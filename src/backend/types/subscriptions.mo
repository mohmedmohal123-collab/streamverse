import Common "common";

module {
  /// Available subscription tiers
  public type SubscriptionTier = { #free; #plus; #pro };

  /// Metadata stored for a premium-gated video
  public type PremiumVideoEntry = {
    videoId : Text;
    requiredTier : SubscriptionTier;
  };

  /// Global content gating configuration (admin-controlled)
  public type ContentGatingSettings = {
    var enabled : Bool;
    var defaultFreeVideosPerDay : Nat;
  };

  /// Mirrors Stripe subscription lifecycle states
  public type SubscriptionStatus = {
    #active;
    #canceled;
    #incomplete;
    #pastDue;
  };

  /// Plan billing interval — monthly or annual
  public type PlanType = { #monthly; #annual };

  /// Subscription record stored in canister state
  public type Subscription = {
    id : Text;
    userId : Common.UserId;
    stripeCustomerId : Text;
    stripeSubscriptionId : Text;
    tier : SubscriptionTier;
    planType : PlanType; // billing interval — default #monthly for migrated records
    var status : SubscriptionStatus;
    var currentPeriodEnd : Common.Timestamp; // Unix epoch seconds (Int)
  };

  /// Immutable snapshot returned over the API boundary
  public type SubscriptionView = {
    id : Text;
    userId : Common.UserId;
    stripeCustomerId : Text;
    stripeSubscriptionId : Text;
    tier : SubscriptionTier;
    planType : PlanType;
    status : SubscriptionStatus;
    currentPeriodEnd : Common.Timestamp;
  };

  /// Input to create a Stripe Checkout Session
  public type CheckoutSessionInput = {
    tier : SubscriptionTier;
    successUrl : Text;
    returnUrl : Text;
  };
};
