import Map "mo:core/Map";
import Text "mo:core/Text";
import Time "mo:core/Time";
import AuthTypes "../types/auth";
import UserTypes "../types/users";
import Common "../types/common";
import PlaylistTypes "../types/playlists";

mixin (
  credentialsMap : Map.Map<Text, AuthTypes.CredentialAuth>,
  users : Map.Map<Common.UserId, UserTypes.User>,
  playlistsMap : Map.Map<Text, PlaylistTypes.PlaylistEntry>,
  playlistCounter : { var value : Nat },
) {
  // Fixed admin password hash — same as seedAdmin() in main.mo.
  let playlistsAdminHash = "f531885ea6b9cd7e742ec473f046ebe69c4fd1ce3ee777eb6a90cdfbf7086b64";

  /// Verify that the given token belongs to the given user (by matching credential hash).
  private func verifyToken(userId : Text, token : Text) : Bool {
    if (token == playlistsAdminHash) return true;
    var found = false;
    credentialsMap.forEach(func(_u, cred) {
      if (cred.passwordHash == token and cred.userId.toText() == userId) {
        found := true;
      };
    });
    found;
  };

  /// Create a new playlist for the given user.
  /// Returns the new playlist's ID on success.
  public shared func createPlaylist(
    userId : Text,
    name : Text,
    description : Text,
    isPublic : Bool,
    token : Text,
  ) : async { #ok : Text; #err : Text } {
    if (not verifyToken(userId, token)) {
      return #err("Unauthorized: invalid token");
    };
    if (name.size() == 0) {
      return #err("اسم قائمة التشغيل لا يمكن أن يكون فارغاً");
    };
    let now = Time.now();
    playlistCounter.value += 1;
    let id = "pl_" # playlistCounter.value.toText();
    let entry : PlaylistTypes.PlaylistEntry = {
      id;
      userId;
      var name;
      var description;
      var videoIds = [];
      createdAt = now;
      var updatedAt = now;
      var isPublic;
    };
    playlistsMap.add(id, entry);
    #ok(id);
  };

  /// Return all playlists belonging to the given user.
  public query func getUserPlaylists(userId : Text) : async [{
    id : Text;
    userId : Text;
    name : Text;
    description : Text;
    videoIds : [Text];
    createdAt : Int;
    updatedAt : Int;
    isPublic : Bool;
  }] {
    playlistsMap.values()
      .filter(func(p) { p.userId == userId })
      .map(func(p) {
        {
          id = p.id;
          userId = p.userId;
          name = p.name;
          description = p.description;
          videoIds = p.videoIds;
          createdAt = p.createdAt;
          updatedAt = p.updatedAt;
          isPublic = p.isPublic;
        };
      })
      .toArray();
  };

  /// Return a single playlist by ID.
  public query func getPlaylist(playlistId : Text) : async {
    #ok : {
      id : Text;
      userId : Text;
      name : Text;
      description : Text;
      videoIds : [Text];
      createdAt : Int;
      updatedAt : Int;
      isPublic : Bool;
    };
    #err : Text;
  } {
    switch (playlistsMap.get(playlistId)) {
      case null { #err("قائمة التشغيل غير موجودة") };
      case (?p) {
        #ok({
          id = p.id;
          userId = p.userId;
          name = p.name;
          description = p.description;
          videoIds = p.videoIds;
          createdAt = p.createdAt;
          updatedAt = p.updatedAt;
          isPublic = p.isPublic;
        });
      };
    };
  };

  /// Add a video ID to an existing playlist.
  public shared func addVideoToPlaylist(
    playlistId : Text,
    videoId : Text,
    userId : Text,
    token : Text,
  ) : async { #ok; #err : Text } {
    if (not verifyToken(userId, token)) {
      return #err("Unauthorized: invalid token");
    };
    switch (playlistsMap.get(playlistId)) {
      case null { #err("قائمة التشغيل غير موجودة") };
      case (?p) {
        if (p.userId != userId and token != playlistsAdminHash) {
          return #err("Unauthorized: not your playlist");
        };
        // Avoid duplicates
        if (p.videoIds.find(func(v) { v == videoId }) != null) {
          return #ok;
        };
        p.videoIds := p.videoIds.concat([videoId]);
        p.updatedAt := Time.now();
        #ok;
      };
    };
  };

  /// Remove a video ID from an existing playlist.
  public shared func removeVideoFromPlaylist(
    playlistId : Text,
    videoId : Text,
    userId : Text,
    token : Text,
  ) : async { #ok; #err : Text } {
    if (not verifyToken(userId, token)) {
      return #err("Unauthorized: invalid token");
    };
    switch (playlistsMap.get(playlistId)) {
      case null { #err("قائمة التشغيل غير موجودة") };
      case (?p) {
        if (p.userId != userId and token != playlistsAdminHash) {
          return #err("Unauthorized: not your playlist");
        };
        p.videoIds := p.videoIds.filter(func(v) { v != videoId });
        p.updatedAt := Time.now();
        #ok;
      };
    };
  };

  /// Delete a playlist entirely.
  public shared func deletePlaylist(
    playlistId : Text,
    userId : Text,
    token : Text,
  ) : async { #ok; #err : Text } {
    if (not verifyToken(userId, token)) {
      return #err("Unauthorized: invalid token");
    };
    switch (playlistsMap.get(playlistId)) {
      case null { #err("قائمة التشغيل غير موجودة") };
      case (?p) {
        if (p.userId != userId and token != playlistsAdminHash) {
          return #err("Unauthorized: not your playlist");
        };
        playlistsMap.remove(playlistId);
        #ok;
      };
    };
  };

  /// Update a playlist's metadata.
  public shared func updatePlaylist(
    playlistId : Text,
    name : Text,
    description : Text,
    isPublic : Bool,
    userId : Text,
    token : Text,
  ) : async { #ok; #err : Text } {
    if (not verifyToken(userId, token)) {
      return #err("Unauthorized: invalid token");
    };
    if (name.size() == 0) {
      return #err("اسم قائمة التشغيل لا يمكن أن يكون فارغاً");
    };
    switch (playlistsMap.get(playlistId)) {
      case null { #err("قائمة التشغيل غير موجودة") };
      case (?p) {
        if (p.userId != userId and token != playlistsAdminHash) {
          return #err("Unauthorized: not your playlist");
        };
        p.name := name;
        p.description := description;
        p.isPublic := isPublic;
        p.updatedAt := Time.now();
        #ok;
      };
    };
  };
};
