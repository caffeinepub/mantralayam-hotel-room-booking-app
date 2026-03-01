import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface RoomPasscodeConfig {
    passcode: string;
    roomId: string;
}
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export type Time = bigint;
export interface PartnerRoomUpdate {
    availability: boolean;
    roomId: string;
    price: bigint;
}
export interface HomeStay {
    id: string;
    photoUrls: Array<string>;
    ownerMessage: string;
    ownerType: Variant_admin_partner;
    partnerName: string;
    hotelId: string;
    ratings: Array<bigint>;
    description: string;
    amenities: Array<string>;
    googleMapsLink?: string;
    videoUrls: Array<string>;
    partnerId?: string;
    availability: boolean;
    price: bigint;
    roomType: RoomType;
    distanceFromTemple?: bigint;
    photos: Array<ExternalBlob>;
    partnerPhoneNumber: string;
}
export interface http_header {
    value: string;
    name: string;
}
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface TempleSpecial {
    id: string;
    date: string;
    name: string;
    description: string;
    image: ExternalBlob;
    price: bigint;
}
export interface ShoppingItem {
    productName: string;
    currency: string;
    quantity: bigint;
    priceInCents: bigint;
    productDescription: string;
}
export interface AdminProfile {
    id: string;
    adminKey: string;
    name: string;
    role: UserRole;
    adminPassword: string;
}
export interface Hotel {
    id: string;
    name: string;
    description: string;
    amenities: Array<string>;
    address: string;
    photos: Array<ExternalBlob>;
}
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export interface Notification {
    id: string;
    notificationType: Variant_profileUpdate_booking_newLogin_partner_payment;
    unread: boolean;
    message: string;
    timestamp: Time;
}
export interface GuestProfile {
    id: string;
    contact: string;
    name: string;
    bookingHistory: Array<string>;
}
export interface PartnerProfile {
    id: string;
    contact: string;
    password: string;
    name: string;
    registrationDate: Time;
    rooms: Array<string>;
}
export type StripeSessionStatus = {
    __kind__: "completed";
    completed: {
        userPrincipal?: string;
        response: string;
    };
} | {
    __kind__: "failed";
    failed: {
        error: string;
    };
};
export interface StripeConfiguration {
    allowedCountries: Array<string>;
    secretKey: string;
}
export interface Booking {
    id: string;
    customerName: string;
    status: BookingStatus;
    userId: string;
    hotelId: string;
    checkInDate: Time;
    guestInfo: GuestProfile;
    bookingDate: Time;
    checkOutDate: Time;
    roomId: string;
    totalPrice: bigint;
}
export interface UserProfile {
    name: string;
}
export enum BookingStatus {
    cancelled = "cancelled",
    confirmed = "confirmed",
    pendingConfirmation = "pendingConfirmation"
}
export enum RoomType {
    double_ = "double",
    suite = "suite",
    single = "single"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export enum Variant_admin_partner {
    admin = "admin",
    partner = "partner"
}
export enum Variant_profileUpdate_booking_newLogin_partner_payment {
    profileUpdate = "profileUpdate",
    booking = "booking",
    newLogin = "newLogin",
    partner = "partner",
    payment = "payment"
}
export interface backendInterface {
    addHomeStayWithOptionalPasscode(homeStay: HomeStay, passcode: string | null): Promise<void>;
    addHotel(hotel: Hotel): Promise<void>;
    addTempleSpecial(special: TempleSpecial): Promise<void>;
    adminUpdatePartnerProfile(profile: PartnerProfile): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    authenticateAdmin(key: string, password: string): Promise<boolean>;
    authenticatePartnerWithPassword(password: string): Promise<boolean>;
    cancelBooking(bookingId: string): Promise<void>;
    checkAdminAuthentication(): Promise<boolean>;
    checkPartnerAuthentication(): Promise<boolean>;
    confirmBookingPayment(bookingId: string): Promise<void>;
    createBooking(booking: Booking): Promise<void>;
    createCheckoutSession(items: Array<ShoppingItem>, successUrl: string, cancelUrl: string): Promise<string>;
    createGuestProfile(profile: GuestProfile): Promise<void>;
    deleteHomeStay(homestayId: string): Promise<void>;
    deleteHotel(hotelId: string): Promise<void>;
    deleteNotification(notificationId: string): Promise<void>;
    deletePartnerProfile(partnerId: string): Promise<void>;
    getAdminDashboardData(): Promise<[AdminProfile, Array<Hotel>, Array<HomeStay>, Array<Booking>]>;
    getAllBookings(): Promise<Array<Booking>>;
    getAllPartnerProfiles(): Promise<Array<PartnerProfile>>;
    getAllRoomPasscodes(): Promise<Array<RoomPasscodeConfig>>;
    getAuthenticatedPartnerId(): Promise<string | null>;
    getAvailableHomeStays(): Promise<Array<HomeStay>>;
    getAvailableHotels(): Promise<Array<Hotel>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getGuestProfile(guestId: string): Promise<GuestProfile | null>;
    getHomeStayAmenities(homestayId: string): Promise<Array<string>>;
    getHomeStayDetails(homeStayId: string): Promise<HomeStay | null>;
    getHotelAmenities(hotelId: string): Promise<Array<string>>;
    getHotels(): Promise<Array<Hotel>>;
    getMyBookings(): Promise<Array<Booking>>;
    getNotifications(): Promise<Array<Notification>>;
    getPartnerNotifications(partnerId: string): Promise<Array<Notification>>;
    getPartnerProfile(partnerId: string): Promise<PartnerProfile | null>;
    getPartnerRooms(partnerId: string): Promise<Array<HomeStay>>;
    getRoomPasscode(roomId: string): Promise<string | null>;
    getStripeSessionStatus(sessionId: string): Promise<StripeSessionStatus>;
    getTempleSpecials(): Promise<Array<TempleSpecial>>;
    getUnreadNotifications(): Promise<Array<Notification>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    hasCustomerLoggedInBefore(): Promise<boolean>;
    initializeAccessControl(): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    isStripeConfigured(): Promise<boolean>;
    logoutAdmin(): Promise<void>;
    logoutPartner(): Promise<void>;
    markNotificationAsRead(notificationId: string): Promise<void>;
    recordCustomerFirstLogin(customerName: string): Promise<boolean>;
    registerPartnerProfile(profile: PartnerProfile): Promise<void>;
    removeRoomPasscode(passcode: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setRoomPasscode(roomId: string, passcode: string): Promise<void>;
    setStripeConfiguration(config: StripeConfiguration): Promise<void>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
    updateAdminCredentials(newKey: string, newPassword: string): Promise<void>;
    updateBooking(booking: Booking): Promise<void>;
    updateGuestProfile(profile: GuestProfile): Promise<void>;
    updateHomeStay(homestay: HomeStay): Promise<void>;
    updateHotel(hotel: Hotel): Promise<void>;
    updatePartnerProfile(profile: PartnerProfile): Promise<void>;
    updatePartnerRoomDetails(update: PartnerRoomUpdate): Promise<void>;
}
