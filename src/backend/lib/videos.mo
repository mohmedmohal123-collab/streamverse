import VideoTypes "../types/videos";
import Common "../types/common";

module {
  /// Build a new WatchHistoryEntry from video metadata
  public func newWatchEntry(
    videoId : Common.VideoId,
    title : Text,
    thumbnailUrl : Text,
    platform : Common.Platform,
    watchedAt : Common.Timestamp,
  ) : VideoTypes.WatchHistoryEntry {
    {
      videoId;
      title;
      thumbnailUrl;
      watchedAt;
      platform;
    };
  };
};
