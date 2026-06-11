import Common "common";

module {
  public type VideoMetadata = {
    videoId : Common.VideoId;
    title : Text;
    thumbnailUrl : Text;
    viewCount : Text;
    duration : Text;
    channelTitle : Text;
    publishedAt : Text;
    platform : Common.Platform;
  };

  public type WatchHistoryEntry = {
    videoId : Common.VideoId;
    title : Text;
    thumbnailUrl : Text;
    watchedAt : Common.Timestamp;
    platform : Common.Platform;
  };

  public type TrendingEntry = {
    video : VideoMetadata;
    watchCount : Nat;
  };
};
