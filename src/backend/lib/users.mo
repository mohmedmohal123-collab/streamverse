import Time "mo:core/Time";
import Types "../types/users";
import Common "../types/common";

module {
  /// Convert internal mutable User to shared UserPublic
  public func toPublic(user : Types.User) : Types.UserPublic {
    {
      id = user.id;
      username = user.username;
      email = user.email;
      displayName = user.displayName;
      avatarUrl = user.avatarUrl;
      role = user.role;
      language = user.language;
      darkMode = user.darkMode;
      createdAt = user.createdAt;
      isBanned = user.isBanned;
      facebookUrl = user.facebookUrl;
      tiktokUrl = user.tiktokUrl;
    };
  };

  /// Build a new User record from registration input
  public func newUser(
    id : Common.UserId,
    input : Types.RegisterInput,
    createdAt : Common.Timestamp,
  ) : Types.User {
    {
      id;
      var username = input.username;
      var email = input.email;
      var displayName = input.displayName;
      var avatarUrl = input.avatarUrl;
      var role = #user;
      var language = #en;
      var darkMode = true;
      createdAt;
      var isBanned = false;
      var facebookUrl = null;
      var tiktokUrl = null;
    };
  };
};
