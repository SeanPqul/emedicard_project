/**
 * Health Card Domain Types
 * 
 * Type definitions for health card entities and operations
 */

import { Id } from 'backend/convex/_generated/dataModel';

// ===== HEALTH CARD STATUS TYPES =====
export type HealthCardStatus = 'Active' | 'Expired' | 'Suspended' | 'Revoked';

// ===== HEALTH CARD ENTITY TYPES =====
export interface HealthCard {
  _id: Id<"healthCards">;
  formId: Id<"applications">;
  cardUrl: string;
  issuedAt: number;
  expiresAt: number;
  verificationToken: string;
  status: HealthCardStatus;
  cardNumber?: string;
  qrCode?: string;
  digitalSignature?: string;
  createdAt?: number;
  updatedAt?: number;
}

export interface HealthCardData {
  _id: Id<"healthCards">;
  form: {
    _id: Id<"applications">;
    applicationType: 'New' | 'Renew';
    position: string;
    organization: string;
    status: 'Submitted' | 'Under Review' | 'Approved' | 'Rejected';
  } | null;
  cardUrl?: string;
  issuedAt?: number;
  expiresAt?: number;
  verificationToken?: string;
  status: HealthCardStatus;
  cardNumber?: string;
  qrCode?: string;
}

// ===== HEALTH CARD VERIFICATION TYPES =====
export interface HealthCardVerification {
  _id: Id<"verificationLogs">;
  healthCardId: Id<"healthCards">;
  scannedBy?: Id<"users">;
  location?: string;
  notes?: string;
  verifiedAt: number;
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
  verifiedAt: number;
}

// ===== HEALTH CARD OPERATION TYPES =====
export interface IssueHealthCardInput {
  formId: Id<'applications'>;
  cardUrl: string;
  issuedAt: number;
  expiresAt: number;
  verificationToken: string;
  cardNumber?: string;
}

export interface UpdateHealthCardInput {
  healthCardId: Id<'healthCards'>;
  status?: HealthCardStatus;
  expiresAt?: number;
  notes?: string;
}

export interface CreateVerificationLogInput {
  healthCardId: Id<'healthCards'>;
  scannedBy?: Id<'users'>;
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

// ===== HEALTH CARD TEMPLATE TYPES =====
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
  createdAt: number;
  updatedAt: number;
}

// ===== HEALTH CARD RENEWAL TYPES =====
export interface HealthCardRenewal {
  id: string;
  originalCardId: Id<"healthCards">;
  newApplicationId: Id<"applications">;
  renewalReason: 'expiration' | 'lost' | 'damaged' | 'update';
  requestedAt: number;
  processedAt?: number;
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
}

// ===== HEALTH CARD ANALYTICS TYPES =====
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