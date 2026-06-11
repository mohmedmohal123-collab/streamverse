import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ChevronDown,
  ChevronUp,
  Download,
  ExternalLink,
  Loader2,
  MessageCircle,
  Pencil,
  Send,
  Share2,
  Subtitles,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { CommentView } from "../backend.d";
import { useActor } from "../lib/backend";
import { useTranslation } from "../lib/i18n";
import type { VideoMetadata } from "../types";
import { SocialBar, handleVideoDownload } from "./SocialBar";

interface VideoPlayerProps {
  video: VideoMetadata | null;
  videoUrl?: string;
  onClose: () => void;
  onShare?: () => void;
}

const WATCH_HISTORY_KEY = "streamverse_watch_history";

function saveToLocalHistory(video: VideoMetadata) {
  try {
    const existing = JSON.parse(
      localStorage.getItem(WATCH_HISTORY_KEY) ?? "[]",
    ) as Array<{
      videoId: string;
      title: string;
      thumbnailUrl: string;
      watchedAt: number;
      platform: string;
    }>;
    const filtered = existing.filter((e) => e.videoId !== video.videoId);
    localStorage.setItem(
      WATCH_HISTORY_KEY,
      JSON.stringify(
        [
          {
            videoId: video.videoId,
            title: video.title,
            thumbnailUrl: video.thumbnailUrl,
            watchedAt: Date.now(),
            platform: video.platform,
          },
          ...filtered,
        ].slice(0, 50),
      ),
    );
  } catch {
    // ignore
  }
}

export function getLocalWatchHistory() {
  try {
    return JSON.parse(
      localStorage.getItem(WATCH_HISTORY_KEY) ?? "[]",
    ) as Array<{
      videoId: string;
      title: string;
      thumbnailUrl: string;
      watchedAt: number;
      platform: string;
    }>;
  } catch {
    return [];
  }
}

export function clearLocalWatchHistory() {
  localStorage.removeItem(WATCH_HISTORY_KEY);
}

function getEmbedUrl(video: VideoMetadata): string | null {
  if (video.platform === "vimeo") {
    return `https://player.vimeo.com/video/${video.videoId}?autoplay=1&title=0&byline=0&portrait=0`;
  }
  if (video.platform === "tiktok") {
    return `https://www.tiktok.com/embed/v2/${video.videoId}`;
  }
  return `https://www.youtube.com/embed/${video.videoId}?autoplay=1&rel=0&modestbranding=1`;
}

function getExternalUrl(video: VideoMetadata): string {
  if (video.platform === "vimeo") return `https://vimeo.com/${video.videoId}`;
  if (video.platform === "tiktok")
    return `https://www.tiktok.com/@user/video/${video.videoId}`;
  return `https://www.youtube.com/watch?v=${video.videoId}`;
}

function timeAgo(ts: bigint, isRTL: boolean): string {
  const diffMs = Date.now() - Number(ts);
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return isRTL ? "الآن" : "now";
  if (diffMin < 60) return isRTL ? `منذ ${diffMin} دقيقة` : `${diffMin}m ago`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return isRTL ? `منذ ${diffH} ساعة` : `${diffH}h ago`;
  const diffD = Math.floor(diffH / 24);
  return isRTL ? `منذ ${diffD} يوم` : `${diffD}d ago`;
}

function getInitials(id: string): string {
  return id.toString().slice(0, 2).toUpperCase();
}

// ─── Comment Item ────────────────────────────────────────────────────────────

interface CommentItemProps {
  comment: CommentView;
  currentUserId: string | null;
  videoId: string;
  index: number;
}

