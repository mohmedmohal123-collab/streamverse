import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import AccessControl "mo:caffeineai-authorization/access-control";
import Outcall "mo:caffeineai-http-outcalls/outcall";
import SubscriptionTypes "../types/subscriptions";
import SubscriptionsLib "../lib/subscriptions";

/// Public API mixin for Stripe subscription management.
/// Stripe API calls are made via the http-outcalls platform extension.
/// Receives injected state: subscriptions map and a monotonic counter.
mixin (
  accessControlState : AccessControl.AccessControlState,
  subscriptions : Map.Map<Text, SubscriptionTypes.Subscription>,
  subscriptionCounter : { var value : Nat },
  stripeSecretKey : { var value : Text },
  stripeWebhookSecret : { var value : Text },
  premiumVideos : Map.Map<Text, SubscriptionTypes.PremiumVideoEntry>,
  contentGatingSettings : SubscriptionTypes.ContentGatingSettings,
) {

  /// Normalise HTTP responses (strip headers for consensus).
  public query func transformSubscription(input : Outcall.TransformationInput) : async Outcall.TransformationOutput {
    Outcall.transform(input);
  };

  /// Creates a Stripe Checkout Session for the given tier and plan type.
  /// Returns the session URL on success or an error message on failure.
  public shared ({ caller }) func createCheckoutSession(
    tier : SubscriptionTypes.SubscriptionTier,
    planType : SubscriptionTypes.PlanType,
    successUrl : Text,
    returnUrl : Text,
  ) : async { #ok : Text; #err : Text } {
    await SubscriptionsLib.createCheckoutSession(
      subscriptions,
      subscriptionCounter,
      caller,
      stripeSecretKey.value,
      tier,
      planType,
      successUrl,
      returnUrl,
      transformSubscription,
    );
  };

  /// Returns the current subscription record for the calling user, if any.
  public query ({ caller }) func getMySubscription() : async ?SubscriptionTypes.SubscriptionView {
    SubscriptionsLib.getMySubscription(subscriptions, caller);
  };

  /// Cancels the calling user's active Stripe subscription.
  public shared ({ caller }) func cancelSubscription() : async { #ok; #err : Text } {
    await SubscriptionsLib.cancelSubscription(
      subscriptions,
      caller,
      stripeSecretKey.value,
      transformSubscription,
    );
  };

  /// Stripe webhook handler — verifies the signature, then processes events
  /// (checkout.session.completed, customer.subscription.updated/deleted).
  public shared func handleStripeWebhook(
    rawBody : Text,
    signature : Text,
  ) : async { #ok; #err : Text } {
    SubscriptionsLib.handleStripeWebhook(
      subscriptions,
      subscriptionCounter,
      stripeWebhookSecret.value,
      rawBody,
      signature,
    );
  };

  /// Creates a Stripe Customer Portal session so the user can manage their
  /// payment method, billing address, and subscription in the Stripe-hosted UI.
  /// Requires the caller to have an existing subscription record (stripeCustomerId).
  public shared ({ caller }) func createCustomerPortalSession(
    returnUrl : Text,
  ) : async { #ok : Text; #err : Text } {
    await SubscriptionsLib.createCustomerPortalSession(
      subscriptions,
      caller,
      stripeSecretKey.value,
      returnUrl,
      transformSubscription,
    );
  };

  // ── Content Gating API ────────────────────────────────────────────────────

  // Fixed admin password hash for server-side token verification.
  // SHA-256("mostfa_salt" + "mostfa123") — matches seedAdmin() in main.mo.
  let _adminPasswordHashSubs = "f531885ea6b9cd7e742ec473f046ebe69c4fd1ce3ee777eb6a90cdfbf7086b64";

  /// Safe admin check — returns false instead of trapping for unregistered principals.
  private func isSubsAdminSafe(caller : Principal) : Bool {
    if (caller.isAnonymous()) return false;
    switch (accessControlState.userRoles.get(caller)) {
      case (?(#admin)) true;
      case _ false;
    };
  };

  /// Marks or unmarks a video as premium. Admin only.
  public shared ({ caller }) func setVideoPremium(
    videoId : Text,
    isPremium : Bool,
    requiredTier : SubscriptionTypes.SubscriptionTier,
  ) : async { #ok; #err : Text } {
    if (not isSubsAdminSafe(caller)) {
      return #err("Unauthorized: admin only");
    };
    SubscriptionsLib.setVideoPremium(premiumVideos, videoId, isPremium, requiredTier);
  };

  /// Returns whether the calling user can access the given video based on
  /// their subscription tier and the video's required tier.
  public query ({ caller }) func canUserAccessVideo(videoId : Text) : async { #ok : Bool; #err : Text } {
    SubscriptionsLib.canUserAccessVideo(
      premiumVideos,
      subscriptions,
      contentGatingSettings,
      caller,
      videoId,
    );
  };

  /// Returns global content gating settings (no auth required — read-only).
  public query func getContentGatingSettings() : async { enabled : Bool; defaultFreeVideosPerDay : Nat } {
    {
      enabled = contentGatingSettings.enabled;
      defaultFreeVideosPerDay = contentGatingSettings.defaultFreeVideosPerDay;
    };
  };

  /// Updates global content gating settings. Admin only.
  public shared ({ caller }) func setContentGatingSettings(
    enabled : Bool,
    defaultFreeVideosPerDay : Nat,
  ) : async { #ok; #err : Text } {
    if (not isSubsAdminSafe(caller)) {
      return #err("Unauthorized: admin only");
    };
    contentGatingSettings.enabled := enabled;
    contentGatingSettings.defaultFreeVideosPerDay := defaultFreeVideosPerDay;
    #ok;
  };

  /// Returns the list of all video IDs currently marked as premium.
  public query func getPremiumVideoIds() : async [Text] {
    SubscriptionsLib.getPremiumVideoIds(premiumVideos);
  };

  /// Returns webhook endpoint path and configuration instructions for the admin.
  public query func getWebhookEndpointInfo() : async { path : Text; note : Text } {
    SubscriptionsLib.getWebhookEndpointInfo();
  };
};
