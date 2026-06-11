import Common "common";

module {
  /// The kind of event that triggered a notification
  public type NotificationKind = {
    #new_follower;
    #video_liked;
    #video_commented;
    #new_video_from_followed;
  };

  /// A single in-app notification record (mutable read-state)
  public type Notification = {
    id : Text;
    userId : Common.UserId;    // recipient
    actorId : Common.UserId;   // who triggered it
    kind : NotificationKind;
    videoId : ?Text;           // present for video-related events
    message : Text;
    timestamp : Common.Timestamp;
    var isRead : Bool;
  };

  /// Immutable snapshot returned over the API boundary
  public type NotificationView = {
    id : Text;
    userId : Common.UserId;
    actorId : Common.UserId;
    kind : NotificationKind;
    videoId : ?Text;
    message : Text;
    timestamp : Common.Timestamp;
    isRead : Bool;
  };

  /// Paginated result for notification list endpoints
  public type NotificationPage = {
    items : [NotificationView];
    total : Nat;
    offset : Nat;
    limit : Nat;
    unreadCount : Nat;
  };
};
