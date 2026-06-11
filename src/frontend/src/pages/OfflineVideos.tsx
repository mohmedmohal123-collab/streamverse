import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Calendar,
  CloudOff,
  Download,
  Grid3X3,
  HardDrive,
  List,
  Maximize2,
  Pause,
  Play,
  RotateCcw,
  SortAsc,
  Subtitles,
  Trash2,
  Upload,
  Volume2,
  VolumeX,
  WifiOff,
  X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useTranslation } from "../lib/i18n";
import {
  getStorageUsage,
  getVideoBlobUrl,
  getVideos,
  removeMultipleVideos,
  removeVideo,
} from "../lib/offlineStorage";
import type { StoredVideo } from "../lib/offlineStorage";
import type { Platform } from "../types";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const PLATFORM_LABELS: Partial<Record<Platform, string>> = {
  youtube: "YouTube",
  vimeo: "Vimeo",
  tiktok: "TikTok",
};

const PLATFORM_COLORS: Partial<Record<Platform, string>> = {
  youtube: "bg-red-500/15 text-red-400 border-red-500/30",
  vimeo: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  tiktok: "bg-pink-500/15 text-pink-400 border-pink-500/30",
};

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1073741824) return `${(bytes / 1048576).toFixed(1)} MB`;
  return `${(bytes / 1073741824).toFixed(2)} GB`;
}

