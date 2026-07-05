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
import {
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  ShieldAlert,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

function parseBackendErrorSafe(e: unknown, isRTL: boolean): string {
  const msg = String(e);
  if (msg.includes("auth") || msg.includes("unauthorized"))
    return isRTL
      ? "خطأ في الصلاحيات — أعد تسجيل الدخول"
      : "Auth error — please log in again";
  if (msg.includes("network") || msg.includes("fetch"))
    return isRTL
      ? "خطأ في الاتصال بالخادم"
      : "Connection error — check your internet";
  return isRTL ? `فشل — ${msg.slice(0, 120)}` : `Failed — ${msg.slice(0, 120)}`;
}
import type { CommentView } from "../backend.d";
import { useActor } from "../lib/backend";

const PAGE_SIZE = 15n;

function fmtDate(ts: bigint): string {
  const ms = Number(ts) / 1_000_000;
  return new Date(ms).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function AdminCommentsTab({ isRTL }: { isRTL: boolean }) {
  const { actor } = useActor();
  const [comments, setComments] = useState<CommentView[]>([]);
  const [total, setTotal] = useState(0n);
  const [offset, setOffset] = useState(0n);
  const [loading, setLoading] = useState(true);

  async function load(off: bigint) {
    if (!actor) return;
    setLoading(true);
    try {
      const res = await actor.adminListAllComments(off, PAGE_SIZE);
      setComments(res.items);
      setTotal(res.total);
      setOffset(off);
    } catch (e) {
      console.error("[Admin/Comments] load failed", e);
      toast.error(
        isRTL
          ? "فشل تحميل التعليقات — تحقق من الاتصال بالخادم"
          : "Failed to load comments — check server connection",
      );
    } finally {
      setLoading(false);
    }
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: load changes when actor changes
  useEffect(() => {
    void load(0n);
  }, [actor]);

  async function handleDelete(commentId: string) {
    if (!actor) return;
    try {
      await actor.adminDeleteComment(commentId);
      setComments((prev) =>
        prev.map((c) => (c.id === commentId ? { ...c, isDeleted: true } : c)),
      );
      toast.success(isRTL ? "تم حذف التعليق" : "Comment deleted");
    } catch (e) {
      console.error("[Admin/Comments] delete failed", commentId, e);
      toast.error(parseBackendErrorSafe(e, isRTL));
    }
  }

  const totalPages =
    Number(total) === 0 ? 1 : Math.ceil(Number(total) / Number(PAGE_SIZE));
  const currentPage = Number(offset) / Number(PAGE_SIZE) + 1;

  if (loading) {
    return (
      <div className="space-y-3" data-ocid="admin.comments.loading_state">
        {Array.from({ length: 5 }).map((_, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: skeleton
          <Skeleton key={i} className="h-16 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4" data-ocid="admin.comments.panel">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {isRTL
            ? `${Number(total)} تعليق`
            : `${Number(total)} comment${Number(total) !== 1 ? "s" : ""}`}
        </p>
      </div>

      {comments.length === 0 ? (
        <div
          className="text-center py-16 text-muted-foreground"
          data-ocid="admin.comments.empty_state"
        >
          <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="font-display">
            {isRTL ? "لا توجد تعليقات" : "No comments yet"}
          </p>
        </div>
      ) : (
        <div className="space-y-2" data-ocid="admin.comments.list">
          {comments.map((comment, idx) => (
            <div
              key={comment.id}
              className={`flex items-start gap-3 p-3 rounded-xl border transition-smooth ${
                comment.isDeleted
                  ? "bg-muted/10 border-border opacity-50"
                  : "bg-muted/30 border-border hover:border-primary/30"
              }`}
              data-ocid={`admin.comments.item.${idx + 1}`}
            >
              {/* Comment icon */}
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                <MessageSquare className="w-3.5 h-3.5 text-primary" />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                  <span className="text-xs font-medium text-primary truncate max-w-[120px]">
                    {comment.videoId
                      ? `${isRTL ? "فيديو" : "Video"}: ${comment.videoId.slice(0, 8)}…`
                      : isRTL
                        ? "فيديو غير معروف"
                        : "Unknown video"}
                  </span>
                  <span className="text-xs text-muted-foreground">•</span>
                  <span className="text-xs text-muted-foreground">
                    {fmtDate(comment.createdAt)}
                  </span>
                  {comment.isDeleted && (
                    <Badge variant="destructive" className="text-xs py-0">
                      {isRTL ? "محذوف" : "Deleted"}
                    </Badge>
                  )}
                  {comment.isEdited && (
                    <Badge variant="secondary" className="text-xs py-0">
                      {isRTL ? "معدَّل" : "Edited"}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-foreground line-clamp-2">
                  {comment.text}
                </p>
              </div>

              {/* Actions */}
              {!comment.isDeleted && (
                <div className="flex items-center gap-1.5 shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs h-7 border-amber-500/40 text-amber-400 hover:bg-amber-500/10"
                    onClick={() => {
                      toast.info(
                        isRTL
                          ? "سيتم تقييد المستخدم قريباً"
                          : "User flagging coming soon",
                      );
                    }}
                    data-ocid={`admin.comments.flag_commenter_button.${idx + 1}`}
                  >
                    <ShieldAlert className="w-3 h-3 me-1" />
                    {isRTL ? "تحذير" : "Flag User"}
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="text-xs h-7"
                        data-ocid={`admin.comments.delete_button.${idx + 1}`}
                      >
                        <Trash2 className="w-3 h-3 me-1" />
                        {isRTL ? "حذف" : "Delete"}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent
                      data-ocid={`admin.comments.delete_dialog.${idx + 1}`}
                    >
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          {isRTL ? "حذف التعليق؟" : "Delete comment?"}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          {isRTL
                            ? "سيتم حذف هذا التعليق نهائياً."
                            : "This comment will be permanently deleted."}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel
                          data-ocid={`admin.comments.delete_cancel.${idx + 1}`}
                        >
                          {isRTL ? "إلغاء" : "Cancel"}
                        </AlertDialogCancel>
                        <AlertDialogAction
                          data-ocid={`admin.comments.delete_confirm.${idx + 1}`}
                          onClick={() => void handleDelete(comment.id)}
                        >
                          {isRTL ? "حذف" : "Delete"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              )}
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
            data-ocid="admin.comments.pagination_prev"
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
            data-ocid="admin.comments.pagination_next"
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
