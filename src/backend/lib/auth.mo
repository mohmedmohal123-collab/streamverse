import Map "mo:core/Map";
import Text "mo:core/Text";
import Array "mo:core/Array";
import Blob "mo:core/Blob";
import Char "mo:core/Char";
import Nat8 "mo:core/Nat8";
import Nat32 "mo:core/Nat32";
import Iter "mo:core/Iter";
import AuthTypes "../types/auth";
import UserTypes "../types/users";

module {
  /// Look up a credential record by username
  public func getCredential(
    credentialsMap : Map.Map<Text, AuthTypes.CredentialAuth>,
    username : Text,
  ) : ?AuthTypes.CredentialAuth {
    credentialsMap.get(username);
  };

  /// Store a new credential record keyed by username
  public func addCredential(
    credentialsMap : Map.Map<Text, AuthTypes.CredentialAuth>,
    username : Text,
    credential : AuthTypes.CredentialAuth,
  ) : () {
    credentialsMap.add(username, credential);
  };

  /// Look up a GoogleOAuthLink record by googleSub
  public func getGoogleLink(
    googleOAuthMap : Map.Map<Text, AuthTypes.GoogleOAuthLink>,
    googleSub : Text,
  ) : ?AuthTypes.GoogleOAuthLink {
    googleOAuthMap.get(googleSub);
  };

  /// Store a new GoogleOAuthLink keyed by googleSub
  public func addGoogleLink(
    googleOAuthMap : Map.Map<Text, AuthTypes.GoogleOAuthLink>,
    googleSub : Text,
    link : AuthTypes.GoogleOAuthLink,
  ) : () {
    googleOAuthMap.add(googleSub, link);
  };

  /// Verify that the supplied passwordHash matches the stored credential
  public func verifyCredential(
    credential : AuthTypes.CredentialAuth,
    passwordHash : Text,
  ) : Bool {
    credential.passwordHash == passwordHash;
  };

  /// Extract the sub and email from a Google ID token JWT payload (base64url-decoded middle segment).
  /// Returns null if the token is malformed or missing required fields.
  public func parseGoogleIdToken(idToken : Text) : ?(Text, Text) {
    do ? {
      // JWT = header.payload.signature — take the payload segment
      let parts = idToken.split(#char '.');
      var count = 0;
      var payload = "";
      for (part in parts) {
        if (count == 1) { payload := part };
        count += 1;
      };
      if (payload == "") { null! };

      // base64url → standard base64 padding
      let rem = payload.size() % 4;
      let padded = if (rem == 0) payload
        else if (rem == 2) payload # "=="
        else if (rem == 3) payload # "="
        else { null! };

      let standard = padded
        .replace(#char '-', "+")
        .replace(#char '_', "/");

      let decoded = decodeBase64(standard)!;
      let json = decoded.decodeUtf8()!;

      let sub = extractJsonField(json, "sub")!;
      let email = extractJsonField(json, "email")!;
      (sub, email);
    };
  };

  /// Build a RegisterInput-compatible record from minimal Google profile data.
  public func googleProfileToRegisterInput(
    googleSub : Text,
    email : Text,
  ) : UserTypes.RegisterInput {
    // Derive a username from the email local-part (max 20 chars)
    let localPart = switch (email.split(#char '@').next()) {
      case (?lp) lp;
      case null googleSub;
    };
    let username = if (localPart.size() > 20) Text.fromIter(localPart.toIter().take(20)) else localPart;
    {
      username;
      email;
      displayName = username;
      avatarUrl = "";
    };
  };

  // ── Private helpers ───────────────────────────────────────────────────────────

  /// Naive base64 decoder for standard (padded, '+' and '/') base64.
  private func decodeBase64(input : Text) : ?Blob {
    let chars = input.toArray();
    let n = chars.size();
    if (n % 4 != 0) { null } else {
      // Count '=' padding at end
      let padInt : Int = (if (n > 0 and chars[n - 1] == '=') 1 else 0)
               + (if (n > 1 and chars[n - 2] == '=') 1 else 0);
      let rawOutSize : Int = (n / 4) * 3;
      let outSize = (rawOutSize - padInt).toNat();

      let outVar = Array.tabulate<Nat8>(outSize, func _ = 0).toVarArray();
      var outIdx = 0;

      var i = 0;
      var ok = true;
      while (ok and i < n) {
        let b0 = charVal(chars[i]);
        let b1 = charVal(chars[i + 1]);
        let b2 = charVal(chars[i + 2]);
        let b3 = charVal(chars[i + 3]);
        switch (b0, b1, b2, b3) {
          case (?v0, ?v1, ?v2, ?v3) {
            let combined = v0 * 262144 + v1 * 4096 + v2 * 64 + v3;
            if (outIdx < outSize) {
              outVar[outIdx] := Nat8.fromNat((combined / 65536) % 256);
              outIdx += 1;
            };
            if (outIdx < outSize) {
              outVar[outIdx] := Nat8.fromNat((combined / 256) % 256);
              outIdx += 1;
            };
            if (outIdx < outSize) {
              outVar[outIdx] := Nat8.fromNat(combined % 256);
              outIdx += 1;
            };
          };
          case _ { ok := false };
        };
        i += 4;
      };
      if (ok) { ?Blob.fromArray(Array.tabulate<Nat8>(outSize, func i = outVar[i])) } else null;
    };
  };

  private func charVal(c : Char) : ?Nat {
    if (c >= 'A' and c <= 'Z') {
      ?((c.toNat32() - ('A').toNat32()).toNat())
    } else if (c >= 'a' and c <= 'z') {
      ?((c.toNat32() - ('a').toNat32()).toNat() + 26)
    } else if (c >= '0' and c <= '9') {
      ?((c.toNat32() - ('0').toNat32()).toNat() + 52)
    } else if (c == '+') {
      ?62
    } else if (c == '/') {
      ?63
    } else if (c == '=') {
      ?0
    } else {
      null
    };
  };

  /// Find index of first '"' character in array, starting from `start`.
  private func findQuoteIndex(chars : [Char], start : Nat) : Nat {
    let quote = Char.fromNat32(34); // ASCII 34 = "
    var i = start;
    var found = false;
    while (i < chars.size() and not found) {
      if (chars[i] == quote) { found := true } else { i += 1 };
    };
    i;
  };

  /// Extract a quoted string value for `fieldName` from a flat JSON object text.
  private func extractJsonField(json : Text, fieldName : Text) : ?Text {
    let needle = "\"" # fieldName # "\"";
    if (not json.contains(#text needle)) { null } else {
      var after = "";
      var count2 = 0;
      for (part in json.split(#text needle)) {
        if (count2 == 1) { after := part };
        count2 += 1;
      };
      if (after == "") { null } else {
        let trimmed = after
          .trimStart(#text " ")
          .trimStart(#text ":")
          .trimStart(#text " ");

        if (not trimmed.startsWith(#text "\"")) { null } else {
          switch (trimmed.stripStart(#text "\"")) {
            case null null;
            case (?rest) {
              let valueChars = rest.toArray();
              let end = findQuoteIndex(valueChars, 0);
              ?Text.fromIter(valueChars.values().take(end));
            };
          };
        };
      };
    };
  };
};
