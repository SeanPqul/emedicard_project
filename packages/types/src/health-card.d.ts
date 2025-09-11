/**
 * Health Card Domain Types
 *
 * Type definitions for health card entities and operations
 */
import { GenericId, BaseEntity, Timestamp } from './base';
export type HealthCardStatus = 'Active' | 'Expired' | 'Suspended' | 'Revoked';
export interface HealthCard extends BaseEntity {
    _id: GenericId<"healthCards">;
    formId: GenericId<"forms">;
    cardUrl: string;
    issuedAt: Timestamp;
    expiresAt: Timestamp;
    verificationToken: string;
    status: HealthCardStatus;
    cardNumber?: string;
    qrCode?: string;
    digitalSignature?: string;
}
export interface HealthCardData extends BaseEntity {
    _id: GenericId<"healthCards">;
    form: {
        _id: GenericId<"forms">;
        applicationType: 'New' | 'Renew';
        position: string;
        organization: string;
        status: 'Submitted' | 'For Document Verification' | 'For Payment Validation' | 'For Orientation' | 'Approved' | 'Rejected';
    } | null;
    cardUrl?: string;
    issuedAt?: Timestamp;
    expiresAt?: Timestamp;
    verificationToken?: string;
    status: HealthCardStatus;
    cardNumber?: string;
    qrCode?: string;
}
export interface HealthCardVerification extends BaseEntity {
    _id: GenericId<"verificationLogs">;
    healthCardId: GenericId<"healthCards">;
    scannedBy?: GenericId<"users">;
    location?: string;
    notes?: string;
    verifiedAt: Timestamp;
    isValid: boolean;
    verificationMethod: 'qr' | 'manual' | 'nfc';
    deviceInfo?: {
        platform: string;
        appVersion: string;
        location?: {
            latitude: number;
            longitude: number;
        };
    };
}
export interface VerificationResult {
    isValid: boolean;
    healthCard?: HealthCardData;
    errors: string[];
    warnings: string[];
    verificationId?: string;
    verifiedAt: Timestamp;
}
export interface IssueHealthCardInput {
    formId: GenericId<'forms'>;
    cardUrl: string;
    issuedAt: Timestamp;
    expiresAt: Timestamp;
    verificationToken: string;
    cardNumber?: string;
}
export interface UpdateHealthCardInput {
    healthCardId: GenericId<'healthCards'>;
    status?: HealthCardStatus;
    expiresAt?: Timestamp;
    notes?: string;
}
export interface CreateVerificationLogInput {
    healthCardId: GenericId<'healthCards'>;
    scannedBy?: GenericId<'users'>;
    location?: string;
    notes?: string;
    verificationMethod?: 'qr' | 'manual' | 'nfc';
    deviceInfo?: {
        platform: string;
        appVersion: string;
        location?: {
            latitude: number;
            longitude: number;
        };
    };
}
export interface HealthCardTemplate {
    id: string;
    name: string;
    version: string;
    layout: {
        width: number;
        height: number;
        dpi: number;
    };
    fields: Array<{
        name: string;
        type: 'text' | 'image' | 'qr' | 'barcode';
        position: {
            x: number;
            y: number;
            width: number;
            height: number;
        };
        style?: Record<string, any>;
    }>;
    styles: Record<string, any>;
    isActive: boolean;
    createdAt: Timestamp;
    updatedAt: Timestamp;
}
export interface HealthCardRenewal {
    id: string;
    originalCardId: GenericId<"healthCards">;
    newApplicationId: GenericId<"forms">;
    renewalReason: 'expiration' | 'lost' | 'damaged' | 'update';
    requestedAt: Timestamp;
    processedAt?: Timestamp;
    status: 'pending' | 'approved' | 'rejected';
    notes?: string;
}
export interface HealthCardAnalytics {
    totalIssued: number;
    totalActive: number;
    totalExpired: number;
    totalRevoked: number;
    verificationCount: number;
    averageValidityPeriod: number;
    renewalRate: number;
    issuesByMonth: Array<{
        month: string;
        count: number;
    }>;
    verificationsByLocation: Array<{
        location: string;
        count: number;
    }>;
}
//# sourceMappingURL=health-card.d.ts.map