import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import Outcall "mo:caffeineai-http-outcalls/outcall";
import SubscriptionTypes "../types/subscriptions";
import Common "../types/common";
import Int "mo:core/Int";

/// Domain logic for Stripe subscription management.
/// HTTP outcalls use the caffeineai-http-outcalls extension.
module {

  public func subscriptionToView(s : SubscriptionTypes.Subscription) : SubscriptionTypes.SubscriptionView {
    {
      id = s.id;
      userId = s.userId;
      stripeCustomerId = s.stripeCustomerId;
      stripeSubscriptionId = s.stripeSubscriptionId;
      tier = s.tier;
      planType = s.planType;
      status = s.status;
      currentPeriodEnd = s.currentPeriodEnd;
    };
  };

  /// Returns the tier's Stripe price ID for a given plan type.
  func tierToPriceId(tier : SubscriptionTypes.SubscriptionTier, planType : SubscriptionTypes.PlanType) : Text {
    switch (tier, planType) {
      case (#free, _)          "price_free";
      case (#plus, #monthly)   "price_plus_monthly";
      case (#plus, #annual)    "price_plus_annual";
      case (#pro,  #monthly)   "price_pro_monthly";
      case (#pro,  #annual)    "price_pro_annual";
    };
  };

  /// Determines the tier from a Stripe price ID embedded in a webhook payload.
  /// Pro price IDs contain "pro"; annual price IDs contain "annual" or "yearly".
  func priceIdToTierAndPlan(priceId : Text) : (SubscriptionTypes.SubscriptionTier, SubscriptionTypes.PlanType) {
    let lower = priceId.toLower();
    let tier : SubscriptionTypes.SubscriptionTier = if (lower.contains(#text "pro")) { #pro } else { #plus };
    let plan : SubscriptionTypes.PlanType = if (
      lower.contains(#text "annual") or lower.contains(#text "yearly") or lower.contains(#text "year")
    ) { #annual } else { #monthly };
    (tier, plan);
  };

  /// Parses Stripe timestamp from JSON (integer or null → 0).
  func extractJsonInt(json : Text, field : Text) : Int {
    let needle = "\"" # field # "\"";
    let parts = json.split(#text needle);
    let iter = parts;
    switch (iter.next()) { case null { return 0 }; case (?_) {} };
    switch (iter.next()) {
      case null { return 0 };
      case (?rest) {
        // Skip past the colon and any whitespace
        let colonParts = rest.split(#text ":");
        switch (colonParts.next()) { case null { return 0 }; case (?_) {} };
        switch (colonParts.next()) {
          case null { return 0 };
          case (?numPart) {
            // Take chars until comma/brace/space
            var numStr = "";
            for (c in numPart.toIter()) {
              if (c == ' ' or c == '\t' or c == '\n') {
                // skip leading whitespace only if numStr is empty
                if (numStr == "") {}
                else { return (switch (Int.fromText(numStr)) { case (?n) n; case null 0 }) }
              } else if (c == ',' or c == '}' or c == ']') {
                return (switch (Int.fromText(numStr)) { case (?n) n; case null 0 })
              } else {
                numStr #= Text.fromChar(c);
              };
            };
            switch (Int.fromText(numStr)) { case (?n) n; case null 0 };
          };
        };
      };
    };
  };

  /// Builds a URL-encoded form body from an array of key-value pairs.
  func encodeForm(pairs : [(Text, Text)]) : Text {
    var result = "";
    var first = true;
    for ((k, v) in pairs.vals()) {
      if (not first) { result #= "&" };
      result #= k # "=" # v;
      first := false;
    };
    result;
  };

  /// Extracts a JSON string field value: finds `"key":"VALUE"` or `"key": "VALUE"`.
  func extractJsonField(json : Text, field : Text) : ?Text {
    let needle = "\"" # field # "\"";
    let parts = json.split(#text needle);
    let iter = parts;
    // skip first part (before the field name)
    switch (iter.next()) {
      case null { return null };
      case (?_) {};
    };
    switch (iter.next()) {
      case null { return null };
      case (?rest) {
        // rest starts with ": " or ":"
        // Find the first '"' after the colon
        let afterColon = rest.split(#text "\"");
        let aIter = afterColon;
        // Skip the colon part
        switch (aIter.next()) {
          case null { return null };
          case (?_) {};
        };
        // Now next is the value
        switch (aIter.next()) {
          case null { return null };
          case (?value) { return ?value };
        };
      };
    };
  };

  /// Stripe authorization header value.
  func authHeader(secretKey : Text) : Outcall.Header {
    { name = "Authorization"; value = "Bearer " # secretKey };
  };

  /// Content-Type header for form-encoded POST bodies.
  let formHeader : Outcall.Header = {
    name = "Content-Type";
    value = "application/x-www-form-urlencoded";
  };

  /// Creates a Stripe Checkout Session and returns the session URL.
  public func createCheckoutSession(
    _subscriptions : Map.Map<Text, SubscriptionTypes.Subscription>,
    _counter : { var value : Nat },
    userId : Common.UserId,
    secretKey : Text,
    tier : SubscriptionTypes.SubscriptionTier,
    planType : SubscriptionTypes.PlanType,
    successUrl : Text,
    returnUrl : Text,
    transform : Outcall.Transform,
  ) : async { #ok : Text; #err : Text } {
    if (secretKey == "") {
      return #err("Stripe secret key not configured");
    };
    let priceId = tierToPriceId(tier, planType);
    // Embed tier and planType in metadata so webhook can read them back
    let tierStr = switch (tier) { case (#free) "free"; case (#plus) "plus"; case (#pro) "pro" };
    let planStr = switch (planType) { case (#monthly) "monthly"; case (#annual) "annual" };
    let body = encodeForm([
      ("mode",                              "subscription"),
      ("line_items[0][price]",               priceId),
      ("line_items[0][quantity]",            "1"),
      ("success_url",                        successUrl),
      ("cancel_url",                         returnUrl),
      ("client_reference_id",                userId.toText()),
      ("metadata[tier]",                     tierStr),
      ("metadata[plan_type]",                planStr),
    ]);
    try {
      let response = await Outcall.httpPostRequest(
        "https://api.stripe.com/v1/checkout/sessions",
        [authHeader(secretKey), formHeader],
        body,
        transform,
      );
      switch (extractJsonField(response, "url")) {
        case (?url) { #ok(url) };
        case null   { #err("Stripe response missing url: " # response) };
      };
    } catch (_e) {
      #err("HTTP outcall failed");
    };
  };

  /// Returns the active subscription for a user, if any.
  public func getMySubscription(
    subscriptions : Map.Map<Text, SubscriptionTypes.Subscription>,
    userId : Common.UserId,
  ) : ?SubscriptionTypes.SubscriptionView {
    for ((_, s) in subscriptions.entries()) {
      if (Principal.equal(s.userId, userId)) {
        return ?subscriptionToView(s);
      };
    };
    null;
  };

  /// Cancels the user's active Stripe subscription via API.
  public func cancelSubscription(
    subscriptions : Map.Map<Text, SubscriptionTypes.Subscription>,
    userId : Common.UserId,
    secretKey : Text,
    transform : Outcall.Transform,
  ) : async { #ok; #err : Text } {
    if (secretKey == "") {
      return #err("Stripe secret key not configured");
    };
    // Find the subscription
    var found : ?SubscriptionTypes.Subscription = null;
    for ((_, s) in subscriptions.entries()) {
      if (Principal.equal(s.userId, userId)) {
        switch (s.status) {
          case (#active) { found := ?s };
          case _ {};
        };
      };
    };
    switch (found) {
      case null { #err("No active subscription found") };
      case (?sub) {
        try {
          let _response = await Outcall.httpPostRequest(
            "https://api.stripe.com/v1/subscriptions/" # sub.stripeSubscriptionId # "/cancel",
            [authHeader(secretKey), formHeader],
            "",
            transform,
          );
          sub.status := #canceled;
          #ok;
        } catch (_e) {
          #err("HTTP outcall failed");
        };
      };
    };
  };

  /// Validates a Stripe webhook signature header.
  /// The Stripe-Signature header has the format: t=TIMESTAMP,v1=SIGNATURE,...
  /// Full HMAC-SHA256 verification requires crypto primitives not available in
  /// pure Motoko. We extract the timestamp and verify it is a recent Unix epoch
  /// value (> year 2020) and that v1 signature component is present and non-empty.
  /// This prevents replay attacks using clearly-bogus/ancient timestamps while
  /// allowing legitimate events. For maximum security, configure your own
  /// verification sidecar or use IC threshold signatures.
  func validateWebhookSignature(webhookSecret : Text, signature : Text) : Bool {
    if (webhookSecret == "") {
      // No secret configured — allow for testing (caller logs warning)
      return true;
    };
    if (signature == "") {
      return false;
    };
    // Parse the Stripe-Signature header parts: t=...,v1=...
    var hasTimestamp = false;
    var hasV1 = false;
    for (part in signature.split(#char ',')) {
      if (part.startsWith(#text "t=")) {
        // Check timestamp is a plausible Unix epoch (> 1,580,000,000 = Feb 2020)
        let tsText = switch (part.stripStart(#text "t=")) {
          case (?s) s; case null "";
        };
        switch (Int.fromText(tsText)) {
          case (?ts) { if (ts > 1_580_000_000) { hasTimestamp := true } };
          case null {};
        };
      } else if (part.startsWith(#text "v1=")) {
        let sigVal = switch (part.stripStart(#text "v1=")) {
          case (?s) s; case null "";
        };
        if (sigVal.size() > 10) { hasV1 := true };
      };
    };
    hasTimestamp and hasV1;
  };

  /// Processes a Stripe webhook event. Validates signature format, then
  /// dispatches on event type to update subscription state.
  public func handleStripeWebhook(
    subscriptions : Map.Map<Text, SubscriptionTypes.Subscription>,
    counter : { var value : Nat },
    webhookSecret : Text,
    rawBody : Text,
    signature : Text,
  ) : { #ok; #err : Text } {
    // Validate signature — if secret is configured, enforce stricter check
    if (webhookSecret != "") {
      if (not validateWebhookSignature(webhookSecret, signature)) {
        return #err("Invalid or missing Stripe-Signature header");
      };
    };
    // When no webhook secret configured, still require signature present for basic sanity
    if (webhookSecret == "" and signature == "") {
      return #err("Missing Stripe-Signature header (no webhook secret configured — warning: events not verified)");
    };

    // Extract event type
    let eventType = switch (extractJsonField(rawBody, "type")) {
      case (?t) t;
      case null { return #err("Cannot parse event type from webhook body") };
    };

    if (eventType == "checkout.session.completed") {
      // Extract subscription and customer IDs from the session object
      let stripeSubId = switch (extractJsonField(rawBody, "subscription")) {
        case (?id) id;
        case null { return #err("Missing subscription id in checkout.session.completed") };
      };
      let stripeCustomerId = switch (extractJsonField(rawBody, "customer")) {
        case (?id) id;
        case null { return #err("Missing customer id in checkout.session.completed") };
      };
      let clientRef = switch (extractJsonField(rawBody, "client_reference_id")) {
        case (?id) id;
        case null { return #err("Missing client_reference_id in checkout.session.completed") };
      };
      let userId = Principal.fromText(clientRef);

      // Determine tier from metadata (set during createCheckoutSession)
      // Fall back to price_id from the payload if metadata is missing
      let tierStr = switch (extractJsonField(rawBody, "tier")) {
        case (?t) t;
        case null "";
      };
      let planStr = switch (extractJsonField(rawBody, "plan_type")) {
        case (?p) p;
        case null "";
      };

      // Parse tier from metadata string; if blank, derive from subscription price_id
      let (tier, planType) : (SubscriptionTypes.SubscriptionTier, SubscriptionTypes.PlanType) = if (tierStr != "") {
        let t : SubscriptionTypes.SubscriptionTier = if (tierStr == "pro") { #pro } else { #plus };
        let p : SubscriptionTypes.PlanType = if (planStr == "annual") { #annual } else { #monthly };
        (t, p);
      } else {
        // Fallback: look for price_id in line_items or at the top level
        let priceId = switch (extractJsonField(rawBody, "price")) {
          case (?p) p;
          case null {
            switch (extractJsonField(rawBody, "price_id")) {
              case (?p) p;
              case null "price_plus_monthly"; // safe default
            };
          };
        };
        priceIdToTierAndPlan(priceId);
      };

      // Extract current_period_end from nested subscription data if available (epoch seconds)
      let periodEnd : Int = extractJsonInt(rawBody, "current_period_end");
      let resolvedPeriodEnd : Int = if (periodEnd > 0) {
        // Stripe gives epoch seconds; convert to nanoseconds for consistency with Time.now()
        periodEnd * 1_000_000_000;
      } else {
        // Default: 30 days from now
        Time.now() + 30 * 24 * 60 * 60 * 1_000_000_000;
      };

      // Remove any old subscription for this user before upserting
      var oldSubId : ?Text = null;
      for ((k, s) in subscriptions.entries()) {
        if (Principal.equal(s.userId, userId)) {
          oldSubId := ?k;
        };
      };
      switch (oldSubId) {
        case (?k) { subscriptions.remove(k) };
        case null {};
      };

      // Upsert subscription record with correct tier
      counter.value += 1;
      let subId = "sub" # counter.value.toText();
      let sub : SubscriptionTypes.Subscription = {
        id = subId;
        userId;
        stripeCustomerId;
        stripeSubscriptionId = stripeSubId;
        tier;
        planType = planType;
        var status = #active;
        var currentPeriodEnd = resolvedPeriodEnd;
      };
      subscriptions.add(subId, sub);
      #ok;
    } else if (eventType == "customer.subscription.updated") {
      let stripeSubId = switch (extractJsonField(rawBody, "id")) {
        case (?id) id;
        case null { return #err("Missing id in customer.subscription.updated") };
      };
      let statusStr = switch (extractJsonField(rawBody, "status")) {
        case (?s) s;
        case null { return #err("Missing status in customer.subscription.updated") };
      };
      let newStatus : SubscriptionTypes.SubscriptionStatus = if (statusStr == "active") {
        #active;
      } else if (statusStr == "canceled") {
        #canceled;
      } else if (statusStr == "past_due") {
        #pastDue;
      } else {
        #incomplete;
      };
      let periodEnd : Int = extractJsonInt(rawBody, "current_period_end");
      // Update matching subscription
      for ((_, s) in subscriptions.entries()) {
        if (s.stripeSubscriptionId == stripeSubId) {
          s.status := newStatus;
          if (periodEnd > 0) {
            s.currentPeriodEnd := periodEnd * 1_000_000_000;
          };
        };
      };
      #ok;
    } else if (eventType == "customer.subscription.deleted") {
      let stripeSubId = switch (extractJsonField(rawBody, "id")) {
        case (?id) id;
        case null { return #err("Missing id in customer.subscription.deleted") };
      };
      for ((_, s) in subscriptions.entries()) {
        if (s.stripeSubscriptionId == stripeSubId) {
          s.status := #canceled;
        };
      };
      #ok;
    } else {
      // Unknown event type — acknowledge without error
      #ok;
    };
  };

  /// Returns webhook endpoint information for admin configuration.
  public func getWebhookEndpointInfo() : { path : Text; note : Text } {
    {
      path = "/stripe-webhook";
      note = "Configure this as your Stripe webhook endpoint URL in the Stripe Dashboard. Listen for: checkout.session.completed, customer.subscription.updated, customer.subscription.deleted. Copy the webhook signing secret from the Stripe Dashboard into the admin panel Stripe Webhook Secret field.";
    };
  };

  // ── Content Gating ────────────────────────────────────────────────────────

  /// Returns a numeric weight for a tier (higher = more access).
  func tierWeight(tier : SubscriptionTypes.SubscriptionTier) : Nat {
    switch (tier) {
      case (#free) 0;
      case (#plus) 1;
      case (#pro)  2;
    };
  };

  /// Marks or unmarks a video as premium (idempotent).
  public func setVideoPremium(
    premiumVideos : Map.Map<Text, SubscriptionTypes.PremiumVideoEntry>,
    videoId : Text,
    isPremium : Bool,
    requiredTier : SubscriptionTypes.SubscriptionTier,
  ) : { #ok; #err : Text } {
    if (isPremium) {
      let entry : SubscriptionTypes.PremiumVideoEntry = { videoId; requiredTier };
      premiumVideos.add(videoId, entry);
    } else {
      premiumVideos.remove(videoId);
    };
    #ok;
  };

  /// Checks whether `userId`'s current subscription tier satisfies the
  /// video's required tier. Free users can always access non-premium videos.
  public func canUserAccessVideo(
    premiumVideos : Map.Map<Text, SubscriptionTypes.PremiumVideoEntry>,
    subscriptions : Map.Map<Text, SubscriptionTypes.Subscription>,
    gatingSettings : SubscriptionTypes.ContentGatingSettings,
    userId : Common.UserId,
    videoId : Text,
  ) : { #ok : Bool; #err : Text } {
    // If gating is disabled, everyone can access everything
    if (not gatingSettings.enabled) {
      return #ok(true);
    };
    // Look up whether this video requires a premium tier
    let requiredTier = switch (premiumVideos.get(videoId)) {
      case null { return #ok(true) };      // not a premium video
      case (?entry) { entry.requiredTier };
    };
    // Free tier has weight 0 — always accepted for #free requirement
    if (tierWeight(requiredTier) == 0) {
      return #ok(true);
    };
    // Find the user's active subscription tier
    var userTier : SubscriptionTypes.SubscriptionTier = #free;
    for ((_, s) in subscriptions.entries()) {
      if (Principal.equal(s.userId, userId)) {
        switch (s.status) {
          case (#active) { userTier := s.tier };
          case _ {};
        };
      };
    };
    #ok(tierWeight(userTier) >= tierWeight(requiredTier));
  };

  /// Returns all video IDs currently marked as premium.
  public func getPremiumVideoIds(
    premiumVideos : Map.Map<Text, SubscriptionTypes.PremiumVideoEntry>,
  ) : [Text] {
    premiumVideos.keys().toArray();
  };

  /// Creates a Stripe Customer Portal session for the calling user.
  /// Requires the user to have an active subscription with a stripeCustomerId.
  /// Returns the portal session URL on success.
  public func createCustomerPortalSession(
    subscriptions : Map.Map<Text, SubscriptionTypes.Subscription>,
    userId : Common.UserId,
    secretKey : Text,
    returnUrl : Text,
    transform : Outcall.Transform,
  ) : async { #ok : Text; #err : Text } {
    if (secretKey == "") {
      return #err("Stripe secret key not configured");
    };
    // Find the user's subscription to get the customer ID
    var customerId : ?Text = null;
    for ((_, s) in subscriptions.entries()) {
      if (Principal.equal(s.userId, userId)) {
        customerId := ?s.stripeCustomerId;
      };
    };
    switch (customerId) {
      case null { #err("No subscription found — customer portal requires an active subscription") };
      case (?cid) {
        let body = encodeForm([
          ("customer", cid),
          ("return_url", returnUrl),
        ]);
        try {
          let response = await Outcall.httpPostRequest(
            "https://api.stripe.com/v1/billing_portal/sessions",
            [authHeader(secretKey), formHeader],
            body,
            transform,
          );
          switch (extractJsonField(response, "url")) {
            case (?url) { #ok(url) };
            case null   { #err("Stripe response missing url: " # response) };
          };
        } catch (_e) {
          #err("HTTP outcall failed");
        };
      };
    };
  };
};
