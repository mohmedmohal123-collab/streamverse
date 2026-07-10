import { c as createLucideIcon, u as useTranslation, r as reactExports, j as jsxRuntimeExports, B as Button, X, b as useActor, p as useQueryClient, a as useNavigate, d as useQuery, q as useMutation, C as Clock, t as cn, v as ue, w as getMyPlaylists } from "./index-B4P1PGaK.js";
import { A as AnimatePresence } from "./index-B_vGwaJy.js";
import { m as motion } from "./proxy-qgqE2Kvk.js";
import { C as Check } from "./check-C3_r_4Ww.js";
import { M as MessageCircle } from "./message-circle-BL4BDtUO.js";
import { M as Mail } from "./mail-Cyv_7LGF.js";
import { B as Badge } from "./badge-B5FJUKjx.js";
import { i as isVideoSaved, r as removeVideo, s as saveVideo, c as cacheThumbnail } from "./offlineStorage-B7iGHUae.js";
import { a as SocialBar } from "./VideoPlayer-vt5cHaXc.js";
import { P as Play } from "./play-BCFueK3b.js";
import { C as CircleCheck } from "./index-KgqyCsxg.js";
import { E as Eye } from "./eye-DnC41Urw.js";
import { P as Plus } from "./plus-jmEHeo4F.js";
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$1 = [
  ["path", { d: "M12 13v8l-4-4", key: "1f5nwf" }],
  ["path", { d: "m12 21 4-4", key: "1lfcce" }],
  ["path", { d: "M4.393 15.269A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.436 8.284", key: "ui1hmy" }]
];
const CloudDownload = createLucideIcon("cloud-download", __iconNode$1);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [
  ["rect", { width: "14", height: "14", x: "8", y: "8", rx: "2", ry: "2", key: "17jyea" }],
  ["path", { d: "M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2", key: "zix9uf" }]
];
const Copy = createLucideIcon("copy", __iconNode);
function getShareUrl(video) {
  return `${window.location.origin}/watch?v=${video.videoId}`;
}
function getPlatformUrl(video) {
  if (video.platform === "vimeo") return `https://vimeo.com/${video.videoId}`;
  return `https://www.youtube.com/watch?v=${video.videoId}`;
}
function ShareModal({ video, onClose }) {
  const { isRTL } = useTranslation();
  const [copied, setCopied] = reactExports.useState(false);
  if (!video) return null;
  const shareUrl = getShareUrl(video);
  const platformUrl = getPlatformUrl(video);
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2e3);
    } catch {
      navigator.clipboard.writeText(platformUrl).catch(() => {
      });
    }
  };
  const handleWhatsApp = () => {
    const text = encodeURIComponent(`${video.title}
${shareUrl}`);
    window.open(`https://wa.me/?text=${text}`, "_blank", "noopener");
  };
  const handleEmail = () => {
    const subject = encodeURIComponent(video.title);
    const body = encodeURIComponent(
      `${isRTL ? "شاهد هذا الفيديو" : "Check out this video"}:
${video.title}
${shareUrl}`
    );
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: video && /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      className: "modal-overlay",
      onClick: onClose,
      onKeyDown: (e) => e.key === "Escape" && onClose(),
      tabIndex: -1,
      "data-ocid": "share_modal.dialog",
      dir: isRTL ? "rtl" : "ltr",
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        motion.div,
        {
          initial: { opacity: 0, scale: 0.92, y: 20 },
          animate: { opacity: 1, scale: 1, y: 0 },
          exit: { opacity: 0, scale: 0.92, y: 20 },
          transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] },
          className: "modal-content",
          onClick: (e) => e.stopPropagation(),
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display font-bold text-base text-foreground", children: isRTL ? "مشاركة الفيديو" : "Share Video" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  variant: "ghost",
                  size: "icon",
                  className: "h-8 w-8 rounded-full text-muted-foreground hover:text-foreground",
                  onClick: onClose,
                  "data-ocid": "share_modal.close_button",
                  "aria-label": isRTL ? "إغلاق" : "Close",
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" })
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3 p-3 rounded-lg bg-muted/40 border border-border/50", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex-shrink-0 w-20 aspect-video rounded overflow-hidden bg-muted", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "img",
                  {
                    src: video.thumbnailUrl,
                    alt: video.title,
                    className: "w-full h-full object-cover"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-1 end-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "span",
                  {
                    className: `text-[9px] font-bold px-1 py-0.5 rounded text-white ${video.platform === "vimeo" ? "bg-primary/90" : "bg-destructive/90"}`,
                    children: video.platform === "vimeo" ? "V" : "YT"
                  }
                ) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0 py-0.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-foreground line-clamp-2 leading-snug", children: video.title }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1 truncate", children: video.channelTitle })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-medium text-muted-foreground uppercase tracking-wide", children: isRTL ? "رابط المشاركة" : "Share link" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 min-w-0 px-3 py-2 rounded-md bg-muted/50 border border-border text-xs text-muted-foreground truncate font-mono", children: shareUrl }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    size: "sm",
                    onClick: handleCopy,
                    "data-ocid": "share_modal.copy_button",
                    className: `shrink-0 transition-all duration-300 ${copied ? "bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/30" : "gradient-primary text-white border-0"}`,
                    "aria-label": isRTL ? "نسخ الرابط" : "Copy link",
                    children: copied ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-3.5 w-3.5 me-1" }),
                      isRTL ? "تم النسخ" : "Copied!"
                    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Copy, { className: "h-3.5 w-3.5 me-1" }),
                      isRTL ? "نسخ" : "Copy"
                    ] })
                  }
                )
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-medium text-muted-foreground uppercase tracking-wide", children: isRTL ? "مشاركة عبر" : "Share via" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "button",
                  {
                    type: "button",
                    className: "share-option",
                    onClick: handleWhatsApp,
                    "data-ocid": "share_modal.whatsapp_button",
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-green-400", children: /* @__PURE__ */ jsxRuntimeExports.jsx(MessageCircle, { className: "h-5 w-5" }) }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "share-option-label", children: "WhatsApp" })
                    ]
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "button",
                  {
                    type: "button",
                    className: "share-option",
                    onClick: handleEmail,
                    "data-ocid": "share_modal.email_button",
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-primary", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Mail, { className: "h-5 w-5" }) }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "share-option-label", children: isRTL ? "بريد إلكتروني" : "Email" })
                    ]
                  }
                )
              ] })
            ] })
          ]
        }
      )
    }
  ) });
}
function getCurrentUserId() {
  return localStorage.getItem("streamverse_admin_username") ?? localStorage.getItem("streamverse_user_id") ?? "user";
}
function getAuthToken() {
  return localStorage.getItem("streamverse_credential_auth") === "true" ? localStorage.getItem("streamverse_admin_cred_hash") ?? localStorage.getItem("streamverse_admin_username") ?? "user" : "user";
}
function PlatformBadge({ platform }) {
  const p = platform.toLowerCase();
  if (p === "vimeo") {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      Badge,
      {
        variant: "secondary",
        className: "bg-primary/80 text-white border-0 text-[10px] px-1.5 py-0.5 font-bold tracking-wide",
        children: "V"
      }
    );
  }
  if (p === "tiktok") {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      Badge,
      {
        variant: "secondary",
        className: "bg-[linear-gradient(135deg,#010101_60%,#fe2c55_100%)] text-white border border-white/20 text-[10px] px-1.5 py-0.5 font-bold tracking-wide",
        children: "TT"
      }
    );
  }
  if (p === "dailymotion") {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      Badge,
      {
        variant: "secondary",
        className: "bg-[#00AAFF] text-white border-0 text-[10px] px-1.5 py-0.5 font-bold tracking-wide",
        children: "DM"
      }
    );
  }
  if (p === "archive" || p === "internetarchive") {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      Badge,
      {
        variant: "secondary",
        className: "bg-amber-600 text-white border-0 text-[10px] px-1.5 py-0.5 font-bold tracking-wide",
        children: "IA"
      }
    );
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Badge,
    {
      variant: "secondary",
      className: "bg-destructive/90 text-white border-0 text-[10px] px-1.5 py-0.5 font-bold tracking-wide",
      children: "YT"
    }
  );
}
function VideoCard({
  video,
  onWatch,
  onShare,
  onComment,
  index = 0,
  className
}) {
  const { t, isRTL } = useTranslation();
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [optimisticReaction, setOptimisticReaction] = reactExports.useState(null);
  const [savedOffline, setSavedOffline] = reactExports.useState(false);
  const [savingOffline, setSavingOffline] = reactExports.useState(false);
  const [showPlaylistMenu, setShowPlaylistMenu] = reactExports.useState(false);
  const [addingToId, setAddingToId] = reactExports.useState(null);
  const [addedToIds, setAddedToIds] = reactExports.useState(/* @__PURE__ */ new Set());
  const menuRef = reactExports.useRef(null);
  const userId = getCurrentUserId();
  const _videoId = "videoId" in video ? video.videoId : video.id;
  const _thumbnailUrl = "thumbnailUrl" in video ? video.thumbnailUrl : video.thumbnail;
  const _platform = "platform" in video ? video.platform : video.source;
  const _channelTitle = "channelTitle" in video ? video.channelTitle : video.source;
  const _viewCount = "viewCount" in video ? video.viewCount : video.views || 0;
  reactExports.useEffect(() => {
    if (!showPlaylistMenu) return;
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowPlaylistMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showPlaylistMenu]);
  reactExports.useEffect(() => {
    const vid2 = "videoId" in video ? _videoId : video.id;
    isVideoSaved(vid2).then(setSavedOffline).catch(() => {
    });
  }, [video, _videoId]);
  const { data: myPlaylists = [] } = useQuery({
    queryKey: ["playlists", userId],
    queryFn: () => getMyPlaylists(userId, actor),
    enabled: !!actor && showPlaylistMenu,
    staleTime: 1e3 * 30
  });
  const addToPlaylistMutation = useMutation({
    mutationFn: async (playlistId) => {
      if (!actor) throw new Error("No actor");
      const token = getAuthToken();
      const vid2 = "videoId" in video ? _videoId : video.id;
      const res = await actor.addVideoToPlaylist(
        playlistId,
        vid2,
        userId,
        token
      );
      if (res.__kind__ === "err") throw new Error(res.err);
      return playlistId;
    },
    onMutate: (id) => setAddingToId(id),
    onSuccess: (id) => {
      setAddedToIds((prev) => /* @__PURE__ */ new Set([...prev, id]));
      setAddingToId(null);
      ue.success(isRTL ? "تمت الإضافة إلى القائمة" : "Added to playlist");
      queryClient.invalidateQueries({ queryKey: ["playlists", userId] });
    },
    onError: () => {
      setAddingToId(null);
      ue.error(isRTL ? "فشل الإضافة" : "Failed to add");
    }
  });
  const handleSaveOffline = async (e) => {
    e.stopPropagation();
    if (savingOffline) return;
    setSavingOffline(true);
    try {
      if (savedOffline) {
        await removeVideo(_videoId);
        setSavedOffline(false);
        queryClient.invalidateQueries({ queryKey: ["offline-videos"] });
        ue.info(
          isRTL ? "تم إزالة الفيديو من المحفوظات" : "Video removed from offline saves"
        );
      } else {
        await saveVideo(video);
        cacheThumbnail(
          "thumbnailUrl" in video ? _thumbnailUrl : video.thumbnail
        );
        setSavedOffline(true);
        queryClient.invalidateQueries({ queryKey: ["offline-videos"] });
        ue.success(
          isRTL ? "تم الحفظ للاستخدام دون إنترنت ✓" : "Saved offline ✓",
          { duration: 3e3 }
        );
      }
    } catch {
      ue.error(isRTL ? "فشل الحفظ" : "Save failed");
    } finally {
      setSavingOffline(false);
    }
  };
  const vid = "videoId" in video ? _videoId : video.id;
  const { data: stats } = useQuery({
    queryKey: ["video-stats", vid],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getVideoStats(vid);
    },
    enabled: !!actor,
    staleTime: 1e3 * 30
  });
  const { data: myReaction } = useQuery({
    queryKey: ["video-reaction", vid],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getVideoReaction(vid);
    },
    enabled: !!actor,
    staleTime: 1e3 * 60
  });
  const reactionMutation = useMutation({
    mutationFn: async (kind) => {
      if (!actor) return;
      const vid2 = "videoId" in video ? _videoId : video.id;
      await actor.reactToVideo(vid2, kind);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["video-stats", _videoId]
      });
      queryClient.invalidateQueries({
        queryKey: ["video-reaction", _videoId]
      });
    }
  });
  const handleLike = () => {
    setOptimisticReaction("like");
    reactionMutation.mutate("like");
  };
  const handleDislike = () => {
    setOptimisticReaction("dislike");
    reactionMutation.mutate("dislike");
  };
  const activeReaction = myReaction ?? optimisticReaction;
  const likeCount = stats ? Number(stats.likeCount) : 0;
  const dislikeCount = stats ? Number(stats.dislikeCount) : 0;
  const commentCount = stats ? Number(stats.commentCount) : 0;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      "data-ocid": `video.item.${index + 1}`,
      className: cn(
        "video-card group",
        "hover:shadow-video-hover hover:-translate-y-1 transition-all duration-300",
        className
      ),
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative aspect-video overflow-hidden rounded-t-lg bg-muted", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              role: "button",
              tabIndex: 0,
              className: "absolute inset-0 z-10 cursor-pointer",
              onClick: () => onWatch(video),
              onKeyDown: (e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onWatch(video);
                }
              },
              "data-ocid": `video.watch_button.${index + 1}`,
              "aria-label": `Watch: ${video.title}`
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "img",
            {
              src: _thumbnailUrl,
              alt: video.title,
              className: "w-full h-full object-cover transition-transform duration-500 group-hover:scale-105",
              loading: "lazy"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "video-overlay opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-between p-3 pointer-events-none", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-10 h-10 rounded-full gradient-primary flex items-center justify-center shadow-glow", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Play, { className: "h-5 w-5 text-white fill-white ms-0.5" }) }) }),
          video.duration && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute bottom-2 start-2 z-20 bg-black/80 rounded px-1.5 py-0.5 flex items-center gap-1 pointer-events-none", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-3 w-3 text-white/70" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-white font-mono font-medium", children: video.duration })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute bottom-2 end-2 z-20 pointer-events-none", children: /* @__PURE__ */ jsxRuntimeExports.jsx(PlatformBadge, { platform: _platform }) }),
          "canDownload" in video && video.canDownload === false && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-2 start-2 z-20 pointer-events-none", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            Badge,
            {
              variant: "outline",
              className: "bg-black/70 text-white/80 border-white/20 text-[10px] px-1.5 py-0.5",
              children: isRTL ? "بث فقط" : "Stream only"
            }
          ) }),
          ("canDownload" in video ? video.canDownload !== false : true) && /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              "data-ocid": `video.save_offline_button.${index + 1}`,
              onClick: handleSaveOffline,
              "aria-label": savedOffline ? "Remove from offline" : "Save for offline",
              className: cn(
                "absolute top-2 end-2 z-20 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 pointer-events-auto",
                "opacity-0 group-hover:opacity-100 focus:opacity-100",
                savedOffline ? "bg-emerald-500/90 text-white shadow-md" : "bg-black/60 text-white hover:bg-primary/80"
              ),
              children: savedOffline ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-3.5 w-3.5" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(CloudDownload, { className: "h-3.5 w-3.5" })
            }
          ),
          savedOffline && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-2 end-2 z-20 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center pointer-events-none group-hover:hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-3 w-3 text-white" }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            type: "button",
            className: "p-3 space-y-1.5 text-start w-full",
            onClick: () => onWatch(video),
            "aria-label": video.title,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-body font-medium text-sm text-card-foreground line-clamp-2 leading-snug min-w-0", children: video.title }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground truncate min-w-0", children: _channelTitle }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 text-xs text-muted-foreground", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-3 w-3 flex-shrink-0" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: _viewCount })
              ] })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "relative px-2 pb-2 border-t border-border/30 pt-2",
            onClick: (e) => e.stopPropagation(),
            onKeyDown: (e) => e.stopPropagation(),
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                SocialBar,
                {
                  videoId: _videoId,
                  videoUrl: _platform === "vimeo" ? `https://vimeo.com/${_videoId}` : _platform === "tiktok" ? `https://www.tiktok.com/video/${_videoId}` : `https://www.youtube.com/watch?v=${_videoId}`,
                  platform: _platform ?? "youtube",
                  videoTitle: video.title,
                  likeCount,
                  dislikeCount,
                  commentCount,
                  userReaction: activeReaction,
                  onLike: handleLike,
                  onDislike: handleDislike,
                  onComment: () => onComment ? onComment(video) : onWatch(video),
                  onShare: () => onShare ? onShare(video) : navigator.clipboard.writeText(
                    _platform === "vimeo" ? `https://vimeo.com/${_videoId}` : _platform === "tiktok" ? `https://www.tiktok.com/@user/video/${_videoId}` : `https://www.youtube.com/watch?v=${_videoId}`
                  ).catch(() => {
                  }),
                  compact: true,
                  index,
                  onAddToPlaylist: () => setShowPlaylistMenu((v) => !v)
                }
              ),
              showPlaylistMenu && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "div",
                {
                  ref: menuRef,
                  "data-ocid": `video.playlist_dropdown.${index + 1}`,
                  className: "absolute bottom-full start-0 mb-1 z-40 bg-popover border border-border rounded-xl shadow-lg py-1.5 min-w-[200px] max-h-56 overflow-y-auto",
                  children: [
                    myPlaylists.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground px-3 py-2", children: isRTL ? "لا توجد قوائم — أنشئ قائمة" : "No playlists — create one" }) : myPlaylists.map((pl) => {
                      const added = addedToIds.has(pl.id);
                      return /* @__PURE__ */ jsxRuntimeExports.jsxs(
                        "button",
                        {
                          type: "button",
                          "data-ocid": `video.playlist_option.${index + 1}`,
                          onClick: () => !added && addToPlaylistMutation.mutate(pl.id),
                          disabled: addingToId === pl.id,
                          className: cn(
                            "w-full flex items-center gap-2 px-3 py-2 text-xs transition-colors",
                            added ? "text-primary bg-primary/5" : "text-foreground hover:bg-muted/60"
                          ),
                          children: [
                            added ? /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-3.5 w-3.5 text-primary flex-shrink-0" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-3.5 w-3.5 text-muted-foreground flex-shrink-0" }),
                            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate", children: pl.name }),
                            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ms-auto text-muted-foreground/60 tabular-nums text-[10px]", children: pl.videoIds.length })
                          ]
                        },
                        pl.id
                      );
                    }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-t border-border/50 mt-1 pt-1", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      "button",
                      {
                        type: "button",
                        "data-ocid": `video.goto_playlists_button.${index + 1}`,
                        onClick: () => {
                          setShowPlaylistMenu(false);
                          void navigate({ to: "/playlists" });
                        },
                        className: "w-full flex items-center gap-2 px-3 py-2 text-xs text-primary hover:bg-primary/10 transition-colors",
                        children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-3.5 w-3.5" }),
                          isRTL ? "إنشاء قائمة جديدة" : "Create new playlist"
                        ]
                      }
                    ) })
                  ]
                }
              )
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-3 pb-3 md:hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            type: "button",
            size: "sm",
            "data-ocid": `video.watch_mobile_button.${index + 1}`,
            onClick: () => onWatch(video),
            className: "w-full gradient-primary text-white border-0 text-xs h-8",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Play, { className: "h-3 w-3 me-1 fill-white" }),
              t("watch")
            ]
          }
        ) })
      ]
    }
  );
}
export {
  ShareModal as S,
  VideoCard as V
};
