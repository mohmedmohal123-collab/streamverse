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
import { useNavigate } from "@tanstack/react-router";
import {
  Bell,
  CheckCheck,
  Heart,
  MessageCircle,
  Play,
  RefreshCw,
  UserPlus,
} from "lucide-react";
import type {
  NotificationKind,
  NotificationView,
} from "../hooks/useNotifications";
import {
  useMarkAllRead,
  useMarkNotificationRead,
  useNotifications,
} from "../hooks/useNotifications";
import { useTranslation } from "../lib/i18n";

// ── Helpers ──────────────────────────────────────────────────────────────────

function relativeTime(ts: bigint, isRTL: boolean): string {
  const diff = Date.now() - Number(ts) / 1_000_000;
  const mins = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days = Math.floor(diff / 86_400_000);

  if (mins < 1) return isRTL ? "الآن" : "Just now";
  if (mins < 60) return isRTL ? `منذ ${mins} د` : `${mins}m ago`;
  if (hours < 24) return isRTL ? `منذ ${hours} س` : `${hours}h ago`;
  if (days < 7) return isRTL ? `منذ ${days} ي` : `${days}d ago`;
  const date = new Date(Number(ts) / 1_000_000);
  return date.toLocaleDateString(isRTL ? "ar" : "en", {
    month: "short",
    day: "numeric",
  });
}

function dayLabel(ts: bigint, isRTL: boolean): string {
  const d = new Date(Number(ts) / 1_000_000);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  const sameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  if (sameDay(d, today)) return isRTL ? "اليوم" : "Today";
  if (sameDay(d, yesterday)) return isRTL ? "أمس" : "Yesterday";
  return d.toLocaleDateString(isRTL ? "ar" : "en", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

interface KindMeta {
  Icon: React.ComponentType<{ className?: string }>;
  colorClass: string;
  bgClass: string;
}

function kindMeta(kind: NotificationKind): KindMeta {
  switch (kind) {
    case "new_follower":
      return {
        Icon: UserPlus,
        colorClass: "text-primary",
        bgClass: "bg-primary/15",
      };
    case "video_liked":
      return {
        Icon: Heart,
        colorClass: "text-rose-400",
        bgClass: "bg-rose-500/15",
      };
    case "video_commented":
      return {
        Icon: MessageCircle,
        colorClass: "text-sky-400",
        bgClass: "bg-sky-500/15",
      };
    case "new_video_from_followed":
      return {
        Icon: Play,
        colorClass: "text-emerald-400",
        bgClass: "bg-emerald-500/15",
      };
    default:
      return {
        Icon: Bell,
        colorClass: "text-muted-foreground",
        bgClass: "bg-muted/30",
      };
  }
}

// ── NotificationRow ───────────────────────────────────────────────────────────

function NotificationRow({
  item,
  isRTL,
  index,
}: { item: NotificationView; isRTL: boolean; index: number }) {
  const { mutate: markRead } = useMarkNotificationRead();
  const navigate = useNavigate();
  const meta = kindMeta(item.kind);
  const { Icon } = meta;

  function handleClick() {
    // Mark as read on click
    if (!item.isRead) markRead(item.id);

    // Navigate to relevant page
    switch (item.kind) {
      case "new_follower":
        void navigate({ to: "/profile" });
        break;
      case "video_liked":
      case "video_commented":
        if (item.videoId) {
          void navigate({ to: "/search", search: { q: item.videoId } });
        } else {
          void navigate({ to: "/" });
        }
        break;
      case "new_video_from_followed":
        void navigate({ to: "/" });
        break;
      default:
        break;
    }
  }

  return (
    <button
      type="button"
      data-ocid={`notification.item.${index + 1}`}
      className={[
        "group w-full flex items-start gap-3 px-4 py-3.5 rounded-xl text-start transition-all duration-200",
        "border",
        !item.isRead
          ? "border-primary/30 bg-primary/5 hover:bg-primary/10 shadow-sm"
          : "border-border/40 bg-card/60 hover:bg-muted/30",
      ].join(" ")}
      onClick={handleClick}
    >
      {/* Kind icon avatar */}
      <div
        className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${meta.bgClass}`}
        aria-hidden="true"
      >
        <Icon className={`h-4.5 w-4.5 ${meta.colorClass}`} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm leading-snug break-words ${
            !item.isRead ? "font-medium text-foreground" : "text-foreground/80"
          }`}
        >
          {item.message}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {relativeTime(item.timestamp, isRTL)}
        </p>
      </div>

      {/* Unread indicator */}
      {!item.isRead && (
        <span
          className="flex-shrink-0 mt-2 w-2 h-2 rounded-full bg-primary"
          aria-label={isRTL ? "غير مقروء" : "Unread"}
        />
      )}
    </button>
  );
}

// ── Day group ─────────────────────────────────────────────────────────────────

function DayGroup({
  label,
  items,
  isRTL,
  startIndex,
}: {
  label: string;
  items: NotificationView[];
  isRTL: boolean;
  startIndex: number;
}) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-2">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {label}
        </span>
        <div className="flex-1 h-px bg-border/50" />
      </div>
      <div className="space-y-2">
        {items.map((item, i) => (
          <NotificationRow
            key={item.id}
            item={item}
            isRTL={isRTL}
            index={startIndex + i}
          />
        ))}
      </div>
    </div>
  );
}

