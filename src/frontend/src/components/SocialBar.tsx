import { cn } from "@/lib/utils";
import {
  BookmarkPlus,
  Download,
  Loader2,
  MessageCircle,
  Share2,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { DownloadModal } from "../components/DownloadModal";
import { useTranslation } from "../lib/i18n";

export interface SocialBarProps {
  videoTitle?: string;
  videoId: string;
  videoUrl?: string;
  /** Platform type: 'youtube' | 'vimeo' or undefined for user uploads */
  platform?: string;
  likeCount?: number;
  dislikeCount?: number;
  commentCount?: number;
  userReaction?: "like" | "dislike" | null;
  onLike?: () => void;
  onDislike?: () => void;
  onComment?: () => void;
  onShare?: () => void;
  compact?: boolean;
  index?: number;
  className?: string;
  onDownloadOverride?: () => void;
  onAddToPlaylist?: () => void;
}

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

/** Returns true if the URL points to a direct downloadable file (not YouTube/Vimeo embed) */
function isDirectDownloadUrl(url: string): boolean {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();
    const isExternal =
      host.includes("youtube") ||
      host.includes("youtu.be") ||
      host.includes("vimeo");
    return !isExternal;
  } catch {
    // relative URL — treat as direct
    return true;
  }
}

// isRTL forwarded for fallback toast in non-component contexts
export async function handleVideoDownload(
  platform: string | undefined,
  videoId: string,
  videoUrl: string | undefined,
  title: string,
  t: (key: string) => string,
  isRTL = false,
) {
  // Determine if this is a direct file URL
  const directUrl = videoUrl && isDirectDownloadUrl(videoUrl) ? videoUrl : null;

  if (directUrl) {
    // Real browser download for user-uploaded videos
    const toastId = toast.loading(t("download.preparing"));
    try {
      const response = await fetch(directUrl);
      if (!response.ok) throw new Error("Network response not ok");
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      const ext =
        blob.type.split("/")[1] ||
        directUrl.split(".").pop()?.split("?")[0] ||
        "mp4";
      a.download = `${title.replace(/[^a-z0-9]/gi, "_").slice(0, 60)}.${ext}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
      toast.success(t("download.success"), { id: toastId });
    } catch {
      toast.error(t("download.failed"), { id: toastId });
    }
    return;
  }

  // YouTube / Vimeo / TikTok / Kwai — callers should open DownloadModal instead;
  // this fallback is kept only for direct calls outside SocialBar component
  const fallbackUrl =
    platform === "vimeo"
      ? `https://vimeo.com/${videoId}`
      : `https://www.youtube.com/watch?v=${videoId}`;
  toast.info(
    isRTL
      ? "يرجى استخدام زر التحميل في البطاقة"
      : "Use the download button on the video card",
    { duration: 4000 },
  );
  // Copy link as fallback so user can use an external downloader
  try {
    await navigator.clipboard.writeText(fallbackUrl);
    toast.success(
      isRTL ? "تم نسخ رابط الفيديو" : "Video link copied to clipboard",
      { duration: 3000 },
    );
  } catch {
    // clipboard unavailable
  }
}

export function SocialBar({
  videoId,
  videoUrl,
  platform,
  likeCount = 0,
  dislikeCount = 0,
  commentCount = 0,
  userReaction,
  onLike,
  onDislike,
  onComment,
  onShare,
  compact = false,
  index,
  className,
  videoTitle,
  onAddToPlaylist,
}: SocialBarProps) {
  const { t, isRTL } = useTranslation();
  const [downloading, setDownloading] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const ocidSuffix = index !== undefined ? `.${index + 1}` : "";

  // Treat undefined/null platform as YouTube (external) so DownloadModal opens instead of native app
  const isExternal =
    !platform ||
    platform === "youtube" ||
    platform === "vimeo" ||
    platform === "tiktok" ||
    platform === "kwai";
  const directUrl = videoUrl && !isExternal ? videoUrl : null;

  const onDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (downloading) return;

    // ALWAYS open the in-app download modal for external platforms (YouTube, Vimeo, TikTok, Kwai)
    // This prevents any native YouTube app redirect
    if (isExternal || !directUrl) {
      setShowDownloadModal(true);
      return;
    }

    // Direct file download (user upload)
    setDownloading(true);
    try {
      await handleVideoDownload(
        platform,
        videoId,
        directUrl ?? undefined,
        videoTitle ?? videoId,
        t as (key: string) => string,
      );
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div
      className={cn(
        "flex items-center gap-1",
        compact ? "gap-0.5" : "gap-1",
        className,
      )}
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* Like */}
      <button
        type="button"
        data-ocid={`social.like_button${ocidSuffix}`}
        onClick={(e) => {
          e.stopPropagation();
          onLike?.();
        }}
        aria-label={isRTL ? "إعجاب" : "Like"}
        className={cn(
          "social-button rounded-full transition-all duration-200 active:scale-95",
          compact ? "px-2 py-1 text-xs gap-1" : "px-3 py-2 text-sm gap-1.5",
          userReaction === "like"
            ? "bg-green-500/20 text-green-400 ring-1 ring-green-500/40"
            : "hover:bg-green-500/10 text-muted-foreground hover:text-green-400",
        )}
      >
        <ThumbsUp
          className={cn(
            compact ? "h-3.5 w-3.5" : "h-4 w-4",
            userReaction === "like" && "fill-green-400",
          )}
        />
        {likeCount > 0 && (
          <span className="font-mono font-medium tabular-nums">
            {formatCount(likeCount)}
          </span>
        )}
      </button>

      {/* Dislike */}
      <button
        type="button"
        data-ocid={`social.dislike_button${ocidSuffix}`}
        onClick={(e) => {
          e.stopPropagation();
          onDislike?.();
        }}
        aria-label={isRTL ? "عدم إعجاب" : "Dislike"}
        className={cn(
          "social-button rounded-full transition-all duration-200 active:scale-95",
          compact ? "px-2 py-1 text-xs gap-1" : "px-3 py-2 text-sm gap-1.5",
          userReaction === "dislike"
            ? "bg-destructive/20 text-destructive ring-1 ring-destructive/40"
            : "hover:bg-destructive/10 text-muted-foreground hover:text-destructive",
        )}
      >
        <ThumbsDown
          className={cn(
            compact ? "h-3.5 w-3.5" : "h-4 w-4",
            userReaction === "dislike" && "fill-destructive",
          )}
        />
        {dislikeCount > 0 && (
          <span className="font-mono font-medium tabular-nums">
            {formatCount(dislikeCount)}
          </span>
        )}
      </button>

      {/* Comment */}
      <button
        type="button"
        data-ocid={`social.comment_button${ocidSuffix}`}
        onClick={(e) => {
          e.stopPropagation();
          onComment?.();
        }}
        aria-label={isRTL ? "التعليقات" : "Comments"}
        className={cn(
          "social-button rounded-full transition-all duration-200 hover:bg-primary/10 hover:text-primary text-muted-foreground active:scale-95",
          compact ? "px-2 py-1 text-xs gap-1" : "px-3 py-2 text-sm gap-1.5",
        )}
      >
        <MessageCircle className={compact ? "h-3.5 w-3.5" : "h-4 w-4"} />
        {commentCount > 0 && (
          <span className="font-mono font-medium tabular-nums">
            {formatCount(commentCount)}
          </span>
        )}
      </button>

      {/* Share */}
      <button
        type="button"
        data-ocid={`social.share_button${ocidSuffix}`}
        onClick={(e) => {
          e.stopPropagation();
          onShare?.();
        }}
        aria-label={isRTL ? "مشاركة" : "Share"}
        className={cn(
          "social-button rounded-full transition-all duration-200 hover:bg-primary/10 hover:text-primary text-muted-foreground active:scale-95",
          compact ? "px-2 py-1 text-xs gap-1" : "px-3 py-2 text-sm gap-1.5",
        )}
      >
        <Share2 className={compact ? "h-3.5 w-3.5" : "h-4 w-4"} />
      </button>

      {/* Download */}
      <button
        type="button"
        data-ocid={`social.download_button${ocidSuffix}`}
        onClick={onDownload}
        disabled={downloading}
        aria-label={isRTL ? "تحميل" : "Download"}
        className={cn(
          "social-button rounded-full transition-all duration-200 hover:bg-cyan-500/10 hover:text-cyan-400 text-muted-foreground active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed",
          compact ? "px-2 py-1 text-xs gap-1" : "px-3 py-2 text-sm gap-1.5",
        )}
      >
        {downloading ? (
          <Loader2
            className={cn("animate-spin", compact ? "h-3.5 w-3.5" : "h-4 w-4")}
          />
        ) : (
          <Download className={compact ? "h-3.5 w-3.5" : "h-4 w-4"} />
        )}
      </button>

      {/* Add to playlist */}
      {onAddToPlaylist && (
        <button
          type="button"
          data-ocid={`social.add_to_playlist_button${ocidSuffix}`}
          onClick={(e) => {
            e.stopPropagation();
            onAddToPlaylist();
          }}
          aria-label={isRTL ? "إضافة إلى قائمة" : "Add to playlist"}
          className={cn(
            "social-button rounded-full transition-all duration-200 hover:bg-primary/10 hover:text-primary text-muted-foreground active:scale-95",
            compact ? "px-2 py-1 text-xs gap-1" : "px-3 py-2 text-sm gap-1.5",
          )}
        >
          <BookmarkPlus className={compact ? "h-3.5 w-3.5" : "h-4 w-4"} />
        </button>
      )}
      {/* Download quality modal for YouTube/Vimeo */}
      {isExternal && (
        <DownloadModal
          open={showDownloadModal}
          onClose={() => setShowDownloadModal(false)}
          videoId={videoId}
          title={videoTitle}
          platform={platform}
          videoUrl={videoUrl}
        />
      )}
    </div>
  );
}
