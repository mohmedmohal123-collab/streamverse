import Map "mo:core/Map";
import Set "mo:core/Set";
import List "mo:core/List";
import Principal "mo:core/Principal";
import Array "mo:core/Array";
import Blob "mo:core/Blob";
import Nat8 "mo:core/Nat8";
import Time "mo:core/Time";
import AccessControl "mo:caffeineai-authorization/access-control";
import MixinAuthorization "mo:caffeineai-authorization/MixinAuthorization";
import UserTypes "types/users";
import VideoTypes "types/videos";
import AuthTypes "types/auth";
import SocialTypes "types/social";
import Common "types/common";
import UsersLib "lib/users";
import UsersMixin "mixins/users-api";
import VideosMixin "mixins/videos-api";
import AdminMixin "mixins/admin-api";
import AuthMixin "mixins/auth-api";
import SocialMixin "mixins/social-api";
import SocialAdminMixin "mixins/social-admin-api";
import NotificationsMixin "mixins/notifications-api";
import SubscriptionsMixin "mixins/subscriptions-api";
import NotificationTypes "types/notifications";
import SubscriptionTypes "types/subscriptions";
import PlaylistsMixin "mixins/playlists-api";
import DownloadsMixin "mixins/downloads-api";
import PlaylistTypes "types/playlists";
import DownloadTypes "types/downloads";
import _ProviderTypes "types/providers";
import ProvidersMixin "mixins/providers-api";import Migration "migration";