// ── Skeleton ─────────────────────────────────────────────────────────────────

function NotificationSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="flex items-center gap-3 p-4 rounded-xl bg-card/60 border border-border/30"
        >
          <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3.5 w-3/4" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function Notifications() {
  const { t, isRTL } = useTranslation();
  const {
    data: notifications = [],
    isLoading,
    isError,
    isFetching,
    refetch,
  } = useNotifications();
  const { mutate: markAll, isPending: markingAll } = useMarkAllRead();

  const unread = notifications.filter((n) => !n.isRead).length;

  // Group notifications by day
  const groups = (() => {
    const result: Array<{ label: string; items: NotificationView[] }> = [];
    const map = new Map<string, NotificationView[]>();
    const keyOrder: string[] = [];

    for (const item of notifications) {
      const d = new Date(Number(item.timestamp) / 1_000_000);
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      if (!map.has(key)) {
        map.set(key, []);
        keyOrder.push(key);
      }
      map.get(key)!.push(item);
    }

    for (const key of keyOrder) {
      const groupItems = map.get(key)!;
      result.push({
        label: dayLabel(groupItems[0].timestamp, isRTL),
        items: groupItems,
      });
    }
    return result;
  })();

  return (
    <div className="transition-page p-4 pb-24 md:pb-8 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
            <Bell className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="font-display font-bold text-xl text-foreground">
              {t("notifications.title")}
            </h1>
            {unread > 0 && (
              <Badge
                variant="secondary"
                className="text-xs px-1.5 py-0 mt-0.5 bg-primary/15 text-primary border-0"
              >
                {isRTL ? `${unread} غير مقروء` : `${unread} unread`}
              </Badge>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Manual refresh */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            data-ocid="notifications.refresh_button"
            onClick={() => void refetch()}
            disabled={isFetching}
            aria-label={isRTL ? "تحديث" : "Refresh"}
            className="text-muted-foreground hover:text-foreground"
          >
            <RefreshCw
              className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
            />
          </Button>

          {/* Mark all read */}
          {unread > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              data-ocid="notifications.mark_all_read_button"
              onClick={() => markAll()}
              disabled={markingAll}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">
                {t("notifications.markAllRead")}
              </span>
            </Button>
          )}

          {/* Clear all (mark all read + confirm) */}
          {notifications.length > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  data-ocid="notifications.clear_all_button"
                  className="text-muted-foreground hover:text-destructive"
                  aria-label={isRTL ? "مسح الكل" : "Clear all"}
                >
                  <CheckCheck className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent data-ocid="notifications.clear_dialog">
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    {isRTL ? "تحديد الكل كمقروء؟" : "Mark all as read?"}
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    {isRTL
                      ? "سيتم تحديد جميع الإشعارات كمقروءة."
                      : "All notifications will be marked as read."}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel data-ocid="notifications.clear_cancel_button">
                    {t("cancel")}
                  </AlertDialogCancel>
                  <AlertDialogAction
                    data-ocid="notifications.clear_confirm_button"
                    onClick={() => markAll()}
                  >
                    {t("confirm")}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>

      {/* Feed */}
      {isLoading ? (
        <div data-ocid="notifications.loading_state">
          <NotificationSkeleton />
        </div>
      ) : isError ? (
        <div
          className="flex flex-col items-center justify-center py-16 gap-4 text-center"
          data-ocid="notifications.error_state"
        >
          <div className="w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center">
            <Bell className="h-7 w-7 text-destructive/60" />
          </div>
          <div className="space-y-1">
            <p className="font-display font-semibold text-foreground">
              {t("error")}
            </p>
            <p className="text-sm text-muted-foreground">
              {isRTL ? "تعذّر تحميل الإشعارات" : "Could not load notifications"}
            </p>
          </div>
          <Button
            type="button"
            variant="secondary"
            data-ocid="notifications.retry_button"
            onClick={() => void refetch()}
          >
            {t("retry")}
          </Button>
        </div>
      ) : notifications.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-20 gap-5 text-center"
          data-ocid="notifications.empty_state"
        >
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-muted/30 flex items-center justify-center">
              <Bell className="h-9 w-9 text-muted-foreground/30" />
            </div>
            <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-xs text-primary font-bold">0</span>
            </div>
          </div>
          <div className="space-y-1.5">
            <p className="font-display font-semibold text-lg text-foreground">
              {t("notifications.empty")}
            </p>
            <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
              {t("notifications.emptyHint")}
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-6" data-ocid="notifications.list">
          {groups.map((group, gi) => {
            const startIndex = groups
              .slice(0, gi)
              .reduce((acc, g) => acc + g.items.length, 0);
            return (
              <DayGroup
                key={group.label}
                label={group.label}
                items={group.items}
                isRTL={isRTL}
                startIndex={startIndex}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
