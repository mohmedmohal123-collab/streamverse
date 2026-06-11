import Map "mo:core/Map";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import Blob "mo:core/Blob";
import Nat8 "mo:core/Nat8";
import Array "mo:core/Array";
import Nat "mo:core/Nat";
import AccessControl "mo:caffeineai-authorization/access-control";
import AuthLib "../lib/auth";
import UsersLib "../lib/users";
import AuthTypes "../types/auth";
import Common "../types/common";
import UserTypes "../types/users";

mixin (
  accessControlState : AccessControl.AccessControlState,
  users : Map.Map<Common.UserId, UserTypes.User>,
  credentialsMap : Map.Map<Text, AuthTypes.CredentialAuth>,
  googleOAuthMap : Map.Map<Text, AuthTypes.GoogleOAuthLink>,
) {
  // Monotonic counter used to generate unique user principals
  let userIdCounter = { var value : Nat = 0 };

  /// Register a new user with a username/email and a client-side password hash+salt.
  /// Creates both the User record and the CredentialAuth record.
  public shared func registerWithCredentials(
    username : Text,
    email : Text,
    passwordHash : Text,
    salt : Text,
  ) : async AuthTypes.AuthResult {
    // Reject reserved admin username
    if (username == "mostfa" or username == "admin") {
      return #err("Username already taken");
    };
    // Reject duplicate username
    if (credentialsMap.get(username) != null) {
      #err("Username already taken");
    } else {
      // Generate a deterministic unique principal from the username + counter
      let userId = makeUserId(username, userIdCounter.value);
      userIdCounter.value += 1;

      let now = Time.now();

      // Store credential
      let credential : AuthTypes.CredentialAuth = {
        userId;
        passwordHash;
        salt;
        createdAt = now;
      };
      AuthLib.addCredential(credentialsMap, username, credential);

      // Create and store user
      let input : UserTypes.RegisterInput = {
        username;
        email;
        displayName = username;
        avatarUrl = "";
      };
      let user = UsersLib.newUser(userId, input, now);
      users.add(userId, user);

      #ok(userId);
    };
  };

  /// Log in with a username and a client-side password hash.
  /// Returns the user's Principal on success.
  public shared func loginWithCredentials(
    username : Text,
    passwordHash : Text,
  ) : async AuthTypes.AuthResult {
    switch (credentialsMap.get(username)) {
      case null #err("User not found");
      case (?cred) {
        if (not AuthLib.verifyCredential(cred, passwordHash)) {
          #err("Invalid password");
        } else {
          // Check user is not banned
          switch (users.get(cred.userId)) {
            case null #err("User account missing");
            case (?user) {
              if (user.isBanned) {
                #err("Account is banned");
              } else {
                // Ensure admin role is set in AccessControl for admin user
                if (user.role == #admin) {
                  accessControlState.userRoles.add(cred.userId, #admin);
                  accessControlState.adminAssigned := true;
                } else {
                  // Register non-admin user in AccessControl if not already present
                  switch (accessControlState.userRoles.get(cred.userId)) {
                    case null {
                      accessControlState.userRoles.add(cred.userId, #user);
                    };
                    case (?_) {};
                  };
                };
                #ok(cred.userId);
              };
            };
          };
        };
      };
    };
  };

  /// Link a Google account (identified by googleSub + email) to the calling user.
  public shared ({ caller }) func linkGoogleAccount(
    googleSub : Text,
    email : Text,
  ) : async { #ok; #err : Text } {
    // Caller must be a known user
    switch (users.get(caller)) {
      case null #err("Caller is not a registered user");
      case (?_) {
        // Reject if this googleSub is already linked to someone else
        switch (googleOAuthMap.get(googleSub)) {
          case (?existing) {
            if (not Principal.equal(existing.userId, caller)) {
              #err("Google account already linked to another user");
            } else {
              // Already linked to this user — idempotent
              #ok;
            };
          };
          case null {
            let link : AuthTypes.GoogleOAuthLink = {
              userId = caller;
              googleSub;
              email;
              linkedAt = Time.now();
            };
            AuthLib.addGoogleLink(googleOAuthMap, googleSub, link);
            #ok;
          };
        };
      };
    };
  };

  /// Verify a Google ID token (decoded client-side or via backend HTTP outcall),
  /// then find or create a user.  Returns the user's Principal on success.
  public shared func verifyGoogleOAuth(idToken : Text) : async AuthTypes.AuthResult {
    // Parse sub + email from the JWT payload
    switch (AuthLib.parseGoogleIdToken(idToken)) {
      case null #err("Invalid Google ID token");
      case (?(googleSub, email)) {
        // Look up an existing link
        switch (googleOAuthMap.get(googleSub)) {
          case (?link) {
            // Verify the linked user still exists and is not banned
            switch (users.get(link.userId)) {
              case null #err("Linked user account missing");
              case (?user) {
                if (user.isBanned) #err("Account is banned")
                else #ok(link.userId);
              };
            };
          };
          case null {
            // First-time Google sign-in: create a new user account
            let regInput = AuthLib.googleProfileToRegisterInput(googleSub, email);

            // Ensure username is unique — append a suffix from the counter if needed
            let baseUsername = regInput.username;
            let uniqueUsername = resolveUniqueUsername(baseUsername);

            let userId = makeUserId(uniqueUsername, userIdCounter.value);
            userIdCounter.value += 1;

            let now = Time.now();

            let finalInput : UserTypes.RegisterInput = { regInput with username = uniqueUsername };
            let user = UsersLib.newUser(userId, finalInput, now);
            users.add(userId, user);

            // Register a pseudo-credential so the username is reserved
            let pseudoCred : AuthTypes.CredentialAuth = {
              userId;
              passwordHash = ""; // no password for Google-only accounts
              salt = "";
              createdAt = now;
            };
            credentialsMap.add(uniqueUsername, pseudoCred);

            // Store the OAuth link
            let link : AuthTypes.GoogleOAuthLink = {
              userId;
              googleSub;
              email;
              linkedAt = now;
            };
            AuthLib.addGoogleLink(googleOAuthMap, googleSub, link);

            #ok(userId);
          };
        };
      };
    };
  };

  /// Return the salt stored for a given username so the client can hash the password before login.
  public query func getSaltForUser(username : Text) : async ?Text {
    switch (credentialsMap.get(username)) {
      case null null;
      case (?cred) ?cred.salt;
    };
  };

  // ── Private helpers ───────────────────────────────────────────────────────────

  /// Generate a stable, unique Principal from a username seed + counter.
  /// Uses the UTF-8 encoding of "username:N" as the blob, then wraps it
  /// into a self-authenticating-style principal via fromBlob.
  private func makeUserId(username : Text, n : Nat) : Common.UserId {
    let seed = username # ":" # n.toText();
    // Pad/truncate to ≤ 29 bytes as required by the Principal spec.
    let seedBlob = seed.encodeUtf8();
    let bytes = seedBlob.toArray();
    // Take first 28 bytes (max opaque principal size), append 0x04 type byte
    let len = if (bytes.size() < 28) bytes.size() else 28;
    let principalBytes = Array.tabulate<Nat8>(len + 1, func i {
      if (i < len) bytes[i] else 0x04;
    });
    Blob.fromArray(principalBytes).fromBlob();
  };

  /// Find a unique username by appending "_N" if the base is already taken.
  private func resolveUniqueUsername(base : Text) : Text {
    if (credentialsMap.get(base) == null) { base } else {
      var n = 1;
      var candidate = base # "_" # n.toText();
      while (credentialsMap.get(candidate) != null) {
        n += 1;
        candidate := base # "_" # n.toText();
      };
      candidate;
    };
  };
};
