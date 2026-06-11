/**
 * DownloadPageInline — embedded variant of DownloadPage used inside DownloadModal.
 * Uses downloadService.ts for real downloads with progress.
 */
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ClipboardCopy,
  Download,
  ExternalLink,
  Film,
  Loader2,
  Music,
  Terminal,
  WifiOff,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  getDownloadLimitInfo,
  getDownloadRapidApiKey,
  recordDownloadLocal,
} from "../lib/backend";
import {
  buildWatchUrl,
  downloadVideo,
  getDownloadDebugLog,
  getVideoDownloadUrl,
  triggerBlobDownload,
} from "../lib/downloadService";
import type { DownloadProgress } from "../lib/downloadService";
import { useTranslation } from "../lib/i18n";
import { saveVideo } from "../lib/offlineStorage";
import type { VideoMetadata } from "../types";

export interface DownloadPageInlineProps {
  videoId: string;
  title?: string;
  platform?: string;
  thumbnailUrl?: string;
  channelTitle?: string;
  duration?: string;
  isSubscribed?: boolean;
  onBack?: () => void;
  onClose?: () => void;
}

interface QualityOpt {
  label: string;
  res: string;
  vQuality: string;
  isAudio?: boolean;
  sizeFmt: string;
}

const YT_QUALITIES: QualityOpt[] = [
  { label: "Full HD", res: "1080p", vQuality: "1080", sizeFmt: "~400 MB" },
  { label: "HD", res: "720p", vQuality: "720", sizeFmt: "~200 MB" },
  { label: "SD", res: "480p", vQuality: "480", sizeFmt: "~100 MB" },
  { label: "Low", res: "360p", vQuality: "360", sizeFmt: "~60 MB" },
  {
    label: "Audio Only",
    res: "MP3",
    vQuality: "128",
    isAudio: true,
    sizeFmt: "~5 MB",
  },
];

const VIMEO_QUALITIES: QualityOpt[] = [
  { label: "Best", res: "Best", vQuality: "max", sizeFmt: "~varies" },
  { label: "HD", res: "720p", vQuality: "720", sizeFmt: "~200 MB" },
  { label: "SD", res: "480p", vQuality: "480", sizeFmt: "~100 MB" },
  { label: "Low", res: "360p", vQuality: "360", sizeFmt: "~60 MB" },
];

const TIKTOK_QUALITIES: QualityOpt[] = [
  { label: "No Watermark", res: "HD", vQuality: "720", sizeFmt: "~20 MB" },
  { label: "With Watermark", res: "SD", vQuality: "480", sizeFmt: "~15 MB" },
  {
    label: "Audio Only",
    res: "MP3",
    vQuality: "128",
    isAudio: true,
    sizeFmt: "~3 MB",
  },
];

const QUALITY_BADGE: Record<string, string> = {
  "1080p": "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
  "720p": "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  "480p": "bg-amber-500/15 text-amber-400 border-amber-500/30",
  "360p": "bg-muted/60 text-muted-foreground border-border",
  HD: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  SD: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  Best: "bg-violet-500/15 text-violet-400 border-violet-500/30",
  MP3: "bg-rose-500/15 text-rose-400 border-rose-500/30",
};

