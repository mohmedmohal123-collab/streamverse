import Map "mo:core/Map";
import Text "mo:core/Text";
import Time "mo:core/Time";
import AuthTypes "../types/auth";
import UserTypes "../types/users";
import Common "../types/common";
import DownloadTypes "../types/downloads";

mixin (
  credentialsMap : Map.Map<Text, AuthTypes.CredentialAuth>,
  users : Map.Map<Common.UserId, UserTypes.User>,
  downloadsMap : Map.Map<Text, DownloadTypes.DownloadRecord>,  // key = userId#":"#date
  downloadLimit : { var value : Int },
) {
  // Fixed admin password hash — same as seedAdmin() in main.mo.
  let downloadsAdminHash = "f531885ea6b9cd7e742ec473f046ebe69c4fd1ce3ee777eb6a90cdfbf7086b64";

  /// Derive the current UTC date string (YYYY-MM-DD) from nanosecond timestamp.
  private func timestampToDate(ns : Int) : Text {
    let secondsTotal : Int = ns / 1_000_000_000;
    let days : Int = secondsTotal / 86400;
    var y : Int = 1970;
    var remaining = days;
    label yearLoop while (true) {
      let daysInYear : Int = if ((y % 4 == 0 and y % 100 != 0) or y % 400 == 0) 366 else 365;
      if (remaining < daysInYear) {
        break yearLoop;
      };
      remaining -= daysInYear;
      y += 1;
    };
    let monthDays : [Int] = [
      31,
      if ((y % 4 == 0 and y % 100 != 0) or y % 400 == 0) 29 else 28,
      31, 30, 31, 30, 31, 31, 30, 31, 30, 31,
    ];
    var m : Int = 1;
    var remDays = remaining;
    label monthLoop while (m <= 12) {
      let dm = monthDays[(m - 1).toNat()];
      if (remDays < dm) {
        break monthLoop;
      };
      remDays -= dm;
      m += 1;
    };
    let d = remDays + 1;
    let yText = y.toText();
    let mText = if (m < 10) "0" # m.toText() else m.toText();
    let dText = if (d < 10) "0" # d.toText() else d.toText();
    yText # "-" # mText # "-" # dText;
  };

  /// Check whether the given token is the admin token.
  private func isAdminToken(token : Text) : Bool {
    token == downloadsAdminHash;
  };

  /// Record a download for the given user.
  /// Returns the remaining download count for the free tier today.
  /// Returns an error if the free-tier daily limit has been reached.
  public shared func recordDownload(
    userId : Text,
    videoId : Text,
    platform : Text,
    token : Text,
  ) : async { #ok : Int; #err : Text } {
    // Verify token belongs to the user or is admin
    var tokenValid = isAdminToken(token);
    if (not tokenValid) {
      credentialsMap.forEach(func(_u, cred) {
        if (cred.passwordHash == token and cred.userId.toText() == userId) {
          tokenValid := true;
        };
      });
    };
    if (not tokenValid) {
      return #err("Unauthorized: invalid token");
    };

    let today = timestampToDate(Time.now());
    let key = userId # ":" # today;

    let record = switch (downloadsMap.get(key)) {
      case (?r) r;
      case null {
        let r : DownloadTypes.DownloadRecord = { userId; date = today; var count = 0 };
        downloadsMap.add(key, r);
        r;
      };
    };

    let limit = downloadLimit.value;
    // Admins get unlimited downloads
    if (not isAdminToken(token) and record.count.toInt() >= limit) {
      return #err("تجاوزت الحد اليومي للتحميل (" # limit.toText() # " مرات). اشترك للحصول على تحميلات غير محدودة.");
    };

    record.count += 1;
    let remaining : Int = limit - record.count.toInt();
    #ok(if (remaining < 0) 0 else remaining);
  };

  /// Return the download count for the given user on the given date (YYYY-MM-DD).
  public query func getDownloadCount(userId : Text, date : Text) : async Int {
    let key = userId # ":" # date;
    switch (downloadsMap.get(key)) {
      case (?r) r.count.toInt();
      case null 0;
    };
  };

  /// Reset all download counts (admin only).
  public shared func resetDownloadCounts(token : Text) : async { #ok; #err : Text } {
    if (not isAdminToken(token)) {
      return #err("Unauthorized: admin only");
    };
    downloadsMap.clear();
    #ok;
  };

  /// Return the current free-tier daily download limit.
  public query func getDownloadLimit() : async Int {
    downloadLimit.value;
  };

  /// Update the free-tier daily download limit (admin only).
  public shared func setDownloadLimit(limit : Int, token : Text) : async { #ok; #err : Text } {
    if (not isAdminToken(token)) {
      return #err("Unauthorized: admin only");
    };
    if (limit < 0) {
      return #err("الحد يجب أن يكون أكبر من أو يساوي الصفر");
    };
    downloadLimit.value := limit;
    #ok;
  };
};
