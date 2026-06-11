import Map "mo:core/Map";
import List "mo:core/List";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import NotificationTypes "../types/notifications";
import Common "../types/common";

/// Domain logic for in-app notifications.
/// All functions are stateless — the notifications map and counter are injected.
module {

  public func notificationToView(n : NotificationTypes.Notification) : NotificationTypes.NotificationView {
    {
      id = n.id;
      userId = n.userId;
      actorId = n.actorId;
      kind = n.kind;
      videoId = n.videoId;
      message = n.message;
      timestamp = n.timestamp;
      isRead = n.isRead;
    };
  };

  /// Creates and stores a new notification for `userId`.
  public func createNotification(
    notifications : Map.Map<Text, NotificationTypes.Notification>,
    counter : { var value : Nat },
    userId : Common.UserId,
    actorId : Common.UserId,
    kind : NotificationTypes.NotificationKind,
    videoId : ?Text,
    message : Text,
  ) : Text {
    // Skip self-notifications
    if (Principal.equal(userId, actorId)) { return "" };
    counter.value += 1;
    let id = "notif" # counter.value.toText();
    let notif : NotificationTypes.Notification = {
      id;
      userId;
      actorId;
      kind;
      videoId;
      message;
      timestamp = Time.now();
      var isRead = false;
    };
    notifications.add(id, notif);
    id;
  };

  /// Returns paginated notifications for `userId`, newest first.
  public func getMyNotifications(
    notifications : Map.Map<Text, NotificationTypes.Notification>,
    userId : Common.UserId,
    offset : Nat,
    limit : Nat,
  ) : NotificationTypes.NotificationPage {
    // Collect all notifications for this user
    let all = notifications.entries()
      .filter(func((_, n) : (Text, NotificationTypes.Notification)) : Bool {
        Principal.equal(n.userId, userId);
      })
      .map(func((_, n) : (Text, NotificationTypes.Notification)) : NotificationTypes.NotificationView {
        notificationToView(n);
      })
      .toArray();

    // Sort newest first by timestamp
    let sorted = all.sort(func(a : NotificationTypes.NotificationView, b : NotificationTypes.NotificationView) : { #less; #equal; #greater } {
      Int.compare(b.timestamp, a.timestamp);
    });

    let total = sorted.size();
    let unreadCount = sorted
      .filter(func(n : NotificationTypes.NotificationView) : Bool { not n.isRead })
      .size();

    let items = if (offset >= total) {
      [];
    } else {
      let end = Nat.min(offset + limit, total);
      sorted.sliceToArray(offset, end);
    };

    { items; total; offset; limit; unreadCount };
  };

  /// Marks a single notification as read if it belongs to `userId`.
  public func markNotificationRead(
    notifications : Map.Map<Text, NotificationTypes.Notification>,
    userId : Common.UserId,
    id : Text,
  ) {
    switch (notifications.get(id)) {
      case (?n) {
        if (Principal.equal(n.userId, userId)) {
          n.isRead := true;
        };
      };
      case null {};
    };
  };

  /// Marks all notifications for `userId` as read.
  public func markAllRead(
    notifications : Map.Map<Text, NotificationTypes.Notification>,
    userId : Common.UserId,
  ) {
    notifications.entries().forEach(func((_, n) : (Text, NotificationTypes.Notification)) {
      if (Principal.equal(n.userId, userId)) {
        n.isRead := true;
      };
    });
  };

  /// Counts unread notifications for `userId`.
  public func getUnreadCount(
    notifications : Map.Map<Text, NotificationTypes.Notification>,
    userId : Common.UserId,
  ) : Nat {
    notifications.entries()
      .filter(func((_, n) : (Text, NotificationTypes.Notification)) : Bool {
        Principal.equal(n.userId, userId) and not n.isRead;
      })
      .size();
  };
};
