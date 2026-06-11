import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import AccessControl "mo:caffeineai-authorization/access-control";
import UserTypes "../types/users";
import Common "../types/common";
import UserLib "../lib/users";

mixin (
  accessControlState : AccessControl.AccessControlState,
  users : Map.Map<Common.UserId, UserTypes.User>,
) {
  /// Register the caller as a new user
  public shared ({ caller }) func registerUser(input : UserTypes.RegisterInput) : async UserTypes.UserPublic {
    if (caller.isAnonymous()) {
      Runtime.trap("Anonymous callers cannot register");
    };
    switch (users.get(caller)) {
      case (?existing) { UserLib.toPublic(existing) };
      case null {
        let user = UserLib.newUser(caller, input, Time.now());
        users.add(caller, user);
        UserLib.toPublic(user);
      };
    };
  };

  /// Get a user by their principal id
  public query ({ caller }) func getUser(userId : Common.UserId) : async ?UserTypes.UserPublic {
    switch (users.get(userId)) {
      case (?user) { ?UserLib.toPublic(user) };
      case null { null };
    };
  };

  /// Get the calling user's profile (for frontend compatibility)
  public query ({ caller }) func getCallerUserProfile() : async ?UserTypes.UserPublic {
    switch (users.get(caller)) {
      case (?user) { ?UserLib.toPublic(user) };
      case null { null };
    };
  };

  /// Get a user profile by username — useful when caller is anonymous (credential auth).
  public query func getProfileByUsername(username : Text) : async ?UserTypes.UserPublic {
    switch (users.values().find(func(u : UserTypes.User) : Bool { u.username == username })) {
      case (?u) { ?UserLib.toPublic(u) };
      case null { null };
    };
  };

  /// Save/upsert caller profile (for frontend compatibility)
  public shared ({ caller }) func saveCallerUserProfile(input : UserTypes.RegisterInput) : async () {
    if (caller.isAnonymous()) {
      Runtime.trap("Anonymous callers cannot save a profile");
    };
    switch (users.get(caller)) {
      case (?user) {
        user.username := input.username;
        user.email := input.email;
        user.displayName := input.displayName;
        user.avatarUrl := input.avatarUrl;
      };
      case null {
        let user = UserLib.newUser(caller, input, Time.now());
        users.add(caller, user);
      };
    };
  };

  /// Update display name, avatar, email, facebookUrl and tiktokUrl for the caller
  public shared ({ caller }) func updateProfile(input : UserTypes.UpdateProfileInput) : async UserTypes.UserPublic {
    if (caller.isAnonymous()) {
      Runtime.trap("Anonymous callers cannot update profile");
    };
    let user = switch (users.get(caller)) {
      case (?u) { u };
      case null { Runtime.trap("User not found") };
    };
    user.displayName := input.displayName;
    user.avatarUrl := input.avatarUrl;
    user.email := input.email;
    user.facebookUrl := input.facebookUrl;
    user.tiktokUrl := input.tiktokUrl;
    UserLib.toPublic(user);
  };

  /// Update language and dark mode settings for the caller
  public shared ({ caller }) func updateSettings(settings : UserTypes.UserSettings) : async () {
    if (caller.isAnonymous()) {
      Runtime.trap("Anonymous callers cannot update settings");
    };
    let user = switch (users.get(caller)) {
      case (?u) { u };
      case null { Runtime.trap("User not found") };
    };
    user.language := settings.language;
    user.darkMode := settings.darkMode;
  };

  /// Get current settings for the caller
  public query ({ caller }) func getUserSettings() : async UserTypes.UserSettings {
    switch (users.get(caller)) {
      case (?user) {
        { language = user.language; darkMode = user.darkMode };
      };
      case null {
        // Default settings for unregistered users
        { language = #en; darkMode = true };
      };
    };
  };
};
