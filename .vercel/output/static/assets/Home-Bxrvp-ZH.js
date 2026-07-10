import { c as createLucideIcon, u as useTranslation, a as useNavigate, b as useActor, r as reactExports, d as useQuery, g as getSampleTrendingVideos, j as jsxRuntimeExports, C as Clock, B as Button, L as Link, S as Search, e as ChevronLeft, f as ChevronRight, G as GridSkeleton, h as getTrendingVideos } from "./index-B4P1PGaK.js";
import { B as Badge } from "./badge-B5FJUKjx.js";
import { S as ShareModal, V as VideoCard } from "./VideoCard-KugQnyPn.js";
import { V as VideoPlayer, g as getLocalWatchHistory } from "./VideoPlayer-vt5cHaXc.js";
import { T as TrendingUp } from "./trending-up-C7qWBfVa.js";
import { S as Sparkles } from "./sparkles-0JpH7AaU.js";
import { m as motion } from "./proxy-qgqE2Kvk.js";
import { P as Play } from "./play-BCFueK3b.js";
import { I as Info } from "./info-Dl9FkbIU.js";
import "./index-B_vGwaJy.js";
import "./check-C3_r_4Ww.js";
import "./message-circle-BL4BDtUO.js";
import "./mail-Cyv_7LGF.js";
import "./offlineStorage-B7iGHUae.js";
import "./index-KgqyCsxg.js";
import "./eye-DnC41Urw.js";
import "./plus-jmEHeo4F.js";
import "./index-BivI3RN0.js";
import "./skeleton-BQhv6M21.js";
import "./textarea-BcmhiIIK.js";
import "./dialog-BTdr-nPe.js";
import "./index-C1nCKn3U.js";
import "./circle-alert-umy4a3lv.js";
import "./film-CmhOy8TL.js";
import "./loader-circle-CD345DHk.js";
import "./wifi-off-Dh_rJnac.js";
import "./external-link-CIWNqrEm.js";
import "./bookmark-plus-DCBfQUwu.js";
import "./upload-DDDpJKii.js";
import "./trash-2-QrZqrw48.js";
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$1 = [
  [
    "path",
    {
      d: "M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z",
      key: "96xj49"
    }
  ]
];
const Flame = createLucideIcon("flame", __iconNode$1);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [
  ["path", { d: "m17 2-5 5-5-5", key: "16satq" }],
  ["rect", { width: "20", height: "15", x: "2", y: "7", rx: "2", key: "1e6viu" }]
];
const Tv = createLucideIcon("tv", __iconNode);
function toVideoMetadata(v) {
  return {
    videoId: v.videoId,
    title: v.title,
    thumbnailUrl: v.thumbnailUrl,
    viewCount: v.viewCount,
    duration: v.duration,
    channelTitle: v.channelTitle,
    publishedAt: v.publishedAt,
    platform: "youtube"
  };
}
function FeaturedBanner({ videos, isRTL, onWatch }) {
  const [index, setIndex] = reactExports.useState(0);
  const featured = videos.slice(0, 5);
  reactExports.useEffect(() => {
    if (featured.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % featured.length);
    }, 6e3);
    return () => clearInterval(timer);
  }, [featured.length]);
  if (featured.length === 0) return null;
  const current = featured[index];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    motion.section,
    {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      transition: { duration: 0.6 },
      "data-ocid": "home.featured_banner",
      className: "relative w-full h-[55vh] min-h-[380px] max-h-[560px] overflow-hidden",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute inset-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "img",
            {
              src: current.thumbnailUrl,
              alt: current.title,
              className: "w-full h-full object-cover transition-transform duration-700 ease-out",
              style: { transform: "scale(1.05)" }
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-transparent" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative z-10 flex flex-col justify-end h-full px-4 md:px-8 pb-10 max-w-4xl", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            motion.div,
            {
              initial: { opacity: 0, y: 20 },
              animate: { opacity: 1, y: 0 },
              transition: { duration: 0.5 },
              className: "space-y-4",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  Badge,
                  {
                    variant: "secondary",
                    className: "bg-primary/20 text-primary border-primary/30 text-xs px-2.5 py-0.5",
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Flame, { className: "h-3 w-3 me-1" }),
                      isRTL ? "الأكثر مشاهدة" : "Trending Now"
                    ]
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display font-bold text-2xl md:text-4xl lg:text-5xl text-foreground leading-tight line-clamp-2", children: current.title }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground line-clamp-2 max-w-lg", children: [
                  current.channelTitle,
                  current.viewCount ? ` · ${current.viewCount} views` : ""
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 pt-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    Button,
                    {
                      onClick: () => onWatch(current),
                      className: "gradient-primary text-white border-0 h-11 px-6 font-medium shadow-glow hover:opacity-90 transition-opacity gap-2",
                      "data-ocid": "home.featured_play_button",
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Play, { className: "h-4 w-4 fill-current" }),
                        isRTL ? "تشغيل" : "Play"
                      ]
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    Button,
                    {
                      variant: "outline",
                      onClick: () => onWatch(current),
                      className: "h-11 px-5 gap-2 border-border/60 hover:bg-card",
                      "data-ocid": "home.featured_info_button",
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { className: "h-4 w-4" }),
                        isRTL ? "المزيد" : "More Info"
                      ]
                    }
                  )
                ] })
              ]
            },
            current.videoId
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-2 mt-6", children: featured.map((video, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: () => setIndex(i),
              className: `h-1.5 rounded-full transition-all duration-300 ${i === index ? "w-6 bg-primary" : "w-1.5 bg-muted-foreground/40 hover:bg-muted-foreground/60"}`,
              "aria-label": `Go to slide ${i + 1}`
            },
            (video == null ? void 0 : video.videoId) || String(i)
          )) })
        ] })
      ]
    }
  );
}
function ContentRow({
  title,
  icon: Icon,
  videos,
  onWatch,
  onShare,
  dataOcid,
  isLoading
}) {
  const scrollRef = reactExports.useRef(null);
  const scroll = (dir) => {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.clientWidth * 0.75;
    scrollRef.current.scrollBy({
      left: dir === "left" ? -amount : amount,
      behavior: "smooth"
    });
  };
  if (!isLoading && videos.length === 0) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "py-5", "data-ocid": dataOcid, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between px-4 mb-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-7 h-7 rounded-md gradient-primary flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-3.5 w-3.5 text-white" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display font-bold text-base md:text-lg text-foreground", children: title })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            onClick: () => scroll("left"),
            className: "w-7 h-7 rounded-full bg-card border border-border flex items-center justify-center hover:bg-card/80 transition-colors",
            "aria-label": "Scroll left",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, { className: "h-4 w-4 text-muted-foreground" })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            onClick: () => scroll("right"),
            className: "w-7 h-7 rounded-full bg-card border border-border flex items-center justify-center hover:bg-card/80 transition-colors",
            "aria-label": "Scroll right",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-4 w-4 text-muted-foreground" })
          }
        )
      ] })
    ] }),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(GridSkeleton, { count: 4 }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        ref: scrollRef,
        className: "flex gap-3 overflow-x-auto px-4 pb-2 scrollbar-hide scroll-smooth",
        style: { scrollbarWidth: "none", msOverflowStyle: "none" },
        children: videos.map((video, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: "flex-shrink-0 w-[260px] sm:w-[280px] md:w-[300px]",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              VideoCard,
              {
                video,
                onWatch: (v) => onWatch(v),
                onShare: (v) => onShare == null ? void 0 : onShare(v),
                onComment: (v) => onWatch(v),
                index: i
              }
            )
          },
          video.videoId
        ))
      }
    )
  ] });
}
function Home() {
  const { isRTL } = useTranslation();
  const navigate = useNavigate();
  const { actor } = useActor();
  const [activeVideo, setActiveVideo] = reactExports.useState(null);
  const [shareVideo, setShareVideo] = reactExports.useState(null);
  const [heroQuery, setHeroQuery] = reactExports.useState("");
  const { data: trendingData, isLoading: trendingLoading } = useQuery({
    queryKey: ["trending"],
    queryFn: () => getTrendingVideos(12, actor).catch(() => getSampleTrendingVideos()),
    staleTime: 1e3 * 60 * 10
  });
  const trendingVideos = (trendingData ?? getSampleTrendingVideos()).map(
    toVideoMetadata
  );
  const { data: recentlyWatched = [] } = useQuery({
    queryKey: ["local-watch-history"],
    queryFn: () => {
      const history = getLocalWatchHistory().slice(0, 10);
      return history.map((h) => ({
        videoId: h.videoId,
        title: h.title,
        thumbnailUrl: h.thumbnailUrl,
        viewCount: "",
        duration: "",
        channelTitle: "",
        publishedAt: "",
        platform: h.platform
      }));
    },
    staleTime: 0
  });
  const { data: recommendations = [], isLoading: recsLoading } = useQuery({
    queryKey: ["recommendations"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getRecommendations(BigInt(10));
    },
    enabled: !!actor,
    staleTime: 1e3 * 60 * 5
  });
  const recommendedVideos = recommendations.map((rec, i) => ({
    videoId: rec.videoId,
    title: isRTL ? `فيديو مقترح #${i + 1}` : `Suggested Video #${i + 1}`,
    thumbnailUrl: `https://picsum.photos/seed/rec-${rec.videoId}/320/180`,
    viewCount: "",
    duration: "",
    channelTitle: "",
    publishedAt: "",
    platform: rec.platform === "vimeo" ? "vimeo" : "youtube"
  }));
  const newVideos = [...trendingVideos].reverse();
  const handleHeroSearch = (e) => {
    e.preventDefault();
    const q = heroQuery.trim();
    if (q) {
      navigate({ to: "/search", search: { q } });
    } else {
      navigate({ to: "/search" });
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: "min-h-full bg-background pb-8 overflow-y-auto",
      dir: isRTL ? "rtl" : "ltr",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          FeaturedBanner,
          {
            videos: trendingVideos,
            isRTL,
            onWatch: setActiveVideo
          }
        ),
        recentlyWatched.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(
          ContentRow,
          {
            title: isRTL ? "مواصلة المشاهدة" : "Continue Watching",
            icon: Clock,
            videos: recentlyWatched.map((v) => ({
              videoId: v.videoId,
              title: v.title,
              thumbnailUrl: v.thumbnailUrl,
              viewCount: v.viewCount,
              duration: v.duration,
              channelTitle: v.channelTitle,
              publishedAt: v.publishedAt,
              platform: v.platform
            })),
            isRTL,
            onWatch: setActiveVideo,
            onShare: setShareVideo,
            dataOcid: "home.continue_watching_row"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          ContentRow,
          {
            title: isRTL ? "الأكثر رواجاً" : "Trending Now",
            icon: TrendingUp,
            videos: trendingVideos,
            isRTL,
            onWatch: setActiveVideo,
            onShare: setShareVideo,
            dataOcid: "home.trending_row",
            isLoading: trendingLoading
          }
        ),
        recsLoading || recommendedVideos.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-muted/20", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          ContentRow,
          {
            title: isRTL ? "مقترح لك" : "Recommended For You",
            icon: Sparkles,
            videos: recommendedVideos,
            isRTL,
            onWatch: setActiveVideo,
            onShare: setShareVideo,
            dataOcid: "home.recommendations_row",
            isLoading: recsLoading
          }
        ) }) : null,
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          ContentRow,
          {
            title: isRTL ? "جديد على StreamVerse" : "New on StreamVerse",
            icon: Flame,
            videos: newVideos,
            isRTL,
            onWatch: setActiveVideo,
            onShare: setShareVideo,
            dataOcid: "home.new_row"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          motion.section,
          {
            initial: { opacity: 0, y: 20 },
            whileInView: { opacity: 1, y: 0 },
            viewport: { once: true },
            transition: { duration: 0.5 },
            className: "px-4 py-8",
            "data-ocid": "home.feed_cta_section",
            children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-xl mx-auto text-center space-y-4 bg-card border border-border rounded-2xl p-6 md:p-8", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-12 h-12 rounded-full gradient-primary flex items-center justify-center mx-auto shadow-glow", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Tv, { className: "h-6 w-6 text-white" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display font-bold text-xl text-foreground", children: isRTL ? "جرب وضع التصفح السريع" : "Try TikTok-Style Feed" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground max-w-sm mx-auto", children: isRTL ? "تصفح الفيديوهات بشكل عمودي سريع وممتع كتيك توك" : "Browse videos in a fast, vertical TikTok-style feed" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  asChild: true,
                  className: "gradient-primary text-white border-0 h-11 px-6 font-medium shadow-glow hover:opacity-90 transition-opacity gap-2",
                  "data-ocid": "home.feed_cta_button",
                  children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/feed", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Play, { className: "h-4 w-4 fill-current" }),
                    isRTL ? "فتح التصفح السريع" : "Open Feed"
                  ] })
                }
              )
            ] })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "section",
          {
            className: "px-4 py-6 bg-muted/20",
            "data-ocid": "home.search_section",
            children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-lg mx-auto text-center space-y-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display font-bold text-lg text-foreground", children: isRTL ? "ابحث عن محتواك المفضل" : "Find Your Favorite Content" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "form",
                {
                  onSubmit: handleHeroSearch,
                  className: "flex gap-2",
                  "data-ocid": "home.search_form",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex-1", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "input",
                        {
                          value: heroQuery,
                          onChange: (e) => setHeroQuery(e.target.value),
                          placeholder: isRTL ? "ابحث عن فيديوهات، موسيقى، أفلام..." : "Search videos, music, movies...",
                          className: "w-full ps-9 bg-background/50 border border-border/60 focus:border-primary focus:bg-background h-11 text-sm rounded-md px-3 outline-none focus:ring-2 focus:ring-primary/20 text-foreground placeholder:text-muted-foreground",
                          "data-ocid": "home.search_input"
                        }
                      )
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Button,
                      {
                        type: "submit",
                        className: "gradient-primary text-white border-0 h-11 px-5 font-medium shadow-glow hover:opacity-90 transition-opacity",
                        "data-ocid": "home.search_button",
                        children: isRTL ? "بحث" : "Search"
                      }
                    )
                  ]
                }
              )
            ] })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("footer", { className: "px-4 pt-8 pb-4 text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
          "© ",
          (/* @__PURE__ */ new Date()).getFullYear(),
          ". Built with love using",
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "a",
            {
              href: `https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`,
              target: "_blank",
              rel: "noopener noreferrer",
              className: "text-primary hover:underline",
              children: "caffeine.ai"
            }
          )
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          VideoPlayer,
          {
            video: activeVideo,
            onClose: () => setActiveVideo(null),
            onShare: () => {
              if (activeVideo) setShareVideo(activeVideo);
            }
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ShareModal, { video: shareVideo, onClose: () => setShareVideo(null) })
      ]
    }
  );
}
export {
  Home as default
};