export function DownloadPageInline({
  videoId,
  title,
  platform = "youtube",
  thumbnailUrl,
  channelTitle = "",
  duration = "",
  isSubscribed = false,
  onBack,
  onClose,
}: DownloadPageInlineProps) {
  const { isRTL } = useTranslation();
  const [loadingRes, setLoadingRes] = useState<string | null>(null);
  const [successRes, setSuccessRes] = useState<string | null>(null);
  const [errorRes, setErrorRes] = useState<string | null>(null);
  const [savingOffline, setSavingOffline] = useState<string | null>(null);
  const [savedOfflineRes, setSavedOfflineRes] = useState<string | null>(null);
  const [progress, setProgress] = useState<Record<string, DownloadProgress>>(
    {},
  );
  const [downloadInfo, setDownloadInfo] = useState(() =>
    getDownloadLimitInfo(),
  );
  const [copied, setCopied] = useState(false);
  const [debugLog, setDebugLog] = useState<
    ReturnType<typeof getDownloadDebugLog>
  >([]);
  const [showDebug, setShowDebug] = useState(false);
  const [detailedError, setDetailedError] = useState<string | null>(null);

  useEffect(() => {
    setDownloadInfo(getDownloadLimitInfo());
  }, []);

  const qualityMap: Record<string, QualityOpt[]> = {
    youtube: YT_QUALITIES,
    vimeo: VIMEO_QUALITIES,
    tiktok: TIKTOK_QUALITIES,
  };
  const qualities = qualityMap[platform] ?? YT_QUALITIES;
  const watchUrl = buildWatchUrl(platform, videoId);
  const thumb =
    thumbnailUrl ??
    (platform === "youtube"
      ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
      : null);

  async function handleDownload(opt: QualityOpt) {
    if (loadingRes) return;
    if (!isSubscribed) {
      const info = getDownloadLimitInfo();
      if (info.remaining <= 0) {
        toast.error(
          isRTL
            ? "لقد وصلت إلى الحد اليومي للتحميل."
            : "Daily download limit reached. Subscribe for unlimited!",
          { duration: 5000 },
        );
        return;
      }
    }

    setLoadingRes(opt.res);
    setErrorRes(null);
    setSuccessRes(null);
    setDetailedError(null);
    setDebugLog([]);
    setShowDebug(false);
    setProgress((p) => ({
      ...p,
      [opt.res]: { stage: "idle" as const, percent: 0 },
    }));

    try {
      const FALLBACK_KEY = "54ca2c15e4mshe644cf482a6a4edp19b3fajsn6ab22879e0db";
      const downloadKey = getDownloadRapidApiKey();
      const rapidApiKey = downloadKey || FALLBACK_KEY;
      const lowerPlatform = platform.toLowerCase();

      // ── BLOCKED: YouTube / TikTok ──────────────────────────────────────
      if (lowerPlatform === "tiktok") {
        const msg = isRTL
          ? "هذا الفيديو متاح للبث فقط — التحميل غير متاح على هذه المنصة"
          : "This video is stream-only — download not available for this platform";
        setErrorRes(opt.res);
        setDetailedError(msg);
        setDebugLog(getDownloadDebugLog());
        setShowDebug(true);
        toast.error(msg, { duration: 8000 });
        setTimeout(() => setErrorRes(null), 6000);
        return;
      }

      // ── Step 1: Resolve download URL ─────────────────────────────────
      setProgress((p) => ({
        ...p,
        [opt.res]: { stage: "fetching" as const, percent: 5 },
      }));
      const directUrl = await getVideoDownloadUrl(
        videoId,
        lowerPlatform,
        opt.vQuality,
        rapidApiKey,
      );

      if (!directUrl) {
        const msg = isRTL
          ? "تعذّر الحصول على رابط التحميل — قد يكون الفيديو محميًا أو غير متاح"
          : "Could not get download URL — video may be protected or unavailable";
        setErrorRes(opt.res);
        setDetailedError(msg);
        setDebugLog(getDownloadDebugLog());
        setShowDebug(true);
        toast.error(msg, { duration: 8000 });
        setTimeout(() => setErrorRes(null), 6000);
        return;
      }

      // ── Step 2: Blob download ────────────────────────────────────────
      const filename = `${(title ?? videoId).replace(/[^a-z0-9\u0600-\u06FF\s-]/gi, "").slice(0, 60)}_${opt.res}.${opt.isAudio ? "mp3" : "mp4"}`;

      await downloadVideo(directUrl, filename, rapidApiKey, (prog) =>
        setProgress((p) => ({ ...p, [opt.res]: prog })),
      );

      const meta: VideoMetadata = {
  videoId,
  title: title ?? videoId,
  thumbnailUrl: thumb ?? "",
  viewCount: "0",
  duration,
  channelTitle,
  publishedAt: new Date().toISOString(),
  platform: platform as VideoMetadata["platform"],
};

await saveVideo(meta);

      recordDownloadLocal();
      setDownloadInfo(getDownloadLimitInfo());
      setSuccessRes(opt.res);
      setTimeout(() => setSuccessRes(null), 4000);
      toast.success(
        isRTL ? "✓ تم حفظ الفيديو على جهازك" : "✓ Video saved to your device",
        { duration: 3000 },
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorRes(opt.res);
      setDetailedError(msg);
      setDebugLog(getDownloadDebugLog());
      setShowDebug(true);
      setTimeout(() => setErrorRes(null), 4000);
    } finally {
      setLoadingRes(null);
      setProgress((p) => {
        const n = { ...p };
        delete n[opt.res];
        return n;
      });
    }
  }

  async function handleSaveOffline(opt: QualityOpt) {
    if (savingOffline) return;
    setSavingOffline(opt.res);
    setProgress((p) => ({
      ...p,
      [`off_${opt.res}`]: { stage: "idle" as const, percent: 0 },
    }));

    try {
      const FALLBACK_KEY = "54ca2c15e4mshe644cf482a6a4edp19b3fajsn6ab22879e0db";
      const downloadKey = getDownloadRapidApiKey();
      const rapidApiKey = downloadKey || FALLBACK_KEY;
      const lowerPlatform = platform.toLowerCase();

      if (lowerPlatform === "tiktok") {
        toast.error(
          isRTL
            ? "التحميل بدون إنترنت غير متاح لهذه المنصة"
            : "Offline save not available for this platform",
          { duration: 5000 },
        );
        return;
      }

      const directUrl = await getVideoDownloadUrl(
        videoId,
        lowerPlatform,
        opt.vQuality,
        rapidApiKey,
      );

      if (!directUrl) {
        toast.error(
          isRTL ? "تعذّر الحصول على رابط التحميل" : "Could not get download URL",
          { duration: 5000 },
        );
        return;
      }

      const filename = `${(title ?? videoId).replace(/[^a-z0-9\u0600-\u06FF\s-]/gi, "").slice(0, 60)}_${opt.res}.${opt.isAudio ? "mp3" : "mp4"}`;

  const response = await fetch(directUrl);

const blob = await response.blob();

const arrayBuf = await blob.arrayBuffer();

triggerBlobDownload(
  URL.createObjectURL(blob),
  filename,
);

const meta: VideoMetadata = {
  videoId,
  title: title ?? videoId,
  thumbnailUrl: thumb ?? "",
  viewCount: "0",
  duration,
  channelTitle,
  publishedAt: new Date().toISOString(),
  platform: platform as VideoMetadata["platform"],
};

await saveVideo(meta, arrayBuf);
console.log("VIDEO SAVED TO INDEXEDDB", meta.videoId);
      setSavedOfflineRes(opt.res);
      setTimeout(() => setSavedOfflineRes(null), 4000);
      toast.success(
        isRTL
          ? "✓ تم حفظ الفيديو للمشاهدة بدون إنترنت"
          : "✓ Saved for offline viewing",
      );
    } catch {
      toast.error(
        isRTL ? "تعذّر الحفظ بدون إنترنت" : "Could not save for offline",
      );
    } finally {
      setSavingOffline(null);
      setProgress((p) => {
        const n = { ...p };
        delete n[`off_${opt.res}`];
        return n;
      });
    }
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(watchUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
      toast.success(isRTL ? "تم نسخ الرابط" : "Link copied");
    } catch {
      toast.error(isRTL ? "فشل النسخ" : "Copy failed");
    }
  }

  const limitReached = !isSubscribed && downloadInfo.remaining <= 0;

  return (
    <div className="bg-background" data-ocid="download_page_inline">
      {/* Header */}
      <div className="bg-card border-b border-border px-4 py-3 flex items-center gap-3">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors"
            aria-label={isRTL ? "رجوع" : "Back"}
            data-ocid="download_page.back_button"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0">
            <Download className="h-3.5 w-3.5 text-cyan-400" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-display font-semibold text-foreground">
              {isRTL ? "تحميل الفيديو" : "Download Video"}
            </p>
            {title && (
              <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                {title}
              </p>
            )}
          </div>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors ms-auto"
            aria-label="Close"
            data-ocid="download_page.close_button"
          >
            <span className="text-lg leading-none">×</span>
          </button>
        )}
      </div>

      <div className="px-4 py-5 space-y-5">
        {/* Thumbnail preview */}
        {thumb && (
          <div className="rounded-xl overflow-hidden aspect-video bg-muted relative">
            <img
              src={thumb}
              alt={title ?? "Thumbnail"}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Download limit banner */}
        {!isSubscribed && (
          <div
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border text-sm ${
              limitReached
                ? "bg-destructive/10 border-destructive/30"
                : downloadInfo.remaining <= 1
                  ? "bg-amber-500/10 border-amber-500/30"
                  : "bg-muted/30 border-border"
            }`}
            data-ocid="download_page.limit_banner"
          >
            {limitReached ? (
              <AlertCircle className="h-4 w-4 text-destructive shrink-0" />
            ) : (
              <Download className="h-4 w-4 text-muted-foreground shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <p
                className={`text-xs font-medium ${limitReached ? "text-destructive" : "text-foreground"}`}
              >
                {isRTL
                  ? limitReached
                    ? "وصلت إلى الحد اليومي"
                    : `لديك ${downloadInfo.remaining} تحميل متبقي اليوم`
                  : limitReached
                    ? "Daily limit reached"
                    : `${downloadInfo.remaining} download${downloadInfo.remaining === 1 ? "" : "s"} remaining today`}
              </p>
              <p className="text-xs text-muted-foreground">
                {isRTL
                  ? `${downloadInfo.used} / ${downloadInfo.limit} تحميلات`
                  : `${downloadInfo.used} / ${downloadInfo.limit} used`}
              </p>
            </div>
            {limitReached && (
              <Button
                type="button"
                size="sm"
                className="shrink-0 gradient-primary text-white border-0 text-xs h-7"
                data-ocid="download_page.upgrade_button"
                onClick={() => {
                  window.location.href = "/subscribe";
                }}
              >
                {isRTL ? "اشترك" : "Subscribe"}
              </Button>
            )}
          </div>
        )}

        {/* Quality selection */}
        {!limitReached && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-3">
              <Film className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm font-semibold text-foreground">
                {isRTL ? "اختر الجودة" : "Select Quality"}
              </p>
              <Badge
                className={`text-xs border ms-auto ${
                  platform === "vimeo"
                    ? "bg-sky-500/15 text-sky-400 border-sky-500/30"
                    : platform === "tiktok"
                      ? "bg-pink-500/15 text-pink-400 border-pink-500/30"
                      : "bg-rose-500/15 text-rose-400 border-rose-500/30"
                }`}
              >
                {platform === "vimeo"
                  ? "Vimeo"
                  : platform === "tiktok"
                    ? "TikTok"
                    : "YouTube"}
              </Badge>
            </div>

            <div className="space-y-2" data-ocid="download_page.quality_list">
              {qualities.map((opt) => {
                const isLoading = loadingRes === opt.res;
                const isSuccess = successRes === opt.res;
                const isError = errorRes === opt.res;
                const isSavingOff = savingOffline === opt.res;
                const isSavedOff = savedOfflineRes === opt.res;
                const prog = progress[opt.res];
                const offProg = progress[`off_${opt.res}`];

                return (
                  <div
                    key={opt.res}
                    className={`flex flex-col gap-2 px-3 py-2.5 rounded-xl border transition-all ${
                      isSuccess || isSavedOff
                        ? "border-emerald-500/40 bg-emerald-500/10"
                        : isError
                          ? "border-destructive/40 bg-destructive/10"
                          : "border-border bg-muted/20 hover:bg-muted/40"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Badge
                        className={`text-xs border shrink-0 font-mono ${
                          QUALITY_BADGE[opt.res] ??
                          "bg-muted/60 text-muted-foreground border-border"
                        }`}
                      >
                        {opt.res}
                      </Badge>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">
                          {opt.label}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {opt.sizeFmt}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {/* Save offline */}
                        <button
                          type="button"
                          disabled={!!loadingRes || !!savingOffline}
                          onClick={() => void handleSaveOffline(opt)}
                          aria-label={
                            isRTL ? "حفظ بدون إنترنت" : "Save offline"
                          }
                          data-ocid={`download_page.offline_button.${opt.res.toLowerCase()}`}
                          title={
                            isRTL
                              ? "حفظ للتشغيل بدون إنترنت"
                              : "Save for offline"
                          }
                          className={`w-7 h-7 flex items-center justify-center rounded-lg border transition-colors disabled:opacity-40 ${
                            isSavedOff
                              ? "border-emerald-500/40 bg-emerald-500/20 text-emerald-400"
                              : "border-border hover:bg-primary/10 hover:border-primary/40 hover:text-primary text-muted-foreground"
                          }`}
                        >
                          {isSavingOff ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : isSavedOff ? (
                            <CheckCircle2 className="h-3.5 w-3.5" />
                          ) : (
                            <WifiOff className="h-3.5 w-3.5" />
                          )}
                        </button>
                        {/* Download */}
                        <button
                          type="button"
                          disabled={!!loadingRes}
                          onClick={() => void handleDownload(opt)}
                          data-ocid={`download_page.quality_button.${opt.res.toLowerCase()}`}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all disabled:opacity-50 ${
                            isSuccess
                              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                              : isError
                                ? "bg-destructive/20 text-destructive border border-destructive/40"
                                : "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/20"
                          }`}
                        >
                          {isLoading ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : isSuccess ? (
                            <CheckCircle2 className="h-3.5 w-3.5" />
                          ) : isError ? (
                            <AlertCircle className="h-3.5 w-3.5" />
                          ) : opt.isAudio ? (
                            <Music className="h-3.5 w-3.5" />
                          ) : (
                            <Download className="h-3.5 w-3.5" />
                          )}
                          <span>
                            {isLoading
                              ? isRTL
                                ? "جارى..."
                                : "Fetching..."
                              : isSuccess
                                ? isRTL
                                  ? "تم!"
                                  : "Saved!"
                                : isError
                                  ? isRTL
                                    ? "خطأ"
                                    : "Error"
                                  : isRTL
                                    ? "تحميل"
                                    : "Download"}
                          </span>
                        </button>
                      </div>
                    </div>
                    {/* Download progress */}
                    {prog && isLoading && (
                      <div className="w-full h-1.5 bg-muted/40 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-cyan-500 rounded-full transition-all duration-300"
                          style={{
                            width: `${prog.percent > 0 ? prog.percent : 15}%`,
                          }}
                        />
                      </div>
                    )}
                    {/* Offline save progress */}
                    {offProg && isSavingOff && (
                      <div className="w-full h-1.5 bg-muted/40 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all duration-300"
                          style={{
                            width: `${offProg.percent > 0 ? offProg.percent : 15}%`,
                          }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {limitReached && (
          <div
            className="text-center py-6 space-y-3"
            data-ocid="download_page.limit_empty_state"
          >
            <AlertCircle className="h-10 w-10 mx-auto text-destructive" />
            <p className="font-display font-semibold text-foreground">
              {isRTL ? "تجاوزت الحد اليومي" : "Daily limit reached"}
            </p>
            <p className="text-sm text-muted-foreground">
              {isRTL
                ? "المستخدمون المجانيون: 3 تحميلات/يوم"
                : "Free users: 3 downloads per day"}
            </p>
            <Button
              type="button"
              className="gradient-primary text-white border-0"
              data-ocid="download_page.subscribe_button"
              onClick={() => {
                window.location.href = "/subscribe";
              }}
            >
              {isRTL ? "اشترك الآن" : "Subscribe Now"}
            </Button>
          </div>
        )}

        {/* Detailed error diagnostic block */}
        {detailedError && (
          <div
            className="rounded-xl border border-destructive/40 bg-destructive/10 p-4 space-y-2"
            data-ocid="download_page.error_diagnostic"
          >
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-4 w-4" />
              <p className="text-sm font-semibold">
                {isRTL ? "❌ فشل التحميل" : "❌ Download Failed"}
              </p>
            </div>
            <div className="space-y-1 text-xs text-foreground/90">
              <p>
                <span className="font-semibold">
                  {isRTL ? "السبب:" : "Reason:"}
                </span>{" "}
                {detailedError}
              </p>
              <p>
                <span className="font-semibold">
                  {isRTL ? "الخطوة:" : "Step:"}
                </span>{" "}
                {debugLog.find((e) => e.status === "error")?.step ?? "unknown"}
              </p>
              <p>
                <span className="font-semibold">
                  {isRTL ? "المنصة:" : "Platform:"}
                </span>{" "}
                {platform}
              </p>
              <p>
                <span className="font-semibold">
                  {isRTL ? "معرف الفيديو:" : "Video ID:"}
                </span>{" "}
                {videoId}
              </p>
            </div>
          </div>
        )}

        {/* Debug log panel — always visible after failure */}
        {showDebug && debugLog.length > 0 && (
          <div className="rounded-xl border border-border bg-muted/30 overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-muted-foreground">
              <Terminal className="h-3.5 w-3.5" />
              {isRTL ? "سجل التشخيص" : "Debug Log"}
              <span className="ms-auto text-[10px] bg-muted px-1.5 py-0.5 rounded">
                {debugLog.length}
              </span>
            </div>
            <div className="px-4 pb-3 space-y-1.5 max-h-64 overflow-y-auto">
              {debugLog.map((entry) => (
                <div
                  key={`${entry.timestamp}-${entry.step}-${entry.message}`}
                  className={`text-[11px] font-mono leading-relaxed rounded px-2 py-1 ${
                    entry.status === "error"
                      ? "bg-destructive/10 text-destructive"
                      : entry.status === "warning"
                        ? "bg-amber-500/10 text-amber-400"
                        : entry.status === "success"
                          ? "bg-emerald-500/10 text-emerald-400"
                          : "bg-muted/40 text-muted-foreground"
                  }`}
                >
                  <span className="opacity-60">
                    {entry.timestamp.slice(11, 19)}
                  </span>{" "}
                  <span className="font-semibold">[{entry.step}]</span>{" "}
                  {entry.message}
                  {entry.details && (
                    <pre className="mt-1 text-[10px] opacity-80 whitespace-pre-wrap">
                      {JSON.stringify(entry.details, null, 2)}
                    </pre>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Copy + open external */}
        <div className="space-y-2 border-t border-border pt-4">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
            {isRTL ? "خيارات أخرى" : "Other Options"}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => void copyLink()}
              data-ocid="download_page.copy_link_button"
              className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl border border-border bg-muted/20 hover:bg-muted/40 text-sm text-foreground transition-colors"
            >
              {copied ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              ) : (
                <ClipboardCopy className="h-4 w-4 text-muted-foreground" />
              )}
              {isRTL ? "نسخ الرابط" : "Copy Link"}
            </button>
            <a
              href={watchUrl}
              target="_blank"
              rel="noopener noreferrer"
              data-ocid="download_page.open_external_link"
              className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl border border-border bg-muted/20 hover:bg-muted/40 text-sm text-foreground transition-colors"
            >
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
              {isRTL ? "فتح خارجيًا" : "Open Externally"}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
