import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import {
  BookmarkPlus,
  Check,
  CheckCircle2,
  Clock,
  CloudDownload,
  Eye,
  Play,
  Plus,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { getMyPlaylists, useActor } from "../lib/backend";
import { useTranslation } from "../lib/i18n";
import {
  cacheThumbnail,
  isVideoSaved,
  removeVideo,
  saveVideo,
} from "../lib/offlineStorage";
import type { UnifiedVideo, VideoMetadata } from "../types";
import { SocialBar } from "./SocialBar";

interface VideoCardProps {
  video: VideoMetadata | UnifiedVideo;
  onWatch: (video: VideoMetadata | UnifiedVideo) => void;
  onShare?: (video: VideoMetadata | UnifiedVideo) => void;
  onComment?: (video: VideoMetadata | UnifiedVideo) => void;
  index?: number;
  className?: string;
}

function getCurrentUserId(): string {
  return (
    localStorage.getItem("streamverse_admin_username") ??
    localStorage.getItem("streamverse_user_id") ??
    "user"
  );
}

function getAuthToken(): string {
  return localStorage.getItem("streamverse_credential_auth") === "true"
    ? (localStorage.getItem("streamverse_admin_cred_hash") ??
        localStorage.getItem("streamverse_admin_username") ??
        "user")
    : "user";
}

function PlatformBadge({ platform }: { platform: string }) {
  const p = platform.toLowerCase();
  if (p === "vimeo") {
    return (
      <Badge
        variant="secondary"
        className="bg-primary/80 text-white border-0 text-[10px] px-1.5 py-0.5 font-bold tracking-wide"
      >
        V
      </Badge>
    );
  }
  if (p === "tiktok") {
    return (
      <Badge
        variant="secondary"
        className="bg-[linear-gradient(135deg,#010101_60%,#fe2c55_100%)] text-white border border-white/20 text-[10px] px-1.5 py-0.5 font-bold tracking-wide"
      >
        TT
      </Badge>
    );
  }
  if (p === "dailymotion") {
    return (
      <Badge
        variant="secondary"
        className="bg-[#00AAFF] text-white border-0 text-[10px] px-1.5 py-0.5 font-bold tracking-wide"
      >
        DM
      </Badge>
    );
  }
  if (p === "archive" || p === "internetarchive") {
    return (
      <Badge
        variant="secondary"
        className="bg-amber-600 text-white border-0 text-[10px] px-1.5 py-0.5 font-bold tracking-wide"
      >
        IA
      </Badge>
    );
  }
  return (
    <Badge
      variant="secondary"
      className="bg-destructive/90 text-white border-0 text-[10px] px-1.5 py-0.5 font-bold tracking-wide"
    >
      YT
    </Badge>
  );
}

export function VideoCard({
  video,
  onWatch,
  onShare,
  onComment,
  index = 0,
  className,
}: VideoCardProps) {
  const { t, isRTL } = useTranslation();
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [optimisticReaction, setOptimisticReaction] = useState<
    "like" | "dislike" | null
  >(null);
  const [savedOffline, setSavedOffline] = useState(false);
  const [savingOffline, setSavingOffline] = useState(false);
  const [showPlaylistMenu, setShowPlaylistMenu] = useState(false);
  const [addingToId, setAddingToId] = useState<string | null>(null);
  const [addedToIds, setAddedToIds] = useState<Set<string>>(new Set());
  const menuRef = useRef<HTMLDivElement>(null);
  const userId = getCurrentUserId();

  const _videoId =
    "videoId" in video ? (video as any).videoId : (video as any).id;
  const _thumbnailUrl =
    "thumbnailUrl" in video
      ? (video as any).thumbnailUrl
      : (video as any).thumbnail;
  const _platform =
    "platform" in video ? (video as any).platform : (video as any).source;
  const _channelTitle =
    "channelTitle" in video
      ? (video as any).channelTitle
      : (video as any).source;
  const _viewCount =
    "viewCount" in video ? (video as any).viewCount : (video as any).views || 0;

  // Close playlist menu on outside click
  useEffect(() => {
    if (!showPlaylistMenu) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowPlaylistMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showPlaylistMenu]);

  // Check if already saved on mount
  useEffect(() => {
    const vid = "videoId" in video ? _videoId : video.id;
    isVideoSaved(vid)
      .then(setSavedOffline)
      .catch(() => {});
  }, [video, _videoId]);

  // Fetch playlists (on demand)
  const { data: myPlaylists = [] } = useQuery({
    queryKey: ["playlists", userId],
    queryFn: () => getMyPlaylists(userId, actor),
    enabled: !!actor && showPlaylistMenu,
    staleTime: 1000 * 30,
  });

  const addToPlaylistMutation = useMutation({
    mutationFn: async (playlistId: string) => {
      if (!actor) throw new Error("No actor");
      const token = getAuthToken();
      const vid = "videoId" in video ? _videoId : video.id;
      const res = await actor.addVideoToPlaylist(
        playlistId,
        vid,
        userId,
        token,
      );
      if (res.__kind__ === "err") throw new Error(res.err);
      return playlistId;
    },
    onMutate: (id) => setAddingToId(id),
    onSuccess: (id) => {
      setAddedToIds((prev) => new Set([...prev, id]));
      setAddingToId(null);
      toast.success(isRTL ? "تمت الإضافة إلى القائمة" : "Added to playlist");
      queryClient.invalidateQueries({ queryKey: ["playlists", userId] });
    },
    onError: () => {
      setAddingToId(null);
      toast.error(isRTL ? "فشل الإضافة" : "Failed to add");
    },
  });

  const handleSaveOffline = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (savingOffline) return;
    setSavingOffline(true);
    try {
      if (savedOffline) {
        await removeVideo(_videoId);
        setSavedOffline(false);
        queryClient.invalidateQueries({ queryKey: ["offline-videos"] });
        toast.info(
          isRTL
            ? "تم إزالة الفيديو من المحفوظات"
            : "Video removed from offline saves",
        );
      } else {
        await saveVideo(video as VideoMetadata);
        cacheThumbnail(
          "thumbnailUrl" in video ? _thumbnailUrl : video.thumbnail,
        );
        setSavedOffline(true);
        queryClient.invalidateQueries({ queryKey: ["offline-videos"] });
        toast.success(
          isRTL ? "تم الحفظ للاستخدام دون إنترنت ✓" : "Saved offline ✓",
          { duration: 3000 },
        );
      }
    } catch {
      toast.error(isRTL ? "فشل الحفظ" : "Save failed");
    } finally {
      setSavingOffline(false);
    }
  };

  // Fetch stats
  const vid = "videoId" in video ? _videoId : video.id;
  const { data: stats } = useQuery({
    queryKey: ["video-stats", vid],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getVideoStats(vid);
    },
    enabled: !!actor,
    staleTime: 1000 * 30,
  });

  // Fetch user's reaction
  const { data: myReaction } = useQuery({
    queryKey: ["video-reaction", vid],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getVideoReaction(vid);
    },
    enabled: !!actor,
    staleTime: 1000 * 60,
  });

  const reactionMutation = useMutation({
    mutationFn: async (kind: "like" | "dislike") => {
      if (!actor) return;
      const vid = "videoId" in video ? _videoId : video.id;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await actor.reactToVideo(vid, kind as any);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["video-stats", _videoId],
      });
      queryClient.invalidateQueries({
        queryKey: ["video-reaction", _videoId],
      });
    },
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

  return (
    <div
      data-ocid={`video.item.${index + 1}`}
      className={cn(
        "video-card group",
        "hover:shadow-video-hover hover:-translate-y-1 transition-all duration-300",
        className,
      )}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden rounded-t-lg bg-muted">
        <div
          role="button"
          tabIndex={0}
          className="absolute inset-0 z-10 cursor-pointer"
          onClick={() => onWatch(video)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onWatch(video);
            }
          }}
          data-ocid={`video.watch_button.${index + 1}`}
          aria-label={`Watch: ${video.title}`}
        />

        <img
          src={_thumbnailUrl}
          alt={video.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />

        {/* Hover overlay */}
        <div className="video-overlay opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-between p-3 pointer-events-none">
          <span className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center shadow-glow">
            <Play className="h-5 w-5 text-white fill-white ms-0.5" />
          </span>
        </div>

        {/* Duration badge */}
        {video.duration && (
          <div className="absolute bottom-2 start-2 z-20 bg-black/80 rounded px-1.5 py-0.5 flex items-center gap-1 pointer-events-none">
            <Clock className="h-3 w-3 text-white/70" />
            <span className="text-xs text-white font-mono font-medium">
              {video.duration}
            </span>
          </div>
        )}

        {/* Platform badge */}
        <div className="absolute bottom-2 end-2 z-20 pointer-events-none">
          <PlatformBadge platform={_platform} />
        </div>

        {/* Download badge for stream-only videos */}
        {"canDownload" in video && video.canDownload === false && (
          <div className="absolute top-2 start-2 z-20 pointer-events-none">
            <Badge
              variant="outline"
              className="bg-black/70 text-white/80 border-white/20 text-[10px] px-1.5 py-0.5"
            >
              {isRTL ? "بث فقط" : "Stream only"}
            </Badge>
          </div>
        )}

        {/* Save offline button — only when canDownload is true or undefined */}
        {("canDownload" in video ? video.canDownload !== false : true) && (
          <button
            type="button"
            data-ocid={`video.save_offline_button.${index + 1}`}
            onClick={handleSaveOffline}
            aria-label={
              savedOffline ? "Remove from offline" : "Save for offline"
            }
            className={cn(
              "absolute top-2 end-2 z-20 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 pointer-events-auto",
              "opacity-0 group-hover:opacity-100 focus:opacity-100",
              savedOffline
                ? "bg-emerald-500/90 text-white shadow-md"
                : "bg-black/60 text-white hover:bg-primary/80",
            )}
          >
            {savedOffline ? (
              <CheckCircle2 className="h-3.5 w-3.5" />
            ) : (
              <CloudDownload className="h-3.5 w-3.5" />
            )}
          </button>
        )}

        {/* Saved indicator (always visible when saved) */}
        {savedOffline && (
          <div className="absolute top-2 end-2 z-20 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center pointer-events-none group-hover:hidden">
            <CheckCircle2 className="h-3 w-3 text-white" />
          </div>
        )}
      </div>

      {/* Info */}
      <button
        type="button"
        className="p-3 space-y-1.5 text-start w-full"
        onClick={() => onWatch(video)}
        aria-label={video.title}
      >
        <h3 className="font-body font-medium text-sm text-card-foreground line-clamp-2 leading-snug min-w-0">
          {video.title}
        </h3>
        <p className="text-xs text-muted-foreground truncate min-w-0">
          {_channelTitle}
        </p>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Eye className="h-3 w-3 flex-shrink-0" />
          <span>{_viewCount}</span>
        </div>
      </button>

      {/* Social bar */}
      <div
        className="relative px-2 pb-2 border-t border-border/30 pt-2"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <SocialBar
          videoId={_videoId}
          videoUrl={
            _platform === "vimeo"
              ? `https://vimeo.com/${_videoId}`
              : _platform === "tiktok"
                ? `https://www.tiktok.com/video/${_videoId}`
                : `https://www.youtube.com/watch?v=${_videoId}`
          }
          platform={_platform ?? "youtube"}
          videoTitle={video.title}
          likeCount={likeCount}
          dislikeCount={dislikeCount}
          commentCount={commentCount}
          userReaction={activeReaction as "like" | "dislike" | null}
          onLike={handleLike}
          onDislike={handleDislike}
          onComment={() => (onComment ? onComment(video) : onWatch(video))}
          onShare={() =>
            onShare
              ? onShare(video)
              : navigator.clipboard
                  .writeText(
                    _platform === "vimeo"
                      ? `https://vimeo.com/${_videoId}`
                      : _platform === "tiktok"
                        ? `https://www.tiktok.com/@user/video/${_videoId}`
                        : `https://www.youtube.com/watch?v=${_videoId}`,
                  )
                  .catch(() => {})
          }
          compact
          index={index}
          onAddToPlaylist={() => setShowPlaylistMenu((v) => !v)}
        />

        {/* Playlist dropdown */}
        {showPlaylistMenu && (
          <div
            ref={menuRef}
            data-ocid={`video.playlist_dropdown.${index + 1}`}
            className="absolute bottom-full start-0 mb-1 z-40 bg-popover border border-border rounded-xl shadow-lg py-1.5 min-w-[200px] max-h-56 overflow-y-auto"
          >
            {myPlaylists.length === 0 ? (
              <p className="text-xs text-muted-foreground px-3 py-2">
                {isRTL
                  ? "لا توجد قوائم — أنشئ قائمة"
                  : "No playlists — create one"}
              </p>
            ) : (
              myPlaylists.map((pl) => {
                const added = addedToIds.has(pl.id);
                return (
                  <button
                    key={pl.id}
                    type="button"
                    data-ocid={`video.playlist_option.${index + 1}`}
                    onClick={() =>
                      !added && addToPlaylistMutation.mutate(pl.id)
                    }
                    disabled={addingToId === pl.id}
                    className={cn(
                      "w-full flex items-center gap-2 px-3 py-2 text-xs transition-colors",
                      added
                        ? "text-primary bg-primary/5"
                        : "text-foreground hover:bg-muted/60",
                    )}
                  >
                    {added ? (
                      <Check className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                    ) : (
                      <Plus className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                    )}
                    <span className="truncate">{pl.name}</span>
                    <span className="ms-auto text-muted-foreground/60 tabular-nums text-[10px]">
                      {pl.videoIds.length}
                    </span>
                  </button>
                );
              })
            )}
            <div className="border-t border-border/50 mt-1 pt-1">
              <button
                type="button"
                data-ocid={`video.goto_playlists_button.${index + 1}`}
                onClick={() => {
                  setShowPlaylistMenu(false);
                  void navigate({ to: "/playlists" });
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-primary hover:bg-primary/10 transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                {isRTL ? "إنشاء قائمة جديدة" : "Create new playlist"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Watch button — always visible on mobile */}
      <div className="px-3 pb-3 md:hidden">
        <Button
          type="button"
          size="sm"
          data-ocid={`video.watch_mobile_button.${index + 1}`}
          onClick={() => onWatch(video)}
          className="w-full gradient-primary text-white border-0 text-xs h-8"
        >
          <Play className="h-3 w-3 me-1 fill-white" />
          {t("watch")}
        </Button>
      </div>
    </div>
  );
}
