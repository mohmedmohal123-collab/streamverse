import Map "mo:core/Map";
import Set "mo:core/Set";
import List "mo:core/List";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import AccessControl "mo:caffeineai-authorization/access-control";
import SocialTypes "../types/social";
import VideoTypes "../types/videos";
import NotificationTypes "../types/notifications";
import SocialLib "../lib/social";

/// Public API mixin for user-facing social-content endpoints.
/// Receives injected state: posts, comments, reactions maps, counters, follow maps,
/// and notifications state for triggering in-app notifications.
mixin (
  accessControlState : AccessControl.AccessControlState,
  videoPosts : Map.Map<Text, SocialTypes.VideoPost>,
  comments : Map.Map<Text, SocialTypes.Comment>,
  reactions : Map.Map<Text, SocialTypes.UserReaction>,
  videoPostCounter : { var value : Nat },
  commentCounter : { var value : Nat },
  followersMap : Map.Map<Principal, Set.Set<Principal>>,
  followingMap : Map.Map<Principal, Set.Set<Principal>>,
  watchEvents : Map.Map<Principal, List.List<VideoTypes.WatchHistoryEntry>>,
  notifications : Map.Map<Text, NotificationTypes.Notification>,
  notificationCounter : { var value : Nat },
) {

  // ── Video Posts ──────────────────────────────────────────────────────────────

  public shared ({ caller }) func createVideoPost(
    input : SocialTypes.VideoPostInput
  ) : async SocialTypes.VideoPostView {
    if (caller.isAnonymous()) Runtime.trap("Not authenticated");
    videoPostCounter.value += 1;
    let postId = SocialLib.makeId("post-", videoPostCounter.value);
    let now = Time.now();
    SocialLib.createVideoPost(
      videoPosts, caller, input, postId, now,
      followersMap, notifications, notificationCounter,
    );
  };

  public query func getVideoPost(postId : Text) : async ?SocialTypes.VideoPostView {
    SocialLib.getVideoPost(videoPosts, postId);
  };

  public query func listVideoPosts(
    offset : Nat,
    limit : Nat,
  ) : async SocialTypes.PageResult<SocialTypes.VideoPostView> {
    SocialLib.listVideoPosts(videoPosts, offset, limit);
  };

  public query func listUserVideoPosts(
    uploader : Principal,
    offset : Nat,
    limit : Nat,
  ) : async SocialTypes.PageResult<SocialTypes.VideoPostView> {
    SocialLib.listUserVideoPosts(videoPosts, uploader, offset, limit);
  };

  public shared ({ caller }) func updateVideoPost(
    postId : Text,
    input : SocialTypes.VideoPostInput,
  ) : async ?SocialTypes.VideoPostView {
    if (caller.isAnonymous()) Runtime.trap("Not authenticated");
    let now = Time.now();
    SocialLib.updateVideoPost(videoPosts, caller, postId, input, now);
  };

  public shared ({ caller }) func deleteVideoPost(postId : Text) : async Bool {
    if (caller.isAnonymous()) Runtime.trap("Not authenticated");
    let now = Time.now();
    SocialLib.deleteVideoPost(videoPosts, caller, postId, now);
  };

  // ── Comments ─────────────────────────────────────────────────────────────────

  public shared ({ caller }) func addComment(
    videoId : Text,
    parentCommentId : ?Text,
    text : Text,
  ) : async SocialTypes.CommentView {
    if (caller.isAnonymous()) Runtime.trap("Not authenticated");
    commentCounter.value += 1;
    let commentId = SocialLib.makeId("comment-", commentCounter.value);
    let now = Time.now();
    SocialLib.addComment(
      comments, videoId, caller, parentCommentId, text, commentId, now,
      videoPosts, notifications, notificationCounter,
    );
  };

  public query func getVideoComments(videoId : Text) : async [SocialTypes.CommentView] {
    SocialLib.getVideoComments(comments, videoId);
  };

  public shared ({ caller }) func editComment(
    commentId : Text,
    newText : Text,
  ) : async ?SocialTypes.CommentView {
    if (caller.isAnonymous()) Runtime.trap("Not authenticated");
    let now = Time.now();
    SocialLib.editComment(comments, caller, commentId, newText, now);
  };

  public shared ({ caller }) func deleteComment(commentId : Text) : async Bool {
    if (caller.isAnonymous()) Runtime.trap("Not authenticated");
    let now = Time.now();
    SocialLib.deleteComment(comments, caller, commentId, now);
  };

  // ── Reactions ─────────────────────────────────────────────────────────────────

  public shared ({ caller }) func reactToVideo(
    videoId : Text,
    reaction : SocialTypes.ReactionKind,
  ) : async Bool {
    if (caller.isAnonymous()) Runtime.trap("Not authenticated");
    let now = Time.now();
    SocialLib.reactToVideo(
      reactions, videoPosts, caller, videoId, reaction, now,
      notifications, notificationCounter,
    );
  };

  public query ({ caller }) func getVideoReaction(videoId : Text) : async ?SocialTypes.ReactionKind {
    SocialLib.getVideoReaction(reactions, caller, videoId);
  };

  public query func getVideoStats(videoId : Text) : async ?SocialTypes.VideoStats {
    SocialLib.getVideoStats(videoPosts, comments, videoId);
  };

  // ── Follow System ─────────────────────────────────────────────────────────────

  public shared ({ caller }) func followUser(targetPrincipal : Principal) : async Bool {
    if (caller.isAnonymous()) Runtime.trap("Not authenticated");
    SocialLib.followUser(
      followersMap, followingMap, caller, targetPrincipal,
      notifications, notificationCounter,
    );
  };

  public shared ({ caller }) func unfollowUser(targetPrincipal : Principal) : async Bool {
    if (caller.isAnonymous()) Runtime.trap("Not authenticated");
    SocialLib.unfollowUser(followersMap, followingMap, caller, targetPrincipal);
  };

  public query func getFollowers(userId : Principal) : async [Principal] {
    SocialLib.getFollowers(followersMap, userId);
  };

  public query func getFollowing(userId : Principal) : async [Principal] {
    SocialLib.getFollowing(followingMap, userId);
  };

  public query ({ caller }) func isFollowing(targetPrincipal : Principal) : async Bool {
    SocialLib.isFollowing(followingMap, caller, targetPrincipal);
  };

  // ── Recommendations ──────────────────────────────────────────────────────────

  public query ({ caller }) func getRecommendations(limit : Nat) : async [SocialTypes.RecommendedVideo] {
    SocialLib.getRecommendations(videoPosts, followingMap, watchEvents, caller, limit);
  };

  // ── Follow Activity Feed ──────────────────────────────────────────────────────

  public query ({ caller }) func getFollowActivity(limit : Nat) : async [SocialTypes.ActivityItem] {
    SocialLib.getFollowActivity(videoPosts, watchEvents, followingMap, caller, limit);
  };
};
