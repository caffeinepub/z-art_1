import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
  type Artwork = {
    id : Text;
    title : Text;
    description : Text;
    price : Nat;
    image : Storage.ExternalBlob;
    imageType : Text;
    createdAt : Time.Time;
    owner : Principal;
    isSold : Bool;
  };

  type UserProfile = {
    name : Text;
  };

  type Purchase = {
    artworkId : Text;
    buyer : Principal;
    price : Nat;
    timestamp : Time.Time;
  };

  type Wallet = {
    owner : Principal;
    balance : Nat;
  };

  let artworks = Map.empty<Text, Artwork>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  var purchases = Map.empty<Text, Purchase>();
  let wallets = Map.empty<Principal, Wallet>();

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  include MixinStorage();

  public query ({ caller }) func isAdmin() : async Bool {
    AccessControl.isAdmin(accessControlState, caller);
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public shared ({ caller }) func createArtwork(artwork : {
    id : Text;
    title : Text;
    description : Text;
    price : Nat;
    image : Storage.ExternalBlob;
    imageType : Text;
  }) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can upload artworks");
    };
    if (artworks.containsKey(artwork.id)) {
      Runtime.trap("Artwork with this ID already exists");
    };

    let newArtwork : Artwork = {
      id = artwork.id;
      title = artwork.title;
      description = artwork.description;
      price = artwork.price;
      image = artwork.image;
      imageType = artwork.imageType;
      createdAt = Time.now();
      owner = caller;
      isSold = false;
    };

    artworks.add(artwork.id, newArtwork);
  };

  public query ({ caller }) func getArtwork(id : Text) : async ?Artwork {
    artworks.get(id);
  };

  public query func listArtworks() : async [(Text, Artwork)] {
    artworks.toArray();
  };

  public query ({ caller }) func getArtworksByUser(user : Principal) : async [Text] {
    if (caller != user and not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admin or owner can access this");
    };
    artworks.toArray().filter(func((_, a)) { a.owner == user }).map(func((_, a)) { a.id });
  };

  public shared ({ caller }) func transferArtwork(artworkId : Text, recipient : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can transfer artworks");
    };

    let artwork = switch (artworks.get(artworkId)) {
      case (null) { Runtime.trap("Artwork not found") };
      case (?artwork) { artwork };
    };

    if (caller != artwork.owner and not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only artwork owner or admin can transfer artworks");
    };

    let updatedArtwork = { artwork with owner = recipient };
    artworks.add(artworkId, updatedArtwork);
  };

  public shared ({ caller }) func updateArtwork(id : Text, updatedArtwork : {
    title : Text;
    description : Text;
    price : Nat;
    image : Storage.ExternalBlob;
    imageType : Text;
  }) : async () {
    let existingArtwork = switch (artworks.get(id)) {
      case (null) { Runtime.trap("Artwork not found") };
      case (?artwork) { artwork };
    };

    if (caller != existingArtwork.owner and not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only artwork owner or admin can update artworks");
    };

    let newArtwork : Artwork = {
      id = existingArtwork.id;
      title = updatedArtwork.title;
      description = updatedArtwork.description;
      price = updatedArtwork.price;
      image = updatedArtwork.image;
      imageType = updatedArtwork.imageType;
      createdAt = existingArtwork.createdAt;
      owner = existingArtwork.owner;
      isSold = existingArtwork.isSold;
    };

    artworks.add(id, newArtwork);
  };

  public shared ({ caller }) func deleteArtwork(id : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admin can delete artworks");
    };

    switch (artworks.get(id)) {
      case (null) { Runtime.trap("Artwork not found") };
      case (?_) {
        artworks.remove(id);
      };
    };
  };

  public shared ({ caller }) func setArtworkSoldStatus(artworkId : Text, isSold : Bool) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can modify sold status");
    };

    let artwork = switch (artworks.get(artworkId)) {
      case (null) { Runtime.trap("Artwork not found") };
      case (?artwork) { artwork };
    };

    if (caller != artwork.owner and not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only artwork owner or admin can change sold status");
    };

    let updatedArtwork = { artwork with isSold };
    artworks.add(artworkId, updatedArtwork);
  };
};
