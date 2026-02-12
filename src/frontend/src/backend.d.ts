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
export type Time = bigint;
export interface Artwork {
    id: string;
    title: string;
    imageType: string;
    owner: Principal;
    createdAt: Time;
    description: string;
    isSold: boolean;
    image: ExternalBlob;
    price: bigint;
}
export interface UserProfile {
    name: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createArtwork(artwork: {
        id: string;
        title: string;
        imageType: string;
        description: string;
        image: ExternalBlob;
        price: bigint;
    }): Promise<void>;
    deleteArtwork(id: string): Promise<void>;
    getArtwork(id: string): Promise<Artwork | null>;
    getArtworksByUser(user: Principal): Promise<Array<[string, Artwork]>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isAdmin(): Promise<boolean>;
    isCallerAdmin(): Promise<boolean>;
    listArtworks(): Promise<Array<[string, Artwork]>>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setArtworkSoldStatus(artworkId: string, isSold: boolean): Promise<void>;
    transferArtwork(artworkId: string, recipient: Principal): Promise<void>;
    updateArtwork(id: string, updatedArtwork: {
        title: string;
        imageType: string;
        description: string;
        image: ExternalBlob;
        price: bigint;
    }): Promise<void>;
}
