import Map "mo:core/Map";
import Set "mo:core/Set";
import List "mo:core/List";
import Iter "mo:core/Iter";
import Array "mo:core/Array";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import SocialTypes "../types/social";
import Common "../types/common";
import VideoTypes "../types/videos";
import NotificationTypes "../types/notifications";
import NotificationsLib "../lib/notifications";

/// Domain logic for video posts, comments, reactions, follows, and recommendations.
/// All functions are stateless — state maps are injected by the caller.
module {

  // ── Video Posts ──────────────────────────────────────────────────────────────

  public func toView(post : SocialTypes.VideoPost) : SocialTypes.VideoPostView {
    {
      id = post.id;
      uploaderId = post.uploaderId;
      title = post.title;
      description = post.description;
      videoUrl = post.videoUrl;
      thumbnailUrl = post.thumbnailUrl;
      tags = post.tags;
      category = post.category;
      status = post.status;
      createdAt = post.createdAt;
      updatedAt = post.updatedAt;
      viewCount = post.viewCount;
      likeCount = post.likeCount;
      dislikeCount = post.dislikeCount;
    };
  };

  public func createVideoPost(
    posts : Map.Map<Text, SocialTypes.VideoPost>,
    uploader : Common.UserId,
    input : SocialTypes.VideoPostInput,
    postId : Text,
    now : Int,
    followersMap : Map.Map<Common.UserId, Set.Set<Common.UserId>>,
    notifications : Map.Map<Text, NotificationTypes.Notification>,
    notificationCounter : { var value : Nat },
  ) : SocialTypes.VideoPostView {
    let post : SocialTypes.VideoPost = {
      id = postId;
      uploaderId = uploader;
      title = input.title;
      description = input.description;
      videoUrl = input.videoUrl;
      thumbnailUrl = input.thumbnailUrl;
      tags = input.tags;
      category = input.category;
      var status = #active;
      createdAt = now;
      var updatedAt = now;
      var viewCount = 0;
      var likeCount = 0;
      var dislikeCount = 0;
    };
    posts.add(postId, post);
    // Notify all followers about the new video
    let followers = switch (followersMap.get(uploader)) {
      case (?s) s.toArray();
      case null [];
    };
    followers.forEach(func(followerId : Common.UserId) {
      let _id = NotificationsLib.createNotification(
        notifications,
        notificationCounter,
        followerId,
        uploader,
        #new_video_from_followed,
        ?postId,
        "نشر شخص تتابعه فيديو جديداً",
      );
    });
    toView(post);
  };

  public func getVideoPost(
    posts : Map.Map<Text, SocialTypes.VideoPost>,
    postId : Text,
  ) : ?SocialTypes.VideoPostView {
    switch (posts.get(postId)) {
      case (?post) ?toView(post);
      case null null;
    };
  };

  public func listVideoPosts(
    posts : Map.Map<Text, SocialTypes.VideoPost>,
    offset : Nat,
    limit : Nat,
  ) : SocialTypes.PageResult<SocialTypes.VideoPostView> {
    let all = posts.entries()
      .filter(func((_, p) : (Text, SocialTypes.VideoPost)) : Bool {
        switch (p.status) { case (#active) true; case _ false };
      })
      .map(func((_, p) : (Text, SocialTypes.VideoPost)) : SocialTypes.VideoPostView { toView(p) })
      .toArray();
    let total = all.size();
    let items = if (offset >= total) {
      [];
    } else {
      let end = Nat.min(offset + limit, total);
      all.sliceToArray(offset, end);
    };
    { items; total; offset; limit };
  };

  public func listUserVideoPosts(
    posts : Map.Map<Text, SocialTypes.VideoPost>,
    uploader : Common.UserId,
    offset : Nat,
    limit : Nat,
  ) : SocialTypes.PageResult<SocialTypes.VideoPostView> {
    let all = posts.entries()
      .filter(func((_, p) : (Text, SocialTypes.VideoPost)) : Bool {
        Principal.equal(p.uploaderId, uploader) and
        (switch (p.status) { case (#deleted) false; case _ true });
      })
      .map(func((_, p) : (Text, SocialTypes.VideoPost)) : SocialTypes.VideoPostView { toView(p) })
      .toArray();
    let total = all.size();
    let items = if (offset >= total) {
      [];
    } else {
      let end = Nat.min(offset + limit, total);
      all.sliceToArray(offset, end);
    };
    { items; total; offset; limit };
  };

  public func updateVideoPost(
    posts : Map.Map<Text, SocialTypes.VideoPost>,
    caller : Common.UserId,
    postId : Text,
    input : SocialTypes.VideoPostInput,
    now : Int,
  ) : ?SocialTypes.VideoPostView {
    switch (posts.get(postId)) {
      case null null;
      case (?post) {
        if (not Principal.equal(post.uploaderId, caller)) { null } else {
          // Create updated record — immutable fields replaced, var fields carried over
          let updated : SocialTypes.VideoPost = {
            id = post.id;
            uploaderId = post.uploaderId;
            title = input.title;
            description = input.description;
            videoUrl = input.videoUrl;
            thumbnailUrl = input.thumbnailUrl;
            tags = input.tags;
            category = input.category;
            var status = post.status;
            createdAt = post.createdAt;
            var updatedAt = now;
            var viewCount = post.viewCount;
            var likeCount = post.likeCount;
            var dislikeCount = post.dislikeCount;
          };
          posts.add(postId, updated);
          ?toView(updated);
        };
      };
    };
  };

  public func deleteVideoPost(
    posts : Map.Map<Text, SocialTypes.VideoPost>,
    caller : Common.UserId,
    postId : Text,
    now : Int,
  ) : Bool {
    switch (posts.get(postId)) {
      case null false;
      case (?post) {
        if (not Principal.equal(post.uploaderId, caller)) { false } else {
          post.status := #deleted;
          post.updatedAt := now;
          true;
        };
      };
    };
  };

  // ── Comments ─────────────────────────────────────────────────────────────────

  public func commentToView(c : SocialTypes.Comment) : SocialTypes.CommentView {
    {
      id = c.id;
      videoId = c.videoId;
      authorId = c.authorId;
      parentCommentId = c.parentCommentId;
      text = c.text;
      createdAt = c.createdAt;
      updatedAt = c.updatedAt;
      isEdited = c.isEdited;
      isDeleted = c.isDeleted;
    };
  };

  public func addComment(
    comments : Map.Map<Text, SocialTypes.Comment>,
    videoId : Text,
    author : Common.UserId,
    parentCommentId : ?Text,
    text : Text,
    commentId : Text,
    now : Int,
    posts : Map.Map<Text, SocialTypes.VideoPost>,
    notifications : Map.Map<Text, NotificationTypes.Notification>,
    notificationCounter : { var value : Nat },
  ) : SocialTypes.CommentView {
    let comment : SocialTypes.Comment = {
      id = commentId;
      videoId;
      authorId = author;
      parentCommentId;
      var text = text;
      createdAt = now;
      var updatedAt = now;
      var isEdited = false;
      var isDeleted = false;
    };
    comments.add(commentId, comment);
    // Notify the video owner about the comment
    switch (posts.get(videoId)) {
      case (?post) {
        let _id = NotificationsLib.createNotification(
          notifications,
          notificationCounter,
          post.uploaderId,
          author,
          #video_commented,
          ?videoId,
          "علّق شخص ما على فيديوك",
        );
      };
      case null {};
    };
    commentToView(comment);
  };

  public func getVideoComments(
    comments : Map.Map<Text, SocialTypes.Comment>,
    videoId : Text,
  ) : [SocialTypes.CommentView] {
    comments.entries()
      .filter(func((_, c) : (Text, SocialTypes.Comment)) : Bool {
        c.videoId == videoId and not c.isDeleted;
      })
      .map(func((_, c) : (Text, SocialTypes.Comment)) : SocialTypes.CommentView {
        commentToView(c);
      })
      .toArray();
  };

  public func editComment(
    comments : Map.Map<Text, SocialTypes.Comment>,
    caller : Common.UserId,
    commentId : Text,
    newText : Text,
    now : Int,
  ) : ?SocialTypes.CommentView {
    switch (comments.get(commentId)) {
      case null null;
      case (?c) {
        if (not Principal.equal(c.authorId, caller) or c.isDeleted) { null } else {
          c.text := newText;
          c.isEdited := true;
          c.updatedAt := now;
          ?commentToView(c);
        };
      };
    };
  };

  public func deleteComment(
    comments : Map.Map<Text, SocialTypes.Comment>,
    caller : Common.UserId,
    commentId : Text,
    now : Int,
  ) : Bool {
    switch (comments.get(commentId)) {
      case null false;
      case (?c) {
        if (not Principal.equal(c.authorId, caller)) { false } else {
          c.isDeleted := true;
          c.updatedAt := now;
          true;
        };
      };
    };
  };

  // ── Reactions ─────────────────────────────────────────────────────────────────

  public func reactionKey(userId : Common.UserId, videoId : Text) : Text {
    userId.toText() # ":" # videoId;
  };

  public func reactToVideo(
    reactions : Map.Map<Text, SocialTypes.UserReaction>,
    posts : Map.Map<Text, SocialTypes.VideoPost>,
    userId : Common.UserId,
    videoId : Text,
    reaction : SocialTypes.ReactionKind,
    now : Int,
    notifications : Map.Map<Text, NotificationTypes.Notification>,
    notificationCounter : { var value : Nat },
  ) : Bool {
    let key = reactionKey(userId, videoId);
    // Find the post — if it doesn't exist we still record the reaction
    let post = posts.get(videoId);

    // Check if already reacted
    switch (reactions.get(key)) {
      case (?existing) {
        // Remove old reaction from counter
        switch (post) {
          case (?p) {
            switch (existing.reaction) {
              case (#like) { if (p.likeCount > 0) p.likeCount := p.likeCount - 1 };
              case (#dislike) { if (p.dislikeCount > 0) p.dislikeCount := p.dislikeCount - 1 };
            };
            // Add new reaction to counter
            switch (reaction) {
              case (#like) p.likeCount := p.likeCount + 1;
              case (#dislike) p.dislikeCount := p.dislikeCount + 1;
            };
            p.updatedAt := now;
          };
          case null {};
        };
      };
      case null {
        // First reaction
        switch (post) {
          case (?p) {
            switch (reaction) {
              case (#like) {
                p.likeCount := p.likeCount + 1;
                // Notify video owner on new like
                let _id = NotificationsLib.createNotification(
                  notifications,
                  notificationCounter,
                  p.uploaderId,
                  userId,
                  #video_liked,
                  ?videoId,
                  "أعجب شخص ما بفيديوك",
                );
              };
              case (#dislike) p.dislikeCount := p.dislikeCount + 1;
            };
            p.updatedAt := now;
          };
          case null {};
        };
      };
    };

    let newReaction : SocialTypes.UserReaction = {
      userId;
      videoId;
      reaction;
      createdAt = now;
    };
    reactions.add(key, newReaction);
    true;
  };

  public func getVideoReaction(
    reactions : Map.Map<Text, SocialTypes.UserReaction>,
    userId : Common.UserId,
    videoId : Text,
  ) : ?SocialTypes.ReactionKind {
    let key = reactionKey(userId, videoId);
    switch (reactions.get(key)) {
      case (?r) ?r.reaction;
      case null null;
    };
  };

  public func getVideoStats(
    posts : Map.Map<Text, SocialTypes.VideoPost>,
    comments : Map.Map<Text, SocialTypes.Comment>,
    videoId : Text,
  ) : ?SocialTypes.VideoStats {
    switch (posts.get(videoId)) {
      case null null;
      case (?post) {
        let commentCount = comments.entries()
          .filter(func((_, c) : (Text, SocialTypes.Comment)) : Bool {
            c.videoId == videoId and not c.isDeleted;
          })
          .size();
        ?{
          likeCount = post.likeCount;
          dislikeCount = post.dislikeCount;
          commentCount;
        };
      };
    };
  };

  // ── Helpers ──────────────────────────────────────────────────────────────────

  public func makeId(prefix : Text, counter : Nat) : Text {
    prefix # counter.toText();
  };

  // ── Follow System ─────────────────────────────────────────────────────────────

  public func followUser(
    followersMap : Map.Map<Common.UserId, Set.Set<Common.UserId>>,
    followingMap : Map.Map<Common.UserId, Set.Set<Common.UserId>>,
    caller : Common.UserId,
    target : Common.UserId,
    notifications : Map.Map<Text, NotificationTypes.Notification>,
    notificationCounter : { var value : Nat },
  ) : Bool {
    if (Principal.equal(caller, target)) { false } else {
      // Add target to caller's following set
      let followingSet = switch (followingMap.get(caller)) {
        case (?s) s;
        case null {
          let s = Set.empty<Common.UserId>();
          followingMap.add(caller, s);
          s;
        };
      };
      if (followingSet.contains(target)) { false } else {
        followingSet.add(target);

        // Add caller to target's followers set
        let followersSet = switch (followersMap.get(target)) {
          case (?s) s;
          case null {
            let s = Set.empty<Common.UserId>();
            followersMap.add(target, s);
            s;
          };
        };
        followersSet.add(caller);

        // Notify the target user about the new follower
        let _id = NotificationsLib.createNotification(
          notifications,
          notificationCounter,
          target,
          caller,
          #new_follower,
          null,
          "بدأ شخص جديد بمتابعتك",
        );
        true;
      };
    };
  };

  public func unfollowUser(
    followersMap : Map.Map<Common.UserId, Set.Set<Common.UserId>>,
    followingMap : Map.Map<Common.UserId, Set.Set<Common.UserId>>,
    caller : Common.UserId,
    target : Common.UserId,
  ) : Bool {
    var changed = false;
    switch (followingMap.get(caller)) {
      case (?s) {
        if (s.contains(target)) {
          s.remove(target);
          changed := true;
        };
      };
      case null {};
    };
    switch (followersMap.get(target)) {
      case (?s) s.remove(caller);
      case null {};
    };
    changed;
  };

  public func getFollowers(
    followersMap : Map.Map<Common.UserId, Set.Set<Common.UserId>>,
    userId : Common.UserId,
  ) : [Principal] {
    switch (followersMap.get(userId)) {
      case (?s) s.toArray();
      case null [];
    };
  };

  public func getFollowing(
    followingMap : Map.Map<Common.UserId, Set.Set<Common.UserId>>,
    userId : Common.UserId,
  ) : [Principal] {
    switch (followingMap.get(userId)) {
      case (?s) s.toArray();
      case null [];
    };
  };

  public func isFollowing(
    followingMap : Map.Map<Common.UserId, Set.Set<Common.UserId>>,
    caller : Common.UserId,
    target : Common.UserId,
  ) : Bool {
    switch (followingMap.get(caller)) {
      case (?s) s.contains(target);
      case null false;
    };
  };

  // ── Recommendations ──────────────────────────────────────────────────────────

  public func getRecommendations(
    posts : Map.Map<Text, SocialTypes.VideoPost>,
    followingMap : Map.Map<Common.UserId, Set.Set<Common.UserId>>,
    watchEvents : Map.Map<Common.UserId, List.List<VideoTypes.WatchHistoryEntry>>,
    caller : Common.UserId,
    limit : Nat,
  ) : [SocialTypes.RecommendedVideo] {
    // Build set of already-watched videoIds
    let watched = Set.empty<Text>();
    switch (watchEvents.get(caller)) {
      case (?entries) {
        entries.forEach(func(e : VideoTypes.WatchHistoryEntry) {
          watched.add(e.videoId);
        });
      };
      case null {};
    };

    // Collect followed user ids
    let following = switch (followingMap.get(caller)) {
      case (?s) s.toArray();
      case null [];
    };
    let followingSet = Set.fromArray(following);

    // First pass: videos from followed users not yet watched
    let fromFollowing = posts.entries()
      .filter(func((_, p) : (Text, SocialTypes.VideoPost)) : Bool {
        switch (p.status) {
          case (#active) not watched.contains(p.id) and followingSet.contains(p.uploaderId);
          case _ false;
        };
      })
      .map(func((_, p) : (Text, SocialTypes.VideoPost)) : SocialTypes.RecommendedVideo {
        {
          videoId = p.id;
          platform = #youtube;
          score = p.likeCount.toFloat() + p.viewCount.toFloat() * 0.1;
          reason = "from_following";
        };
      })
      .toArray();

    if (fromFollowing.size() >= limit) {
      fromFollowing.sliceToArray(0, limit);
    } else {
      // Second pass: trending fallback (highest likes)
      let remaining = ((limit : Int) - (fromFollowing.size() : Int)).toNat();
      let trending = posts.entries()
        .filter(func((_, p) : (Text, SocialTypes.VideoPost)) : Bool {
          switch (p.status) {
            case (#active) not watched.contains(p.id) and not followingSet.contains(p.uploaderId);
            case _ false;
          };
        })
        .map(func((_, p) : (Text, SocialTypes.VideoPost)) : SocialTypes.RecommendedVideo {
          {
            videoId = p.id;
            platform = #youtube;
            score = p.likeCount.toFloat() + p.viewCount.toFloat() * 0.1;
            reason = "trending";
          };
        })
        .toArray();
      // Sort descending by score
      let sorted = trending.sort(func(a : SocialTypes.RecommendedVideo, b : SocialTypes.RecommendedVideo) : Order.Order {
        if (a.score > b.score) #less else if (a.score < b.score) #greater else #equal;
      });
      let take = Nat.min(remaining, sorted.size());
      let trendingSlice = sorted.sliceToArray(0, take);
      fromFollowing.concat(trendingSlice);
    };
  };

  // ── Follow Activity Feed ──────────────────────────────────────────────────────

  public func getFollowActivity(
    posts : Map.Map<Text, SocialTypes.VideoPost>,
    watchEvents : Map.Map<Common.UserId, List.List<VideoTypes.WatchHistoryEntry>>,
    followingMap : Map.Map<Common.UserId, Set.Set<Common.UserId>>,
    caller : Common.UserId,
    limit : Nat,
  ) : [SocialTypes.ActivityItem] {
    let following = switch (followingMap.get(caller)) {
      case (?s) s.toArray();
      case null [];
    };

    let items = List.empty<SocialTypes.ActivityItem>();

    // Collect "posted" events from followed users
    posts.entries().forEach(func((_, p) : (Text, SocialTypes.VideoPost)) {
      let inFollowing = following
        .find(func(uid : Common.UserId) : Bool { Principal.equal(uid, p.uploaderId) });
      switch (inFollowing) {
        case (?_) {
          items.add({
            userId = p.uploaderId;
            activityType = #posted;
            videoId = p.id;
            timestamp = p.createdAt;
          });
        };
        case null {};
      };
    });

    // Collect "watched" events from followed users
    following.forEach(func(uid : Common.UserId) {
      switch (watchEvents.get(uid)) {
        case (?entries) {
          entries.forEach(func(e : VideoTypes.WatchHistoryEntry) {
            items.add({
              userId = uid;
              activityType = #watched;
              videoId = e.videoId;
              timestamp = e.watchedAt;
            });
          });
        };
        case null {};
      };
    });

    // Sort by timestamp descending, take `limit`
    let sorted = items.toArray()
      .sort(func(a : SocialTypes.ActivityItem, b : SocialTypes.ActivityItem) : Order.Order {
        Int.compare(b.timestamp, a.timestamp);
      });
    let take = Nat.min(limit, sorted.size());
    sorted.sliceToArray(0, take);
  };

  // ── Admin ─────────────────────────────────────────────────────────────────────

  public func adminListAllVideoPosts(
    posts : Map.Map<Text, SocialTypes.VideoPost>,
    offset : Nat,
    limit : Nat,
  ) : SocialTypes.PageResult<SocialTypes.VideoPostView> {
    let all = posts.entries()
      .map(func((_, p) : (Text, SocialTypes.VideoPost)) : SocialTypes.VideoPostView { toView(p) })
      .toArray();
    let total = all.size();
    let items = if (offset >= total) {
      [];
    } else {
      let end = Nat.min(offset + limit, total);
      all.sliceToArray(offset, end);
    };
    { items; total; offset; limit };
  };

  public func adminUpdateVideoPostStatus(
    posts : Map.Map<Text, SocialTypes.VideoPost>,
    postId : Text,
    status : SocialTypes.VideoPostStatus,
    now : Int,
  ) : ?SocialTypes.VideoPostView {
    switch (posts.get(postId)) {
      case null null;
      case (?post) {
        post.status := status;
        post.updatedAt := now;
        ?toView(post);
      };
    };
  };

  public func adminListAllComments(
    comments : Map.Map<Text, SocialTypes.Comment>,
    offset : Nat,
    limit : Nat,
  ) : SocialTypes.PageResult<SocialTypes.CommentView> {
    let all = comments.entries()
      .map(func((_, c) : (Text, SocialTypes.Comment)) : SocialTypes.CommentView { commentToView(c) })
      .toArray();
    let total = all.size();
    let items = if (offset >= total) {
      [];
    } else {
      let end = Nat.min(offset + limit, total);
      all.sliceToArray(offset, end);
    };
    { items; total; offset; limit };
  };

  public func adminDeleteComment(
    comments : Map.Map<Text, SocialTypes.Comment>,
    commentId : Text,
    now : Int,
  ) : Bool {
    switch (comments.get(commentId)) {
      case null false;
      case (?c) {
        c.isDeleted := true;
        c.updatedAt := now;
        true;
      };
    };
  };

  public func adminGetContentStats(
    posts : Map.Map<Text, SocialTypes.VideoPost>,
    comments : Map.Map<Text, SocialTypes.Comment>,
    reactions : Map.Map<Text, SocialTypes.UserReaction>,
  ) : SocialTypes.ContentStats {
    var total = 0;
    var active = 0;
    var flagged = 0;
    var deleted = 0;
    posts.entries().forEach(func((_, p) : (Text, SocialTypes.VideoPost)) {
      total += 1;
      switch (p.status) {
        case (#active) active += 1;
        case (#flagged) flagged += 1;
        case (#deleted) deleted += 1;
      };
    });
    var totalComments = 0;
    var deletedComments = 0;
    comments.entries().forEach(func((_, c) : (Text, SocialTypes.Comment)) {
      totalComments += 1;
      if (c.isDeleted) deletedComments += 1;
    });
    {
      totalVideoPosts = total;
      activeVideoPosts = active;
      flaggedVideoPosts = flagged;
      deletedVideoPosts = deleted;
      totalComments;
      deletedComments;
      totalReactions = reactions.size();
    };
  };
};
