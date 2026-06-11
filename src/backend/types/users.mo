import Common "common";

module {
  public type UserRole = { #user; #admin };

  public type User = {
    id : Common.UserId;
    var username : Text;
    var email : Text;
    var displayName : Text;
    var avatarUrl : Text;
    var role : UserRole;
    var language : Common.Language;
    var darkMode : Bool;
    createdAt : Common.Timestamp;
    var isBanned : Bool;
    var facebookUrl : ?Text;
    var tiktokUrl : ?Text;
  };

  /// Shared (non-mutable) representation for API boundary
  public type UserPublic = {
    id : Common.UserId;
    username : Text;
    email : Text;
    displayName : Text;
    avatarUrl : Text;
    role : UserRole;
    language : Common.Language;
    darkMode : Bool;
    createdAt : Common.Timestamp;
    isBanned : Bool;
    facebookUrl : ?Text;
    tiktokUrl : ?Text;
  };

  public type RegisterInput = {
    username : Text;
    email : Text;
    displayName : Text;
    avatarUrl : Text;
  };

  public type UpdateProfileInput = {
    displayName : Text;
    avatarUrl : Text;
    email : Text;
    facebookUrl : ?Text;
    tiktokUrl : ?Text;
  };

  public type UserSettings = {
    language : Common.Language;
    darkMode : Bool;
  };
};
