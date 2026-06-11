import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  Download,
  Eye,
  Heart,
  LayoutGrid,
  Share2,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { DownloadModal } from "../components/DownloadModal";
import { VideoPlayer } from "../components/VideoPlayer";
import { useActor } from "../lib/backend";
import type { VideoSearchResult } from "../lib/backend";
import { getTrendingVideos } from "../lib/backend";
import { useTranslation } from "../lib/i18n";
import type { VideoMetadata } from "../types";

// ─── Types ───────────────────────────────────────────────────────────────────

interface FeedVideo extends VideoSearchResult {
  liked?: boolean;
  likeCount?: number;
  streamUrl?: string;
  canDownload?: boolean;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function toVideoMetadata(v: FeedVideo): VideoMetadata {
  return {
    videoId: v.videoId,
    title: v.title,
    thumbnailUrl: v.thumbnailUrl,
    viewCount: v.viewCount,
    duration: v.duration,
    channelTitle: v.channelTitle,
    publishedAt: v.publishedAt,
    platform: v.platform,
  };
}

function getPlatformStreamUrl(video: FeedVideo): string {
  switch (video.platform) {
    case "youtube":
      return `https://www.youtube.com/embed/${video.videoId}?autoplay=1&mute=1`;
    case "vimeo":
      return `https://player.vimeo.com/video/${video.videoId}?autoplay=1&muted=1`;
    case "tiktok":
      return video.thumbnailUrl; // TikTok doesn't have direct embed URLs without API
    default:
      return video.thumbnailUrl;
  }
}

function getProviderIcon(platform: string) {
  switch (platform) {
    case "youtube":
      return (
        <svg
          className="w-5 h-5"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-label="YouTube"
          role="img"
        >
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      );
    case "vimeo":
      return (
        <svg
          className="w-5 h-5"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-label="Vimeo"
          role="img"
        >
          <path d="M23.977 6.416c-.105 2.338-1.739 5.543-4.894 9.609-3.268 4.247-6.026 6.37-8.29 6.37-1.409 0-2.578-1.294-3.553-3.881L5.322 11.4C4.603 8.816 3.834 7.522 3.01 7.522c-.179 0-.806.378-1.881 1.132L0 7.197c1.185-1.044 2.351-2.084 3.501-3.128C5.08 2.701 6.266 1.984 7.055 1.91c1.867-.18 3.016 1.1 3.447 3.838.465 2.953.789 4.789.971 5.507.539 2.45 1.131 3.674 1.776 3.674.502 0 1.256-.796 2.265-2.385 1.004-1.589 1.54-2.797 1.612-3.628.144-1.371-.395-2.061-1.614-2.061-.574 0-1.167.121-1.777.391 1.186-3.868 3.434-5.757 6.762-5.637 2.473.075 3.654 1.664 3.57 4.771z" />
        </svg>
      );
    case "tiktok":
      return (
        <svg
          className="w-5 h-5"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-label="TikTok"
          role="img"
        >
          <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
        </svg>
      );
    case "archive":
      return (
        <svg
          className="w-5 h-5"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-label="Internet Archive"
          role="img"
        >
          <path d="M20.54 5.23l-1.39-1.68C18.88 3.21 18.47 3 18 3H6c-.47 0-.88.21-1.16.55L3.46 5.23C3.17 5.57 3 6.02 3 6.5V19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6.5c0-.48-.17-.93-.46-1.27zM12 17.5L6.5 12H10v-2h4v2h3.5L12 17.5zM5.12 5l.81-1h12.14l.81 1H5.12z" />
        </svg>
      );
    default:
      return <Eye className="w-5 h-5" />;
  }
}

function getProviderLabel(platform: string, isRTL: boolean): string {
  switch (platform) {
    case "youtube":
      return isRTL ? "يوتيوب" : "YouTube";
    case "vimeo":
      return isRTL ? "فيميو" : "Vimeo";
    case "tiktok":
      return isRTL ? "تيك توك" : "TikTok";
    case "archive":
      return isRTL ? "أرشيف الإنترنت" : "Internet Archive";
    default:
      return platform;
  }
}

function getProviderColor(platform: string): string {
  switch (platform) {
    case "youtube":
      return "text-red-400";
    case "vimeo":
      return "text-sky-400";
    case "tiktok":
      return "text-pink-400";
    case "archive":
      return "text-amber-400";
    default:
      return "text-primary";
  }
}

// ─── Feed Item Component ────────────────────────────────────────────────────

interface FeedItemProps {
  video: FeedVideo;
  isActive: boolean;
  onToggleLike: (videoId: string) => void;
  onOpenPlayer: (video: FeedVideo) => void;
  onShare: (video: FeedVideo) => void;
  index: number;
}

function FeedItem({
  video,
  isActive,
  onToggleLike,
  onOpenPlayer,
  onShare,
  index,
}: FeedItemProps) {
  const { isRTL } = useTranslation();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [videoError, setVideoError] = useState(false);

  // Auto-play / pause based on active state
  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    if (isActive) {
      el.play().catch(() => {
        // Autoplay blocked — show thumbnail fallback
      });
    } else {
      el.pause();
      el.currentTime = 0;
    }
  }, [isActive]);

  const handleMuteToggle = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setMuted((m) => !m);
  }, []);

  const handleLike = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onToggleLike(video.videoId);
    },
    [onToggleLike, video.videoId],
  );

  const handleShare = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onShare(video);
    },
    [onShare, video],
  );

  const handleWatch = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onOpenPlayer(video);
    },
    [onOpenPlayer, video],
  );

  const handleDownload = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDownloadModal(true);
  }, []);

  // Build stream URL from platform
  const streamUrl = video.streamUrl || getPlatformStreamUrl(video);
  const canDownload = video.canDownload ?? true;

  return (
    <div
      className="relative w-full h-full flex-shrink-0 snap-start snap-always overflow-hidden bg-black"
      data-ocid={`feed.item.${index + 1}`}
    >
      {/* Video / Thumbnail */}
      {streamUrl && !videoError ? (
        <video
          ref={videoRef}
          src={streamUrl}
          poster={video.thumbnailUrl}
          muted={muted}
          loop
          playsInline
          preload={index < 3 ? "auto" : "metadata"}
          className="absolute inset-0 w-full h-full object-cover"
          onError={() => setVideoError(true)}
        />
      ) : (
        <div
          className="absolute inset-0 w-full h-full bg-cover bg-center"
          style={{ backgroundImage: `url(${video.thumbnailUrl})` }}
        />
      )}

      {/* Dark gradient overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

      {/* Top navigation bar */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4 pt-safe pt-4">
        <Link
          to="/"
          className="flex items-center justify-center w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm text-white hover:bg-black/60 transition-colors"
          data-ocid="feed.back_button"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <Link
          to="/"
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/40 backdrop-blur-sm text-white text-sm font-medium hover:bg-black/60 transition-colors"
          data-ocid="feed.switch_view_button"
        >
          <LayoutGrid className="w-4 h-4" />
          <span className="hidden sm:inline">
            {isRTL ? "عرض نيتفليكس" : "Netflix View"}
          </span>
        </Link>
      </div>

      {/* Right side interaction buttons (TikTok style) */}
      <div className="absolute right-4 bottom-24 z-20 flex flex-col items-center gap-5">
        {/* Like */}
        <button
          type="button"
          onClick={handleLike}
          className="flex flex-col items-center gap-1 group"
          data-ocid={`feed.like_button.${index + 1}`}
          aria-label={isRTL ? "إعجاب" : "Like"}
        >
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 ${
              video.liked
                ? "bg-red-500/20 text-red-400"
                : "bg-black/40 backdrop-blur-sm text-white hover:bg-black/60"
            }`}
          >
            <Heart
              className={`w-6 h-6 transition-transform group-active:scale-125 ${
                video.liked ? "fill-red-400" : ""
              }`}
            />
          </div>
          <span className="text-white text-xs font-medium drop-shadow-lg">
            {video.likeCount ?? 0}
          </span>
        </button>

        {/* Share */}
        <button
          type="button"
          onClick={handleShare}
          className="flex flex-col items-center gap-1 group"
          data-ocid={`feed.share_button.${index + 1}`}
          aria-label={isRTL ? "مشاركة" : "Share"}
        >
          <div className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/60 transition-all duration-200">
            <Share2 className="w-6 h-6 transition-transform group-active:scale-125" />
          </div>
          <span className="text-white text-xs font-medium drop-shadow-lg">
            {isRTL ? "مشاركة" : "Share"}
          </span>
        </button>

        {/* Provider badge */}
        <div
          className="flex flex-col items-center gap-1"
          data-ocid={`feed.provider_badge.${index + 1}`}
        >
          <div
            className={`w-12 h-12 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center ${getProviderColor(video.platform)}`}
          >
            {getProviderIcon(video.platform)}
          </div>
          <span className="text-white text-xs font-medium drop-shadow-lg">
            {getProviderLabel(video.platform, isRTL)}
          </span>
        </div>

        {/* Mute toggle */}
        <button
          type="button"
          onClick={handleMuteToggle}
          className="flex flex-col items-center gap-1"
          data-ocid={`feed.mute_button.${index + 1}`}
          aria-label={
            muted ? (isRTL ? "إلغاء الكتم" : "Unmute") : isRTL ? "كتم" : "Mute"
          }
        >
          <div className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/60 transition-all duration-200">
            {muted ? (
              <VolumeX className="w-6 h-6" />
            ) : (
              <Volume2 className="w-6 h-6" />
            )}
          </div>
          <span className="text-white text-xs font-medium drop-shadow-lg">
            {muted ? (isRTL ? "صامت" : "Muted") : isRTL ? "صوت" : "Sound"}
          </span>
        </button>
      </div>

      {/* Bottom info overlay */}
      <div className="absolute bottom-0 left-0 right-0 z-20 px-4 pb-safe pb-6">
        <div className="max-w-[calc(100%-5rem)]">
          {/* Title */}
          <h3 className="text-white font-semibold text-base leading-snug line-clamp-2 drop-shadow-lg mb-1">
            {video.title}
          </h3>

          {/* Source & actions row */}
          <div className="flex items-center gap-3 mt-2">
            <span
              className={`inline-flex items-center gap-1.5 text-xs font-medium ${getProviderColor(video.platform)} bg-black/40 backdrop-blur-sm px-2.5 py-1 rounded-full`}
            >
              {getProviderIcon(video.platform)}
              {getProviderLabel(video.platform, isRTL)}
            </span>

            {/* Watch button */}
            <button
              type="button"
              onClick={handleWatch}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-white bg-primary/80 hover:bg-primary backdrop-blur-sm px-3 py-1.5 rounded-full transition-colors"
              data-ocid={`feed.watch_button.${index + 1}`}
            >
              <Eye className="w-3.5 h-3.5" />
              {isRTL ? "شاهد" : "Watch"}
            </button>

            {/* Download button */}
            <button
              type="button"
              onClick={canDownload ? handleDownload : undefined}
              className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${
                canDownload
                  ? "text-white bg-cyan-500/80 hover:bg-cyan-500 backdrop-blur-sm"
                  : "text-white/50 bg-white/10 backdrop-blur-sm cursor-not-allowed"
              }`}
              data-ocid={`feed.download_button.${index + 1}`}
              title={
                canDownload
                  ? isRTL
                    ? "تحميل"
                    : "Download"
                  : isRTL
                    ? "التحميل غير متاح"
                    : "Not available"
              }
            >
              <Download className="w-3.5 h-3.5" />
              {canDownload
                ? isRTL
                  ? "تحميل"
                  : "Download"
                : isRTL
                  ? "غير متاح"
                  : "N/A"}
            </button>
          </div>
        </div>
      </div>

      {/* Download modal */}
      {showDownloadModal && (
        <DownloadModal
          open={showDownloadModal}
          onClose={() => setShowDownloadModal(false)}
          videoId={video.videoId}
          title={video.title}
          platform={video.platform}
          videoUrl={video.streamUrl || getPlatformStreamUrl(video)}
        />
      )}
    </div>
  );
}

