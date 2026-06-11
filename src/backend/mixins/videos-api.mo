import Map "mo:core/Map";
import List "mo:core/List";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Int "mo:core/Int";
import AccessControl "mo:caffeineai-authorization/access-control";
import OutCall "mo:caffeineai-http-outcalls/outcall";
import VideoTypes "../types/videos";
import Common "../types/common";

mixin (
  accessControlState : AccessControl.AccessControlState,
  watchEvents : Map.Map<Common.UserId, List.List<VideoTypes.WatchHistoryEntry>>,
  trendingMap : Map.Map<Common.VideoId, VideoTypes.TrendingEntry>,
  youtubeApiKey : { var value : Text },
) {
  /// Transform callback required by the IC for HTTP outcalls
  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  /// Add a video to the caller's watch history (max 100 entries, drops oldest)
  public shared ({ caller }) func addWatchHistory(entry : VideoTypes.WatchHistoryEntry) : async () {
    if (caller.isAnonymous()) {
      Runtime.trap("Anonymous callers cannot add watch history");
    };
    let history = switch (watchEvents.get(caller)) {
      case (?h) { h };
      case null {
        let h = List.empty<VideoTypes.WatchHistoryEntry>();
        watchEvents.add(caller, h);
        h;
      };
    };
    // Prepend new entry at front (index 0 = most recent)
    // We insert at front by reversing, adding, reversing back — or simply add and manage order at retrieval.
    // Use add + truncate: add at end, then keep last 100 by truncating front
    history.add(entry);
    if (history.size() > 100) {
      // Remove oldest entry (index 0 is oldest since we add at end)
      history.reverseInPlace();
      history.truncate(100);
      history.reverseInPlace();
    };

    // Update trending map
    let videoId = entry.videoId;
    switch (trendingMap.get(videoId)) {
      case (?existing) {
        let updated : VideoTypes.TrendingEntry = {
          video = existing.video;
          watchCount = existing.watchCount + 1;
        };
        trendingMap.add(videoId, updated);
      };
      case null {
        let video : VideoTypes.VideoMetadata = {
          videoId = entry.videoId;
          title = entry.title;
          thumbnailUrl = entry.thumbnailUrl;
          viewCount = "";
          duration = "";
          channelTitle = "";
          publishedAt = "";
          platform = entry.platform;
        };
        trendingMap.add(videoId, { video; watchCount = 1 });
      };
    };
  };

  /// Return caller's watch history in reverse chronological order
  public query ({ caller }) func getWatchHistory() : async [VideoTypes.WatchHistoryEntry] {
    switch (watchEvents.get(caller)) {
      case (?history) {
        // history is stored oldest-first (add appends); return newest-first
        history.reverse().toArray();
      };
      case null { [] };
    };
  };

  /// Delete all of the caller's watch history
  public shared ({ caller }) func clearWatchHistory() : async () {
    switch (watchEvents.get(caller)) {
      case (?history) { history.clear() };
      case null {};
    };
  };

  /// Return top 20 trending videos sorted by watch count (descending)
  public query func getTrending() : async [VideoTypes.TrendingEntry] {
    let entries = trendingMap.values().toArray();
    let sorted = entries.sort(func(a : VideoTypes.TrendingEntry, b : VideoTypes.TrendingEntry) : Order.Order {
      if (a.watchCount > b.watchCount) { #less }
      else if (a.watchCount < b.watchCount) { #greater }
      else { #equal };
    });
    if (sorted.size() <= 20) { sorted } else { sorted.sliceToArray(0, 20) };
  };

  /// Call YouTube Data API v3 search endpoint via HTTP outcall.
  /// Returns raw JSON string for the frontend to parse.
  public shared ({ caller }) func searchYouTube(searchQuery : Text, maxResults : Nat) : async Text {
    if (youtubeApiKey.value == "") {
      Runtime.trap("YouTube API key not configured");
    };
    let maxStr = maxResults.toText();
    // URL-encode the query (basic: replace spaces with +)
    let encodedQuery = searchQuery.replace(#text " ", "+");
    let url = "https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=" # maxStr # "&q=" # encodedQuery # "&key=" # youtubeApiKey.value;
    await OutCall.httpGetRequest(url, [], transform);
  };
};
