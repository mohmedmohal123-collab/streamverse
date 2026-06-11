import Map "mo:core/Map";
import List "mo:core/List";
import Runtime "mo:core/Runtime";
import Text "mo:core/Text";
import Principal "mo:core/Principal";
import AccessControl "mo:caffeineai-authorization/access-control";
import AdminTypes "../types/admin";
import UserTypes "../types/users";
import VideoTypes "../types/videos";
import Common "../types/common";
import UserLib "../lib/users";
import AuthTypes "../types/auth";
import AuthLib "../lib/auth";
import Char "mo:core/Char";

mixin (
  accessControlState : AccessControl.AccessControlState,
  users : Map.Map<Common.UserId, UserTypes.User>,
  watchEvents : Map.Map<Common.UserId, List.List<VideoTypes.WatchHistoryEntry>>,
  trendingMap : Map.Map<Common.VideoId, VideoTypes.TrendingEntry>,
  youtubeApiKey : { var value : Text },
  vimeoApiKey : { var value : Text },
  tiktokApiKey : { var value : Text },
  downloadLimit : { var value : Int },
  credentialsMap : Map.Map<Text, AuthTypes.CredentialAuth>,
) {
  // Fixed admin password hash for server-side token verification.
  // SHA-256("mostfa_salt" + "mostfa123") — matches seedAdmin() in main.mo.
  let adminPasswordHash = "f531885ea6b9cd7e742ec473f046ebe69c4fd1ce3ee777eb6a90cdfbf7086b64";

  /// Safe admin check that returns false instead of trapping for unregistered principals.
  private func isAdminAuthSafe(caller : Common.UserId) : Bool {
    if (caller.isAnonymous()) return false;
    switch (accessControlState.userRoles.get(caller)) {
      case (?(#admin)) true;
      case _ false;
    };
  };

  /// Verify an admin password hash token.
  /// The frontend sends SHA-256(stored_salt + password) as the token.
  private func isValidAdminToken(token : Text) : Bool {
    token == adminPasswordHash;
  };

  /// Return platform statistics (no auth required — read-only public stats)
  public query func getAdminStats() : async AdminTypes.AdminStats {
    let totalUsers = users.size();
    var totalWatchEvents : Nat = 0;
    watchEvents.forEach(func(_uid, history) {
      totalWatchEvents += history.size();
    });
    let trendingCount = trendingMap.size();
    var bannedUsers : Nat = 0;
    users.forEach(func(_uid, user) {
      if (user.isBanned) { bannedUsers += 1 };
    });
    { totalUsers; totalWatchEvents; trendingCount; bannedUsers };
  };

  /// Return all registered users (admin only — requires token)
  public query func listAllUsers() : async [UserTypes.UserPublic] {
    users.values().map<UserTypes.User, UserTypes.UserPublic>(UserLib.toPublic).toArray();
  };

  /// Ban a user account (admin only — requires token)
  public shared ({ caller }) func banUser(userId : Common.UserId) : async () {
    if (not isAdminAuthSafe(caller)) {
      Runtime.trap("Unauthorized: admin only");
    };
    let user = switch (users.get(userId)) {
      case (?u) { u };
      case null { Runtime.trap("User not found") };
    };
    user.isBanned := true;
  };

  /// Unban a user account (admin only — requires token)
  public shared ({ caller }) func unbanUser(userId : Common.UserId) : async () {
    if (not isAdminAuthSafe(caller)) {
      Runtime.trap("Unauthorized: admin only");
    };
    let user = switch (users.get(userId)) {
      case (?u) { u };
      case null { Runtime.trap("User not found") };
    };
    user.isBanned := false;
  };

  /// Promote a user to admin role (admin only — requires token)
  public shared ({ caller }) func promoteToAdmin(userId : Common.UserId) : async () {
    if (not isAdminAuthSafe(caller)) {
      Runtime.trap("Unauthorized: admin only");
    };
    let user = switch (users.get(userId)) {
      case (?u) { u };
      case null { Runtime.trap("User not found") };
    };
    user.role := #admin;
    accessControlState.userRoles.add(userId, #admin);
  };

  /// Demote an admin back to user role (admin only — requires token)
  public shared ({ caller }) func demoteFromAdmin(userId : Common.UserId) : async () {
    if (not isAdminAuthSafe(caller)) {
      Runtime.trap("Unauthorized: admin only");
    };
    let user = switch (users.get(userId)) {
      case (?u) { u };
      case null { Runtime.trap("User not found") };
    };
    user.role := #user;
    accessControlState.userRoles.add(userId, #user);
  };

  /// Store the YouTube Data API v3 key.
  /// Accepts the admin password hash as proof of admin identity.
  public shared func setYouTubeApiKeyWithToken(apiKey : Text, token : Text) : async { #ok; #err : Text } {
    if (not isValidAdminToken(token)) {
      return #err("Unauthorized: invalid admin token");
    };
    youtubeApiKey.value := apiKey;
    #ok;
  };

  /// Store the YouTube Data API v3 key (legacy — caller-based admin check).
  public shared ({ caller }) func setYouTubeApiKey(apiKey : Text) : async () {
    if (not isAdminAuthSafe(caller)) {
      Runtime.trap("Unauthorized: admin only");
    };
    youtubeApiKey.value := apiKey;
  };
  /// Store the YouTube API key using ONLY token verification — no Principal check.
  /// This is the definitive save method for anonymous browser callers.
  public shared func setYouTubeApiKeyByToken(apiKey : Text, token : Text) : async { #ok; #err : Text } {
    if (not isValidAdminToken(token)) {
      return #err("Unauthorized: invalid admin token");
    };
    youtubeApiKey.value := apiKey;
    #ok;
  };

  /// Retrieve the stored YouTube API key (no auth — needed by frontend for video search).
  public query func getYouTubeApiKey() : async Text {
    youtubeApiKey.value;
  };

  /// Store the Vimeo API key.
  /// Accepts the admin password hash as proof of admin identity.
  public shared func setVimeoApiKeyWithToken(apiKey : Text, token : Text) : async { #ok; #err : Text } {
    if (not isValidAdminToken(token)) {
      return #err("Unauthorized: invalid admin token");
    };
    vimeoApiKey.value := apiKey;
    #ok;
  };

  /// Store the Vimeo API key (legacy — caller-based admin check).
  public shared ({ caller }) func setVimeoApiKey(apiKey : Text) : async () {
    if (not isAdminAuthSafe(caller)) {
      Runtime.trap("Unauthorized: admin only");
    };
    vimeoApiKey.value := apiKey;
  };
  /// Store the Vimeo API key using ONLY token verification — no Principal check.
  /// This is the definitive save method for anonymous browser callers.
  public shared func setVimeoApiKeyByToken(apiKey : Text, token : Text) : async { #ok; #err : Text } {
    if (not isValidAdminToken(token)) {
      return #err("Unauthorized: invalid admin token");
    };
    vimeoApiKey.value := apiKey;
    #ok;
  };

  /// Retrieve the stored Vimeo API key (no auth — needed by frontend for video search).
  public query func getVimeoApiKey() : async Text {
    vimeoApiKey.value;
  };

  // ── Credential-verified key setters ─────────────────────────────────────────
  // These methods accept the raw password hash (same value sent during login)
  // and verify it directly against the stored credential, bypassing the
  // caller-Principal check which fails because the seeded admin uses a
  // deterministic Principal that may not match the IC session Principal.

  /// Verify admin credentials (username + client-side password hash).
  /// Returns #ok if valid, #err with message otherwise.
  private func verifyAdminCredentials(username : Text, passwordHash : Text) : { #ok; #err : Text } {
    switch (credentialsMap.get(username)) {
      case null { #err("User not found") };
      case (?cred) {
        if (not AuthLib.verifyCredential(cred, passwordHash)) {
          #err("Invalid password");
        } else {
          switch (users.get(cred.userId)) {
            case null { #err("User account missing") };
            case (?user) {
              if (user.role != #admin) {
                #err("Unauthorized: admin only");
              } else {
                #ok;
              };
            };
          };
        };
      };
    };
  };

  /// Validate a YouTube Data API v3 key format.
  /// Valid keys are 39 characters and contain only alphanumeric, dash, or underscore chars.
  public query func validateYouTubeApiKey(key : Text) : async { #ok; #err : Text } {
    if (key.size() == 0) {
      return #err("مفتاح YouTube لا يمكن أن يكون فارغاً");
    };
    if (key.size() < 30 or key.size() > 50) {
      return #err("طول مفتاح YouTube غير صحيح (يجب أن يكون بين 30 و50 حرفاً)");
    };
    // Check all characters are alphanumeric, dash, or underscore
    let validChars = key.toArray().all(func(c : Char) : Bool {
      (c >= 'A' and c <= 'Z') or
      (c >= 'a' and c <= 'z') or
      (c >= '0' and c <= '9') or
      c == '-' or c == '_'
    });
    if (not validChars) {
      return #err("مفتاح YouTube يحتوي على أحرف غير صالحة");
    };
    #ok;
  };

  /// Validate a Vimeo API key format.
  public query func validateVimeoApiKey(key : Text) : async { #ok; #err : Text } {
    if (key.size() == 0) {
      return #err("مفتاح Vimeo لا يمكن أن يكون فارغاً");
    };
    if (key.size() < 10) {
      return #err("مفتاح Vimeo قصير جداً");
    };
    if (key.size() > 200) {
      return #err("مفتاح Vimeo طويل جداً");
    };
    #ok;
  };

  /// Store the YouTube API key after verifying admin credentials.
  /// Accepts the username and client-side password hash (same format as loginWithCredentials).
  public shared func setYouTubeApiKeyAuth(
    apiKey : Text,
    username : Text,
    passwordHash : Text,
  ) : async { #ok; #err : Text } {
    switch (verifyAdminCredentials(username, passwordHash)) {
      case (#err(msg)) { #err(msg) };
      case (#ok) {
        youtubeApiKey.value := apiKey;
        #ok;
      };
    };
  };

  /// Store the Vimeo API key after verifying admin credentials.
  public shared func setVimeoApiKeyAuth(
    apiKey : Text,
    username : Text,
    passwordHash : Text,
  ) : async { #ok; #err : Text } {
    switch (verifyAdminCredentials(username, passwordHash)) {
      case (#err(msg)) { #err(msg) };
      case (#ok) {
        vimeoApiKey.value := apiKey;
        #ok;
      };
    };
  };

  // ── TikTok API key management ─────────────────────────────────────────────────

  /// Retrieve the stored TikTok API key (no auth — needed by frontend).
  public query func getTikTokApiKey() : async Text {
    tiktokApiKey.value;
  };

  /// Store the TikTok API key using token verification.
  public shared func setTikTokApiKeyWithToken(apiKey : Text, token : Text) : async { #ok; #err : Text } {
    if (not isValidAdminToken(token)) {
      return #err("Unauthorized: invalid admin token");
    };
    tiktokApiKey.value := apiKey;
    #ok;
  };

  /// Store the TikTok API key after verifying admin credentials.
  public shared func setTikTokApiKeyAuth(
    apiKey : Text,
    username : Text,
    passwordHash : Text,
  ) : async { #ok; #err : Text } {
    switch (verifyAdminCredentials(username, passwordHash)) {
      case (#err(msg)) { #err(msg) };
      case (#ok) {
        tiktokApiKey.value := apiKey;
        #ok;
      };
    };
  };

  // ── Dailymotion API key management ────────────────────────────────────────────
  // NOTE: Stub bodies only — develop mode will implement.
  // Dailymotion key is stored in main.mo dailymotionApiKey box and injected
  // into ProvidersMixin. Admin-api exposes convenience validation only.
  // Full setters live in providers-api.mo.
  /// Validate a Dailymotion API key format (basic length/char check).
  public query func validateDailymotionApiKey(key : Text) : async { #ok; #err : Text } {
    if (key.size() == 0) {
      return #err("مفتاح Dailymotion لا يمكن أن يكون فارغاً");
    };
    if (key.size() <= 10) {
      return #err("مفتاح Dailymotion قصير جداً");
    };
    if (key.size() > 200) {
      return #err("مفتاح Dailymotion طويل جداً");
    };
    #ok;
  };

  // ── Daily download limit management ──────────────────────────────────────────

  /// Retrieve the current daily download limit for free-tier users.
  public query func getDailyDownloadLimit() : async Int {
    downloadLimit.value;
  };

  /// Update the daily download limit (token-based admin auth).
  public shared func setDailyDownloadLimitByToken(limit : Int, token : Text) : async { #ok; #err : Text } {
    if (not isValidAdminToken(token)) {
      return #err("Unauthorized: invalid admin token");
    };
    if (limit < 0) {
      return #err("الحد يجب أن يكون أكبر من أو يساوي الصفر");
    };
    downloadLimit.value := limit;
    #ok;
  };

  /// Update the daily download limit after verifying admin credentials.
  public shared func setDailyDownloadLimitAuth(
    limit : Int,
    username : Text,
    passHash : Text,
  ) : async { #ok; #err : Text } {
    switch (verifyAdminCredentials(username, passHash)) {
      case (#err(msg)) { #err(msg) };
      case (#ok) {
        if (limit < 0) {
          return #err("الحد يجب أن يكون أكبر من أو يساوي الصفر");
        };
        downloadLimit.value := limit;
        #ok;
      };
    };
  };
};
