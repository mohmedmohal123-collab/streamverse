import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  BookmarkPlus,
  Globe,
  List,
  Lock,
  MoreVertical,
  Plus,
  Trash2,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "../hooks/useAuth";
import { useActor } from "../lib/backend";
import { useTranslation } from "../lib/i18n";
import type { Playlist, PlaylistVideo } from "../types";

// ── localStorage helpers ──────────────────────────────────────────────────────

function getCacheKey(userId: string) {
  return `streamverse_playlists_${userId}`;
}

function loadCachedPlaylists(userId: string): Playlist[] {
  try {
    const raw = localStorage.getItem(getCacheKey(userId));
    if (!raw) return [];
    return JSON.parse(raw) as Playlist[];
  } catch {
    return [];
  }
}

function saveCachedPlaylists(userId: string, playlists: Playlist[]): void {
  try {
    localStorage.setItem(getCacheKey(userId), JSON.stringify(playlists));
  } catch {
    // ignore
  }
}

// ── helpers ───────────────────────────────────────────────────────────────────

function getAuthToken(): string {
  return localStorage.getItem("streamverse_credential_auth") === "true"
    ? (localStorage.getItem("streamverse_admin_cred_hash") ??
        localStorage.getItem("streamverse_admin_username") ??
        "user")
    : "user";
}

