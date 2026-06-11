import Common "common";

module {
  // ── Video Post ──────────────────────────────────────────────────────────────

  public type VideoPostStatus = { #active; #flagged; #deleted };

  public type VideoPost = {
    id : Text;
    uploaderId : Common.UserId;
    title : Text;
    description : Text;
    videoUrl : Text;
    thumbnailUrl : Text;
    tags : [Text];
    category : Text;
    var status : VideoPostStatus;
    createdAt : Int;
    var updatedAt : Int;
    var viewCount : Nat;
    var likeCount : Nat;
    var dislikeCount : Nat;
  };

  // Shared (immutable) snapshot returned over the API boundary
  public type VideoPostView = {
    id : Text;
    uploaderId : Common.UserId;
    title : Text;
    description : Text;
    videoUrl : Text;
    thumbnailUrl : Text;
    tags : [Text];
    category : Text;
    status : VideoPostStatus;
    createdAt : Int;
    updatedAt : Int;
    viewCount : Nat;
    likeCount : Nat;
    dislikeCount : Nat;
  };

  // Input record used for creating / updating a post
  public type VideoPostInput = {
    title : Text;
    description : Text;
    videoUrl : Text;
    thumbnailUrl : Text;
    tags : [Text];
    category : Text;
  };

  // ── Comments ─────────────────────────────────────────────────────────────────

  public type Comment = {
    id : Text;
    videoId : Text;
    authorId : Common.UserId;
    parentCommentId : ?Text;
    var text : Text;
    createdAt : Int;
    var updatedAt : Int;
    var isEdited : Bool;
    var isDeleted : Bool;
  };

  public type CommentView = {
    id : Text;
    videoId : Text;
    authorId : Common.UserId;
    parentCommentId : ?Text;
    text : Text;
    createdAt : Int;
    updatedAt : Int;
    isEdited : Bool;
    isDeleted : Bool;
  };

  // ── Reactions ─────────────────────────────────────────────────────────────────

  public type ReactionKind = { #like; #dislike };

  public type UserReaction = {
    userId : Common.UserId;
    videoId : Text;
    reaction : ReactionKind;
    createdAt : Int;
  };

  // ── Stats ─────────────────────────────────────────────────────────────────────

  public type VideoStats = {
    likeCount : Nat;
    dislikeCount : Nat;
    commentCount : Nat;
  };

  // Composite key for reactions map: (userId, videoId) → UserReaction
  public type ReactionKey = { userId : Common.UserId; videoId : Text };

  // Paginated result for list endpoints
  public type PageResult<T> = {
    items : [T];
    total : Nat;
    offset : Nat;
    limit : Nat;
  };

  // Admin content stats
  public type ContentStats = {
    totalVideoPosts : Nat;
    activeVideoPosts : Nat;
    flaggedVideoPosts : Nat;
    deletedVideoPosts : Nat;
    totalComments : Nat;
    deletedComments : Nat;
    totalReactions : Nat;
  };

  // ── Follow System ─────────────────────────────────────────────────────────────

  /// A video recommended to the caller, with a reason string
  public type RecommendedVideo = {
    videoId : Text;
    platform : Common.Platform;
    score : Float;
    reason : Text;
  };

  /// A recent activity item from a followed user
  public type ActivityItem = {
    userId : Common.UserId;
    activityType : { #watched; #posted };
    videoId : Text;
    timestamp : Int;
  };
};
