import { c as createLucideIcon, u as useTranslation, an as useNotifications, ao as useMarkAllRead, j as jsxRuntimeExports, J as Bell, B as Button, ap as useMarkNotificationRead, a as useNavigate } from "./index-B4P1PGaK.js";
import { A as AlertDialog, a as AlertDialogTrigger, b as AlertDialogContent, c as AlertDialogHeader, d as AlertDialogTitle, e as AlertDialogDescription, f as AlertDialogFooter, g as AlertDialogCancel, h as AlertDialogAction } from "./alert-dialog-OHUUwJKB.js";
import { B as Badge } from "./badge-B5FJUKjx.js";
import { S as Skeleton } from "./skeleton-BQhv6M21.js";
import { R as RefreshCw } from "./refresh-cw-ASyrAJdc.js";
import { P as Play } from "./play-BCFueK3b.js";
import { M as MessageCircle } from "./message-circle-BL4BDtUO.js";
import { H as Heart } from "./heart-CVmL7WsL.js";
import { U as UserPlus } from "./user-plus-BrkdH85U.js";
import "./index-C1nCKn3U.js";
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [
  ["path", { d: "M18 6 7 17l-5-5", key: "116fxf" }],
  ["path", { d: "m22 10-7.5 7.5L13 16", key: "ke71qq" }]
];
const CheckCheck = createLucideIcon("check-check", __iconNode);
function relativeTime(ts, isRTL) {
  const diff = Date.now() - Number(ts) / 1e6;
  const mins = Math.floor(diff / 6e4);
  const hours = Math.floor(diff / 36e5);
  const days = Math.floor(diff / 864e5);
  if (mins < 1) return isRTL ? "الآن" : "Just now";
  if (mins < 60) return isRTL ? `منذ ${mins} د` : `${mins}m ago`;
  if (hours < 24) return isRTL ? `منذ ${hours} س` : `${hours}h ago`;
  if (days < 7) return isRTL ? `منذ ${days} ي` : `${days}d ago`;
  const date = new Date(Number(ts) / 1e6);
  return date.toLocaleDateString(isRTL ? "ar" : "en", {
    month: "short",
    day: "numeric"
  });
}
function dayLabel(ts, isRTL) {
  const d = new Date(Number(ts) / 1e6);
  const today = /* @__PURE__ */ new Date();
  const yesterday = /* @__PURE__ */ new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const sameDay = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  if (sameDay(d, today)) return isRTL ? "اليوم" : "Today";
  if (sameDay(d, yesterday)) return isRTL ? "أمس" : "Yesterday";
  return d.toLocaleDateString(isRTL ? "ar" : "en", {
    weekday: "long",
    month: "long",
    day: "numeric"
  });
}
function kindMeta(kind) {
  switch (kind) {
    case "new_follower":
      return {
        Icon: UserPlus,
        colorClass: "text-primary",
        bgClass: "bg-primary/15"
      };
    case "video_liked":
      return {
        Icon: Heart,
        colorClass: "text-rose-400",
        bgClass: "bg-rose-500/15"
      };
    case "video_commented":
      return {
        Icon: MessageCircle,
        colorClass: "text-sky-400",
        bgClass: "bg-sky-500/15"
      };
    case "new_video_from_followed":
      return {
        Icon: Play,
        colorClass: "text-emerald-400",
        bgClass: "bg-emerald-500/15"
      };
    default:
      return {
        Icon: Bell,
        colorClass: "text-muted-foreground",
        bgClass: "bg-muted/30"
      };
  }
}
function NotificationRow({
  item,
  isRTL,
  index
}) {
  const { mutate: markRead } = useMarkNotificationRead();
  const navigate = useNavigate();
  const meta = kindMeta(item.kind);
  const { Icon } = meta;
  function handleClick() {
    if (!item.isRead) markRead(item.id);
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
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "button",
    {
      type: "button",
      "data-ocid": `notification.item.${index + 1}`,
      className: [
        "group w-full flex items-start gap-3 px-4 py-3.5 rounded-xl text-start transition-all duration-200",
        "border",
        !item.isRead ? "border-primary/30 bg-primary/5 hover:bg-primary/10 shadow-sm" : "border-border/40 bg-card/60 hover:bg-muted/30"
      ].join(" "),
      onClick: handleClick,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: `flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${meta.bgClass}`,
            "aria-hidden": "true",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: `h-4.5 w-4.5 ${meta.colorClass}` })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "p",
            {
              className: `text-sm leading-snug break-words ${!item.isRead ? "font-medium text-foreground" : "text-foreground/80"}`,
              children: item.message
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-muted-foreground", children: relativeTime(item.timestamp, isRTL) })
        ] }),
        !item.isRead && /* @__PURE__ */ jsxRuntimeExports.jsx(
          "span",
          {
            className: "flex-shrink-0 mt-2 w-2 h-2 rounded-full bg-primary",
            "aria-label": isRTL ? "غير مقروء" : "Unread"
          }
        )
      ]
    }
  );
}
function DayGroup({
  label,
  items,
  isRTL,
  startIndex
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 mb-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-semibold text-muted-foreground uppercase tracking-wider", children: label }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 h-px bg-border/50" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: items.map((item, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      NotificationRow,
      {
        item,
        isRTL,
        index: startIndex + i
      },
      item.id
    )) })
  ] });
}
function NotificationSkeleton() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: [1, 2, 3, 4, 5].map((i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: "flex items-center gap-3 p-4 rounded-xl bg-card/60 border border-border/30",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "w-10 h-10 rounded-full flex-shrink-0" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-3.5 w-3/4" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-3 w-1/3" })
        ] })
      ]
    },
    i
  )) });
}
function Notifications() {
  const { t, isRTL } = useTranslation();
  const {
    data: notifications = [],
    isLoading,
    isError,
    isFetching,
    refetch
  } = useNotifications();
  const { mutate: markAll, isPending: markingAll } = useMarkAllRead();
  const unread = notifications.filter((n) => !n.isRead).length;
  const groups = (() => {
    const result = [];
    const map = /* @__PURE__ */ new Map();
    const keyOrder = [];
    for (const item of notifications) {
      const d = new Date(Number(item.timestamp) / 1e6);
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      if (!map.has(key)) {
        map.set(key, []);
        keyOrder.push(key);
      }
      map.get(key).push(item);
    }
    for (const key of keyOrder) {
      const groupItems = map.get(key);
      result.push({
        label: dayLabel(groupItems[0].timestamp, isRTL),
        items: groupItems
      });
    }
    return result;
  })();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "transition-page p-4 pb-24 md:pb-8 max-w-2xl mx-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Bell, { className: "h-5 w-5 text-primary" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display font-bold text-xl text-foreground", children: t("notifications.title") }),
          unread > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(
            Badge,
            {
              variant: "secondary",
              className: "text-xs px-1.5 py-0 mt-0.5 bg-primary/15 text-primary border-0",
              children: isRTL ? `${unread} غير مقروء` : `${unread} unread`
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            type: "button",
            variant: "ghost",
            size: "icon",
            "data-ocid": "notifications.refresh_button",
            onClick: () => void refetch(),
            disabled: isFetching,
            "aria-label": isRTL ? "تحديث" : "Refresh",
            className: "text-muted-foreground hover:text-foreground",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              RefreshCw,
              {
                className: `h-4 w-4 ${isFetching ? "animate-spin" : ""}`
              }
            )
          }
        ),
        unread > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            type: "button",
            variant: "ghost",
            size: "sm",
            "data-ocid": "notifications.mark_all_read_button",
            onClick: () => markAll(),
            disabled: markingAll,
            className: "flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCheck, { className: "h-3.5 w-3.5" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hidden sm:inline", children: t("notifications.markAllRead") })
            ]
          }
        ),
        notifications.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialog, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              type: "button",
              variant: "ghost",
              size: "icon",
              "data-ocid": "notifications.clear_all_button",
              className: "text-muted-foreground hover:text-destructive",
              "aria-label": isRTL ? "مسح الكل" : "Clear all",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCheck, { className: "h-4 w-4" })
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogContent, { "data-ocid": "notifications.clear_dialog", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogHeader, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogTitle, { children: isRTL ? "تحديد الكل كمقروء؟" : "Mark all as read?" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogDescription, { children: isRTL ? "سيتم تحديد جميع الإشعارات كمقروءة." : "All notifications will be marked as read." })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogFooter, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogCancel, { "data-ocid": "notifications.clear_cancel_button", children: t("cancel") }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                AlertDialogAction,
                {
                  "data-ocid": "notifications.clear_confirm_button",
                  onClick: () => markAll(),
                  children: t("confirm")
                }
              )
            ] })
          ] })
        ] })
      ] })
    ] }),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { "data-ocid": "notifications.loading_state", children: /* @__PURE__ */ jsxRuntimeExports.jsx(NotificationSkeleton, {}) }) : isError ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "flex flex-col items-center justify-center py-16 gap-4 text-center",
        "data-ocid": "notifications.error_state",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Bell, { className: "h-7 w-7 text-destructive/60" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-display font-semibold text-foreground", children: t("error") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: isRTL ? "تعذّر تحميل الإشعارات" : "Could not load notifications" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              type: "button",
              variant: "secondary",
              "data-ocid": "notifications.retry_button",
              onClick: () => void refetch(),
              children: t("retry")
            }
          )
        ]
      }
    ) : notifications.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "flex flex-col items-center justify-center py-20 gap-5 text-center",
        "data-ocid": "notifications.empty_state",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-20 h-20 rounded-2xl bg-muted/30 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Bell, { className: "h-9 w-9 text-muted-foreground/30" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -top-1 -right-1 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-primary font-bold", children: "0" }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-display font-semibold text-lg text-foreground", children: t("notifications.empty") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground max-w-xs leading-relaxed", children: t("notifications.emptyHint") })
          ] })
        ]
      }
    ) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-6", "data-ocid": "notifications.list", children: groups.map((group, gi) => {
      const startIndex = groups.slice(0, gi).reduce((acc, g) => acc + g.items.length, 0);
      return /* @__PURE__ */ jsxRuntimeExports.jsx(
        DayGroup,
        {
          label: group.label,
          items: group.items,
          isRTL,
          startIndex
        },
        group.label
      );
    }) })
  ] });
}
export {
  Notifications as default
};