function getCurrentUserId(): string {
  return (
    localStorage.getItem("streamverse_admin_username") ??
    localStorage.getItem("streamverse_user_id") ??
    "user"
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function Playlists() {
  const { t, isRTL } = useTranslation();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { actor } = useActor();
  const queryClient = useQueryClient();

  const userId = getCurrentUserId();
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(
    null,
  );
  const [showCreate, setShowCreate] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createDesc, setCreateDesc] = useState("");
  const [createPublic, setCreatePublic] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // ── Fetch playlists ──────────────────────────────────────────────────────────

  const { data: playlists = [], isLoading } = useQuery<Playlist[]>({
    queryKey: ["playlists", userId],
    queryFn: async () => {
      if (!actor || !userId) return loadCachedPlaylists(userId);
      try {
        const raw = await actor.getUserPlaylists(userId);
        const result: Playlist[] = raw.map((p) => ({
          id: p.id,
          userId: p.userId,
          name: p.name,
          description: p.description,
          isPublic: p.isPublic,
          videoIds: p.videoIds,
          createdAt: Number(p.createdAt),
          updatedAt: Number(p.updatedAt),
        }));
        saveCachedPlaylists(userId, result);
        return result;
      } catch {
        return loadCachedPlaylists(userId);
      }
    },
    enabled: !!actor && !!userId,
    initialData: () => loadCachedPlaylists(userId),
    staleTime: 1000 * 30,
  });

  // ── Fetch detail ─────────────────────────────────────────────────────────────

  const { data: playlistDetail, isLoading: detailLoading } = useQuery({
    queryKey: ["playlist-detail", selectedPlaylist?.id],
    queryFn: async () => {
      if (!actor || !selectedPlaylist) return null;
      const res = await actor.getPlaylist(selectedPlaylist.id);
      if (res.__kind__ === "ok") {
        return res.ok as {
          id: string;
          name: string;
          description: string;
          isPublic: boolean;
          videoIds: string[];
          userId: string;
          createdAt: bigint;
          updatedAt: bigint;
        };
      }
      return null;
    },
    enabled: !!actor && !!selectedPlaylist,
  });

  // ── Create ───────────────────────────────────────────────────────────────────

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("No actor");
      const token = getAuthToken();
      const res = await actor.createPlaylist(
        userId,
        createName.trim(),
        createDesc.trim(),
        createPublic,
        token,
      );
      if (res.__kind__ === "err") throw new Error(res.err);
      return res.ok;
    },
    onSuccess: () => {
      toast.success(isRTL ? "تم إنشاء قائمة التشغيل" : "Playlist created");
      setShowCreate(false);
      setCreateName("");
      setCreateDesc("");
      setCreatePublic(false);
      queryClient.invalidateQueries({ queryKey: ["playlists", userId] });
    },
    onError: (err: Error) => {
      toast.error(
        isRTL ? `فشل الإنشاء: ${err.message}` : `Failed: ${err.message}`,
      );
    },
  });

  // ── Delete ───────────────────────────────────────────────────────────────────

  const deleteMutation = useMutation({
    mutationFn: async (playlistId: string) => {
      if (!actor) throw new Error("No actor");
      const token = getAuthToken();
      const res = await actor.deletePlaylist(playlistId, userId, token);
      if (res.__kind__ === "err") throw new Error(res.err);
    },
    onSuccess: () => {
      toast.success(isRTL ? "تم حذف القائمة" : "Playlist deleted");
      setOpenMenuId(null);
      if (selectedPlaylist) setSelectedPlaylist(null);
      queryClient.invalidateQueries({ queryKey: ["playlists", userId] });
    },
    onError: (err: Error) => {
      toast.error(
        isRTL ? `فشل الحذف: ${err.message}` : `Failed: ${err.message}`,
      );
    },
  });

  // ── Remove video ─────────────────────────────────────────────────────────────

  const removeVideoMutation = useMutation({
    mutationFn: async ({
      playlistId,
      videoId,
    }: { playlistId: string; videoId: string }) => {
      if (!actor) throw new Error("No actor");
      const token = getAuthToken();
      const res = await actor.removeVideoFromPlaylist(
        playlistId,
        videoId,
        userId,
        token,
      );
      if (res.__kind__ === "err") throw new Error(res.err);
    },
    onSuccess: () => {
      toast.success(
        isRTL ? "تم حذف الفيديو من القائمة" : "Video removed from playlist",
      );
      queryClient.invalidateQueries({
        queryKey: ["playlist-detail", selectedPlaylist?.id],
      });
      queryClient.invalidateQueries({ queryKey: ["playlists", userId] });
    },
  });

  // ── Login gate ───────────────────────────────────────────────────────────────

  if (!isAuthenticated) {
    return (
      <div
        className="flex flex-col items-center justify-center min-h-[60vh] gap-6 p-8"
        dir={isRTL ? "rtl" : "ltr"}
      >
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
          <List className="h-10 w-10 text-primary" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-xl font-display font-bold text-foreground">
            {isRTL ? "قوائم التشغيل" : "My Playlists"}
          </h2>
          <p className="text-muted-foreground text-sm">
            {isRTL
              ? "سجّل الدخول لإنشاء قوائم تشغيل مخصصة"
              : "Sign in to create and manage your playlists"}
          </p>
        </div>
        <Button
          data-ocid="playlists.login_button"
          onClick={() => void navigate({ to: "/login" })}
          className="gradient-primary text-white border-0"
        >
          {t("login")}
        </Button>
      </div>
    );
  }

  // ── Detail view ──────────────────────────────────────────────────────────────

  if (selectedPlaylist) {
    const videoIds = playlistDetail?.videoIds ?? selectedPlaylist.videoIds;
    return (
      <div className="p-4 space-y-4" dir={isRTL ? "rtl" : "ltr"}>
        <div className="flex items-center gap-3">
          <button
            type="button"
            data-ocid="playlists.back_button"
            onClick={() => setSelectedPlaylist(null)}
            className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            aria-label={t("back")}
          >
            <ArrowLeft className={`h-5 w-5 ${isRTL ? "rotate-180" : ""}`} />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-display font-bold text-foreground truncate">
              {selectedPlaylist.name}
            </h1>
            {selectedPlaylist.description && (
              <p className="text-xs text-muted-foreground truncate">
                {selectedPlaylist.description}
              </p>
            )}
          </div>
          <Badge
            variant="secondary"
            className="flex-shrink-0 flex items-center gap-1"
          >
            {selectedPlaylist.isPublic ? (
              <Globe className="h-3 w-3" />
            ) : (
              <Lock className="h-3 w-3" />
            )}
            {selectedPlaylist.isPublic
              ? isRTL
                ? "عام"
                : "Public"
              : isRTL
                ? "خاص"
                : "Private"}
          </Badge>
        </div>

        {detailLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full rounded-lg" />
            ))}
          </div>
        ) : videoIds.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-16 gap-4 text-center"
            data-ocid="playlists.detail.empty_state"
          >
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
              <BookmarkPlus className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-sm">
              {isRTL
                ? "لا توجد فيديوهات في هذه القائمة"
                : "No videos in this playlist"}
            </p>
            <p className="text-xs text-muted-foreground/70">
              {isRTL
                ? "أضف فيديوهات من خلال زر إضافة إلى القائمة"
                : "Add videos using the playlist button on any video"}
            </p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-2"
          >
            <p className="text-xs text-muted-foreground">
              {videoIds.length} {isRTL ? "فيديو" : "video(s)"}
            </p>
            <AnimatePresence>
              {videoIds.map((vid, idx) => (
                <motion.div
                  key={vid}
                  initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: isRTL ? -20 : 20 }}
                  transition={{ delay: idx * 0.05 }}
                  data-ocid={`playlists.video.item.${idx + 1}`}
                  className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border/50 group"
                >
                  <div className="w-8 h-8 rounded-md bg-muted flex items-center justify-center flex-shrink-0">
                    <span className="text-xs text-muted-foreground font-mono">
                      {idx + 1}
                    </span>
                  </div>
                  <span className="flex-1 text-sm text-foreground min-w-0 truncate font-mono">
                    {vid}
                  </span>
                  <button
                    type="button"
                    data-ocid={`playlists.remove_video_button.${idx + 1}`}
                    onClick={() =>
                      removeVideoMutation.mutate({
                        playlistId: selectedPlaylist.id,
                        videoId: vid,
                      })
                    }
                    disabled={removeVideoMutation.isPending}
                    aria-label={isRTL ? "حذف" : "Remove"}
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    );
  }

  // ── List view ────────────────────────────────────────────────────────────────

  return (
    <div className="p-4 space-y-4" dir={isRTL ? "rtl" : "ltr"}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-display font-bold text-foreground">
          {isRTL ? "قوائم التشغيل" : "My Playlists"}
        </h1>
        <Button
          size="sm"
          data-ocid="playlists.create_button"
          onClick={() => setShowCreate(true)}
          className="gradient-primary text-white border-0"
        >
          <Plus className="h-4 w-4 me-1" />
          {isRTL ? "إنشاء قائمة" : "New Playlist"}
        </Button>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28 w-full rounded-xl" />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && playlists.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-20 gap-5 text-center"
          data-ocid="playlists.empty_state"
        >
          <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
            <List className="h-12 w-12 text-primary" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-base font-display font-semibold text-foreground">
              {isRTL ? "لا توجد قوائم تشغيل بعد" : "No playlists yet"}
            </h2>
            <p className="text-sm text-muted-foreground max-w-xs">
              {isRTL
                ? "أنشئ قائمتك الأولى لتنظيم فيديوهاتك المفضلة"
                : "Create your first playlist to organize your favorite videos"}
            </p>
          </div>
          <Button
            data-ocid="playlists.empty_create_button"
            onClick={() => setShowCreate(true)}
            className="gradient-primary text-white border-0"
          >
            <Plus className="h-4 w-4 me-1" />
            {isRTL ? "إنشاء قائمة تشغيل" : "Create Playlist"}
          </Button>
        </motion.div>
      )}

      {/* Playlist grid */}
      {!isLoading && playlists.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-3"
        >
          <AnimatePresence>
            {playlists.map((pl, idx) => (
              <motion.div
                key={pl.id}
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: idx * 0.06 }}
                data-ocid={`playlists.item.${idx + 1}`}
                className="relative group bg-card border border-border/60 rounded-xl overflow-hidden hover:border-primary/40 hover:shadow-md transition-all duration-200 cursor-pointer"
                onClick={() => setSelectedPlaylist(pl)}
              >
                {/* Thumbnail strip */}
                <div className="h-20 bg-gradient-to-br from-primary/20 via-primary/10 to-muted flex items-center justify-center">
                  <List className="h-8 w-8 text-primary/60" />
                  <div className="absolute top-2 end-2">
                    {pl.isPublic ? (
                      <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                    ) : (
                      <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                    )}
                  </div>
                </div>

                {/* Info */}
                <div className="p-3 space-y-1">
                  <h3 className="font-medium text-sm text-foreground line-clamp-1">
                    {pl.name}
                  </h3>
                  {pl.description && (
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {pl.description}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground/70">
                    {pl.videoIds.length} {isRTL ? "فيديو" : "video(s)"}
                  </p>
                </div>

                {/* Kebab menu */}
                <button
                  type="button"
                  data-ocid={`playlists.menu_button.${idx + 1}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenMenuId(openMenuId === pl.id ? null : pl.id);
                  }}
                  aria-label="Menu"
                  className="absolute top-2 start-2 opacity-0 group-hover:opacity-100 p-1.5 rounded-md bg-black/40 text-white hover:bg-black/60 transition-all"
                >
                  <MoreVertical className="h-4 w-4" />
                </button>

                {/* Dropdown menu */}
                <AnimatePresence>
                  {openMenuId === pl.id && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="absolute top-9 start-2 z-30 bg-popover border border-border rounded-lg shadow-lg py-1 min-w-[140px]"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        data-ocid={`playlists.delete_button.${idx + 1}`}
                        onClick={() => deleteMutation.mutate(pl.id)}
                        disabled={deleteMutation.isPending}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        {isRTL ? "حذف القائمة" : "Delete Playlist"}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Create dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent
          data-ocid="playlists.create_dialog"
          dir={isRTL ? "rtl" : "ltr"}
          className="sm:max-w-md"
        >
          <DialogHeader>
            <DialogTitle className="font-display">
              {isRTL ? "إنشاء قائمة تشغيل جديدة" : "Create New Playlist"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="pl-name">{isRTL ? "الاسم" : "Name"}</Label>
              <Input
                id="pl-name"
                data-ocid="playlists.create_name_input"
                value={createName}
                onChange={(e) => setCreateName(e.target.value)}
                placeholder={isRTL ? "اسم القائمة..." : "Playlist name..."}
                maxLength={60}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pl-desc">
                {isRTL ? "الوصف (اختياري)" : "Description (optional)"}
              </Label>
              <Textarea
                id="pl-desc"
                data-ocid="playlists.create_desc_input"
                value={createDesc}
                onChange={(e) => setCreateDesc(e.target.value)}
                placeholder={
                  isRTL ? "وصف القائمة..." : "Describe your playlist..."
                }
                rows={2}
                maxLength={200}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="pl-public" className="cursor-pointer">
                {isRTL ? "قائمة عامة" : "Public playlist"}
              </Label>
              <Switch
                id="pl-public"
                data-ocid="playlists.create_public_switch"
                checked={createPublic}
                onCheckedChange={setCreatePublic}
              />
            </div>
            <div className="flex gap-2 pt-1">
              <Button
                type="button"
                variant="outline"
                data-ocid="playlists.create_cancel_button"
                onClick={() => setShowCreate(false)}
                className="flex-1"
              >
                {t("cancel")}
              </Button>
              <Button
                type="button"
                data-ocid="playlists.create_submit_button"
                onClick={() => createMutation.mutate()}
                disabled={!createName.trim() || createMutation.isPending}
                className="flex-1 gradient-primary text-white border-0"
              >
                {createMutation.isPending
                  ? isRTL
                    ? "جارٍ الإنشاء..."
                    : "Creating..."
                  : isRTL
                    ? "إنشاء"
                    : "Create"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
