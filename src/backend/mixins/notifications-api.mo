import Map "mo:core/Map";
import Principal "mo:core/Principal";
import AccessControl "mo:caffeineai-authorization/access-control";
import NotificationTypes "../types/notifications";
import NotificationsLib "../lib/notifications";

/// Public API mixin for in-app notification endpoints.
/// Receives injected state: notifications map and a monotonic counter.
mixin (
  accessControlState : AccessControl.AccessControlState,
  notifications : Map.Map<Text, NotificationTypes.Notification>,
  notificationCounter : { var value : Nat },
) {

  /// Returns a paginated list of notifications for the calling user,
  /// newest first. Includes unreadCount in the page envelope.
  public query ({ caller }) func getMyNotifications(
    offset : Nat,
    limit : Nat,
  ) : async NotificationTypes.NotificationPage {
    NotificationsLib.getMyNotifications(notifications, caller, offset, limit);
  };

  /// Marks a single notification as read for the calling user.
  public shared ({ caller }) func markNotificationRead(id : Text) : async () {
    NotificationsLib.markNotificationRead(notifications, caller, id);
  };

  /// Marks ALL notifications of the calling user as read.
  public shared ({ caller }) func markAllRead() : async () {
    NotificationsLib.markAllRead(notifications, caller);
  };

  /// Returns the count of unread notifications for the calling user.
  public query ({ caller }) func getUnreadCount() : async Nat {
    NotificationsLib.getUnreadCount(notifications, caller);
  };
};
