module {
  public type PlaylistEntry = {
    id : Text;
    userId : Text;
    var name : Text;
    var description : Text;
    var videoIds : [Text];
    createdAt : Int;
    var updatedAt : Int;
    var isPublic : Bool;
  };
};
