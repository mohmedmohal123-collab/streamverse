import { c as createLucideIcon, u as useTranslation, A as useAuth, a as useNavigate, b as useActor, p as useQueryClient, r as reactExports, d as useQuery, q as useMutation, j as jsxRuntimeExports, B as Button, v as ue } from "./index-B4P1PGaK.js";
import { B as Badge } from "./badge-B5FJUKjx.js";
import { D as Dialog, a as DialogContent, b as DialogHeader, c as DialogTitle } from "./dialog-BTdr-nPe.js";
import { I as Input } from "./input-DsF85mHK.js";
import { L as Label } from "./label-DLTocRv1.js";
import { S as Skeleton } from "./skeleton-BQhv6M21.js";
import { G as Globe, S as Switch } from "./switch-BNsGjAoU.js";
import { T as Textarea } from "./textarea-BcmhiIIK.js";
import { L as List } from "./list-CHrbW2Ww.js";
import { A as ArrowLeft } from "./arrow-left-CJSsBox5.js";
import { L as Lock } from "./lock-Bod2zGNq.js";
import { m as motion } from "./proxy-qgqE2Kvk.js";
import { B as BookmarkPlus } from "./bookmark-plus-DCBfQUwu.js";
import { A as AnimatePresence } from "./index-B_vGwaJy.js";
import { T as Trash2 } from "./trash-2-QrZqrw48.js";
import { P as Plus } from "./plus-jmEHeo4F.js";
import "./index-C1nCKn3U.js";
import "./index-HkvmYA7b.js";
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [
  ["circle", { cx: "12", cy: "12", r: "1", key: "41hilf" }],
  ["circle", { cx: "12", cy: "5", r: "1", key: "gxeob9" }],
  ["circle", { cx: "12", cy: "19", r: "1", key: "lyex9k" }]
];
const EllipsisVertical = createLucideIcon("ellipsis-vertical", __iconNode);
function getCacheKey(userId) {
  return `streamverse_playlists_${userId}`;
}
function loadCachedPlaylists(userId) {
  try {
    const raw = localStorage.getItem(getCacheKey(userId));
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}
function saveCachedPlaylists(userId, playlists) {
  try {
    localStorage.setItem(getCacheKey(userId), JSON.stringify(playlists));
  } catch {
  }
}
function getAuthToken() {
  return localStorage.getItem("streamverse_credential_auth") === "true" ? localStorage.getItem("streamverse_admin_cred_hash") ?? localStorage.getItem("streamverse_admin_username") ?? "user" : "user";
}
function getCurrentUserId() {
  return localStorage.getItem("streamverse_admin_username") ?? localStorage.getItem("streamverse_user_id") ?? "user";
}
function Playlists() {
  const { t, isRTL } = useTranslation();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const userId = getCurrentUserId();
  const [selectedPlaylist, setSelectedPlaylist] = reactExports.useState(
    null
  );
  const [showCreate, setShowCreate] = reactExports.useState(false);
  const [createName, setCreateName] = reactExports.useState("");
  const [createDesc, setCreateDesc] = reactExports.useState("");
  const [createPublic, setCreatePublic] = reactExports.useState(false);
  const [openMenuId, setOpenMenuId] = reactExports.useState(null);
  const { data: playlists = [], isLoading } = useQuery({
    queryKey: ["playlists", userId],
    queryFn: async () => {
      if (!actor || !userId) return loadCachedPlaylists(userId);
      try {
        const raw = await actor.getUserPlaylists(userId);
        const result = raw.map((p) => ({
          id: p.id,
          userId: p.userId,
          name: p.name,
          description: p.description,
          isPublic: p.isPublic,
          videoIds: p.videoIds,
          createdAt: Number(p.createdAt),
          updatedAt: Number(p.updatedAt)
        }));
        saveCachedPlaylists(userId, result);
        return result;
      } catch {
        return loadCachedPlaylists(userId);
      }
    },
    enabled: !!actor && !!userId,
    initialData: () => loadCachedPlaylists(userId),
    staleTime: 1e3 * 30
  });
  const { data: playlistDetail, isLoading: detailLoading } = useQuery({
    queryKey: ["playlist-detail", selectedPlaylist == null ? void 0 : selectedPlaylist.id],
    queryFn: async () => {
      if (!actor || !selectedPlaylist) return null;
      const res = await actor.getPlaylist(selectedPlaylist.id);
      if (res.__kind__ === "ok") {
        return res.ok;
      }
      return null;
    },
    enabled: !!actor && !!selectedPlaylist
  });
  const createMutation = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("No actor");
      const token = getAuthToken();
      const res = await actor.createPlaylist(
        userId,
        createName.trim(),
        createDesc.trim(),
        createPublic,
        token
      );
      if (res.__kind__ === "err") throw new Error(res.err);
      return res.ok;
    },
    onSuccess: () => {
      ue.success(isRTL ? "تم إنشاء قائمة التشغيل" : "Playlist created");
      setShowCreate(false);
      setCreateName("");
      setCreateDesc("");
      setCreatePublic(false);
      queryClient.invalidateQueries({ queryKey: ["playlists", userId] });
    },
    onError: (err) => {
      ue.error(
        isRTL ? `فشل الإنشاء: ${err.message}` : `Failed: ${err.message}`
      );
    }
  });
  const deleteMutation = useMutation({
    mutationFn: async (playlistId) => {
      if (!actor) throw new Error("No actor");
      const token = getAuthToken();
      const res = await actor.deletePlaylist(playlistId, userId, token);
      if (res.__kind__ === "err") throw new Error(res.err);
    },
    onSuccess: () => {
      ue.success(isRTL ? "تم حذف القائمة" : "Playlist deleted");
      setOpenMenuId(null);
      if (selectedPlaylist) setSelectedPlaylist(null);
      queryClient.invalidateQueries({ queryKey: ["playlists", userId] });
    },
    onError: (err) => {
      ue.error(
        isRTL ? `فشل الحذف: ${err.message}` : `Failed: ${err.message}`
      );
    }
  });
  const removeVideoMutation = useMutation({
    mutationFn: async ({
      playlistId,
      videoId
    }) => {
      if (!actor) throw new Error("No actor");
      const token = getAuthToken();
      const res = await actor.removeVideoFromPlaylist(
        playlistId,
        videoId,
        userId,
        token
      );
      if (res.__kind__ === "err") throw new Error(res.err);
    },
    onSuccess: () => {
      ue.success(
        isRTL ? "تم حذف الفيديو من القائمة" : "Video removed from playlist"
      );
      queryClient.invalidateQueries({
        queryKey: ["playlist-detail", selectedPlaylist == null ? void 0 : selectedPlaylist.id]
      });
      queryClient.invalidateQueries({ queryKey: ["playlists", userId] });
    }
  });
  if (!isAuthenticated) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "flex flex-col items-center justify-center min-h-[60vh] gap-6 p-8",
        dir: isRTL ? "rtl" : "ltr",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(List, { className: "h-10 w-10 text-primary" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-display font-bold text-foreground", children: isRTL ? "قوائم التشغيل" : "My Playlists" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-sm", children: isRTL ? "سجّل الدخول لإنشاء قوائم تشغيل مخصصة" : "Sign in to create and manage your playlists" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              "data-ocid": "playlists.login_button",
              onClick: () => void navigate({ to: "/login" }),
              className: "gradient-primary text-white border-0",
              children: t("login")
            }
          )
        ]
      }
    );
  }
  if (selectedPlaylist) {
    const videoIds = (playlistDetail == null ? void 0 : playlistDetail.videoIds) ?? selectedPlaylist.videoIds;
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 space-y-4", dir: isRTL ? "rtl" : "ltr", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            "data-ocid": "playlists.back_button",
            onClick: () => setSelectedPlaylist(null),
            className: "p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors",
            "aria-label": t("back"),
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: `h-5 w-5 ${isRTL ? "rotate-180" : ""}` })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-lg font-display font-bold text-foreground truncate", children: selectedPlaylist.name }),
          selectedPlaylist.description && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground truncate", children: selectedPlaylist.description })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Badge,
          {
            variant: "secondary",
            className: "flex-shrink-0 flex items-center gap-1",
            children: [
              selectedPlaylist.isPublic ? /* @__PURE__ */ jsxRuntimeExports.jsx(Globe, { className: "h-3 w-3" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "h-3 w-3" }),
              selectedPlaylist.isPublic ? isRTL ? "عام" : "Public" : isRTL ? "خاص" : "Private"
            ]
          }
        )
      ] }),
      detailLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: [1, 2, 3].map((i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-16 w-full rounded-lg" }, i)) }) : videoIds.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
        motion.div,
        {
          initial: { opacity: 0, y: 20 },
          animate: { opacity: 1, y: 0 },
          className: "flex flex-col items-center justify-center py-16 gap-4 text-center",
          "data-ocid": "playlists.detail.empty_state",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-16 h-16 rounded-full bg-muted flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(BookmarkPlus, { className: "h-8 w-8 text-muted-foreground" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-sm", children: isRTL ? "لا توجد فيديوهات في هذه القائمة" : "No videos in this playlist" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground/70", children: isRTL ? "أضف فيديوهات من خلال زر إضافة إلى القائمة" : "Add videos using the playlist button on any video" })
          ]
        }
      ) : /* @__PURE__ */ jsxRuntimeExports.jsxs(
        motion.div,
        {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          className: "space-y-2",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
              videoIds.length,
              " ",
              isRTL ? "فيديو" : "video(s)"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: videoIds.map((vid, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
              motion.div,
              {
                initial: { opacity: 0, x: isRTL ? 20 : -20 },
                animate: { opacity: 1, x: 0 },
                exit: { opacity: 0, x: isRTL ? -20 : 20 },
                transition: { delay: idx * 0.05 },
                "data-ocid": `playlists.video.item.${idx + 1}`,
                className: "flex items-center gap-3 p-3 rounded-lg bg-card border border-border/50 group",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-8 h-8 rounded-md bg-muted flex items-center justify-center flex-shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground font-mono", children: idx + 1 }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex-1 text-sm text-foreground min-w-0 truncate font-mono", children: vid }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "button",
                    {
                      type: "button",
                      "data-ocid": `playlists.remove_video_button.${idx + 1}`,
                      onClick: () => removeVideoMutation.mutate({
                        playlistId: selectedPlaylist.id,
                        videoId: vid
                      }),
                      disabled: removeVideoMutation.isPending,
                      "aria-label": isRTL ? "حذف" : "Remove",
                      className: "opacity-0 group-hover:opacity-100 p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all",
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4" })
                    }
                  )
                ]
              },
              vid
            )) })
          ]
        }
      )
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 space-y-4", dir: isRTL ? "rtl" : "ltr", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl font-display font-bold text-foreground", children: isRTL ? "قوائم التشغيل" : "My Playlists" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          size: "sm",
          "data-ocid": "playlists.create_button",
          onClick: () => setShowCreate(true),
          className: "gradient-primary text-white border-0",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4 me-1" }),
            isRTL ? "إنشاء قائمة" : "New Playlist"
          ]
        }
      )
    ] }),
    isLoading && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3", children: [1, 2, 3, 4].map((i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-28 w-full rounded-xl" }, i)) }),
    !isLoading && playlists.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(
      motion.div,
      {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        className: "flex flex-col items-center justify-center py-20 gap-5 text-center",
        "data-ocid": "playlists.empty_state",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(List, { className: "h-12 w-12 text-primary" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-base font-display font-semibold text-foreground", children: isRTL ? "لا توجد قوائم تشغيل بعد" : "No playlists yet" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground max-w-xs", children: isRTL ? "أنشئ قائمتك الأولى لتنظيم فيديوهاتك المفضلة" : "Create your first playlist to organize your favorite videos" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              "data-ocid": "playlists.empty_create_button",
              onClick: () => setShowCreate(true),
              className: "gradient-primary text-white border-0",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4 me-1" }),
                isRTL ? "إنشاء قائمة تشغيل" : "Create Playlist"
              ]
            }
          )
        ]
      }
    ),
    !isLoading && playlists.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(
      motion.div,
      {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        className: "grid grid-cols-1 sm:grid-cols-2 gap-3",
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: playlists.map((pl, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          motion.div,
          {
            initial: { opacity: 0, scale: 0.95, y: 10 },
            animate: { opacity: 1, scale: 1, y: 0 },
            exit: { opacity: 0, scale: 0.95 },
            transition: { delay: idx * 0.06 },
            "data-ocid": `playlists.item.${idx + 1}`,
            className: "relative group bg-card border border-border/60 rounded-xl overflow-hidden hover:border-primary/40 hover:shadow-md transition-all duration-200 cursor-pointer",
            onClick: () => setSelectedPlaylist(pl),
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "h-20 bg-gradient-to-br from-primary/20 via-primary/10 to-muted flex items-center justify-center", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(List, { className: "h-8 w-8 text-primary/60" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-2 end-2", children: pl.isPublic ? /* @__PURE__ */ jsxRuntimeExports.jsx(Globe, { className: "h-3.5 w-3.5 text-muted-foreground" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "h-3.5 w-3.5 text-muted-foreground" }) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 space-y-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-medium text-sm text-foreground line-clamp-1", children: pl.name }),
                pl.description && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground line-clamp-1", children: pl.description }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground/70", children: [
                  pl.videoIds.length,
                  " ",
                  isRTL ? "فيديو" : "video(s)"
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  type: "button",
                  "data-ocid": `playlists.menu_button.${idx + 1}`,
                  onClick: (e) => {
                    e.stopPropagation();
                    setOpenMenuId(openMenuId === pl.id ? null : pl.id);
                  },
                  "aria-label": "Menu",
                  className: "absolute top-2 start-2 opacity-0 group-hover:opacity-100 p-1.5 rounded-md bg-black/40 text-white hover:bg-black/60 transition-all",
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(EllipsisVertical, { className: "h-4 w-4" })
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: openMenuId === pl.id && /* @__PURE__ */ jsxRuntimeExports.jsx(
                motion.div,
                {
                  initial: { opacity: 0, scale: 0.9 },
                  animate: { opacity: 1, scale: 1 },
                  exit: { opacity: 0, scale: 0.9 },
                  className: "absolute top-9 start-2 z-30 bg-popover border border-border rounded-lg shadow-lg py-1 min-w-[140px]",
                  onClick: (e) => e.stopPropagation(),
                  children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "button",
                    {
                      type: "button",
                      "data-ocid": `playlists.delete_button.${idx + 1}`,
                      onClick: () => deleteMutation.mutate(pl.id),
                      disabled: deleteMutation.isPending,
                      className: "w-full flex items-center gap-2 px-3 py-2 text-xs text-destructive hover:bg-destructive/10 transition-colors",
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5" }),
                        isRTL ? "حذف القائمة" : "Delete Playlist"
                      ]
                    }
                  )
                }
              ) })
            ]
          },
          pl.id
        )) })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: showCreate, onOpenChange: setShowCreate, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
      DialogContent,
      {
        "data-ocid": "playlists.create_dialog",
        dir: isRTL ? "rtl" : "ltr",
        className: "sm:max-w-md",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { className: "font-display", children: isRTL ? "إنشاء قائمة تشغيل جديدة" : "Create New Playlist" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 pt-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "pl-name", children: isRTL ? "الاسم" : "Name" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  id: "pl-name",
                  "data-ocid": "playlists.create_name_input",
                  value: createName,
                  onChange: (e) => setCreateName(e.target.value),
                  placeholder: isRTL ? "اسم القائمة..." : "Playlist name...",
                  maxLength: 60
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "pl-desc", children: isRTL ? "الوصف (اختياري)" : "Description (optional)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Textarea,
                {
                  id: "pl-desc",
                  "data-ocid": "playlists.create_desc_input",
                  value: createDesc,
                  onChange: (e) => setCreateDesc(e.target.value),
                  placeholder: isRTL ? "وصف القائمة..." : "Describe your playlist...",
                  rows: 2,
                  maxLength: 200
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "pl-public", className: "cursor-pointer", children: isRTL ? "قائمة عامة" : "Public playlist" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Switch,
                {
                  id: "pl-public",
                  "data-ocid": "playlists.create_public_switch",
                  checked: createPublic,
                  onCheckedChange: setCreatePublic
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 pt-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  type: "button",
                  variant: "outline",
                  "data-ocid": "playlists.create_cancel_button",
                  onClick: () => setShowCreate(false),
                  className: "flex-1",
                  children: t("cancel")
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  type: "button",
                  "data-ocid": "playlists.create_submit_button",
                  onClick: () => createMutation.mutate(),
                  disabled: !createName.trim() || createMutation.isPending,
                  className: "flex-1 gradient-primary text-white border-0",
                  children: createMutation.isPending ? isRTL ? "جارٍ الإنشاء..." : "Creating..." : isRTL ? "إنشاء" : "Create"
                }
              )
            ] })
          ] })
        ]
      }
    ) })
  ] });
}
export {
  Playlists as default
};
