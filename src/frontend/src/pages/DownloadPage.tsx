/**
 * DownloadPage.tsx — Full-page download manager for StreamVerse.
 * Uses downloadService.ts for Invidious/cobalt-based real downloads.
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
import { getDownloadLimitInfo, recordDownloadLocal } from "../lib/backend";
import {
  DOWNLOAD_CONTENT_ERROR,
  DOWNLOAD_CORS_ERROR,
  buildWatchUrl,
  clearDownloadDebugLog,
  downloadVideoLegacy as downloadVideo,
  getDownloadDebugLog,
  triggerAnchorDownload,
  triggerBlobDownload,
} from "../lib/downloadService";
import type { DownloadProgress } from "../lib/downloadService";
import { useTranslation } from "../lib/i18n";
import { saveVideo } from "../lib/offlineStorage";
import type { VideoMetadata } from "../types";

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

interface DownloadPageProps {
  videoId: string;
  title?: string;
  platform?: string;
  thumbnailUrl?: string;
  channelTitle?: string;
  duration?: string;
  onBack?: () => void;
  isSubscribed?: boolean;
}

export default function DownloadPage({
  videoId,
  title,
  platform = "youtube",
  thumbnailUrl,
  channelTitle = "",
  duration = "",
  onBack,
  isSubscribed = false,
}: DownloadPageProps) {
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
  // AbortController reserved for future cancellation support

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

  const embedUrl =
    platform === "youtube"
      ? `https://www.youtube.com/embed/${videoId}`
      : platform === "vimeo"
        ? `https://player.vimeo.com/video/${videoId}`
        : null;

  async function handleDownload(opt: QualityOpt) {
    // Block YouTube and TikTok downloads
    if (platform === "youtube" || platform === "tiktok") {
      setErrorRes(
        isRTL
          ? "هذا الفيديو للبث فقط - التحميل غير متاح"
          : "This video is stream-only - download is not available",
      );
      return;
    }
    if (loadingRes) return;
    if (!isSubscribed) {
      const info = getDownloadLimitInfo();
      if (info.remaining <= 0) {
        toast.error(
          isRTL
            ? "لقد وصلت إلى الحد اليومي للتحميل. اشترك للحصول على تحميلات غير محدودة!"
            : "Daily download limit reached. Subscribe for unlimited downloads!",
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
      const result = await downloadVideo({
        videoId,
        platform,
        quality: opt.vQuality,
        isAudio: !!opt.isAudio,
        title: title ?? videoId,
        onProgress: (prog) =>
          setProgress((p) => ({
            ...p,
            [opt.res]: {
              stage: "downloading" as const,
              percent: prog.percent || 0,
            },
          })),
      });

      if (result.success && result.blobUrl && result.filename) {
        // Real blob download — saves to device
        triggerBlobDownload(result.blobUrl, result.filename);
        recordDownloadLocal();
        setDownloadInfo(getDownloadLimitInfo());
        setSuccessRes(opt.res);
        setTimeout(() => setSuccessRes(null), 4000);
        toast.success(
          isRTL
            ? "✓ تم تحميل الفيديو على جهازك"
            : "✓ Video saved to your device",
          { duration: 3000 },
        );
      } else if (result.success && result.directUrl && result.filename) {
        // Have URL but couldn't fetch blob (CORS) — use anchor download
        triggerAnchorDownload(result.directUrl, result.filename);
        recordDownloadLocal();
        setDownloadInfo(getDownloadLimitInfo());
        setSuccessRes(opt.res);
        setTimeout(() => setSuccessRes(null), 4000);
        toast.success(isRTL ? "✓ بدأ التحميل" : "✓ Download started", {
          duration: 3000,
        });
      } else {
        // Download failed — show REAL error message
        const errMsg = result.details ?? result.error ?? DOWNLOAD_CONTENT_ERROR;
        const isCorsErr = errMsg.includes("CORS");
        const isContentErr =
          errMsg === DOWNLOAD_CONTENT_ERROR ||
          errMsg.includes("تعذر التحميل - يرجى");
        setErrorRes(opt.res);
        setDetailedError(errMsg);
        setDebugLog(getDownloadDebugLog());
        setShowDebug(true);
        toast.error(
          isCorsErr
            ? isRTL
              ? DOWNLOAD_CORS_ERROR.split(" / ")[0]
              : DOWNLOAD_CORS_ERROR.split(" / ")[1]
            : isContentErr
              ? isRTL
                ? "تعذر التحميل - يرجى المحاولة مرة أخرى"
                : "Download failed - please try again"
              : isRTL
                ? errMsg
                : errMsg,
          { duration: 8000 },
        );
        setTimeout(() => setErrorRes(null), 6000);
      }
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
      const result = await downloadVideo({
        videoId,
        platform,
        quality: opt.vQuality,
        isAudio: !!opt.isAudio,
        title: title ?? videoId,
        onProgress: (prog) =>
          setProgress((p) => ({
            ...p,
            [`off_${opt.res}`]: {
              stage: "downloading" as const,
              percent: prog.percent || 0,
            },
          })),
      });

      if (result.blob && result.success) {
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
        const arrayBuf = await result.blob.arrayBuffer();
        await saveVideo(meta, arrayBuf);
        console.log("VIDEO SAVED TO INDEXEDDB", meta.videoId);
        setSavedOfflineRes(opt.res);
        setTimeout(() => setSavedOfflineRes(null), 4000);
        toast.success(
          isRTL
            ? "✓ تم حفظ الفيديو للمشاهدة بدون إنترنت"
            : "✓ Saved for offline viewing",
        );
      } else {
        // Save metadata only (no blob available)
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
        toast.warning(
          isRTL
            ? "تم حفظ البيانات فقط (ملف الفيديو غير متاح)"
            : "Saved metadata only (video file unavailable)",
          { duration: 4000 },
        );
      }
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
    <div className="min-h-screen bg-background" data-ocid="download_page">
      {/* Header */}
      <div className="bg-card border-b border-border px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
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
            <p className="text-sm font-display font-semibold text-foreground truncate">
              {isRTL ? "تحميل الفيديو" : "Download Video"}
            </p>
            {title && (
              <p className="text-xs text-muted-foreground truncate max-w-[220px]">
                {title}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Video preview */}
        {(embedUrl || thumb) && (
          <div className="rounded-2xl overflow-hidden bg-card border border-border">
            {embedUrl ? (
              <div className="aspect-video">
                <iframe
                  src={embedUrl}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={title ?? "Video preview"}
                  loading="lazy"
                />
              </div>
            ) : thumb ? (
              <div className="aspect-video relative">
                <img
                  src={thumb}
                  alt={title ?? "Thumbnail"}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                  <Film className="h-10 w-10 text-white/70" />
                </div>
              </div>
            ) : null}
          </div>
        )}

        {/* Download limit banner */}
        {!isSubscribed && (
          <div
            className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${
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
                    ? `تحملت ${downloadInfo.used} من ${downloadInfo.limit} تحميلات اليوم \u2014 وصلت للحد الأقصى`
                    : `تحملت ${downloadInfo.used} من ${downloadInfo.limit} تحميلات اليوم`
                  : limitReached
                    ? `Downloaded ${downloadInfo.used} of ${downloadInfo.limit} today — limit reached`
                    : `Downloaded ${downloadInfo.used} of ${downloadInfo.limit} today`}
              </p>
              <p className="text-xs text-muted-foreground">
                {isRTL
                  ? `متبقي ${downloadInfo.remaining} تحميل${downloadInfo.remaining === 1 ? "" : ""} اليوم`
                  : `${downloadInfo.remaining} download${downloadInfo.remaining === 1 ? "" : "s"} remaining today`}
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
          <div className="space-y-3">
            <div className="flex items-center gap-2">
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
                    className={`flex flex-col gap-2 px-3 py-3 rounded-xl border transition-all duration-150 ${
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
                          className={`w-7 h-7 flex items-center justify-center rounded-lg border transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
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
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed ${
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
                                  ? "تم التحميل"
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
                    {/* Download progress bar */}
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
                    {/* Offline save progress bar */}
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

        {/* Limit-reached upgrade prompt */}
        {limitReached && (
          <div
            className="text-center py-8 space-y-4"
            data-ocid="download_page.limit_empty_state"
          >
            <div className="w-16 h-16 mx-auto rounded-2xl bg-destructive/10 flex items-center justify-center">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
            <div className="space-y-1">
              <p className="font-display font-semibold text-foreground">
                {isRTL ? "تجاوزت الحد اليومي" : "Daily limit reached"}
              </p>
              <p className="text-sm text-muted-foreground">
                {isRTL
                  ? "المستخدمون المجانيون لديهم 3 تحميلات يوميًا. اشترك للحصول على تحميلات غير محدودة."
                  : "Free users have 3 downloads per day. Subscribe for unlimited downloads."}
              </p>
            </div>
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

        {/* Debug log (always visible after failure) */}
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

        {/* Copy link + open externally */}
        <div className="space-y-2 border-t border-border pt-4">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
            {isRTL ? "خيارات أخرى" : "Other Options"}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => void copyLink()}
              data-ocid="download_page.copy_link_button"
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-border bg-muted/20 hover:bg-muted/40 transition-colors text-sm text-foreground"
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
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-border bg-muted/20 hover:bg-muted/40 transition-colors text-sm text-foreground"
            >
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
              {isRTL ? "فتح خارجيًا" : "Open Externally"}
            </a>
          </div>
          <p className="text-xs text-muted-foreground/70 leading-relaxed">
            {isRTL
              ? "يمكنك نسخ الرابط واستخدامه مع تطبيق تحميل خارجي من اختيارك."
              : "You can copy the link and use it with an external download app of your choice."}
          </p>
        </div>
      </div>
    </div>
  );
}
