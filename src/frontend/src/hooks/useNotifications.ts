import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { NotificationKind, NotificationView } from "../backend.d.ts";
import { useActor } from "../lib/backend";

// Re-export backend type so pages can import from here
export type { NotificationKind, NotificationView };

// VAPID public key for Web Push (demo key — replace with real key for production)
const VAPID_PUBLIC_KEY =
  "BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U";

function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray.buffer;
}

const PAGE_LIMIT = BigInt(30);

/**
 * Request push notification permission and subscribe to Web Push.
 * Returns the subscription object on success, or null on failure.
 */
export async function requestPushPermission(): Promise<PushSubscription | null> {
  try {
    if (
      !("Notification" in window) ||
      !("serviceWorker" in navigator) ||
      !("PushManager" in window)
    ) {
      console.warn("[Push] Push notifications not supported in this browser");
      return null;
    }

    // Request permission
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.warn("[Push] Notification permission denied");
      return null;
    }

    // Get service worker registration
    const registration = await navigator.serviceWorker.ready;

    // Check existing subscription
    const existingSub = await registration.pushManager.getSubscription();
    if (existingSub) return existingSub;

    // Subscribe to push
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    });

    return subscription;
  } catch (err) {
    console.error("[Push] Failed to subscribe:", err);
    return null;
  }
}

/**
 * Check current push notification permission status.
 */
export function getPushPermissionStatus():
  | NotificationPermission
  | "unsupported" {
  if (!("Notification" in window)) return "unsupported";
  return Notification.permission;
}

/**
 * Fetch the current user's notifications from the backend (paginated, page 1).
 * Sorted newest first (backend returns in insertion order; we reverse).
 * Refetches every 30 seconds for live updates.
 */
export function useNotifications() {
  const { actor, isFetching } = useActor();
  return useQuery<NotificationView[]>({
    queryKey: ["notifications"],
    queryFn: async () => {
      if (!actor) return [];
      const page = await actor.getMyNotifications(BigInt(0), PAGE_LIMIT);
      // Newest first
      return [...page.items].sort(
        (a, b) => Number(b.timestamp) - Number(a.timestamp),
      );
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 20_000,
    staleTime: 10_000,
  });
}

/**
 * Poll backend for unread count every 15 seconds.
 * Used by Layout's bell badge.
 */
export function useUnreadCount() {
  const { actor, isFetching } = useActor();
  return useQuery<number>({
    queryKey: ["notifications", "unread"],
    queryFn: async () => {
      if (!actor) return 0;
      const count = await actor.getUnreadCount();
      return Number(count);
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 15_000,
    staleTime: 10_000,
  });
}

/**
 * Mark a single notification as read by its id.
 * Optimistically updates the cache so the UI responds instantly.
 */
export function useMarkNotificationRead() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) return;
      await actor.markNotificationRead(id);
    },
    // Optimistic update: flip isRead flag in cache immediately
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: ["notifications"] });

      const previous = queryClient.getQueryData<NotificationView[]>([
        "notifications",
      ]);
      queryClient.setQueryData<NotificationView[]>(
        ["notifications"],
        (old) =>
          old?.map((n) => (n.id === id ? { ...n, isRead: true } : n)) ?? [],
      );
      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["notifications"], context.previous);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

/**
 * Mark all notifications as read.
 * Invalidates both the list and the unread count queries.
 */
export function useMarkAllRead() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) return;
      await actor.markAllRead();
    },
    // Optimistic update
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["notifications"] });
      const previous = queryClient.getQueryData<NotificationView[]>([
        "notifications",
      ]);
      queryClient.setQueryData<NotificationView[]>(
        ["notifications"],
        (old) => old?.map((n) => ({ ...n, isRead: true })) ?? [],
      );
      // Also zero the badge immediately
      queryClient.setQueryData(["notifications", "unread"], 0);
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["notifications"], context.previous);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ["notifications"] });
      void queryClient.invalidateQueries({
        queryKey: ["notifications", "unread"],
      });
    },
  });
}
