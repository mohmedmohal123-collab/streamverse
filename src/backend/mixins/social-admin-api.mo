import Map "mo:core/Map";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import AccessControl "mo:caffeineai-authorization/access-control";
import SocialTypes "../types/social";
import SocialLib "../lib/social";

/// Admin-only mixin for content moderation and statistics.
mixin (
  accessControlState : AccessControl.AccessControlState,
  videoPosts : Map.Map<Text, SocialTypes.VideoPost>,
  comments : Map.Map<Text, SocialTypes.Comment>,
  reactions : Map.Map<Text, SocialTypes.UserReaction>,
) {
  /// Safe admin check — returns false instead of trapping for unregistered principals.
  private func isSocialAdminSafe(caller : Principal) : Bool {
    if (caller.isAnonymous()) return false;
    switch (accessControlState.userRoles.get(caller)) {
      case (?(#admin)) true;
      case _ false;
    };
  };

  public shared ({ caller }) func adminListAllVideoPosts(
    offset : Nat,
    limit : Nat,
  ) : async SocialTypes.PageResult<SocialTypes.VideoPostView> {
    if (not isSocialAdminSafe(caller)) Runtime.trap("Not authorized");
    SocialLib.adminListAllVideoPosts(videoPosts, offset, limit);
  };

  public shared ({ caller }) func adminUpdateVideoPostStatus(
    postId : Text,
    status : SocialTypes.VideoPostStatus,
  ) : async ?SocialTypes.VideoPostView {
    if (not isSocialAdminSafe(caller)) Runtime.trap("Not authorized");
    let now = Time.now();
    SocialLib.adminUpdateVideoPostStatus(videoPosts, postId, status, now);
  };

  public shared ({ caller }) func adminListAllComments(
    offset : Nat,
    limit : Nat,
  ) : async SocialTypes.PageResult<SocialTypes.CommentView> {
    if (not isSocialAdminSafe(caller)) Runtime.trap("Not authorized");
    SocialLib.adminListAllComments(comments, offset, limit);
  };

  public shared ({ caller }) func adminDeleteComment(commentId : Text) : async Bool {
    if (not isSocialAdminSafe(caller)) Runtime.trap("Not authorized");
    let now = Time.now();
    SocialLib.adminDeleteComment(comments, commentId, now);
  };

  public query ({ caller }) func adminGetContentStats() : async SocialTypes.ContentStats {
    if (not isSocialAdminSafe(caller)) Runtime.trap("Not authorized");
    SocialLib.adminGetContentStats(videoPosts, comments, reactions);
  };

  public shared ({ caller }) func flagVideoPost(postId : Text) : async ?SocialTypes.VideoPostView {
    if (not isSocialAdminSafe(caller)) Runtime.trap("Not authorized");
    let now = Time.now();
    SocialLib.adminUpdateVideoPostStatus(videoPosts, postId, #flagged, now);
  };

  public shared ({ caller }) func deleteVideoPostByAdmin(postId : Text) : async ?SocialTypes.VideoPostView {
    if (not isSocialAdminSafe(caller)) Runtime.trap("Not authorized");
    let now = Time.now();
    SocialLib.adminUpdateVideoPostStatus(videoPosts, postId, #deleted, now);
  };

  public shared ({ caller }) func deleteCommentByAdmin(commentId : Text) : async Bool {
    if (not isSocialAdminSafe(caller)) Runtime.trap("Not authorized");
    let now = Time.now();
    SocialLib.adminDeleteComment(comments, commentId, now);
  };

  public query ({ caller }) func getFlaggedContent() : async SocialTypes.PageResult<SocialTypes.VideoPostView> {
    if (not isSocialAdminSafe(caller)) Runtime.trap("Not authorized");
    let flagged = videoPosts.entries()
      .filter(func((_, p) : (Text, SocialTypes.VideoPost)) : Bool {
        switch (p.status) { case (#flagged) true; case _ false };
      })
      .map(func((_, p) : (Text, SocialTypes.VideoPost)) : SocialTypes.VideoPostView {
        SocialLib.toView(p);
      })
      .toArray();
    { items = flagged; total = flagged.size(); offset = 0; limit = flagged.size() };
  };
};