function formatDate(ts: number, isRTL: boolean): string {
  return new Intl.DateTimeFormat(isRTL ? "ar-SA" : "en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(ts));
}

type SortKey = "date" | "platform" | "size";
type ViewMode = "grid" | "list";

// ─── Inline Video Player ──────────────────────────────────────────────────────

function InlinePlayer({
  video,
  onClose,
  isRTL,
}: {
  video: StoredVideo;
  onClose: () => void;
  isRTL: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const subtitleInputRef = useRef<HTMLInputElement>(null);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [loadingBlob, setLoadingBlob] = useState(true);
  const [noBlob, setNoBlob] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(1);
  const [duration, setDuration] = useState(0);
  const [subtitles, setSubtitles] = useState<
    Array<{ url: string; label: string; lang: string }>
  >([]);
  const [activeSubtitle, setActiveSubtitle] = useState<string | null>(null);

  function srtToVtt(srt: string): string {
    const converted = srt
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n")
      .replace(/\d+\n(\d{2}:\d{2}:\d{2}),(\d{3})/g, "$1.$2")
      .replace(
        /(\d{2}:\d{2}:\d{2}),(\d{3}) --> (\d{2}:\d{2}:\d{2}),(\d{3})/g,
        "$1.$2 --> $3.$4",
      );
    return `WEBVTT\n\n${converted}`;
  }

  async function handleSubtitleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    let vttContent = text;
    if (file.name.endsWith(".srt")) {
      vttContent = srtToVtt(text);
    }
    const blob = new Blob([vttContent], { type: "text/vtt" });
    const url = URL.createObjectURL(blob);
    const label = file.name.replace(/\.(srt|vtt)$/i, "");
    setSubtitles((prev) => [...prev, { url, label, lang: "custom" }]);
    setActiveSubtitle(url);
  }

  useEffect(() => {
    let url: string | null = null;
    setLoadingBlob(true);
    setNoBlob(false);
    getVideoBlobUrl(video.videoId)
      .then((u) => {
        if (u) {
          url = u;
          setBlobUrl(u);
        } else {
          setNoBlob(true);
        }
      })
      .catch(() => setNoBlob(true))
      .finally(() => setLoadingBlob(false));
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [video.videoId]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onTime = () => {
      if (v.duration) setProgress((v.currentTime / v.duration) * 100);
    };
    const onDur = () => setDuration(v.duration);
    const onEnded = () => setPlaying(false);
    v.addEventListener("timeupdate", onTime);
    v.addEventListener("loadedmetadata", onDur);
    v.addEventListener("ended", onEnded);
    return () => {
      v.removeEventListener("timeupdate", onTime);
      v.removeEventListener("loadedmetadata", onDur);
      v.removeEventListener("ended", onEnded);
    };
  }, []);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play();
      setPlaying(true);
    } else {
      v.pause();
      setPlaying(false);
    }
  };

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = videoRef.current;
    if (!v || !duration) return;
    const pct = Number(e.target.value);
    v.currentTime = (pct / 100) * duration;
    setProgress(pct);
  };

  const handleVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = videoRef.current;
    if (!v) return;
    const val = Number(e.target.value);
    v.volume = val;
    setVolume(val);
    setMuted(val === 0);
  };

  const handleFullscreen = () => {
    const v = videoRef.current;
    if (!v) return;
    if (document.fullscreenElement) document.exitFullscreen();
    else v.requestFullscreen();
  };

  return (
    <div
      data-ocid="offline.player"
      className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-4"
    >
      <button
        type="button"
        aria-label={isRTL ? "إغلاق" : "Close player"}
        onClick={onClose}
        data-ocid="offline.player.close_button"
        className="absolute top-4 right-4 z-10 w-9 h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
      >
        <X className="h-5 w-5" />
      </button>

      <div className="relative w-full max-w-3xl aspect-video rounded-xl overflow-hidden bg-zinc-900 shadow-2xl">
        {loadingBlob && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-white/60">
            <div className="w-10 h-10 border-2 border-white/20 border-t-white/80 rounded-full animate-spin" />
            <p className="text-sm">
              {isRTL ? "جارى التحميل..." : "Loading..."}
            </p>
          </div>
        )}
        {noBlob && !loadingBlob && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-muted-foreground">
            {video.thumbnailUrl && (
              <img
                src={video.thumbnailUrl}
                alt={video.title}
                className="absolute inset-0 w-full h-full object-cover opacity-10"
              />
            )}
            <CloudOff className="h-12 w-12 opacity-40" />
            <p className="text-sm text-center px-6 relative">
              {isRTL
                ? "لا يتوفر ملف فيديو محلي — تم حفظ البيانات الوصفية فقط"
                : "No local video file — only metadata was saved"}
            </p>
          </div>
        )}
        {blobUrl && !loadingBlob && (
          // biome-ignore lint/a11y/useMediaCaption: subtitle tracks added dynamically via state
          <video
            ref={videoRef}
            src={blobUrl}
            className="w-full h-full object-contain"
            playsInline
            onClick={togglePlay}
            onKeyDown={(e) =>
              (e.key === "Enter" || e.key === " ") && togglePlay()
            }
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
          >
            {subtitles.map((sub) => (
              <track
                key={sub.url}
                kind="subtitles"
                src={sub.url}
                srcLang={sub.lang}
                label={sub.label}
                default={activeSubtitle === sub.url}
              />
            ))}
          </video>
        )}
        {blobUrl && !playing && !loadingBlob && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-16 h-16 rounded-full bg-black/50 flex items-center justify-center">
              <Play className="h-8 w-8 text-white fill-white" />
            </div>
          </div>
        )}
      </div>

      {blobUrl && (
        <div className="w-full max-w-3xl mt-3 space-y-2">
          <input
            type="range"
            min={0}
            max={100}
            step={0.1}
            value={progress}
            onChange={handleSeek}
            data-ocid="offline.player.progress"
            className="w-full h-1.5 accent-primary cursor-pointer rounded-full"
            aria-label={isRTL ? "تقدم التشغيل" : "Playback progress"}
          />
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={togglePlay}
              data-ocid="offline.player.play_button"
              className="text-white hover:text-primary transition-colors"
              aria-label={
                playing ? (isRTL ? "إيقاف" : "Pause") : isRTL ? "تشغيل" : "Play"
              }
            >
              {playing ? (
                <Pause className="h-5 w-5 fill-white" />
              ) : (
                <Play className="h-5 w-5 fill-white" />
              )}
            </button>
            <button
              type="button"
              onClick={toggleMute}
              data-ocid="offline.player.mute_button"
              className="text-white hover:text-primary transition-colors"
              aria-label={
                muted
                  ? isRTL
                    ? "رفع الصوت"
                    : "Unmute"
                  : isRTL
                    ? "كتم الصوت"
                    : "Mute"
              }
            >
              {muted ? (
                <VolumeX className="h-5 w-5" />
              ) : (
                <Volume2 className="h-5 w-5" />
              )}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={muted ? 0 : volume}
              onChange={handleVolume}
              data-ocid="offline.player.volume"
              aria-label={isRTL ? "مستوى الصوت" : "Volume"}
              className="w-20 h-1 accent-primary cursor-pointer"
            />
            <div className="flex-1" />
            <button
              type="button"
              onClick={handleFullscreen}
              data-ocid="offline.player.fullscreen"
              className="text-white hover:text-primary transition-colors"
              aria-label={isRTL ? "ملء الشاشة" : "Fullscreen"}
            >
              <Maximize2 className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      <p className="mt-3 text-white/70 text-sm font-medium text-center max-w-2xl line-clamp-2">
        {video.title}
      </p>

      {/* Subtitle controls */}
      <div className="mt-2 flex items-center gap-2 flex-wrap justify-center">
        <input
          ref={subtitleInputRef}
          type="file"
          accept=".vtt,.srt"
          className="hidden"
          onChange={(e) => void handleSubtitleUpload(e)}
          aria-label={isRTL ? "رفع ملف ترجمة" : "Upload subtitle file"}
        />
        <button
          type="button"
          onClick={() => subtitleInputRef.current?.click()}
          data-ocid="offline.player.upload_subtitle_button"
          className="flex items-center gap-1.5 text-xs text-white/60 hover:text-white transition-colors px-2 py-1 rounded-lg hover:bg-white/10"
        >
          <Upload className="h-3.5 w-3.5" />
          {isRTL ? "إضافة ترجمة" : "Add Subtitle"}
        </button>
        {subtitles.length > 0 && (
          <div className="flex items-center gap-1 flex-wrap">
            <button
              type="button"
              onClick={() => setActiveSubtitle(null)}
              data-ocid="offline.player.subtitle_off"
              className={`text-xs px-2 py-1 rounded-lg transition-colors ${
                !activeSubtitle
                  ? "bg-white/20 text-white"
                  : "text-white/50 hover:text-white hover:bg-white/10"
              }`}
            >
              {isRTL ? "بدون ترجمة" : "Off"}
            </button>
            {subtitles.map((sub) => (
              <button
                key={sub.url}
                type="button"
                onClick={() => setActiveSubtitle(sub.url)}
                data-ocid="offline.player.subtitle_toggle"
                className={`text-xs px-2 py-1 rounded-lg transition-colors flex items-center gap-1 ${
                  activeSubtitle === sub.url
                    ? "bg-primary/30 text-primary"
                    : "text-white/50 hover:text-white hover:bg-white/10"
                }`}
              >
                <Subtitles className="h-3 w-3" />
                {sub.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Storage Indicator ────────────────────────────────────────────────────────

function StorageIndicator({ isRTL }: { isRTL: boolean }) {
  const { data } = useQuery({
    queryKey: ["storage-usage"],
    queryFn: getStorageUsage,
    staleTime: 30000,
  });
  if (!data || (data.usedMB === 0 && data.totalMB === 0)) return null;
  const totalLabel =
    data.totalMB > 1000
      ? `${(data.totalMB / 1024).toFixed(1)} GB`
      : `${data.totalMB} MB`;
  return (
    <div
      data-ocid="offline.storage_indicator"
      className="flex items-center gap-3 px-4 py-3 bg-card border border-border rounded-xl"
    >
      <HardDrive className="h-4 w-4 text-primary flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
          <span>{isRTL ? "مساحة التخزين" : "Storage"}</span>
          <span className="font-mono">
            {isRTL
              ? `${data.usedMB} MB مستخدم من ${totalLabel}`
              : `${data.usedMB} MB used of ${totalLabel}`}
          </span>
        </div>
        <Progress value={data.percent} className="h-1.5" />
      </div>
      <span className="text-xs font-mono text-muted-foreground flex-shrink-0">
        {data.percent}%
      </span>
    </div>
  );
}

// ─── Video Card (Grid) ────────────────────────────────────────────────────────

function VideoCard({
  video,
  index,
  selected,
  selectMode,
  isRTL,
  onPlay,
  onDelete,
  onToggleSelect,
}: {
  video: StoredVideo;
  index: number;
  selected: boolean;
  selectMode: boolean;
  isRTL: boolean;
  onPlay: (v: StoredVideo) => void;
  onDelete: (v: StoredVideo) => void;
  onToggleSelect: (id: string) => void;
}) {
  const handleActivate = () =>
    selectMode ? onToggleSelect(video.videoId) : onPlay(video);
  return (
    <div
      data-ocid={`offline.item.${index + 1}`}
      className={`relative group rounded-xl overflow-hidden border transition-all duration-200 cursor-pointer ${
        selected
          ? "border-primary ring-2 ring-primary/30"
          : "border-border hover:border-primary/40"
      } bg-card`}
    >
      <button
        type="button"
        className="relative aspect-video bg-muted w-full"
        onClick={handleActivate}
        aria-label={
          selectMode
            ? isRTL
              ? `تحديد ${video.title}`
              : `Select ${video.title}`
            : isRTL
              ? `تشغيل ${video.title}`
              : `Play ${video.title}`
        }
      >
        <img
          src={video.thumbnailUrl || "/assets/images/placeholder.svg"}
          alt={video.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        {!selectMode && (
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-black/60 flex items-center justify-center">
              <Play className="h-6 w-6 text-white fill-white" />
            </div>
          </div>
        )}
        {video.videoData && (
          <div className="absolute top-2 left-2">
            <Badge className="text-[10px] px-1.5 py-0 h-4 bg-emerald-500/90 text-white border-0">
              {isRTL ? "متوفر" : "Local"}
            </Badge>
          </div>
        )}
        {video.duration && (
          <div className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] font-mono px-1.5 py-0.5 rounded">
            {video.duration}
          </div>
        )}
        {selectMode && (
          <div className="absolute top-2 right-2">
            <Checkbox
              checked={selected}
              onCheckedChange={() => onToggleSelect(video.videoId)}
              data-ocid={`offline.checkbox.${index + 1}`}
              className="bg-white/20 border-white"
            />
          </div>
        )}
      </button>
      <div className="p-3 space-y-1">
        <p className="text-sm font-medium text-card-foreground line-clamp-2 leading-snug min-h-[2.5rem]">
          {video.title}
        </p>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge
            variant="secondary"
            className={`text-[10px] px-1.5 py-0 h-4 border ${PLATFORM_COLORS[video.platform] ?? "bg-muted/60 text-muted-foreground border-border"}`}
          >
            {PLATFORM_LABELS[video.platform] ?? video.platform}
          </Badge>
          {video.fileSize ? (
            <span className="text-[10px] text-muted-foreground font-mono">
              {formatBytes(video.fileSize)}
            </span>
          ) : null}
        </div>
        {video.savedAt ? (
          <p className="text-[10px] text-muted-foreground flex items-center gap-1">
            <Calendar className="h-2.5 w-2.5" />
            {formatDate(video.savedAt, isRTL)}
          </p>
        ) : null}
      </div>
      <div className="px-3 pb-3 flex items-center gap-1.5">
        <Button
          type="button"
          size="sm"
          variant="secondary"
          className="flex-1 h-7 text-xs gap-1"
          onClick={() => onPlay(video)}
          data-ocid={`offline.play_button.${index + 1}`}
        >
          <Play className="h-3 w-3" />
          {isRTL ? "تشغيل" : "Play"}
        </Button>
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className="h-7 w-7 text-muted-foreground hover:text-destructive flex-shrink-0"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(video);
          }}
          aria-label={isRTL ? `حذف ${video.title}` : `Delete ${video.title}`}
          data-ocid={`offline.delete_button.${index + 1}`}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}

// ─── Video Row (List) ─────────────────────────────────────────────────────────

function VideoRow({
  video,
  index,
  selected,
  selectMode,
  isRTL,
  onPlay,
  onDelete,
  onToggleSelect,
}: {
  video: StoredVideo;
  index: number;
  selected: boolean;
  selectMode: boolean;
  isRTL: boolean;
  onPlay: (v: StoredVideo) => void;
  onDelete: (v: StoredVideo) => void;
  onToggleSelect: (id: string) => void;
}) {
  return (
    <div
      data-ocid={`offline.item.${index + 1}`}
      className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 ${
        selected
          ? "border-primary ring-2 ring-primary/30 bg-primary/5"
          : "border-border hover:border-primary/40 bg-card"
      }`}
    >
      {selectMode && (
        <Checkbox
          checked={selected}
          onCheckedChange={() => onToggleSelect(video.videoId)}
          data-ocid={`offline.checkbox.${index + 1}`}
        />
      )}
      <button
        type="button"
        className="relative w-28 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-muted group"
        onClick={() => onPlay(video)}
        aria-label={isRTL ? `تشغيل ${video.title}` : `Play ${video.title}`}
      >
        <img
          src={video.thumbnailUrl || "/assets/images/placeholder.svg"}
          alt={video.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Play className="h-5 w-5 text-white fill-white" />
        </div>
        {video.duration && (
          <div className="absolute bottom-1 right-1 bg-black/70 text-white text-[9px] font-mono px-1 py-0.5 rounded">
            {video.duration}
          </div>
        )}
      </button>
      <div className="flex-1 min-w-0 space-y-0.5">
        <p className="text-sm font-medium text-card-foreground line-clamp-2 leading-snug">
          {video.title}
        </p>
        <p className="text-xs text-muted-foreground truncate">
          {video.channelTitle}
        </p>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge
            variant="secondary"
            className={`text-[10px] px-1.5 py-0 h-4 border ${PLATFORM_COLORS[video.platform] ?? "bg-muted/60 text-muted-foreground border-border"}`}
          >
            {PLATFORM_LABELS[video.platform] ?? video.platform}
          </Badge>
          {video.fileSize ? (
            <span className="text-[10px] text-muted-foreground font-mono">
              {formatBytes(video.fileSize)}
            </span>
          ) : null}
          {video.savedAt ? (
            <span className="text-[10px] text-muted-foreground">
              {formatDate(video.savedAt, isRTL)}
            </span>
          ) : null}
        </div>
      </div>
      <div className="flex items-center gap-1 flex-shrink-0">
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className="h-8 w-8 text-muted-foreground hover:text-primary"
          onClick={() => onPlay(video)}
          aria-label={isRTL ? `تشغيل ${video.title}` : `Play ${video.title}`}
          data-ocid={`offline.play_button.${index + 1}`}
        >
          <Play className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className="h-8 w-8 text-muted-foreground hover:text-destructive"
          onClick={() => onDelete(video)}
          aria-label={isRTL ? `حذف ${video.title}` : `Delete ${video.title}`}
          data-ocid={`offline.delete_button.${index + 1}`}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function OfflineVideos() {
  const { isRTL } = useTranslation();
  const queryClient = useQueryClient();
  const isOffline = !navigator.onLine;

  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortMenuOpen, setSortMenuOpen] = useState(false);
  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [activeVideo, setActiveVideo] = useState<StoredVideo | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<StoredVideo | null>(null);
  const [deleteMultiConfirm, setDeleteMultiConfirm] = useState(false);

  const { data: videos = [], isLoading } = useQuery({
    queryKey: ["offline-videos"],
    queryFn: getVideos,
    staleTime: 0,
  });

  const removeMutation = useMutation({
    mutationFn: removeVideo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["offline-videos"] });
      queryClient.invalidateQueries({ queryKey: ["storage-usage"] });
      toast.success(isRTL ? "تم حذف الفيديو" : "Video deleted");
    },
  });

  const removeBatchMutation = useMutation({
    mutationFn: removeMultipleVideos,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["offline-videos"] });
      queryClient.invalidateQueries({ queryKey: ["storage-usage"] });
      setSelected(new Set());
      setSelectMode(false);
      toast.success(
        isRTL ? "تم حذف الفيديوهات المحددة" : "Selected videos deleted",
      );
    },
  });

  const handleToggleSelect = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const sorted = [...videos].sort((a, b) => {
    if (sortKey === "date") return (b.savedAt ?? 0) - (a.savedAt ?? 0);
    if (sortKey === "platform") return a.platform.localeCompare(b.platform);
    if (sortKey === "size") return (b.fileSize ?? 0) - (a.fileSize ?? 0);
    return 0;
  });

  const handleSelectAll = () => {
    if (selected.size === sorted.length) setSelected(new Set());
    else setSelected(new Set(sorted.map((v) => v.videoId)));
  };

  const sortLabels: Record<SortKey, { en: string; ar: string }> = {
    date: { en: "By Date", ar: "حسب التاريخ" },
    platform: { en: "By Platform", ar: "حسب المنصة" },
    size: { en: "By Size", ar: "حسب الحجم" },
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSortMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div
      className="p-4 max-w-5xl mx-auto space-y-5 pb-8"
      data-ocid="offline.page"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0 shadow-md">
          <Download className="h-5 w-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="font-display font-bold text-xl text-foreground">
            {isRTL ? "التحميلات" : "Downloads"}
          </h1>
          <p className="text-xs text-muted-foreground">
            {isRTL
              ? "فيديوهاتك المحفوظة للمشاهدة بدون إنترنت"
              : "Your saved videos for offline playback"}
          </p>
        </div>
        {videos.length > 0 && (
          <Badge variant="secondary" className="text-xs font-mono">
            {videos.length}
          </Badge>
        )}
      </div>

      {/* Offline banner */}
      {isOffline && (
        <div
          data-ocid="offline.status_banner"
          className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/30 rounded-lg text-sm text-amber-400"
        >
          <WifiOff className="h-4 w-4 flex-shrink-0" />
          <span>
            {isRTL
              ? "أنت غير متصل — تشغيل الفيديوهات المحلية متاح"
              : "You're offline — local videos can still play"}
          </span>
        </div>
      )}

      {/* Storage indicator */}
      <StorageIndicator isRTL={isRTL} />

      {/* Toolbar */}
      {!isLoading && videos.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            type="button"
            size="sm"
            variant={selectMode ? "default" : "outline"}
            className="h-8 text-xs gap-1.5"
            onClick={() => {
              setSelectMode((v) => !v);
              setSelected(new Set());
            }}
            data-ocid="offline.select_toggle"
          >
            <Checkbox
              checked={
                selectMode &&
                selected.size === sorted.length &&
                sorted.length > 0
              }
              className="h-3 w-3 pointer-events-none"
            />
            {isRTL ? "تحديد" : "Select"}
          </Button>

          {selectMode && (
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-8 text-xs"
              onClick={handleSelectAll}
              data-ocid="offline.select_all_button"
            >
              {selected.size === sorted.length && sorted.length > 0
                ? isRTL
                  ? "إلغاء تحديد الكل"
                  : "Deselect All"
                : isRTL
                  ? "تحديد الكل"
                  : "Select All"}
            </Button>
          )}

          {selectMode && selected.size > 0 && (
            <Button
              type="button"
              size="sm"
              variant="destructive"
              className="h-8 text-xs gap-1.5"
              onClick={() => setDeleteMultiConfirm(true)}
              data-ocid="offline.delete_selected_button"
            >
              <Trash2 className="h-3.5 w-3.5" />
              {isRTL ? `حذف (${selected.size})` : `Delete (${selected.size})`}
            </Button>
          )}

          <div className="flex-1" />

          {/* Sort dropdown */}
          <div className="relative">
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-8 text-xs gap-1.5"
              onClick={() => setSortMenuOpen((v) => !v)}
              data-ocid="offline.sort_button"
            >
              <SortAsc className="h-3.5 w-3.5" />
              {isRTL ? sortLabels[sortKey].ar : sortLabels[sortKey].en}
            </Button>
            {sortMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  role="button"
                  tabIndex={-1}
                  aria-label={isRTL ? "إغلاق القائمة" : "Close sort menu"}
                  onClick={() => setSortMenuOpen(false)}
                  onKeyDown={(e) =>
                    e.key === "Escape" && setSortMenuOpen(false)
                  }
                />
                <div
                  data-ocid="offline.sort_dropdown_menu"
                  className="absolute top-full mt-1 right-0 z-20 bg-card border border-border rounded-xl shadow-lg py-1 min-w-[150px]"
                >
                  {(Object.keys(sortLabels) as SortKey[]).map((key) => (
                    <button
                      type="button"
                      key={key}
                      className={`w-full text-left px-3 py-2 text-xs hover:bg-muted transition-colors ${
                        sortKey === key
                          ? "text-primary font-medium"
                          : "text-foreground"
                      }`}
                      onClick={() => {
                        setSortKey(key);
                        setSortMenuOpen(false);
                      }}
                      data-ocid={`offline.sort_option.${key}`}
                    >
                      {isRTL ? sortLabels[key].ar : sortLabels[key].en}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* View toggle */}
          <div className="flex items-center border border-border rounded-lg overflow-hidden">
            <button
              type="button"
              className={`p-1.5 transition-colors ${
                viewMode === "grid"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setViewMode("grid")}
              aria-label={isRTL ? "عرض شبكي" : "Grid view"}
              data-ocid="offline.view_grid_toggle"
            >
              <Grid3X3 className="h-4 w-4" />
            </button>
            <button
              type="button"
              className={`p-1.5 transition-colors ${
                viewMode === "list"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setViewMode("list")}
              aria-label={isRTL ? "عرض قائمة" : "List view"}
              data-ocid="offline.view_list_toggle"
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <div
          className={`${
            viewMode === "grid"
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
              : "space-y-3"
          }`}
        >
          {[1, 2, 3, 4, 5, 6].map((i) =>
            viewMode === "grid" ? (
              <div
                key={i}
                className="rounded-xl border border-border bg-card overflow-hidden"
              >
                <Skeleton className="aspect-video w-full" />
                <div className="p-3 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ) : (
              <div
                key={i}
                className="flex items-center gap-3 p-3 bg-card rounded-xl border border-border"
              >
                <Skeleton className="w-28 h-16 rounded-lg flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ),
          )}
        </div>
      ) : sorted.length === 0 ? (
        <div
          data-ocid="offline.empty_state"
          className="flex flex-col items-center justify-center py-20 text-center gap-5"
        >
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-muted/60 flex items-center justify-center">
              <Download className="h-9 w-9 text-muted-foreground opacity-50" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
              <CloudOff className="h-3.5 w-3.5 text-primary" />
            </div>
          </div>
          <div className="space-y-2">
            <h2 className="font-display font-semibold text-lg text-foreground">
              {isRTL ? "لا توجد تحميلات بعد" : "No Downloads Yet"}
            </h2>
            <p className="text-sm text-muted-foreground max-w-xs">
              {isRTL
                ? "عند تحميل أي فيديو، سيظهر هنا للمشاهدة بدون إنترنت"
                : "When you download a video, it will appear here for offline playback"}
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => window.history.back()}
            data-ocid="offline.empty_state.back_button"
          >
            <RotateCcw className="h-4 w-4" />
            {isRTL ? "العودة للتصفح" : "Browse videos"}
          </Button>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sorted.map((video, i) => (
            <VideoCard
              key={video.videoId}
              video={video}
              index={i}
              selected={selected.has(video.videoId)}
              selectMode={selectMode}
              isRTL={isRTL}
              onPlay={setActiveVideo}
              onDelete={setDeleteTarget}
              onToggleSelect={handleToggleSelect}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map((video, i) => (
            <VideoRow
              key={video.videoId}
              video={video}
              index={i}
              selected={selected.has(video.videoId)}
              selectMode={selectMode}
              isRTL={isRTL}
              onPlay={setActiveVideo}
              onDelete={setDeleteTarget}
              onToggleSelect={handleToggleSelect}
            />
          ))}
        </div>
      )}

      {/* Inline Player */}
      {activeVideo && (
        <InlinePlayer
          video={activeVideo}
          onClose={() => setActiveVideo(null)}
          isRTL={isRTL}
        />
      )}

      {/* Delete single confirmation */}
      <Dialog
        open={deleteTarget !== null}
        onOpenChange={(o) => {
          if (!o) setDeleteTarget(null);
        }}
      >
        <DialogContent data-ocid="offline.delete_dialog">
          <DialogHeader>
            <DialogTitle>
              {isRTL ? "حذف الفيديو؟" : "Delete Video?"}
            </DialogTitle>
            <DialogDescription>
              {isRTL
                ? `سيتم حذف "${deleteTarget?.title}" من التحميلات نهائياً.`
                : `"${deleteTarget?.title}" will be permanently removed from your downloads.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              data-ocid="offline.delete_dialog.cancel_button"
            >
              {isRTL ? "إلغاء" : "Cancel"}
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => {
                if (deleteTarget) {
                  removeMutation.mutate(deleteTarget.videoId);
                  setDeleteTarget(null);
                }
              }}
              disabled={removeMutation.isPending}
              data-ocid="offline.delete_dialog.confirm_button"
            >
              {isRTL ? "حذف" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Batch delete confirmation */}
      <Dialog
        open={deleteMultiConfirm}
        onOpenChange={(o) => {
          if (!o) setDeleteMultiConfirm(false);
        }}
      >
        <DialogContent data-ocid="offline.batch_delete_dialog">
          <DialogHeader>
            <DialogTitle>
              {isRTL
                ? `حذف ${selected.size} فيديو؟`
                : `Delete ${selected.size} video${selected.size !== 1 ? "s" : ""}?`}
            </DialogTitle>
            <DialogDescription>
              {isRTL
                ? "سيتم حذف الفيديوهات المحددة من التحميلات نهائياً ولا يمكن التراجع عن هذا الإجراء."
                : "The selected videos will be permanently deleted. This action cannot be undone."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteMultiConfirm(false)}
              data-ocid="offline.batch_delete_dialog.cancel_button"
            >
              {isRTL ? "إلغاء" : "Cancel"}
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => {
                removeBatchMutation.mutate(Array.from(selected));
                setDeleteMultiConfirm(false);
              }}
              disabled={removeBatchMutation.isPending}
              data-ocid="offline.batch_delete_dialog.confirm_button"
            >
              {isRTL ? "حذف الكل" : "Delete All"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
