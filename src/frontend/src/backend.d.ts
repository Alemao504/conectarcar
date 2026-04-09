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
export interface Trip {
    id: string;
    startTime: Time;
    status: TripStatus;
    passenger: Principal;
    paidMinutes: bigint;
    totalPaid: bigint;
    freeMinutesUsed: bigint;
    driver: Principal;
}
export type Time = bigint;
export interface Payment {
    id: string;
    status: PaymentStatus;
    passenger: Principal;
    paymentMethod: PaymentMethod;
    minutes: bigint;
    amount: bigint;
    driver: Principal;
}
export interface AdminStats {
    totalBanned: bigint;
    totalPassengers: bigint;
    totalDrivers: bigint;
    totalAdvertisers: bigint;
    activeSubscriptions: bigint;
}
export interface PendingTimeRequest {
    passenger: Principal;
    driver: Principal;
    requestedMinutes: bigint;
}
export interface AdRequest {
    id: string;
    contactLink: string;
    video: ExternalBlob;
    city: string;
    createdAt: Time;
    advertiser: Principal;
}
export interface UserProfile {
    id: Principal;
    cpf?: string;
    carModel?: string;
    adsLink?: string;
    city: string;
    subscriptionExpiry: bigint;
    name: string;
    createdAt: Time;
    role: UserRole;
    subscriptionPlan: string;
    state: string;
    deviceId: string;
    maxMinutesPerTrip?: bigint;
    isBanned: boolean;
    paymentLink?: string;
    totalEarnings?: bigint;
    minuteRate?: bigint;
    carPlate?: string;
    freeMinutes?: bigint;
    avatar?: ExternalBlob;
    qrCode?: string;
}
export interface Ad {
    id: string;
    contactLink: string;
    video: ExternalBlob;
    city: string;
    createdAt: Time;
    viewCount: bigint;
    approved: boolean;
    advertiser: Principal;
}
export enum PaymentMethod {
    pix = "pix",
    cash = "cash"
}
export enum PaymentStatus {
    pending = "pending",
    confirmed = "confirmed"
}
export enum TripStatus {
    requested = "requested",
    completed = "completed",
    inProgress = "inProgress"
}
export enum UserRole {
    passenger = "passenger",
    admin = "admin",
    advertiser = "advertiser",
    driver = "driver"
}
export enum UserRole__1 {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    adminBanUser(userId: Principal): Promise<boolean>;
    adminDeleteUser(userId: Principal): Promise<boolean>;
    adminGetAllProfiles(): Promise<Array<UserProfile>>;
    adminGetStats(): Promise<AdminStats>;
    adminSaveUserDeviceId(deviceId: string): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole__1): Promise<void>;
    getAdvertiserMonthlyViews(): Promise<bigint>;
    getAdvertisersByCity(city: string): Promise<Array<UserProfile>>;
    getAllAdRequests(): Promise<Array<AdRequest>>;
    getAllAds(): Promise<Array<Ad>>;
    getAllAdvertisers(): Promise<Array<UserProfile>>;
    getAllDriverProfiles(): Promise<Array<UserProfile>>;
    getAllPayments(): Promise<Array<Payment>>;
    getAllProfiles(): Promise<Array<UserProfile>>;
    getAllSessions(): Promise<Array<Trip>>;
    getApprovedAdsForCity(city: string): Promise<Array<Ad>>;
    getAvailableDriversByCity(city: string): Promise<Array<UserProfile>>;
    getAvailablePassengersByCity(city: string): Promise<Array<UserProfile>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole__1>;
    getConfirmedDriversByCity(city: string): Promise<Array<UserProfile>>;
    getDriverMonthlyEarnings(): Promise<bigint>;
    getDriverProfile(driver: Principal): Promise<UserProfile>;
    getPaymentStatus(sessionId: string): Promise<Payment>;
    getPendingTimeRequestsForDriverProfile(driver: Principal): Promise<Array<PendingTimeRequest>>;
    getRideHistory(passenger: Principal): Promise<Array<Trip>>;
    getSessionsForDriverProfile(driver: Principal): Promise<Array<Trip>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getVerifiedDriversByCity(city: string): Promise<Array<UserProfile>>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
}