function CommentItem({
  comment,
  currentUserId,
  videoId,
  index,
}: CommentItemProps) {
  const { isRTL } = useTranslation();
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(comment.text);

  const isOwn = currentUserId === comment.authorId.toString();

  const editMutation = useMutation({
    mutationFn: async (text: string) => {
      if (!actor) return;
      await actor.editComment(comment.id, text);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", videoId] });
      setEditing(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!actor) return;
      await actor.deleteComment(comment.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", videoId] });
    },
  });

  if (comment.isDeleted) return null;

  return (
    <div className="comment-card" data-ocid={`comment.item.${index + 1}`}>
      {/* Avatar */}
      <div className="flex-shrink-0 w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-xs font-bold text-white">
        {getInitials(comment.authorId.toString())}
      </div>

      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center gap-2 justify-between">
          <span className="text-xs font-semibold text-foreground truncate">
            {comment.authorId.toString().slice(0, 8)}…
          </span>
          <span className="text-[10px] text-muted-foreground flex-shrink-0">
            {timeAgo(comment.createdAt, isRTL)}
            {comment.isEdited && (
              <span className="ms-1 opacity-60">
                ({isRTL ? "معدّل" : "edited"})
              </span>
            )}
          </span>
        </div>

        {editing ? (
          <div className="space-y-2">
            <Textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="text-sm min-h-[60px] bg-background border-border resize-none"
              data-ocid={`comment.edit_textarea.${index + 1}`}
            />
            <div className="flex gap-1.5">
              <Button
                size="sm"
                className="h-7 text-xs gradient-primary text-white border-0"
                onClick={() => editMutation.mutate(editText)}
                disabled={editMutation.isPending || !editText.trim()}
                data-ocid={`comment.save_button.${index + 1}`}
              >
                {editMutation.isPending ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : isRTL ? (
                  "حفظ"
                ) : (
                  "Save"
                )}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 text-xs"
                onClick={() => setEditing(false)}
                data-ocid={`comment.cancel_button.${index + 1}`}
              >
                {isRTL ? "إلغاء" : "Cancel"}
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-foreground/90 leading-relaxed">
            {comment.text}
          </p>
        )}

        {/* Edit/Delete for own comments */}
        {isOwn && !editing && (
          <div className="flex gap-1">
            <button
              type="button"
              className="text-[10px] text-muted-foreground hover:text-foreground transition-colors flex items-center gap-0.5"
              onClick={() => setEditing(true)}
              data-ocid={`comment.edit_button.${index + 1}`}
              aria-label={isRTL ? "تعديل" : "Edit"}
            >
              <Pencil className="h-2.5 w-2.5" />
              {isRTL ? "تعديل" : "Edit"}
            </button>
            <span className="text-muted-foreground/30 mx-1">·</span>
            <button
              type="button"
              className="text-[10px] text-destructive/60 hover:text-destructive transition-colors flex items-center gap-0.5"
              onClick={() => deleteMutation.mutate()}
              disabled={deleteMutation.isPending}
              data-ocid={`comment.delete_button.${index + 1}`}
              aria-label={isRTL ? "حذف" : "Delete"}
            >
              {deleteMutation.isPending ? (
                <Loader2 className="h-2.5 w-2.5 animate-spin" />
              ) : (
                <Trash2 className="h-2.5 w-2.5" />
              )}
              {isRTL ? "حذف" : "Delete"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Comments Panel ──────────────────────────────────────────────────────────

interface CommentsPanelProps {
  video: VideoMetadata;
  currentUserId: string | null;
}

function CommentsPanel({ video, currentUserId }: CommentsPanelProps) {
  const { isRTL } = useTranslation();
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const [newComment, setNewComment] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { data: comments = [], isLoading } = useQuery<CommentView[]>({
    queryKey: ["comments", video.videoId],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getVideoComments(video.videoId);
    },
    enabled: !!actor,
    staleTime: 1000 * 30,
  });

  const addMutation = useMutation({
    mutationFn: async (text: string) => {
      if (!actor) return;
      await actor.addComment(video.videoId, null, text);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", video.videoId] });
      setNewComment("");
    },
  });

  const visibleComments = comments.filter((c) => !c.isDeleted);

  return (
    <div
      className="comment-thread"
      data-ocid="comments.panel"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="flex items-center gap-2 mb-1">
        <MessageCircle className="h-4 w-4 text-primary" />
        <h3 className="font-display font-semibold text-sm text-foreground">
          {isRTL ? "التعليقات" : "Comments"}
          {visibleComments.length > 0 && (
            <span className="ms-1.5 text-xs text-muted-foreground font-normal">
              ({visibleComments.length})
            </span>
          )}
        </h3>
      </div>

      {/* Add comment */}
      <div className="flex gap-2 items-start">
        <div className="flex-shrink-0 w-7 h-7 rounded-full gradient-accent flex items-center justify-center text-[10px] font-bold text-white mt-1">
          {currentUserId ? getInitials(currentUserId) : "?"}
        </div>
        <div className="flex-1 space-y-2">
          <Textarea
            ref={textareaRef}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={isRTL ? "أضف تعليقاً..." : "Add a comment..."}
            className="text-sm min-h-[70px] bg-background border-border resize-none text-foreground placeholder:text-muted-foreground"
            data-ocid="comments.new_comment_textarea"
            onKeyDown={(e) => {
              if (
                e.key === "Enter" &&
                (e.ctrlKey || e.metaKey) &&
                newComment.trim()
              ) {
                addMutation.mutate(newComment.trim());
              }
            }}
          />
          <Button
            size="sm"
            onClick={() => addMutation.mutate(newComment.trim())}
            disabled={addMutation.isPending || !newComment.trim()}
            className="h-8 text-xs gradient-primary text-white border-0 gap-1.5"
            data-ocid="comments.submit_button"
          >
            {addMutation.isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Send className="h-3.5 w-3.5" />
            )}
            {isRTL ? "نشر" : "Post"}
          </Button>
        </div>
      </div>

      {/* Comments list */}
      {isLoading ? (
        <div className="space-y-3 mt-2" data-ocid="comments.loading_state">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-4 w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : visibleComments.length === 0 ? (
        <div
          className="text-center py-6 text-muted-foreground"
          data-ocid="comments.empty_state"
        >
          <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-30" />
          <p className="text-sm">
            {isRTL ? "لا توجد تعليقات بعد" : "No comments yet"}
          </p>
          <p className="text-xs mt-0.5">
            {isRTL ? "كن أول من يعلق!" : "Be the first to comment!"}
          </p>
        </div>
      ) : (
        <ScrollArea className="max-h-72">
          <div className="space-y-2 pe-2">
            {visibleComments.map((c, i) => (
              <CommentItem
                key={c.id}
                comment={c}
                currentUserId={currentUserId}
                videoId={video.videoId}
                index={i}
              />
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}

// ─── Main VideoPlayer ────────────────────────────────────────────────────────

export function VideoPlayer({
  video,
  videoUrl,
  onClose,
  onShare,
}: VideoPlayerProps) {
  const { t, isRTL } = useTranslation();
  const { actor } = useActor();
  const overlayRef = useRef<HTMLDivElement>(null);
  const [showComments, setShowComments] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [subtitles, setSubtitles] = useState<
    Array<{ url: string; label: string; language: string }>
  >([]);
  const [activeSubtitle, setActiveSubtitle] = useState<string | null>(null);
  const subtitleInputRef = useRef<HTMLInputElement>(null);

  // Convert SRT to VTT in browser
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
    setSubtitles((prev) => [...prev, { url, label, language: "custom" }]);
    setActiveSubtitle(url);
    toast.success(
      isRTL ? `✓ تم إضافة الترجمة: ${label}` : `✓ Subtitle added: ${label}`,
    );
  }

  const [optimisticReaction, setOptimisticReaction] = useState<
    "like" | "dislike" | null
  >(null);
  const queryClient = useQueryClient();

  // Current user profile
  const { data: userProfile } = useQuery({
    queryKey: ["my-profile"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserProfile();
    },
    enabled: !!actor,
  });

  const currentUserId = userProfile?.id?.toString() ?? null;

  const { data: stats } = useQuery({
    queryKey: ["video-stats", video?.videoId],
    queryFn: async () => {
      if (!actor || !video) return null;
      return actor.getVideoStats(video.videoId);
    },
    enabled: !!actor && !!video,
    staleTime: 1000 * 30,
  });

  const { data: myReaction } = useQuery({
    queryKey: ["video-reaction", video?.videoId],
    queryFn: async () => {
      if (!actor || !video) return null;
      return actor.getVideoReaction(video.videoId);
    },
    enabled: !!actor && !!video,
  });

  const reactionMutation = useMutation({
    mutationFn: async (kind: "like" | "dislike") => {
      if (!actor || !video) return;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await actor.reactToVideo(video.videoId, kind as any);
    },
    onSuccess: () => {
      if (!video) return;
      queryClient.invalidateQueries({
        queryKey: ["video-stats", video.videoId],
      });
      queryClient.invalidateQueries({
        queryKey: ["video-reaction", video.videoId],
      });
    },
  });

  useEffect(() => {
    if (video) {
      saveToLocalHistory(video);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [video]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  if (!video) return null;

  const platformLabel =
    video.platform === "vimeo" ? (
      <span className="inline-flex items-center gap-1 text-primary font-semibold text-xs">
        <span className="w-2 h-2 rounded-full bg-primary" />
        Vimeo
      </span>
    ) : video.platform === "tiktok" ? (
      <span
        className="inline-flex items-center gap-1 font-semibold text-xs"
        style={{ color: "#fe2c55" }}
      >
        <span
          className="w-2 h-2 rounded-full"
          style={{ background: "#fe2c55" }}
        />
        TikTok
      </span>
    ) : (
      <span className="inline-flex items-center gap-1 text-red-400 font-semibold text-xs">
        <span className="w-2 h-2 rounded-full bg-red-500" />
        YouTube
      </span>
    );

  const likeCount = stats ? Number(stats.likeCount) : 0;
  const dislikeCount = stats ? Number(stats.dislikeCount) : 0;
  const commentCount = stats ? Number(stats.commentCount) : 0;
  const activeReaction = myReaction ?? optimisticReaction;

  const handleDownload = async () => {
    if (!video || downloading) return;
    setDownloading(true);
    try {
      await handleVideoDownload(
        video.platform,
        video.videoId,
        videoUrl,
        video.title,
        t as (key: string) => string,
      );
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div
      ref={overlayRef}
      data-ocid="video_player.dialog"
      className="fixed inset-0 z-50 flex flex-col items-center justify-start md:justify-center bg-black/95 backdrop-blur-sm animate-fade-in overflow-y-auto py-4"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape") onClose();
      }}
      tabIndex={-1}
      aria-modal="true"
      aria-label={`Playing: ${video.title}`}
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className={cn("relative w-full max-w-4xl mx-4 animate-slide-up")}>
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-3 px-1">
          <div className="flex-1 min-w-0">
            <h2 className="font-display font-bold text-white text-base md:text-lg line-clamp-2">
              {video.title}
            </h2>
            <div className="flex items-center gap-3 mt-0.5">
              <p className="text-sm text-white/60">{video.channelTitle}</p>
              {platformLabel}
            </div>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            {/* Download button */}
            <Button
              variant="ghost"
              size="icon"
              type="button"
              data-ocid="video_player.download_button"
              className="text-white/70 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-full transition-colors"
              onClick={handleDownload}
              disabled={downloading}
              aria-label={isRTL ? "تحميل الفيديو" : "Download video"}
              title={isRTL ? "تحميل الفيديو" : "Download video"}
            >
              {downloading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
            </Button>

            {/* Open externally */}
            <a
              href={getExternalUrl(video)}
              target="_blank"
              rel="noopener noreferrer"
              data-ocid="video_player.external_link"
              className="inline-flex items-center justify-center w-9 h-9 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors"
              aria-label={
                video.platform === "vimeo" ? "Open on Vimeo" : "Open on YouTube"
              }
            >
              <ExternalLink className="h-4 w-4" />
            </a>

            <Button
              variant="ghost"
              size="icon"
              type="button"
              data-ocid="video_player.share_button"
              className="text-white/70 hover:text-white hover:bg-white/10 rounded-full"
              onClick={onShare}
              aria-label={t("share")}
            >
              <Share2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              type="button"
              data-ocid="video_player.close_button"
              className="text-white/70 hover:text-white hover:bg-white/10 rounded-full"
              onClick={onClose}
              aria-label={t("close")}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Player */}
        <div
          className="relative rounded-xl overflow-hidden bg-black shadow-2xl"
          style={{ paddingBottom: "56.25%" }}
        >
          <>
            <iframe
              src={getEmbedUrl(video) ?? ""}
              title={video.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
            />
            {/* Subtitle overlay for iframes (approximation — actual sync not possible without JS API) */}
            {activeSubtitle && subtitles.length > 0 && (
              <div className="absolute bottom-10 left-0 right-0 flex justify-center pointer-events-none z-10 px-4">
                <div className="bg-black/80 text-white text-sm px-3 py-1.5 rounded-lg text-center max-w-sm backdrop-blur-sm">
                  {subtitles.find((s) => s.url === activeSubtitle)?.label}
                </div>
              </div>
            )}
          </>
        </div>

        {/* Subtitle controls */}
        <div className="mt-2 px-1 flex items-center gap-2 flex-wrap">
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
            data-ocid="video_player.upload_subtitle_button"
            className="flex items-center gap-1.5 text-xs text-white/60 hover:text-white transition-colors px-2 py-1 rounded-lg hover:bg-white/10"
            aria-label={isRTL ? "إضافة ترجمة" : "Add subtitle"}
          >
            <Upload className="h-3.5 w-3.5" />
            {isRTL ? "ترجمة" : "Subtitles"}
          </button>
          {subtitles.length > 0 && (
            <div className="flex items-center gap-1 flex-wrap">
              <button
                type="button"
                onClick={() => setActiveSubtitle(null)}
                data-ocid="video_player.subtitle_off_button"
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
                  data-ocid="video_player.subtitle_toggle"
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

        {/* Social bar row */}
        <div className="mt-3 px-1 flex items-center justify-between gap-2 bg-white/5 rounded-xl p-3">
          <SocialBar
            videoId={video.videoId}
            videoUrl={videoUrl}
            platform={video.platform}
            likeCount={likeCount}
            dislikeCount={dislikeCount}
            commentCount={commentCount}
            userReaction={activeReaction as "like" | "dislike" | null}
            onLike={() => {
              setOptimisticReaction("like");
              reactionMutation.mutate("like");
            }}
            onDislike={() => {
              setOptimisticReaction("dislike");
              reactionMutation.mutate("dislike");
            }}
            onComment={() => setShowComments((v) => !v)}
            onShare={onShare}
          />
          <button
            type="button"
            data-ocid="video_player.toggle_comments_button"
            onClick={() => setShowComments((v) => !v)}
            className="flex items-center gap-1.5 text-xs text-white/60 hover:text-white transition-colors ms-auto"
            aria-label={isRTL ? "التعليقات" : "Toggle comments"}
          >
            {showComments ? (
              <>
                <ChevronUp className="h-4 w-4" />
                {isRTL ? "إخفاء التعليقات" : "Hide comments"}
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4" />
                {isRTL ? "عرض التعليقات" : "View comments"}
              </>
            )}
          </button>
        </div>

        {/* Comments panel */}
        {showComments && (
          <div className="mt-3">
            <CommentsPanel video={video} currentUserId={currentUserId} />
          </div>
        )}
      </div>
    </div>
  );
}