(with migration = Migration.run)
actor {
  // Authorization state (managed by MixinAuthorization)
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // User registry: Principal → User
  let users = Map.empty<Common.UserId, UserTypes.User>();

  // Watch history per user: Principal → ordered list of entries
  let watchEvents = Map.empty<Common.UserId, List.List<VideoTypes.WatchHistoryEntry>>();

  // Trending video aggregation: VideoId → TrendingEntry
  let trendingMap = Map.empty<Common.VideoId, VideoTypes.TrendingEntry>();

  // YouTube API key (mutable box so mixins can update it)
  let youtubeApiKey = { var value : Text = "" };

  // Vimeo API key (mutable box so mixins can update it)
  let vimeoApiKey = { var value : Text = "" };

  // TikTok API key (mutable box so mixins can update it)
  let tiktokApiKey = { var value : Text = "" };

  // Kwai stable vars retained for upgrade compatibility (unused)
  let kwaiAppId = { var value : Text = "" };
  let kwaiAppSecret = { var value : Text = "" };
  let kwaiRapidApiKey = { var value : Text = "" };
  let kwaiApiHost = { var value : Text = "" };

  // Dailymotion API key (mutable box so mixins can update it)
  let dailymotionApiKey = { var value : Text = "" };

  // Internet Archive enabled flag (true = enabled)
  let isArchiveEnabled = { var value : Bool = true };

  // Provider status map: providerName → enabled
  let providerStatusMap = Map.empty<Text, Bool>();

  // ── Playlists state ───────────────────────────────────────────────────────────

  // playlistsMap: playlistId → PlaylistEntry
  let playlistsMap = Map.empty<Text, PlaylistTypes.PlaylistEntry>();
  let playlistCounter = { var value : Nat = 0 };

  // ── Downloads state ───────────────────────────────────────────────────────────

  // downloadsMap: "userId:YYYY-MM-DD" → DownloadRecord
  let downloadsMap = Map.empty<Text, DownloadTypes.DownloadRecord>();
  // Free-tier daily download limit (default 5)
  let downloadLimit = { var value : Int = 5 };

  // Credential auth state: username → CredentialAuth
  let credentialsMap = Map.empty<Text, AuthTypes.CredentialAuth>();

  // Google OAuth state: googleSub → GoogleOAuthLink
  let googleOAuthMap = Map.empty<Text, AuthTypes.GoogleOAuthLink>();

  // ── Social-content state ──────────────────────────────────────────────────────

  // User-uploaded video posts: postId → VideoPost
  let videoPosts = Map.empty<Text, SocialTypes.VideoPost>();

  // Comments: commentId → Comment
  let socialComments = Map.empty<Text, SocialTypes.Comment>();

  // Reactions: "userId:videoId" → UserReaction
  let socialReactions = Map.empty<Text, SocialTypes.UserReaction>();

  // Monotonic ID counters
  let videoPostCounter = { var value : Nat = 0 };
  let commentCounter = { var value : Nat = 0 };

  // ── Follow state ──────────────────────────────────────────────────────────────

  // followersMap: userId → Set of followers (who follow this user)
  let followersMap = Map.empty<Common.UserId, Set.Set<Common.UserId>>();

  // followingMap: userId → Set of accounts this user follows
  let followingMap = Map.empty<Common.UserId, Set.Set<Common.UserId>>();

  // ── Notifications state ───────────────────────────────────────────────────────

  // notifications: notificationId → Notification
  let notificationsMap = Map.empty<Text, NotificationTypes.Notification>();
  let notificationCounter = { var value : Nat = 0 };

  // ── Subscriptions state ───────────────────────────────────────────────────────

  // subscriptions: subscriptionId → Subscription
  let subscriptionsMap = Map.empty<Text, SubscriptionTypes.Subscription>();
  let subscriptionCounter = { var value : Nat = 0 };

  // Stripe credentials (admin-configurable)
  let stripePublishableKey = { var value : Text = "" };
  let stripeSecretKey = { var value : Text = "" };
  let stripeWebhookSecret = { var value : Text = "" };

  // Premium video gating: videoId → PremiumVideoEntry
  let premiumVideosMap = Map.empty<Text, SubscriptionTypes.PremiumVideoEntry>();

  // Global content gating settings (disabled by default)
  let contentGatingSettings : SubscriptionTypes.ContentGatingSettings = {
    var enabled = false;
    var defaultFreeVideosPerDay = 5;
  };

  // Compose domain mixins
  include UsersMixin(accessControlState, users);
  include VideosMixin(accessControlState, watchEvents, trendingMap, youtubeApiKey);
  include AdminMixin(accessControlState, users, watchEvents, trendingMap, youtubeApiKey, vimeoApiKey, tiktokApiKey, downloadLimit, credentialsMap);
  include AuthMixin(accessControlState, users, credentialsMap, googleOAuthMap);
  include SocialMixin(
    accessControlState,
    videoPosts, socialComments, socialReactions,
    videoPostCounter, commentCounter,
    followersMap, followingMap,
    watchEvents,
    notificationsMap, notificationCounter,
  );
  include SocialAdminMixin(accessControlState, videoPosts, socialComments, socialReactions);
  include NotificationsMixin(accessControlState, notificationsMap, notificationCounter);
  include SubscriptionsMixin(accessControlState, subscriptionsMap, subscriptionCounter, stripeSecretKey, stripeWebhookSecret, premiumVideosMap, contentGatingSettings);
  include PlaylistsMixin(credentialsMap, users, playlistsMap, playlistCounter);
  include DownloadsMixin(credentialsMap, users, downloadsMap, downloadLimit);
  include ProvidersMixin(
    accessControlState,
    credentialsMap, users,
    downloadsMap, downloadLimit,
    subscriptionsMap,
    dailymotionApiKey, isArchiveEnabled,
    providerStatusMap,
  );

  // ── Admin: Stripe key management ─────────────────────────────────────────────

  /// Sets the Stripe publishable key, secret key, and webhook secret.
  /// No caller-based auth since frontend calls are anonymous.
  public shared func setStripeKeys(publishableKey : Text, secretKey : Text, webhookSecret : Text) : async () {
    stripePublishableKey.value := publishableKey;
    stripeSecretKey.value := secretKey;
    stripeWebhookSecret.value := webhookSecret;
  };

  /// Sets Stripe keys after verifying admin credentials.
  /// Accepts the username and client-side password hash (same format as loginWithCredentials).
  public shared func setStripeKeysAuth(
    publishableKey : Text,
    secretKey : Text,
    webhookSecret : Text,
    username : Text,
    passwordHash : Text,
  ) : async { #ok; #err : Text } {
    // Verify credentials against stored credential map
    switch (credentialsMap.get(username)) {
      case null { #err("User not found") };
      case (?cred) {
        if (cred.passwordHash != passwordHash) {
          #err("Invalid password");
        } else {
          switch (users.get(cred.userId)) {
            case null { #err("User account missing") };
            case (?user) {
              if (user.role != #admin) {
                #err("Unauthorized: admin only");
              } else {
                stripePublishableKey.value := publishableKey;
                stripeSecretKey.value := secretKey;
                stripeWebhookSecret.value := webhookSecret;
                #ok;
              };
            };
          };
        };
      };
    };
  };

  /// Returns the stored Stripe publishable key (public key, no auth needed).
  public query func getStripePublishableKey() : async Text {
    stripePublishableKey.value;
  };

  // ── Account deletion ──────────────────────────────────────────────────────────

  /// Deletes the calling user's account and all associated data. Caller must be authenticated.
  public shared ({ caller }) func deleteMyAccount() : async { #ok; #err : Text } {
    if (caller.isAnonymous()) {
      return #err("Not authenticated");
    };
    // Remove user record
    switch (users.get(caller)) {
      case null { return #err("User not found") };
      case (?user) {
        let username = user.username;
        // Remove from users map
        users.remove(caller);
        // Remove credential auth entry
        credentialsMap.remove(username);
        // Remove watch history
        watchEvents.remove(caller);
        // Collect subscription IDs to remove (avoid mutation during iteration)
        var subIdsToRemove : [Text] = [];
        subscriptionsMap.forEach(func(subId, sub) {
          if (Principal.equal(sub.userId, caller)) {
            subIdsToRemove := subIdsToRemove.concat([subId]);
          };
        });
        for (subId in subIdsToRemove.vals()) {
          subscriptionsMap.remove(subId);
        };
        // Remove from AccessControl role map
        accessControlState.userRoles.remove(caller);
        #ok;
      };
    };
  };

  // ── Hardcoded admin account seeding ──────────────────────────────────────────
  // Admin credentials: username=mostfa, password=mostfa123
  // Password hash: SHA-256("mostfa_salt" + "mostfa123")
  //   = f531885ea6b9cd7e742ec473f046ebe69c4fd1ce3ee777eb6a90cdfbf7086b64
  // Salt: mostfa_salt
  //
  // The frontend crypto.ts does: SHA-256(salt + password) → hex string.
  // Stored hash matches that formula with the fixed salt above.

  /// Generate a stable Principal for the admin account from a fixed seed.
  private func makeAdminPrincipal(username : Text) : Common.UserId {
    let seed = username # ":999999";
    let seedBlob = seed.encodeUtf8();
    let bytes = seedBlob.toArray();
    let len = if (bytes.size() < 28) bytes.size() else 28;
    let principalBytes = Array.tabulate<Nat8>(len + 1, func i {
      if (i < len) bytes[i] else 0x04;
    });
    Blob.fromArray(principalBytes).fromBlob();
  };

  /// Seed the admin account. Always overwrites the admin entry to ensure consistency.
  /// Safe to call multiple times.
  private func seedAdmin() : () {
    let adminUsername = "mostfa";
    let adminSalt = "mostfa_salt";
    // SHA-256("mostfa_salt" + "mostfa123") = precomputed deterministic hash
    let adminPasswordHash = "f531885ea6b9cd7e742ec473f046ebe69c4fd1ce3ee777eb6a90cdfbf7086b64";

    // Generate a deterministic principal for the admin account (counter = 999999)
    let adminId = makeAdminPrincipal(adminUsername);

    let now = Time.now();

    // Check if there's a conflicting user-registered account with username "mostfa"
    // If so, remove it to make way for the admin account
    switch (credentialsMap.get(adminUsername)) {
      case (?existing) {
        // If the existing entry doesn't use the admin principal, remove conflicting user
        if (not Principal.equal(existing.userId, adminId)) {
          // Remove the conflicting user from users map
          users.remove(existing.userId);
          // Remove their role if any
          accessControlState.userRoles.remove(existing.userId);
        };
      };
      case null {};
    };

    // Store/overwrite credential record with admin's deterministic principal
    let credential : AuthTypes.CredentialAuth = {
      userId = adminId;
      passwordHash = adminPasswordHash;
      salt = adminSalt;
      createdAt = now;
    };
    credentialsMap.add(adminUsername, credential);

    // Create/overwrite user record with admin role
    let adminInput : UserTypes.RegisterInput = {
      username = adminUsername;
      email = "admin@streamverse.app";
      displayName = "مصطفى Admin";
      avatarUrl = "";
    };
    let adminUser = UsersLib.newUser(adminId, adminInput, now);
    // Override role to admin
    adminUser.role := #admin;
    users.add(adminId, adminUser);

    // Grant admin role in AccessControl — always set to ensure it's there
    accessControlState.userRoles.add(adminId, #admin);
    accessControlState.adminAssigned := true;
  };

  seedAdmin();

  // ── Admin identity helpers ────────────────────────────────────────────────────

  /// Check if the given username belongs to the admin account.
  /// Used by the frontend to verify admin status without needing II.
  public query func isAdminUsername(username : Text) : async Bool {
    let adminUsername = "mostfa";
    if (username != adminUsername) return false;
    // Verify the credential entry points to the admin principal
    switch (credentialsMap.get(username)) {
      case null false;
      case (?cred) {
        let adminId = makeAdminPrincipal(adminUsername);
        Principal.equal(cred.userId, adminId);
      };
    };
  };

  /// Re-seed the admin account. Call this if admin access is lost.
  /// Returns true if seeding succeeded.
  public shared func reseedAdmin() : async Bool {
    seedAdmin();
    true;
  };
};
