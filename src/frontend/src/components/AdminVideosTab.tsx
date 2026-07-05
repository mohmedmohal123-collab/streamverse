import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CircleCheck as CheckCircle, ChevronLeft, ChevronRight, Flag, Trash2, Video } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { VideoPostView } from "../backend.d";
import { VideoPostStatus } from "../backend.d";
import { useActor } from "../lib/backend";

const PAGE_SIZE = 10n;

function statusBadge(status: VideoPostStatus, isRTL: boolean) {
  if (status === VideoPostStatus.active)
    return (
      <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-xs">
        {isRTL ? "نشط" : "Active"}
      </Badge>
    );
  if (status === VideoPostStatus.flagged)
    return (
      <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-xs">
        {isRTL ? "مُبلَّغ" : "Flagged"}
      </Badge>
    );
  return (
    <Badge variant="destructive" className="text-xs">
      {isRTL ? "محذوف" : "Deleted"}
    </Badge>
  );
}

function fmtDate(ts: bigint): string {
  const ms = Number(ts) / 1_000_000;
  return new Date(ms).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function fmtNum(n: bigint): string {
  const v = Number(n);
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(1)}K`;
  return v.toLocaleString();
}

export function AdminVideosTab({ isRTL }: { isRTL: boolean }) {
  const { actor } = useActor();
  const [videos, setVideos] = useState<VideoPostView[]>([]);
  const [total, setTotal] = useState(0n);
  const [offset, setOffset] = useState(0n);
  const [loading, setLoading] = useState(true);

  async function load(off: bigint) {
    if (!actor) return;
    setLoading(true);
    try {
      const res = await actor.adminListAllVideoPosts(off, PAGE_SIZE);
      setVideos(res.items);
      setTotal(res.total);
      setOffset(off);
    } catch (e) {
      console.error("[Admin/Videos] load failed", e);
      toast.error(
        isRTL
          ? "فشل تحميل الفيديوهات — تحقق من الاتصال بالخادم"
          : "Failed to load videos — check server connection",
      );
    } finally {
      setLoading(false);
    }
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: load changes when actor changes
  useEffect(() => {
    void load(0n);
  }, [actor]);

  async function moderate(postId: string, status: VideoPostStatus) {
    if (!actor) return;
    try {
      await actor.adminUpdateVideoPostStatus(postId, status);
      setVideos((prev) =>
        prev.map((v) => (v.id === postId ? { ...v, status } : v)),
      );
      toast.success(isRTL ? "تم تحديث حالة الفيديو" : "Video status updated");
    } catch (e) {
      console.error("[Admin/Videos] moderate failed", postId, status, e);
      toast.error(
        isRTL
          ? `فشل تحديث الحالة: ${String(e).slice(0, 80)}`
          : `Failed to update status: ${String(e).slice(0, 80)}`,
      );
    }
  }

  const totalPages =
    Number(total) === 0 ? 1 : Math.ceil(Number(total) / Number(PAGE_SIZE));
  const currentPage = Number(offset) / Number(PAGE_SIZE) + 1;

  if (loading) {
    return (
      <div className="space-y-3" data-ocid="admin.videos.loading_state">
        {Array.from({ length: 5 }).map((_, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: skeleton
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4" data-ocid="admin.videos.panel">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {isRTL
            ? `${Number(total)} فيديو`
            : `${Number(total)} video${Number(total) !== 1 ? "s" : ""}`}
        </p>
      </div>

      {videos.length === 0 ? (
        <div
          className="text-center py-16 text-muted-foreground"
          data-ocid="admin.videos.empty_state"
        >
          <Video className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="font-display">
            {isRTL ? "لا توجد فيديوهات" : "No videos yet"}
          </p>
        </div>
      ) : (
        <div className="space-y-2" data-ocid="admin.videos.list">
          {videos.map((video, idx) => (
            <div
              key={video.id}
              className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border hover:border-primary/30 transition-smooth"
              data-ocid={`admin.videos.item.${idx + 1}`}
            >
              {/* Thumbnail */}
              <div className="w-16 h-10 rounded-lg bg-muted overflow-hidden shrink-0">
                {video.thumbnailUrl ? (
                  <img
                    src={video.thumbnailUrl}
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Video className="w-5 h-5 text-muted-foreground opacity-50" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-foreground truncate">
                  {video.title}
                </p>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  {statusBadge(video.status, isRTL)}
                  <span className="text-xs text-muted-foreground">
                    {fmtNum(video.viewCount)} {isRTL ? "مشاهدة" : "views"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {fmtDate(video.createdAt)}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1.5 shrink-0">
                {video.status === VideoPostStatus.flagged && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs h-7 border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10"
                    onClick={() =>
                      void moderate(video.id, VideoPostStatus.active)
                    }
                    data-ocid={`admin.videos.approve_button.${idx + 1}`}
                  >
                    <CheckCircle className="w-3 h-3 me-1" />
                    {isRTL ? "قبول" : "Approve"}
                  </Button>
                )}
                {video.status === VideoPostStatus.active && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs h-7 border-amber-500/40 text-amber-400 hover:bg-amber-500/10"
                    onClick={() =>
                      void moderate(video.id, VideoPostStatus.flagged)
                    }
                    data-ocid={`admin.videos.flag_button.${idx + 1}`}
                  >
                    <Flag className="w-3 h-3 me-1" />
                    {isRTL ? "تبليغ" : "Flag"}
                  </Button>
                )}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="text-xs h-7"
                      data-ocid={`admin.videos.delete_button.${idx + 1}`}
                    >
                      <Trash2 className="w-3 h-3 me-1" />
                      {isRTL ? "حذف" : "Delete"}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent
                    data-ocid={`admin.videos.delete_dialog.${idx + 1}`}
                  >
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        {isRTL ? "حذف الفيديو؟" : "Delete this video?"}
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        {isRTL
                          ? "سيتم حذف الفيديو نهائياً. لا يمكن التراجع عن هذا الإجراء."
                          : "This video will be permanently deleted. This action cannot be undone."}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel
                        data-ocid={`admin.videos.delete_cancel.${idx + 1}`}
                      >
                        {isRTL ? "إلغاء" : "Cancel"}
                      </AlertDialogCancel>
                      <AlertDialogAction
                        data-ocid={`admin.videos.delete_confirm.${idx + 1}`}
                        onClick={() =>
                          void moderate(video.id, VideoPostStatus.deleted)
                        }
                      >
                        {isRTL ? "حذف" : "Delete"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-2">
          <Button
            size="sm"
            variant="outline"
            disabled={offset === 0n}
            onClick={() => void load(offset - PAGE_SIZE)}
            data-ocid="admin.videos.pagination_prev"
          >
            {isRTL ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </Button>
          <span className="text-sm text-muted-foreground">
            {currentPage} / {totalPages}
          </span>
          <Button
            size="sm"
            variant="outline"
            disabled={offset + PAGE_SIZE >= total}
            onClick={() => void load(offset + PAGE_SIZE)}
            data-ocid="admin.videos.pagination_next"
          >
            {isRTL ? (
              <ChevronLeft className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
