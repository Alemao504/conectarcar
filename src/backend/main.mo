import Principal "mo:core/Principal";
import Map "mo:core/Map";
import Int "mo:core/Int";
import Nat "mo:core/Nat";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Text "mo:core/Text";
import Order "mo:core/Order";
import MixinAuthorization "mo:caffeineai-authorization/MixinAuthorization";
import AccessControl "mo:caffeineai-authorization/access-control";
import MixinObjectStorage "mo:caffeineai-object-storage/Mixin";
import Storage "mo:caffeineai-object-storage/Storage";



actor {
  include MixinObjectStorage();

  ////////// TYPES //////////

  type TripStatus = {
    #requested;
    #inProgress;
    #completed;
  };

  type UserRole = {
    #admin;
    #driver;
    #passenger;
    #advertiser;
  };

  type UserProfile = {
    id : Principal;
    name : Text;
    role : UserRole;
    paymentLink : ?Text;
    city : Text;
    state : Text;
    avatar : ?Storage.ExternalBlob;
    adsLink : ?Text;
    carPlate : ?Text;
    carModel : ?Text;
    cpf : ?Text;
    maxMinutesPerTrip : ?Nat;
    minuteRate : ?Nat;
    freeMinutes : ?Nat;
    qrCode : ?Text;
    totalEarnings : ?Nat;
    deviceId : Text;
    isBanned : Bool;
    subscriptionExpiry : Int;
    subscriptionPlan : Text;
    createdAt : Time.Time;
  };

  type Ad = {
    id : Text;
    advertiser : Principal;
    video : Storage.ExternalBlob;
    contactLink : Text;
    city : Text;
    createdAt : Time.Time;
    approved : Bool;
    viewCount : Nat;
  };

  type Trip = {
    id : Text;
    passenger : Principal;
    driver : Principal;
    startTime : Time.Time;
    freeMinutesUsed : Nat;
    paidMinutes : Nat;
    status : TripStatus;
    totalPaid : Nat;
  };

  type PaymentStatus = {
    #pending;
    #confirmed;
  };

  type PaymentMethod = {
    #pix;
    #cash;
  };

  type Payment = {
    id : Text;
    passenger : Principal;
    driver : Principal;
    minutes : Nat;
    amount : Nat;
    paymentMethod : PaymentMethod;
    status : PaymentStatus;
  };

  type AdRequest = {
    id : Text;
    advertiser : Principal;
    video : Storage.ExternalBlob;
    contactLink : Text;
    city : Text;
    createdAt : Time.Time;
  };

  type PendingTimeRequest = {
    passenger : Principal;
    driver : Principal;
    requestedMinutes : Nat;
  };

  type AdminStats = {
    totalDrivers : Nat;
    totalPassengers : Nat;
    totalAdvertisers : Nat;
    totalBanned : Nat;
    activeSubscriptions : Nat;
  };

  module UserProfile {
    // Order by city, then by name
    public func compareByCity(userProfile1 : UserProfile, userProfile2 : UserProfile) : Order.Order {
      switch (Text.compare(userProfile1.city, userProfile2.city)) {
        case (#equal) { Text.compare(userProfile1.name, userProfile2.name) };
        case (order) { order };
      };
    };
  };

  module AdRequest {
    // Order by most recently created first
    public func compareByCreationTime(adRequest1 : AdRequest, adRequest2 : AdRequest) : Order.Order {
      Int.compare(adRequest2.createdAt, adRequest1.createdAt);
    };
  };

  module Ad {
    public func compareByCreationTime(ad1 : Ad, ad2 : Ad) : Order.Order {
      Int.compare(ad2.createdAt, ad1.createdAt);
    };
  };

  ////////// STATE //////////

  let userProfiles = Map.empty<Principal, UserProfile>();
  let pendingTimeRequests = Map.empty<Text, PendingTimeRequest>();
  let adRequests = Map.empty<Text, AdRequest>();
  let ads = Map.empty<Text, Ad>();
  let trips = Map.empty<Text, Trip>();
  let payments = Map.empty<Text, Payment>();

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  ////////// USER PROFILE - CORE CANISTER ENDPOINTS //////////

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
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

  ////////// PUBLIC PROFILE FUNCTIONS //////////

  public query func getAllDriverProfiles() : async [UserProfile] {
    userProfiles.values().toArray().filter(func(u) { u.role == #driver }).sort(UserProfile.compareByCity);
  };

  public query ({ caller }) func getVerifiedDriversByCity(city : Text) : async [UserProfile] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view verified drivers");
    };
    let filtered = userProfiles.values().toArray().filter(func(u) { Text.equal(u.city, city) and u.role == #driver });
    filtered.sort(UserProfile.compareByCity);
  };

  public query ({ caller }) func getConfirmedDriversByCity(city : Text) : async [UserProfile] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view confirmed drivers");
    };
    let filtered = userProfiles.values().toArray().filter(func(u) { Text.equal(u.city, city) and u.role == #driver });
    filtered.sort(UserProfile.compareByCity);
  };

  public query ({ caller }) func getAvailablePassengersByCity(city : Text) : async [UserProfile] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view available passengers");
    };
    userProfiles.values().toArray().filter(func(u) { Text.equal(u.city, city) and u.role == #passenger });
  };

  public query ({ caller }) func getAdvertisersByCity(city : Text) : async [UserProfile] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view advertisers");
    };
    userProfiles.values().toArray().filter(func(u) { Text.equal(u.city, city) and u.role == #advertiser });
  };

  ////////// PROFILE LOOKUP + REGISTRATION FUNCTIONS //////////

  public query ({ caller }) func getDriverProfile(driver : Principal) : async UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view driver profiles");
    };
    switch (userProfiles.get(driver)) {
      case (null) { Runtime.trap("Driver not found") };
      case (?profile) { profile };
    };
  };

  public query ({ caller }) func getAllAdvertisers() : async [UserProfile] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view all advertisers");
    };
    userProfiles.values().toArray().filter(func(p) { p.role == #advertiser });
  };

  public query ({ caller }) func getPendingTimeRequestsForDriverProfile(driver : Principal) : async [PendingTimeRequest] {
    if (caller != driver and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: You can only view your own time requests");
    };
    pendingTimeRequests.values().toArray().filter(func(req) { req.driver == driver });
  };

  public query ({ caller }) func getAllAdRequests() : async [AdRequest] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view all ad requests");
    };
    adRequests.values().toArray().sort(AdRequest.compareByCreationTime);
  };

  ////////// VIEW PROFILE HISTORY (RIDE HISTORY) //////////

  public query ({ caller }) func getRideHistory(passenger : Principal) : async [Trip] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view ride history");
    };
    if (caller != passenger and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only the passenger can view their own ride history");
    };
    trips.values().toArray().filter(func(t) { t.passenger == passenger });
  };

  public query ({ caller }) func getSessionsForDriverProfile(driver : Principal) : async [Trip] {
    if (caller != driver and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only the driver can view their own sessions");
    };
    trips.values().toArray().filter(func(t) { t.driver == driver });
  };

  ////////// GET APPROVED ADS/REQUEST FOR ROTATION (CITY-SPECIFIC) //////////

  public query ({ caller }) func getApprovedAdsForCity(city : Text) : async [Ad] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view ads");
    };
    ads.values().toArray().filter(func(ad) { ad.city == city and ad.approved }).sort(Ad.compareByCreationTime);
  };

  //////////////////// CRUD + VIEW FUNCTIONS FOR VERIFIED DRIVERS /////////////////////
  // Get all drivers in a city (for passengers to find drivers)
  public query ({ caller }) func getAvailableDriversByCity(city : Text) : async [UserProfile] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view available drivers");
    };
    userProfiles.values().toArray().filter(func(p) { p.role == #driver and p.city == city });
  };

  //////////////////// PAYMENT FUNCTIONS (VIEW FEEDBACK) /////////////////////
  public query ({ caller }) func getPaymentStatus(sessionId : Text) : async Payment {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view payment status");
    };
    switch (payments.get(sessionId)) {
      case (null) { Runtime.trap("No payment found for that session") };
      case (?payment) { payment };
    };
  };

  // Retrieve monthly view count for advertiser
  // Helper for recurring bill (enforce pricing!)
  public query ({ caller }) func getAdvertiserMonthlyViews() : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view monthly views");
    };
    switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("Not a valid advertiser...") };
      case (?profile) {
        if (profile.role != #advertiser) {
          Runtime.trap("Only advertisers can view their monthly views");
        };
      };
    };
    var totalViews = 0;
    ads.values().toArray().forEach(
      func(ad) {
        if (ad.advertiser == caller) {
          totalViews += ad.viewCount;
        };
      }
    );
    totalViews;
  };

  // Helper for admin view
  public query ({ caller }) func getDriverMonthlyEarnings() : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view earnings");
    };
    // Validate as a driver
    switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("Not a valid driver profile...") };
      case (?profile) {
        if (profile.role != #driver) {
          Runtime.trap("Only drivers can view their earnings");
        };
      };
    };
    var totalEarnings = 0;
    payments.values().toArray().forEach(
      func(payment) {
        if (payment.driver == caller and payment.status == #confirmed) {
          totalEarnings += payment.amount;
        };
      }
    );
    totalEarnings;
  };

  ////////// ADMIN CRUD LIST QUERIES TABLE VIEWS //////////
  public query ({ caller }) func getAllProfiles() : async [UserProfile] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view all users");
    };
    userProfiles.values().toArray();
  };

  public query ({ caller }) func getAllSessions() : async [Trip] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view all sessions");
    };
    trips.values().toArray();
  };

  public query ({ caller }) func getAllPayments() : async [Payment] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view all payments");
    };
    payments.values().toArray();
  };

  public query ({ caller }) func getAllAds() : async [Ad] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view all ads");
    };
    ads.values().toArray();
  };

  ////////// ADMIN-ONLY EXTENDED FUNCTIONS //////////

  // Returns all profiles including deviceId — admin only
  public query ({ caller }) func adminGetAllProfiles() : async [UserProfile] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can access this");
    };
    userProfiles.values().toArray();
  };

  // Bans a user by setting isBanned=true — admin only
  public shared ({ caller }) func adminBanUser(userId : Principal) : async Bool {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can ban users");
    };
    switch (userProfiles.get(userId)) {
      case (null) { false };
      case (?profile) {
        userProfiles.add(userId, { profile with isBanned = true });
        true;
      };
    };
  };

  // Removes a user from the platform — admin only
  public shared ({ caller }) func adminDeleteUser(userId : Principal) : async Bool {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can delete users");
    };
    switch (userProfiles.get(userId)) {
      case (null) { false };
      case (?_) {
        userProfiles.remove(userId);
        true;
      };
    };
  };

  // Updates the caller's device ID (called during registration/login)
  public shared ({ caller }) func adminSaveUserDeviceId(deviceId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update their device ID");
    };
    switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("Profile not found") };
      case (?profile) {
        userProfiles.add(caller, { profile with deviceId = deviceId });
      };
    };
  };

  // Returns aggregated platform statistics — admin only
  public query ({ caller }) func adminGetStats() : async AdminStats {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view stats");
    };
    let now = Time.now();
    var totalDrivers = 0;
    var totalPassengers = 0;
    var totalAdvertisers = 0;
    var totalBanned = 0;
    var activeSubscriptions = 0;
    userProfiles.values().toArray().forEach(func(u) {
      if (u.role == #driver) { totalDrivers += 1 };
      if (u.role == #passenger) { totalPassengers += 1 };
      if (u.role == #advertiser) { totalAdvertisers += 1 };
      if (u.isBanned) { totalBanned += 1 };
      if (u.subscriptionExpiry > now) { activeSubscriptions += 1 };
    });
    {
      totalDrivers;
      totalPassengers;
      totalAdvertisers;
      totalBanned;
      activeSubscriptions;
    };
  };
};