// ─── Main Feed Page ───────────────────────────────────────────────────────────

export default function Feed() {
  const { isRTL } = useTranslation();
  const { actor, isFetching: actorLoading } = useActor();
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [likedVideos, setLikedVideos] = useState<Set<string>>(new Set());
  const [playerVideo, setPlayerVideo] = useState<FeedVideo | null>(null);
  const [_shareVideo, setShareVideo] = useState<FeedVideo | null>(null);

  // Fetch trending videos
  const {
    data: videos = [],
    isLoading,
    error,
  } = useQuery<FeedVideo[]>({
    queryKey: ["feed-trending"],
    queryFn: async () => {
      const results = await getTrendingVideos(20, actor);
      return results.map((v) => ({
        ...v,
        liked: false,
        likeCount: Math.floor(Math.random() * 5000) + 100,
      }));
    },
    enabled: !actorLoading,
    staleTime: 1000 * 60 * 5,
  });

  // IntersectionObserver to track active video
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const idx = Number(entry.target.getAttribute("data-index") ?? "0");
            setActiveIndex(idx);
          }
        }
      },
      {
        root: container,
        threshold: 0.6,
      },
    );

    const items = container.querySelectorAll("[data-index]");
    for (const item of items) observer.observe(item);

    return () => observer.disconnect();
  }, []);

  // Preload adjacent videos
  useEffect(() => {
    const preloadIndices = [activeIndex - 1, activeIndex + 1].filter(
      (i) => i >= 0 && i < videos.length,
    );
    for (const idx of preloadIndices) {
      const video = videos[idx];
      if (video?.thumbnailUrl) {
        const img = new Image();
        img.src = video.thumbnailUrl;
      }
    }
  }, [activeIndex, videos]);

  const handleToggleLike = useCallback((videoId: string) => {
    setLikedVideos((prev) => {
      const next = new Set(prev);
      if (next.has(videoId)) {
        next.delete(videoId);
      } else {
        next.add(videoId);
      }
      return next;
    });
  }, []);

  const handleShare = useCallback(
    (video: FeedVideo) => {
      setShareVideo(video);
      const url =
        video.platform === "vimeo"
          ? `https://vimeo.com/${video.videoId}`
          : `https://www.youtube.com/watch?v=${video.videoId}`;
      if (navigator.share) {
        navigator
          .share({
            title: video.title,
            url,
          })
          .catch(() => {
            // User cancelled
          });
      } else {
        navigator.clipboard.writeText(url).then(() => {
          toast.success(isRTL ? "تم نسخ الرابط" : "Link copied");
        });
      }
    },
    [isRTL],
  );

  const handleOpenPlayer = useCallback((video: FeedVideo) => {
    setPlayerVideo(video);
  }, []);

  const handleClosePlayer = useCallback(() => {
    setPlayerVideo(null);
  }, []);

  // Loading state
  if (isLoading || actorLoading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-white/70 text-sm">
            {isRTL ? "جارٍ تحميل الفيديوهات..." : "Loading videos..."}
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
        <div className="flex flex-col items-center gap-4 px-6 text-center">
          <p className="text-destructive text-lg font-semibold">
            {isRTL ? "خطأ في التحميل" : "Load Error"}
          </p>
          <p className="text-white/60 text-sm">
            {isRTL
              ? "تعذر تحميل الفيديوهات. حاول مرة أخرى."
              : "Could not load videos. Please try again."}
          </p>
          <Link
            to="/"
            className="mt-2 px-6 py-2.5 rounded-full bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
          >
            {isRTL ? "العودة للرئيسية" : "Back to Home"}
          </Link>
        </div>
      </div>
    );
  }

  // Empty state
  if (videos.length === 0) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
        <div className="flex flex-col items-center gap-4 px-6 text-center">
          <p className="text-white/70 text-lg">
            {isRTL ? "لا توجد فيديوهات متاحة" : "No videos available"}
          </p>
          <Link
            to="/"
            className="mt-2 px-6 py-2.5 rounded-full bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
          >
            {isRTL ? "العودة للرئيسية" : "Back to Home"}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black z-40" dir={isRTL ? "rtl" : "ltr"}>
      {/* Scroll container with snap */}
      <div
        ref={containerRef}
        className="w-full h-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
        style={{
          scrollSnapType: "y mandatory",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {videos.map((video, index) => (
          <div key={video.videoId} data-index={index} className="h-full">
            <FeedItem
              video={{
                ...video,
                liked: likedVideos.has(video.videoId),
              }}
              isActive={index === activeIndex}
              onToggleLike={handleToggleLike}
              onOpenPlayer={handleOpenPlayer}
              onShare={handleShare}
              index={index}
            />
          </div>
        ))}
      </div>

      {/* Video player modal */}
      {playerVideo && (
        <VideoPlayer
          video={toVideoMetadata(playerVideo)}
          videoUrl={playerVideo.streamUrl}
          onClose={handleClosePlayer}
          onShare={() => handleShare(playerVideo)}
        />
      )}

      {/* Hide scrollbar */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
