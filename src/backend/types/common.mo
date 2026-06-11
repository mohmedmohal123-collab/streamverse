import Time "mo:core/Time";

module {
  public type Timestamp = Time.Time; // Int (nanoseconds)
  public type UserId = Principal;
  public type VideoId = Text;
  public type Language = { #en; #ar };
  public type Platform = { #youtube; #vimeo; #tiktok; #kwai; #dailymotion; #archive };
};
