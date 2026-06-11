module {
  /// Tracks how many downloads a user has made on a given date.
  public type DownloadRecord = {
    userId : Text;
    date : Text;   // YYYY-MM-DD
    var count : Nat;
  };
};
