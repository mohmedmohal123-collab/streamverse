import { u as useTranslation, b as useActor, r as reactExports, d as useQuery, v as ue, j as jsxRuntimeExports, L as Link, av as Download, h as getTrendingVideos } from "./index-B4P1PGaK.js";
import { V as VideoPlayer, b as Share2, D as DownloadModal } from "./VideoPlayer-vt5cHaXc.js";
import { A as ArrowLeft } from "./arrow-left-CJSsBox5.js";
import { L as LayoutGrid } from "./layout-grid-DjEallVl.js";
import { H as Heart } from "./heart-CVmL7WsL.js";
import { V as VolumeX, a as Volume2 } from "./volume-x-EhayjM3h.js";
import { E as Eye } from "./eye-DnC41Urw.js";
import "./index-KgqyCsxg.js";
import "./index-BivI3RN0.js";
import "./skeleton-BQhv6M21.js";
import "./textarea-BcmhiIIK.js";
import "./badge-B5FJUKjx.js";
import "./dialog-BTdr-nPe.js";
import "./index-C1nCKn3U.js";
import "./offlineStorage-B7iGHUae.js";
import "./circle-alert-umy4a3lv.js";
import "./film-CmhOy8TL.js";
import "./loader-circle-CD345DHk.js";
import "./wifi-off-Dh_rJnac.js";
import "./external-link-CIWNqrEm.js";
import "./message-circle-BL4BDtUO.js";
import "./bookmark-plus-DCBfQUwu.js";
import "./upload-DDDpJKii.js";
import "./trash-2-QrZqrw48.js";
function toVideoMetadata(v) {
  return {
    videoId: v.videoId,
    title: v.title,
    thumbnailUrl: v.thumbnailUrl,
    viewCount: v.viewCount,
    duration: v.duration,
    channelTitle: v.channelTitle,
    publishedAt: v.publishedAt,
    platform: v.platform
  };
}
function getPlatformStreamUrl(video) {
  switch (video.platform) {
    case "youtube":
      return `https://www.youtube.com/embed/${video.videoId}?autoplay=1&mute=1`;
    case "vimeo":
      return `https://player.vimeo.com/video/${video.videoId}?autoplay=1&muted=1`;
    case "tiktok":
      return video.thumbnailUrl;
    default:
      return video.thumbnailUrl;
  }
}
function getProviderIcon(platform) {
  switch (platform) {
    case "youtube":
      return /* @__PURE__ */ jsxRuntimeExports.jsx(
        "svg",
        {
          className: "w-5 h-5",
          viewBox: "0 0 24 24",
          fill: "currentColor",
          "aria-label": "YouTube",
          role: "img",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" })
        }
      );
    case "vimeo":
      return /* @__PURE__ */ jsxRuntimeExports.jsx(
        "svg",
        {
          className: "w-5 h-5",
          viewBox: "0 0 24 24",
          fill: "currentColor",
          "aria-label": "Vimeo",
          role: "img",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M23.977 6.416c-.105 2.338-1.739 5.543-4.894 9.609-3.268 4.247-6.026 6.37-8.29 6.37-1.409 0-2.578-1.294-3.553-3.881L5.322 11.4C4.603 8.816 3.834 7.522 3.01 7.522c-.179 0-.806.378-1.881 1.132L0 7.197c1.185-1.044 2.351-2.084 3.501-3.128C5.08 2.701 6.266 1.984 7.055 1.91c1.867-.18 3.016 1.1 3.447 3.838.465 2.953.789 4.789.971 5.507.539 2.45 1.131 3.674 1.776 3.674.502 0 1.256-.796 2.265-2.385 1.004-1.589 1.54-2.797 1.612-3.628.144-1.371-.395-2.061-1.614-2.061-.574 0-1.167.121-1.777.391 1.186-3.868 3.434-5.757 6.762-5.637 2.473.075 3.654 1.664 3.57 4.771z" })
        }
      );
    case "tiktok":
      return /* @__PURE__ */ jsxRuntimeExports.jsx(
        "svg",
        {
          className: "w-5 h-5",
          viewBox: "0 0 24 24",
          fill: "currentColor",
          "aria-label": "TikTok",
          role: "img",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" })
        }
      );
    case "archive":
      return /* @__PURE__ */ jsxRuntimeExports.jsx(
        "svg",
        {
          className: "w-5 h-5",
          viewBox: "0 0 24 24",
          fill: "currentColor",
          "aria-label": "Internet Archive",
          role: "img",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M20.54 5.23l-1.39-1.68C18.88 3.21 18.47 3 18 3H6c-.47 0-.88.21-1.16.55L3.46 5.23C3.17 5.57 3 6.02 3 6.5V19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6.5c0-.48-.17-.93-.46-1.27zM12 17.5L6.5 12H10v-2h4v2h3.5L12 17.5zM5.12 5l.81-1h12.14l.81 1H5.12z" })
        }
      );
    default:
      return /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "w-5 h-5" });
  }
}
function getProviderLabel(platform, isRTL) {
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
function getProviderColor(platform) {
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
function FeedItem({
  video,
  isActive,
  onToggleLike,
  onOpenPlayer,
  onShare,
  index
}) {
  const { isRTL } = useTranslation();
  const videoRef = reactExports.useRef(null);
  const [muted, setMuted] = reactExports.useState(true);
  const [showDownloadModal, setShowDownloadModal] = reactExports.useState(false);
  const [videoError, setVideoError] = reactExports.useState(false);
  reactExports.useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    if (isActive) {
      el.play().catch(() => {
      });
    } else {
      el.pause();
      el.currentTime = 0;
    }
  }, [isActive]);
  const handleMuteToggle = reactExports.useCallback((e) => {
    e.stopPropagation();
    setMuted((m) => !m);
  }, []);
  const handleLike = reactExports.useCallback(
    (e) => {
      e.stopPropagation();
      onToggleLike(video.videoId);
    },
    [onToggleLike, video.videoId]
  );
  const handleShare = reactExports.useCallback(
    (e) => {
      e.stopPropagation();
      onShare(video);
    },
    [onShare, video]
  );
  const handleWatch = reactExports.useCallback(
    (e) => {
      e.stopPropagation();
      onOpenPlayer(video);
    },
    [onOpenPlayer, video]
  );
  const handleDownload = reactExports.useCallback((e) => {
    e.stopPropagation();
    setShowDownloadModal(true);
  }, []);
  const streamUrl = video.streamUrl || getPlatformStreamUrl(video);
  const canDownload = video.canDownload ?? true;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: "relative w-full h-full flex-shrink-0 snap-start snap-always overflow-hidden bg-black",
      "data-ocid": `feed.item.${index + 1}`,
      children: [
        streamUrl && !videoError ? /* @__PURE__ */ jsxRuntimeExports.jsx(
          "video",
          {
            ref: videoRef,
            src: streamUrl,
            poster: video.thumbnailUrl,
            muted,
            loop: true,
            playsInline: true,
            preload: index < 3 ? "auto" : "metadata",
            className: "absolute inset-0 w-full h-full object-cover",
            onError: () => setVideoError(true)
          }
        ) : /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: "absolute inset-0 w-full h-full bg-cover bg-center",
            style: { backgroundImage: `url(${video.thumbnailUrl})` }
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4 pt-safe pt-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Link,
            {
              to: "/",
              className: "flex items-center justify-center w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm text-white hover:bg-black/60 transition-colors",
              "data-ocid": "feed.back_button",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "w-5 h-5" })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Link,
            {
              to: "/",
              className: "flex items-center gap-2 px-4 py-2 rounded-full bg-black/40 backdrop-blur-sm text-white text-sm font-medium hover:bg-black/60 transition-colors",
              "data-ocid": "feed.switch_view_button",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(LayoutGrid, { className: "w-4 h-4" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hidden sm:inline", children: isRTL ? "عرض نيتفليكس" : "Netflix View" })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute right-4 bottom-24 z-20 flex flex-col items-center gap-5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              type: "button",
              onClick: handleLike,
              className: "flex flex-col items-center gap-1 group",
              "data-ocid": `feed.like_button.${index + 1}`,
              "aria-label": isRTL ? "إعجاب" : "Like",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "div",
                  {
                    className: `w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 ${video.liked ? "bg-red-500/20 text-red-400" : "bg-black/40 backdrop-blur-sm text-white hover:bg-black/60"}`,
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Heart,
                      {
                        className: `w-6 h-6 transition-transform group-active:scale-125 ${video.liked ? "fill-red-400" : ""}`
                      }
                    )
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-white text-xs font-medium drop-shadow-lg", children: video.likeCount ?? 0 })
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              type: "button",
              onClick: handleShare,
              className: "flex flex-col items-center gap-1 group",
              "data-ocid": `feed.share_button.${index + 1}`,
              "aria-label": isRTL ? "مشاركة" : "Share",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-12 h-12 rounded-full bg-black/40 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/60 transition-all duration-200", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Share2, { className: "w-6 h-6 transition-transform group-active:scale-125" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-white text-xs font-medium drop-shadow-lg", children: isRTL ? "مشاركة" : "Share" })
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              className: "flex flex-col items-center gap-1",
              "data-ocid": `feed.provider_badge.${index + 1}`,
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "div",
                  {
                    className: `w-12 h-12 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center ${getProviderColor(video.platform)}`,
                    children: getProviderIcon(video.platform)
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-white text-xs font-medium drop-shadow-lg", children: getProviderLabel(video.platform, isRTL) })
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              type: "button",
              onClick: handleMuteToggle,
              className: "flex flex-col items-center gap-1",
              "data-ocid": `feed.mute_button.${index + 1}`,
              "aria-label": muted ? isRTL ? "إلغاء الكتم" : "Unmute" : isRTL ? "كتم" : "Mute",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-12 h-12 rounded-full bg-black/40 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/60 transition-all duration-200", children: muted ? /* @__PURE__ */ jsxRuntimeExports.jsx(VolumeX, { className: "w-6 h-6" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Volume2, { className: "w-6 h-6" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-white text-xs font-medium drop-shadow-lg", children: muted ? isRTL ? "صامت" : "Muted" : isRTL ? "صوت" : "Sound" })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute bottom-0 left-0 right-0 z-20 px-4 pb-safe pb-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-[calc(100%-5rem)]", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-white font-semibold text-base leading-snug line-clamp-2 drop-shadow-lg mb-1", children: video.title }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 mt-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "span",
              {
                className: `inline-flex items-center gap-1.5 text-xs font-medium ${getProviderColor(video.platform)} bg-black/40 backdrop-blur-sm px-2.5 py-1 rounded-full`,
                children: [
                  getProviderIcon(video.platform),
                  getProviderLabel(video.platform, isRTL)
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                type: "button",
                onClick: handleWatch,
                className: "inline-flex items-center gap-1.5 text-xs font-medium text-white bg-primary/80 hover:bg-primary backdrop-blur-sm px-3 py-1.5 rounded-full transition-colors",
                "data-ocid": `feed.watch_button.${index + 1}`,
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "w-3.5 h-3.5" }),
                  isRTL ? "شاهد" : "Watch"
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                type: "button",
                onClick: canDownload ? handleDownload : void 0,
                className: `inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${canDownload ? "text-white bg-cyan-500/80 hover:bg-cyan-500 backdrop-blur-sm" : "text-white/50 bg-white/10 backdrop-blur-sm cursor-not-allowed"}`,
                "data-ocid": `feed.download_button.${index + 1}`,
                title: canDownload ? isRTL ? "تحميل" : "Download" : isRTL ? "التحميل غير متاح" : "Not available",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "w-3.5 h-3.5" }),
                  canDownload ? isRTL ? "تحميل" : "Download" : isRTL ? "غير متاح" : "N/A"
                ]
              }
            )
          ] })
        ] }) }),
        showDownloadModal && /* @__PURE__ */ jsxRuntimeExports.jsx(
          DownloadModal,
          {
            open: showDownloadModal,
            onClose: () => setShowDownloadModal(false),
            videoId: video.videoId,
            title: video.title,
            platform: video.platform,
            videoUrl: video.streamUrl || getPlatformStreamUrl(video)
          }
        )
      ]
    }
  );
}
function Feed() {
  const { isRTL } = useTranslation();
  const { actor, isFetching: actorLoading } = useActor();
  const containerRef = reactExports.useRef(null);
  const [activeIndex, setActiveIndex] = reactExports.useState(0);
  const [likedVideos, setLikedVideos] = reactExports.useState(/* @__PURE__ */ new Set());
  const [playerVideo, setPlayerVideo] = reactExports.useState(null);
  const [_shareVideo, setShareVideo] = reactExports.useState(null);
  const {
    data: videos = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ["feed-trending"],
    queryFn: async () => {
      const results = await getTrendingVideos(20, actor);
      return results.map((v) => ({
        ...v,
        liked: false,
        likeCount: Math.floor(Math.random() * 5e3) + 100
      }));
    },
    enabled: !actorLoading,
    staleTime: 1e3 * 60 * 5
  });
  reactExports.useEffect(() => {
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
        threshold: 0.6
      }
    );
    const items = container.querySelectorAll("[data-index]");
    for (const item of items) observer.observe(item);
    return () => observer.disconnect();
  }, []);
  reactExports.useEffect(() => {
    const preloadIndices = [activeIndex - 1, activeIndex + 1].filter(
      (i) => i >= 0 && i < videos.length
    );
    for (const idx of preloadIndices) {
      const video = videos[idx];
      if (video == null ? void 0 : video.thumbnailUrl) {
        const img = new Image();
        img.src = video.thumbnailUrl;
      }
    }
  }, [activeIndex, videos]);
  const handleToggleLike = reactExports.useCallback((videoId) => {
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
  const handleShare = reactExports.useCallback(
    (video) => {
      setShareVideo(video);
      const url = video.platform === "vimeo" ? `https://vimeo.com/${video.videoId}` : `https://www.youtube.com/watch?v=${video.videoId}`;
      if (navigator.share) {
        navigator.share({
          title: video.title,
          url
        }).catch(() => {
        });
      } else {
        navigator.clipboard.writeText(url).then(() => {
          ue.success(isRTL ? "تم نسخ الرابط" : "Link copied");
        });
      }
    },
    [isRTL]
  );
  const handleOpenPlayer = reactExports.useCallback((video) => {
    setPlayerVideo(video);
  }, []);
  const handleClosePlayer = reactExports.useCallback(() => {
    setPlayerVideo(null);
  }, []);
  if (isLoading || actorLoading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 bg-black flex items-center justify-center z-50", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-white/70 text-sm", children: isRTL ? "جارٍ تحميل الفيديوهات..." : "Loading videos..." })
    ] }) });
  }
  if (error) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 bg-black flex items-center justify-center z-50", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-4 px-6 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-destructive text-lg font-semibold", children: isRTL ? "خطأ في التحميل" : "Load Error" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-white/60 text-sm", children: isRTL ? "تعذر تحميل الفيديوهات. حاول مرة أخرى." : "Could not load videos. Please try again." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Link,
        {
          to: "/",
          className: "mt-2 px-6 py-2.5 rounded-full bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors",
          children: isRTL ? "العودة للرئيسية" : "Back to Home"
        }
      )
    ] }) });
  }
  if (videos.length === 0) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 bg-black flex items-center justify-center z-50", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-4 px-6 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-white/70 text-lg", children: isRTL ? "لا توجد فيديوهات متاحة" : "No videos available" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Link,
        {
          to: "/",
          className: "mt-2 px-6 py-2.5 rounded-full bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors",
          children: isRTL ? "العودة للرئيسية" : "Back to Home"
        }
      )
    ] }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "fixed inset-0 bg-black z-40", dir: isRTL ? "rtl" : "ltr", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        ref: containerRef,
        className: "w-full h-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide",
        style: {
          scrollSnapType: "y mandatory",
          scrollbarWidth: "none",
          msOverflowStyle: "none"
        },
        children: videos.map((video, index) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { "data-index": index, className: "h-full", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          FeedItem,
          {
            video: {
              ...video,
              liked: likedVideos.has(video.videoId)
            },
            isActive: index === activeIndex,
            onToggleLike: handleToggleLike,
            onOpenPlayer: handleOpenPlayer,
            onShare: handleShare,
            index
          }
        ) }, video.videoId))
      }
    ),
    playerVideo && /* @__PURE__ */ jsxRuntimeExports.jsx(
      VideoPlayer,
      {
        video: toVideoMetadata(playerVideo),
        videoUrl: playerVideo.streamUrl,
        onClose: handleClosePlayer,
        onShare: () => handleShare(playerVideo)
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx("style", { children: `
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      ` })
  ] });
}
export {
  Feed as default
};
