import Map "mo:core/Map";
import List "mo:core/List";
import Runtime "mo:core/Runtime";
import AuthTypes "../types/auth";
import UserTypes "../types/users";
import Common "../types/common";
import DownloadTypes "../types/downloads";
import SubscriptionTypes "../types/subscriptions";
import ProviderTypes "../types/providers";
import AccessControl "mo:caffeineai-authorization/access-control";

/// Providers API mixin.
/// Manages:
///   - Video provider enabled/disabled status
///   - Dailymotion API key
///   - Internet Archive enabled flag
///   - Download analytics (admin-only)
///   - canUserDownload: subscription-aware download gate
mixin (
  accessControlState : AccessControl.AccessControlState,
  credentialsMap : Map.Map<Text, AuthTypes.CredentialAuth>,
  users : Map.Map<Common.UserId, UserTypes.User>,
  downloadsMap : Map.Map<Text, DownloadTypes.DownloadRecord>,
  downloadLimit : { var value : Int },
  subscriptionsMap : Map.Map<Text, SubscriptionTypes.Subscription>,
  dailymotionApiKey : { var value : Text },
  isArchiveEnabled : { var value : Bool },
  providerStatusMap : Map.Map<Text, Bool>,
) {
  // Fixed admin password hash — matches seedAdmin() in main.mo.
  let providerAdminHash = "f531885ea6b9cd7e742ec473f046ebe69c4fd1ce3ee777eb6a90cdfbf7086b64";

  /// Check caller is admin via role map.
  private func isProviderAdminCaller(caller : Common.UserId) : Bool {
    if (caller.isAnonymous()) return false;
    switch (accessControlState.userRoles.get(caller)) {
      case (?(#admin)) true;
      case _ false;
    };
  };

  /// Verify admin token (uniquely named to avoid duplicate with AdminMixin).
  private func isProviderAdminToken(token : Text) : Bool {
    token == providerAdminHash;
  };

  // ── Dailymotion API key ───────────────────────────────────────────────────

  /// Retrieve the stored Dailymotion API key (public — needed by frontend).
  public query func getDailymotionApiKey() : async Text {
    dailymotionApiKey.value;
  };

  /// Store the Dailymotion API key after token verification (admin-only).
  public shared func setDailymotionApiKeyByToken(
    apiKey : Text,
    token : Text,
  ) : async { #ok; #err : Text } {
    if (not isProviderAdminToken(token)) {
      return #err("Unauthorized: invalid admin token");
    };
    dailymotionApiKey.value := apiKey;
    #ok;
  };

  /// Store the Dailymotion API key after credential verification (admin-only).
  public shared func setDailymotionApiKey(
    apiKey : Text,
    username : Text,
    passwordHash : Text,
  ) : async { #ok; #err : Text } {
    switch (credentialsMap.get(username)) {
      case null { return #err("User not found") };
      case (?cred) {
        if (cred.passwordHash != passwordHash) {
          return #err("Invalid password");
        };
        switch (users.get(cred.userId)) {
          case null { return #err("User account missing") };
          case (?user) {
            if (user.role != #admin) {
              return #err("Unauthorized: admin only");
            };
            dailymotionApiKey.value := apiKey;
            #ok;
          };
        };
      };
    };
  };

  // ── Internet Archive toggle ───────────────────────────────────────────────

  /// Return whether Internet Archive is enabled (public getter).
  public query func getArchiveEnabled() : async Bool {
    isArchiveEnabled.value;
  };

  /// Enable or disable Internet Archive (admin-only, token-based).
  public shared func setArchiveEnabled(
    enabled : Bool,
    token : Text,
  ) : async { #ok; #err : Text } {
    if (not isProviderAdminToken(token)) {
      return #err("Unauthorized: invalid admin token");
    };
    isArchiveEnabled.value := enabled;
    #ok;
  };

  // ── Provider status tracking ──────────────────────────────────────────────

  /// Return whether a named provider is enabled.
  /// Defaults to true if no explicit setting has been stored.
  public query func getProviderEnabled(provider : Text) : async Bool {
    switch (providerStatusMap.get(provider)) {
      case (?enabled) { enabled };
      case null { true };
    };
  };

  /// Enable or disable a named provider (admin-only, caller-based).
  public shared ({ caller }) func setProviderEnabled(
    provider : Text,
    enabled : Bool,
  ) : async { #ok; #err : Text } {
    if (not isProviderAdminCaller(caller)) {
      return #err("Unauthorized: admin only");
    };
    providerStatusMap.add(provider, enabled);
    #ok;
  };

  // ── Download analytics ────────────────────────────────────────────────────

  /// Return download analytics. Admin-only (caller-based).
  public query ({ caller }) func getDownloadAnalytics() : async ProviderTypes.DownloadAnalytics {
    if (not isProviderAdminCaller(caller)) {
      Runtime.trap("Unauthorized: admin only");
    };
    var totalDownloads : Nat = 0;
    downloadsMap.forEach(func(_key, record) {
      totalDownloads += record.count;
    });
    {
      totalDownloads;
      byTier = [];
      topUsers = [];
      dailyTotals = [];
    };
  };

  // ── Subscription-aware download gate ─────────────────────────────────────

  /// Return whether the given userId is allowed to download, based on
  /// subscription tier and daily download limit.
  public query func canUserDownload(userId : Text) : async Bool {
    // Check if user has an active premium/pro subscription
    var hasPremium = false;
    subscriptionsMap.forEach(func(_key, sub) {
      if (sub.userId.toText() == userId and sub.status == #active) {
        switch (sub.tier) {
          case (#plus or #pro) { hasPremium := true };
          case (#free) {};
        };
      };
    });
    if (hasPremium) return true;
    // Free tier: check daily download count against limit
    let limit = downloadLimit.value;
    if (limit <= 0) return false;
    var used : Nat = 0;
    downloadsMap.forEach(func(_key, record) {
      if (record.userId == userId) {
        used += record.count;
      };
    });
    used < limit.toNat();
  };
};
