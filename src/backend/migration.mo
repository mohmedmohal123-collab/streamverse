import Map "mo:core/Map";
import List "mo:core/List";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import VideoTypes "types/videos";
import Common "types/common";

module {
  // ── Old type definitions (inline, copied from previous version) ───────────────

  type OldPlatform = { #youtube; #vimeo; #tiktok; #kwai };

  type OldVideoMetadata = {
    videoId : Text;
    title : Text;
    thumbnailUrl : Text;
    viewCount : Text;
    duration : Text;
    channelTitle : Text;
    publishedAt : Text;
    platform : OldPlatform;
  };

  type OldWatchHistoryEntry = {
    videoId : Text;
    title : Text;
    thumbnailUrl : Text;
    watchedAt : Time.Time;
    platform : OldPlatform;
  };

  type OldTrendingEntry = {
    video : OldVideoMetadata;
    watchCount : Nat;
  };

  // ── OldActor: stable fields as they existed before this upgrade ───────────────

  type OldActor = {
    trendingMap : Map.Map<Text, OldTrendingEntry>;
    watchEvents : Map.Map<Principal, List.List<OldWatchHistoryEntry>>;
  };

  // ── NewActor: stable fields after this upgrade ────────────────────────────────

  type NewActor = {
    trendingMap : Map.Map<Text, VideoTypes.TrendingEntry>;
    watchEvents : Map.Map<Principal, List.List<VideoTypes.WatchHistoryEntry>>;
  };

  // ── Coercion helpers ──────────────────────────────────────────────────────────

  private func coercePlatform(p : OldPlatform) : Common.Platform {
    switch p {
      case (#youtube) #youtube;
      case (#vimeo) #vimeo;
      case (#tiktok) #tiktok;
      case (#kwai) #kwai;
    };
  };

  private func coerceWatchEntry(e : OldWatchHistoryEntry) : VideoTypes.WatchHistoryEntry {
    {
      videoId = e.videoId;
      title = e.title;
      thumbnailUrl = e.thumbnailUrl;
      watchedAt = e.watchedAt;
      platform = coercePlatform(e.platform);
    };
  };

  private func coerceVideoMetadata(v : OldVideoMetadata) : VideoTypes.VideoMetadata {
    {
      videoId = v.videoId;
      title = v.title;
      thumbnailUrl = v.thumbnailUrl;
      viewCount = v.viewCount;
      duration = v.duration;
      channelTitle = v.channelTitle;
      publishedAt = v.publishedAt;
      platform = coercePlatform(v.platform);
    };
  };

  private func coerceTrendingEntry(t : OldTrendingEntry) : VideoTypes.TrendingEntry {
    {
      video = coerceVideoMetadata(t.video);
      watchCount = t.watchCount;
    };
  };

  // ── Migration entry point ─────────────────────────────────────────────────────

  public func run(old : OldActor) : NewActor {
    let trendingMap = old.trendingMap.map<Text, OldTrendingEntry, VideoTypes.TrendingEntry>(
      func(_k, t) { coerceTrendingEntry(t) }
    );
    let watchEvents = old.watchEvents.map<Principal, List.List<OldWatchHistoryEntry>, List.List<VideoTypes.WatchHistoryEntry>>(
      func(_k, entries) {
        entries.map<OldWatchHistoryEntry, VideoTypes.WatchHistoryEntry>(
          func(e) { coerceWatchEntry(e) }
        )
      }
    );
    { trendingMap; watchEvents };
  };
};
