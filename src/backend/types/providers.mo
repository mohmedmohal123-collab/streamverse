module {
  /// Analytics record returned by getDownloadAnalytics (admin-only).
  public type TierDownloadCount = {
    tier : Text;
    count : Nat;
  };

  public type UserDownloadCount = {
    userId : Text;
    count : Nat;
  };

  public type DailyDownloadTotal = {
    date : Text;
    count : Nat;
  };

  public type DownloadAnalytics = {
    totalDownloads : Nat;
    byTier : [TierDownloadCount];
    topUsers : [UserDownloadCount];
    dailyTotals : [DailyDownloadTotal];
  };

  /// Per-provider enabled/disabled state stored as a key→Bool map entry.
  /// Provider names: "youtube", "vimeo", "tiktok", "dailymotion", "archive"
  public type ProviderName = Text;
};
