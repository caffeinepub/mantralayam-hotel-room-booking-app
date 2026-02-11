import Map "mo:core/Map";
import Array "mo:core/Array";
import Time "mo:core/Time";
import Iter "mo:core/Iter";
import Principal "mo:core/Principal";
import Text "mo:core/Text";
import Runtime "mo:core/Runtime";
import AccessControl "authorization/access-control";
import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";
import OutCall "http-outcalls/outcall";
import Stripe "stripe/stripe";



actor {
  include MixinStorage();

  public type Hotel = {
    id : Text;
    name : Text;
    address : Text;
    description : Text;
    amenities : [Text];
    photos : [Storage.ExternalBlob];
  };

  public type RoomType = {
    #single;
    #double;
    #suite;
  };

  public type HomeStay = {
    id : Text;
    hotelId : Text;
    roomType : RoomType;
    price : Nat;
    amenities : [Text];
    photos : [Storage.ExternalBlob];
    description : Text;
    availability : Bool;
    ownerType : {
      #admin;
      #partner;
    };
    partnerId : ?Text;
    googleMapsLink : ?Text;
    partnerName : Text;
    partnerPhoneNumber : Text;
    distanceFromTemple : ?Nat;
    photoUrls : [Text];
    videoUrls : [Text];
    ratings : [Nat];
    ownerMessage : Text;
  };

  public type GuestProfile = {
    id : Text;
    name : Text;
    contact : Text;
    bookingHistory : [Text];
  };

  public type BookingStatus = {
    #pendingConfirmation;
    #confirmed;
    #cancelled;
  };

  public type Booking = {
    id : Text;
    userId : Text;
    hotelId : Text;
    roomId : Text;
    checkInDate : Time.Time;
    checkOutDate : Time.Time;
    totalPrice : Nat;
    status : BookingStatus;
    bookingDate : Time.Time;
    guestInfo : GuestProfile;
    customerName : Text;
  };

  public type AdminProfile = {
    id : Text;
    name : Text;
    role : AccessControl.UserRole;
    adminKey : Text;
    adminPassword : Text;
  };

  public type PartnerProfile = {
    id : Text;
    name : Text;
    contact : Text;
    rooms : [Text];
    registrationDate : Time.Time;
  };

  public type Notification = {
    id : Text;
    message : Text;
    timestamp : Time.Time;
    notificationType : {
      #booking;
      #payment;
      #profileUpdate;
      #partner;
      #newLogin;
    };
    unread : Bool;
  };

  public type UserProfile = {
    name : Text;
  };

  public type RoomPasscodeConfig = {
    roomId : Text;
    passcode : Text;
  };

  public type PartnerRoomUpdate = {
    roomId : Text;
    price : Nat;
    availability : Bool;
  };

  let hotels = Map.empty<Text, Hotel>();
  let homeStays = Map.empty<Text, HomeStay>();
  let guestProfiles = Map.empty<Text, GuestProfile>();
  var bookings = Map.empty<Text, Booking>();
  let adminProfiles = Map.empty<Text, AdminProfile>();
  let partnerProfiles = Map.empty<Text, PartnerProfile>();
  let notifications = Map.empty<Text, Notification>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  let adminSessions = Map.empty<Principal, Bool>();
  let partnerSessions = Map.empty<Principal, Bool>();
  let partnerPrincipalToId = Map.empty<Principal, Text>();
  let customerFirstLoginTracking = Map.empty<Principal, Bool>();

  let accessControlState = AccessControl.initState();
  let roomPasscodes = Map.empty<Text, Text>();
  let partnerAuthenticatedRooms = Map.empty<Principal, Text>();

  func isAuthenticatedAdmin(caller : Principal) : Bool {
    let hasAdminRole = AccessControl.isAdmin(accessControlState, caller);
    let hasActiveSession = adminSessions.get(caller) == ?true;
    hasAdminRole and hasActiveSession;
  };

  func isAuthenticatedPartner(caller : Principal) : Bool {
    switch (partnerSessions.get(caller)) {
      case (?true) {
        switch (partnerAuthenticatedRooms.get(caller)) {
          case (?_) { true };
          case (null) { false };
        };
      };
      case (_) { false };
    };
  };

  func getPartnerIdForCaller(caller : Principal) : ?Text {
    partnerPrincipalToId.get(caller);
  };

  func getPartnerAuthenticatedRoom(caller : Principal) : ?Text {
    partnerAuthenticatedRooms.get(caller);
  };

  func validatePartnerRoomAccess(caller : Principal, roomId : Text) {
    switch (getPartnerAuthenticatedRoom(caller)) {
      case (?authenticatedRoomId) {
        if (authenticatedRoomId != roomId) {
          Runtime.trap("Unauthorized: Partner can only access their authenticated room");
        };
      };
      case (null) {
        Runtime.trap("Unauthorized: No authenticated room for partner");
      };
    };
  };

  func validatePartnerOwnsRoom(partnerId : Text, roomId : Text) {
    switch (partnerProfiles.get(partnerId)) {
      case (?partnerProfile) {
        let ownsRoom = partnerProfile.rooms.find(
          func(r) { r == roomId }
        );
        switch (ownsRoom) {
          case (?_) {};
          case (null) {
            Runtime.trap("Unauthorized: Partner does not own this room");
          };
        };
      };
      case (null) {
        Runtime.trap("Partner profile not found");
      };
    };
  };

  // Stripe integration setup
  var stripeConfig : ?Stripe.StripeConfiguration = null;

  public query func isStripeConfigured() : async Bool {
    stripeConfig != null;
  };

  public shared ({ caller }) func setStripeConfiguration(config : Stripe.StripeConfiguration) : async () {
    if (not isAuthenticatedAdmin(caller)) {
      Runtime.trap("Unauthorized: Only authenticated admins can configure Stripe");
    };
    stripeConfig := ?config;
  };

  func getStripeConfiguration() : Stripe.StripeConfiguration {
    switch (stripeConfig) {
      case (null) { Runtime.trap("Stripe needs to be configured first") };
      case (?value) { value };
    };
  };

  public func getStripeSessionStatus(sessionId : Text) : async Stripe.StripeSessionStatus {
    await Stripe.getSessionStatus(getStripeConfiguration(), sessionId, transform);
  };

  public shared ({ caller }) func createCheckoutSession(items : [Stripe.ShoppingItem], successUrl : Text, cancelUrl : Text) : async Text {
    await Stripe.createCheckoutSession(getStripeConfiguration(), caller, items, successUrl, cancelUrl, transform);
  };

  // Admin-only access - First caller becomes admin
  public shared ({ caller }) func initializeAccessControl() : async () {
    AccessControl.initialize(accessControlState, caller);
    let adminProfile : AdminProfile = {
      id = caller.toText();
      name = "Mantralayam Admin";
      role = #admin;
      adminKey = "default-admin";
      adminPassword = "admin-123";
    };
    adminProfiles.add(caller.toText(), adminProfile);
    adminSessions.add(caller, true);
  };

  // Customer first-time login verification (called from frontend after OTP verification)
  // This is the ONLY function that should create #newLogin notifications
  public shared ({ caller }) func recordCustomerFirstLogin(customerName : Text) : async Bool {
    // Must be authenticated as user
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can record login");
    };

    // Check if this is truly the first login for this customer
    switch (customerFirstLoginTracking.get(caller)) {
      case (?true) {
        // Already logged in before, don't create duplicate notification
        return false;
      };
      case (_) {
        // First time login - record it and create notification
        customerFirstLoginTracking.add(caller, true);

        // Create user profile if it doesn't exist
        switch (userProfiles.get(caller)) {
          case (null) {
            let newProfile : UserProfile = { name = customerName };
            userProfiles.add(caller, newProfile);
          };
          case (?_) {
            // Profile already exists, just update tracking
          };
        };

        // Create admin notification for first-time customer login
        let notification : Notification = {
          id = createNotificationId();
          message = "New customer first-time login: " # customerName # " at " # Time.now().toText();
          timestamp = Time.now();
          notificationType = #newLogin;
          unread = true;
        };
        notifications.add(notification.id, notification);

        return true;
      };
    };
  };

  // Check if customer has logged in before (for session-aware verification)
  // FIXED: Only allow users to check their own login status
  public query ({ caller }) func hasCustomerLoggedInBefore() : async Bool {
    // Must be authenticated as user to check login status
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can check login status");
    };
    
    // Users can only check their own login status
    switch (customerFirstLoginTracking.get(caller)) {
      case (?true) { true };
      case (_) { false };
    };
  };

  public query ({ caller }) func getCallerUserRole() : async AccessControl.UserRole {
    AccessControl.getUserRole(accessControlState, caller);
  };

  public shared ({ caller }) func assignCallerUserRole(user : Principal, role : AccessControl.UserRole) : async () {
    if (not isAuthenticatedAdmin(caller)) {
      Runtime.trap("Unauthorized: Admin authentication required");
    };
    AccessControl.assignRole(accessControlState, caller, user, role);
  };

  public query ({ caller }) func isCallerAdmin() : async Bool {
    AccessControl.isAdmin(accessControlState, caller);
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not isAuthenticatedAdmin(caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Hotel Management - Admin only for modifications
  public shared ({ caller }) func addHotel(hotel : Hotel) : async () {
    if (not isAuthenticatedAdmin(caller)) {
      Runtime.trap("Unauthorized: Only authenticated admins can add hotels");
    };
    hotels.add(hotel.id, hotel);
  };

  public shared ({ caller }) func updateHotel(hotel : Hotel) : async () {
    if (not isAuthenticatedAdmin(caller)) {
      Runtime.trap("Unauthorized: Only authenticated admins can update hotels");
    };
    hotels.add(hotel.id, hotel);
  };

  public shared ({ caller }) func deleteHotel(hotelId : Text) : async () {
    if (not isAuthenticatedAdmin(caller)) {
      Runtime.trap("Unauthorized: Only authenticated admins can delete hotels");
    };
    hotels.remove(hotelId);
  };

  public query ({ caller }) func getHotels() : async [Hotel] {
    if (not isAuthenticatedAdmin(caller)) {
      Runtime.trap("Unauthorized: Only authenticated admins can view all hotels");
    };
    hotels.values().toArray();
  };

  // Public access - Anyone can browse available hotels
  public query func getAvailableHotels() : async [Hotel] {
    hotels.values().toArray();
  };

  // HomeStay Management - Admin only for add/update/delete
  public shared ({ caller }) func addHomeStayWithOptionalPasscode(homeStay : HomeStay, passcode : ?Text) : async () {
    if (not isAuthenticatedAdmin(caller)) {
      Runtime.trap("Unauthorized: Only authenticated admins can add homestays");
    };

    // Validate partner room setup
    if (homeStay.ownerType == #partner) {
      switch (homeStay.partnerId) {
        case (?partnerId) {
          switch (partnerProfiles.get(partnerId)) {
            case (?partnerProfile) {
              let updatedProfile = {
                partnerProfile with
                rooms = partnerProfile.rooms.concat([homeStay.id]);
              };
              partnerProfiles.add(partnerId, updatedProfile);
              // Store passcode if provided
              switch (passcode) {
                case (?p) {
                  // Validate passcode is not empty
                  if (p == "") {
                    Runtime.trap("Passcode cannot be empty");
                  };
                  // Check if passcode already exists
                  switch (roomPasscodes.get(p)) {
                    case (?existingRoomId) {
                      Runtime.trap("Passcode already in use for room: " # existingRoomId);
                    };
                    case (null) {
                      roomPasscodes.add(p, homeStay.id);
                      createNotification("Passcode configured for homestay: " # homeStay.id, #partner);
                    };
                  };
                };
                case (null) {};
              };
            };
            case (null) {
              Runtime.trap("Partner profile not found for partner homestay");
            };
          };
        };
        case (null) {
          Runtime.trap("Partner ID is required for partner homestays");
        };
      };
    };

    homeStays.add(homeStay.id, homeStay);
  };

  public shared ({ caller }) func updateHomeStay(homestay : HomeStay) : async () {
    if (not isAuthenticatedAdmin(caller)) {
      Runtime.trap("Unauthorized: Only authenticated admins can update homestays");
    };
    homeStays.add(homestay.id, homestay);
  };

  public shared ({ caller }) func deleteHomeStay(homestayId : Text) : async () {
    if (not isAuthenticatedAdmin(caller)) {
      Runtime.trap("Unauthorized: Only authenticated admins can delete homestays");
    };

    switch (homeStays.get(homestayId)) {
      case (?homestay) {
        // Remove room from partner profile if it's a partner room
        if (homestay.ownerType == #partner) {
          switch (homestay.partnerId) {
            case (?partnerId) {
              switch (partnerProfiles.get(partnerId)) {
                case (?partnerProfile) {
                  let updatedRooms = partnerProfile.rooms.filter(
                    func(r) { r != homestayId }
                  );
                  let updatedProfile = {
                    partnerProfile with
                    rooms = updatedRooms;
                  };
                  partnerProfiles.add(partnerId, updatedProfile);
                };
                case (null) {};
              };
            };
            case (null) {};
          };
        };
        // Remove associated passcode if exists
        for ((passcode, mappedRoomId) in roomPasscodes.entries()) {
          if (mappedRoomId == homestayId) {
            roomPasscodes.remove(passcode);
          };
        };
      };
      case (null) {};
    };

    homeStays.remove(homestayId);
  };

  // Public access - Anyone can browse available homestays (for Browse HomeStays page)
  public query func getAvailableHomeStays() : async [HomeStay] {
    homeStays.values().toArray().filter(func(homeStay) { homeStay.availability });
  };

  // Public access - Anyone can view homestay details (for booking flow)
  public query func getHomeStayDetails(homeStayId : Text) : async ?HomeStay {
    homeStays.get(homeStayId);
  };

  // Bookings - Admin can view all, users can view their own
  public query ({ caller }) func getAllBookings() : async [Booking] {
    if (not isAuthenticatedAdmin(caller)) {
      Runtime.trap("Unauthorized: Only authenticated admins can view all bookings");
    };
    bookings.values().toArray();
  };

  public query ({ caller }) func getMyBookings() : async [Booking] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view bookings");
    };
    let callerText = caller.toText();
    bookings.values().toArray().filter(func(booking) { booking.userId == callerText });
  };

  // Create booking with simulated payment - creates booking with "Pending Confirmation" status
  public shared ({ caller }) func createBooking(booking : Booking) : async () {
    // Must be authenticated user
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can create bookings");
    };

    // Verify booking is for the caller
    if (booking.userId != caller.toText()) {
      Runtime.trap("Unauthorized: Cannot create booking for another user");
    };

    // Verify room exists and is available
    switch (homeStays.get(booking.roomId)) {
      case (?homeStay) {
        if (not homeStay.availability) {
          Runtime.trap("Room is not available for booking");
        };
      };
      case (null) {
        Runtime.trap("Room not found");
      };
    };

    // Ensure booking status is pendingConfirmation for simulated payment
    let bookingWithStatus = {
      booking with
      status = #pendingConfirmation;
    };

    bookings.add(bookingWithStatus.id, bookingWithStatus);

    // Create admin notification for new booking
    let adminNotification : Notification = {
      id = createNotificationId();
      message = "New booking created: " # bookingWithStatus.id # " by " # booking.customerName # " for room " # booking.roomId;
      timestamp = Time.now();
      notificationType = #booking;
      unread = true;
    };
    notifications.add(adminNotification.id, adminNotification);

    // Create partner notification if room is partner-owned
    switch (homeStays.get(booking.roomId)) {
      case (?homeStay) {
        if (homeStay.ownerType == #partner) {
          switch (homeStay.partnerId) {
            case (?partnerId) {
              createPartnerNotification(partnerId, "New booking for your room: " # booking.roomId # " by " # booking.customerName);
            };
            case (null) {};
          };
        };
      };
      case (null) {};
    };
  };

  // Confirm booking payment (simulated) - only authenticated users can confirm their own bookings
  public shared ({ caller }) func confirmBookingPayment(bookingId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can confirm payments");
    };

    switch (bookings.get(bookingId)) {
      case (?booking) {
        // Verify booking belongs to caller
        if (booking.userId != caller.toText()) {
          Runtime.trap("Unauthorized: Cannot confirm payment for another user's booking");
        };

        // Update booking status to confirmed
        let confirmedBooking = {
          booking with
          status = #confirmed;
        };
        bookings.add(bookingId, confirmedBooking);

        // Create payment confirmation notification
        let paymentNotification : Notification = {
          id = createNotificationId();
          message = "Payment confirmed for booking: " # bookingId # " by " # booking.customerName;
          timestamp = Time.now();
          notificationType = #payment;
          unread = true;
        };
        notifications.add(paymentNotification.id, paymentNotification);

        // Notify partner if applicable
        switch (homeStays.get(booking.roomId)) {
          case (?homeStay) {
            if (homeStay.ownerType == #partner) {
              switch (homeStay.partnerId) {
                case (?partnerId) {
                  createPartnerNotification(partnerId, "Payment confirmed for booking: " # bookingId);
                };
                case (null) {};
              };
            };
          };
          case (null) {};
        };
      };
      case (null) {
        Runtime.trap("Booking not found");
      };
    };
  };

  public shared ({ caller }) func updateBooking(booking : Booking) : async () {
    if (not isAuthenticatedAdmin(caller)) {
      Runtime.trap("Unauthorized: Only authenticated admins can update bookings");
    };
    bookings.add(booking.id, booking);
  };

  public shared ({ caller }) func cancelBooking(bookingId : Text) : async () {
    switch (bookings.get(bookingId)) {
      case (?booking) {
        let isOwner = booking.userId == caller.toText() and AccessControl.hasPermission(accessControlState, caller, #user);
        let isAdmin = isAuthenticatedAdmin(caller);
        if (not (isOwner or isAdmin)) {
          Runtime.trap("Unauthorized: Can only cancel your own bookings");
        };

        // Update booking status to cancelled instead of removing
        let cancelledBooking = {
          booking with
          status = #cancelled;
        };
        bookings.add(bookingId, cancelledBooking);

        // Create cancellation notification
        let cancellationNotification : Notification = {
          id = createNotificationId();
          message = "Booking cancelled: " # bookingId # " by " # booking.customerName;
          timestamp = Time.now();
          notificationType = #booking;
          unread = true;
        };
        notifications.add(cancellationNotification.id, cancellationNotification);

        // Notify partner if applicable
        switch (homeStays.get(booking.roomId)) {
          case (?homeStay) {
            if (homeStay.ownerType == #partner) {
              switch (homeStay.partnerId) {
                case (?partnerId) {
                  createPartnerNotification(partnerId, "Booking cancelled: " # bookingId);
                };
                case (null) {};
              };
            };
          };
          case (null) {};
        };
      };
      case (null) { Runtime.trap("Booking not found") };
    };
  };

  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  // Public access - Anyone can view amenities
  public query func getHotelAmenities(hotelId : Text) : async [Text] {
    switch (hotels.get(hotelId)) {
      case (?hotel) { hotel.amenities };
      case (null) { [] };
    };
  };

  public query func getHomeStayAmenities(homestayId : Text) : async [Text] {
    switch (homeStays.get(homestayId)) {
      case (?homeStay) { homeStay.amenities };
      case (null) { [] };
    };
  };

  public query ({ caller }) func getAdminDashboardData() : async (AdminProfile, [Hotel], [HomeStay], [Booking]) {
    if (not isAuthenticatedAdmin(caller)) {
      Runtime.trap("Unauthorized: Only authenticated admins can access dashboard data");
    };
    switch (adminProfiles.get(caller.toText())) {
      case (?adminProfile) {
        let hotelsArray = hotels.values().toArray();
        let homeStaysArray = homeStays.values().toArray();
        let bookingsArray = bookings.values().toArray();
        (adminProfile, hotelsArray, homeStaysArray, bookingsArray);
      };
      case (null) { Runtime.trap("Admin profile not found") };
    };
  };

  public query ({ caller }) func getNotifications() : async [Notification] {
    if (not isAuthenticatedAdmin(caller)) {
      Runtime.trap("Unauthorized: Only authenticated admins can view notifications");
    };
    notifications.values().toArray();
  };

  public query ({ caller }) func getUnreadNotifications() : async [Notification] {
    if (not isAuthenticatedAdmin(caller)) {
      Runtime.trap("Unauthorized: Only authenticated admins can view notifications");
    };
    notifications.values().toArray().filter(func(n) { n.unread });
  };

  public shared ({ caller }) func markNotificationAsRead(notificationId : Text) : async () {
    if (not isAuthenticatedAdmin(caller)) {
      Runtime.trap("Unauthorized: Only authenticated admins can mark notifications as read");
    };
    switch (notifications.get(notificationId)) {
      case (?notification) {
        let updated = { notification with unread = false };
        notifications.add(notificationId, updated);
      };
      case (null) { Runtime.trap("Notification not found") };
    };
  };

  public shared ({ caller }) func deleteNotification(notificationId : Text) : async () {
    if (not isAuthenticatedAdmin(caller)) {
      Runtime.trap("Unauthorized: Only authenticated admins can delete notifications");
    };
    notifications.remove(notificationId);
  };

  public shared ({ caller }) func authenticateAdmin(key : Text, password : Text) : async Bool {
    var authenticated = false;
    var matchingAdminId : ?Text = null;
    for ((profileId, adminProfile) in adminProfiles.entries()) {
      if (adminProfile.adminKey == key and adminProfile.adminPassword == password) {
        authenticated := true;
        matchingAdminId := ?profileId;
      };
    };
    if (not authenticated) {
      Runtime.trap("Invalid admin key or password");
    };
    adminSessions.add(caller, true);
    let currentRole = AccessControl.getUserRole(accessControlState, caller);
    if (currentRole != #admin) {
      Runtime.trap("Admin role not properly configured. Please contact system administrator.");
    };
    authenticated;
  };

  public shared ({ caller }) func logoutAdmin() : async () {
    adminSessions.remove(caller);
  };

  public shared ({ caller }) func updateAdminCredentials(newKey : Text, newPassword : Text) : async () {
    if (not isAuthenticatedAdmin(caller)) {
      Runtime.trap("Unauthorized: Only authenticated admins can update credentials");
    };
    switch (adminProfiles.get(caller.toText())) {
      case (?adminProfile) {
        let updatedProfile = {
          adminProfile with
          adminKey = newKey;
          adminPassword = newPassword;
        };
        adminProfiles.add(caller.toText(), updatedProfile);
      };
      case (null) { Runtime.trap("Admin profile not found") };
    };
  };

  public query ({ caller }) func checkAdminAuthentication() : async Bool {
    isAuthenticatedAdmin(caller);
  };

  // Guest Profile Management
  public shared ({ caller }) func createGuestProfile(profile : GuestProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can create guest profiles");
    };
    if (profile.id != caller.toText()) {
      Runtime.trap("Unauthorized: Cannot create profile for another user");
    };
    guestProfiles.add(profile.id, profile);
    let notification : Notification = {
      id = createNotificationId();
      message = "Guest profile created: " # profile.name;
      timestamp = Time.now();
      notificationType = #profileUpdate;
      unread = true;
    };
    notifications.add(notification.id, notification);
  };

  public query ({ caller }) func getGuestProfile(guestId : Text) : async ?GuestProfile {
    let isOwner = guestId == caller.toText() and AccessControl.hasPermission(accessControlState, caller, #user);
    let isAdmin = isAuthenticatedAdmin(caller);
    if (not (isOwner or isAdmin)) {
      Runtime.trap("Unauthorized: Can only view your own guest profile");
    };
    guestProfiles.get(guestId);
  };

  public shared ({ caller }) func updateGuestProfile(profile : GuestProfile) : async () {
    let isOwner = profile.id == caller.toText() and AccessControl.hasPermission(accessControlState, caller, #user);
    let isAdmin = isAuthenticatedAdmin(caller);
    if (not (isOwner or isAdmin)) {
      Runtime.trap("Unauthorized: Can only update your own guest profile");
    };
    guestProfiles.add(profile.id, profile);
    let notification : Notification = {
      id = createNotificationId();
      message = "Guest profile updated: " # profile.name;
      timestamp = Time.now();
      notificationType = #profileUpdate;
      unread = true;
    };
    notifications.add(notification.id, notification);
  };

  // Partner (Landlord) Interface Functions with Passcode Authentication
  public shared ({ caller }) func registerPartnerProfile(profile : PartnerProfile) : async () {
    if (not isAuthenticatedAdmin(caller)) {
      Runtime.trap("Unauthorized: Only authenticated admins can register partner profiles");
    };
    partnerProfiles.add(profile.id, profile);
    createNotification("New partner registered: " # profile.name, #partner);
  };

  public shared ({ caller }) func authenticatePartnerWithPasscode(passcode : Text) : async Text {
    // Validate passcode is not empty
    if (passcode == "") {
      Runtime.trap("Invalid passcode: Passcode cannot be empty");
    };

    switch (roomPasscodes.get(passcode)) {
      case (?roomId) {
        switch (homeStays.get(roomId)) {
          case (?homeStay) {
            if (homeStay.ownerType != #partner) {
              Runtime.trap("Invalid passcode: Room is not a partner room");
            };

            switch (homeStay.partnerId) {
              case (?partnerId) {
                // Verify partner profile exists
                switch (partnerProfiles.get(partnerId)) {
                  case (?partnerProfile) {
                    // Verify room is in partner's room list
                    let ownsRoom = partnerProfile.rooms.find(func(r) { r == roomId });
                    switch (ownsRoom) {
                      case (?_) {
                        // Authentication successful
                        partnerSessions.add(caller, true);
                        partnerAuthenticatedRooms.add(caller, roomId);
                        partnerPrincipalToId.add(caller, partnerId);

                        createPartnerNotification(partnerId, "Partner authenticated for room: " # roomId);
                        roomId;
                      };
                      case (null) {
                        Runtime.trap("Invalid passcode: Room not assigned to this partner");
                      };
                    };
                  };
                  case (null) {
                    Runtime.trap("Invalid passcode: Partner profile not found");
                  };
                };
              };
              case (null) {
                Runtime.trap("Invalid passcode: Room has no partner assigned");
              };
            };
          };
          case (null) {
            Runtime.trap("Invalid passcode: Room not found");
          };
        };
      };
      case (null) {
        Runtime.trap("Invalid passcode");
      };
    };
  };

  public query ({ caller }) func checkPartnerAuthentication() : async Bool {
    isAuthenticatedPartner(caller);
  };

  public query ({ caller }) func getPartnerAuthenticatedRoomId() : async ?Text {
    if (not isAuthenticatedPartner(caller)) {
      Runtime.trap("Unauthorized: Partner not authenticated");
    };
    getPartnerAuthenticatedRoom(caller);
  };

  public shared ({ caller }) func logoutPartner() : async () {
    switch (getPartnerIdForCaller(caller)) {
      case (?partnerId) {
        createPartnerNotification(partnerId, "Partner logged out");
      };
      case (null) {};
    };
    partnerSessions.remove(caller);
    partnerPrincipalToId.remove(caller);
    partnerAuthenticatedRooms.remove(caller);
  };

  public query ({ caller }) func getPartnerProfile(partnerId : Text) : async ?PartnerProfile {
    let isOwner = isAuthenticatedPartner(caller);
    let isAdmin = isAuthenticatedAdmin(caller);

    if (not (isOwner or isAdmin)) {
      Runtime.trap("Unauthorized: Partner authentication required");
    };

    if (isOwner and not isAdmin) {
      switch (getPartnerIdForCaller(caller)) {
        case (?callerPartnerId) {
          if (callerPartnerId != partnerId) {
            Runtime.trap("Unauthorized: Can only view your own partner profile");
          };
        };
        case (null) {
          Runtime.trap("Unauthorized: Partner authentication error");
        };
      };
    };

    partnerProfiles.get(partnerId);
  };

  public query ({ caller }) func getPartnerRooms(partnerId : Text) : async [HomeStay] {
    let isOwner = isAuthenticatedPartner(caller);
    let isAdmin = isAuthenticatedAdmin(caller);

    if (not (isOwner or isAdmin)) {
      Runtime.trap("Unauthorized: Partner authentication required");
    };

    if (isOwner and not isAdmin) {
      switch (getPartnerIdForCaller(caller)) {
        case (?callerPartnerId) {
          if (callerPartnerId != partnerId) {
            Runtime.trap("Unauthorized: Can only view your own partner rooms");
          };
        };
        case (null) {
          Runtime.trap("Unauthorized: Partner authentication error");
        };
      };
    };

    switch (partnerProfiles.get(partnerId)) {
      case (?partnerProfile) {
        homeStays.values().toArray().filter(
          func(homeStay) {
            homeStay.partnerId == ?partnerId and homeStay.ownerType == #partner
          }
        );
      };
      case (null) { [] };
    };
  };

  public shared ({ caller }) func updatePartnerRoomDetails(update : PartnerRoomUpdate) : async () {
    if (not isAuthenticatedPartner(caller)) {
      Runtime.trap("Unauthorized: Only authenticated partners can update room details");
    };

    // Validate partner can only update their authenticated room
    validatePartnerRoomAccess(caller, update.roomId);

    switch (getPartnerIdForCaller(caller)) {
      case (?partnerId) {
        // Verify partner owns the room
        validatePartnerOwnsRoom(partnerId, update.roomId);

        switch (homeStays.get(update.roomId)) {
          case (?homeStay) {
            // Double-check room's partnerId matches
            switch (homeStay.partnerId) {
              case (?roomPartnerId) {
                if (roomPartnerId != partnerId) {
                  Runtime.trap("Unauthorized: Cannot update another partner's room");
                };
              };
              case (null) {
                Runtime.trap("Room has no partner assigned");
              };
            };

            // Only allow updating price and availability
            let updatedHomeStay = {
              homeStay with
              price = update.price;
              availability = update.availability;
            };
            homeStays.add(update.roomId, updatedHomeStay);

            createPartnerNotification(partnerId, "Room details updated: " # update.roomId);
          };
          case (null) {
            Runtime.trap("Room not found");
          };
        };
      };
      case (null) {
        Runtime.trap("Partner authentication error");
      };
    };
  };

  public shared ({ caller }) func updatePartnerProfile(profile : PartnerProfile) : async () {
    if (not isAuthenticatedPartner(caller)) {
      Runtime.trap("Unauthorized: Only authenticated partners can update their profile");
    };

    switch (getPartnerIdForCaller(caller)) {
      case (?authenticatedPartnerId) {
        if (profile.id != authenticatedPartnerId) {
          Runtime.trap("Unauthorized: Cannot update another partner's profile");
        };

        switch (partnerProfiles.get(authenticatedPartnerId)) {
          case (?existingProfile) {
            // Preserve critical fields that partners cannot modify
            let updatedProfile = {
              profile with
              rooms = existingProfile.rooms;
              registrationDate = existingProfile.registrationDate;
            };
            partnerProfiles.add(profile.id, updatedProfile);
            createPartnerNotification(profile.id, "Partner profile updated: " # profile.name);
          };
          case (null) {
            Runtime.trap("Partner profile not found");
          };
        };
      };
      case (null) {
        Runtime.trap("Partner authentication error");
      };
    };
  };

  public query ({ caller }) func getPartnerNotifications(partnerId : Text) : async [Notification] {
    let isOwner = isAuthenticatedPartner(caller);
    let isAdmin = isAuthenticatedAdmin(caller);

    if (not (isOwner or isAdmin)) {
      Runtime.trap("Unauthorized: Can only view your own notifications");
    };

    if (isOwner and not isAdmin) {
      switch (getPartnerIdForCaller(caller)) {
        case (?callerPartnerId) {
          if (callerPartnerId != partnerId) {
            Runtime.trap("Unauthorized: Can only view your own notifications");
          };
        };
        case (null) {
          Runtime.trap("Unauthorized: Partner authentication error");
        };
      };
    };

    notifications.values().toArray().filter(
      func(n) {
        n.notificationType == #partner and n.message.contains(#text partnerId)
      }
    );
  };

  public query ({ caller }) func getAllPartnerProfiles() : async [PartnerProfile] {
    if (not isAuthenticatedAdmin(caller)) {
      Runtime.trap("Unauthorized: Only authenticated admins can view all partner profiles");
    };
    partnerProfiles.values().toArray();
  };

  public shared ({ caller }) func deletePartnerProfile(partnerId : Text) : async () {
    if (not isAuthenticatedAdmin(caller)) {
      Runtime.trap("Unauthorized: Only authenticated admins can delete partner profiles");
    };
    switch (partnerProfiles.get(partnerId)) {
      case (?partnerProfile) {
        // Delete all rooms owned by this partner
        for (roomId in partnerProfile.rooms.vals()) {
          homeStays.remove(roomId);
          // Remove associated passcodes
          for ((passcode, mappedRoomId) in roomPasscodes.entries()) {
            if (mappedRoomId == roomId) {
              roomPasscodes.remove(passcode);
            };
          };
        };
      };
      case (null) {};
    };
    partnerProfiles.remove(partnerId);
    createNotification("Partner profile deleted: " # partnerId, #partner);
  };

  // Admin Passcode Management
  public shared ({ caller }) func setRoomPasscode(roomId : Text, passcode : Text) : async () {
    if (not isAuthenticatedAdmin(caller)) {
      Runtime.trap("Unauthorized: Only authenticated admins can set room passcodes");
    };

    // Validate passcode is not empty
    if (passcode == "") {
      Runtime.trap("Passcode cannot be empty");
    };

    switch (homeStays.get(roomId)) {
      case (?homestay) {
        if (homestay.ownerType != #partner) {
          Runtime.trap("Can only set passcodes for partner rooms");
        };

        switch (homestay.partnerId) {
          case (?partnerId) {
            switch (partnerProfiles.get(partnerId)) {
              case (?_) {
                // Check if passcode already exists for a different room
                switch (roomPasscodes.get(passcode)) {
                  case (?existingRoomId) {
                    if (existingRoomId != roomId) {
                      Runtime.trap("Passcode already in use for room: " # existingRoomId);
                    };
                  };
                  case (null) {};
                };

                // Remove old passcode for this room if exists
                for ((oldPasscode, mappedRoomId) in roomPasscodes.entries()) {
                  if (mappedRoomId == roomId and oldPasscode != passcode) {
                    roomPasscodes.remove(oldPasscode);
                  };
                };

                roomPasscodes.add(passcode, roomId);
                createNotification("Passcode configured for room: " # roomId, #partner);
              };
              case (null) {
                Runtime.trap("Partner profile not found for this room");
              };
            };
          };
          case (null) {
            Runtime.trap("Room has no partner assigned");
          };
        };
      };
      case (null) {
        Runtime.trap("Room not found");
      };
    };
  };

  public shared ({ caller }) func removeRoomPasscode(passcode : Text) : async () {
    if (not isAuthenticatedAdmin(caller)) {
      Runtime.trap("Unauthorized: Only authenticated admins can remove room passcodes");
    };
    roomPasscodes.remove(passcode);
    createNotification("Passcode removed", #partner);
  };

  public query ({ caller }) func getAllRoomPasscodes() : async [RoomPasscodeConfig] {
    if (not isAuthenticatedAdmin(caller)) {
      Runtime.trap("Unauthorized: Only authenticated admins can view room passcodes");
    };
    roomPasscodes.entries().toArray().map(
      func((passcode, roomId)) : RoomPasscodeConfig {
        { roomId; passcode };
      }
    );
  };

  public query ({ caller }) func getRoomPasscode(roomId : Text) : async ?Text {
    if (not isAuthenticatedAdmin(caller)) {
      Runtime.trap("Unauthorized: Only authenticated admins can view room passcodes");
    };
    for ((passcode, mappedRoomId) in roomPasscodes.entries()) {
      if (mappedRoomId == roomId) {
        return ?passcode;
      };
    };
    null;
  };

  func createNotification(message : Text, notificationType : { #booking; #payment; #profileUpdate; #partner; #newLogin }) {
    let notification : Notification = {
      id = createNotificationId();
      message;
      timestamp = Time.now();
      notificationType;
      unread = true;
    };
    notifications.add(notification.id, notification);
  };

  func createPartnerNotification(partnerId : Text, message : Text) {
    let notification : Notification = {
      id = createNotificationId();
      message = message # " (Partner: " # partnerId # ")";
      timestamp = Time.now();
      notificationType = #partner;
      unread = true;
    };
    notifications.add(notification.id, notification);
  };

  func createNotificationId() : Text {
    "notification_" # Time.now().toText();
  };
};
