import Common "common";

module {
  /// Stores username/password credential data — passwords are hashed client-side
  public type CredentialAuth = {
    userId : Common.UserId;
    passwordHash : Text;
    salt : Text;
    createdAt : Common.Timestamp;
  };

  /// Links a Google OAuth identity (sub) to a local user account
  public type GoogleOAuthLink = {
    userId : Common.UserId;
    googleSub : Text;
    email : Text;
    linkedAt : Common.Timestamp;
  };

  /// Result type for authentication operations
  public type AuthResult = { #ok : Common.UserId; #err : Text };
};
