/**
 * HealthCard Service Type Definitions
 * This file contains all types related to the HealthCard service.
 */

// Health Card Types
export type HealthCardStatus = 'Active' | 'Expired' | 'Revoked' | 'Pending';

/**
 * HealthCard Interface
 * Represents a digital health card
 */
export interface HealthCard {
  _id: string;
  formId: string;
  cardUrl: string;
  issuedAt: number;
  expiresAt: number;
  verificationToken: string;
  status?: HealthCardStatus;
  createdAt?: number;
  updatedAt?: number;
}

/**
 * HealthCard Data Interface
 * Extended health card data with form information
 */
export interface HealthCardData {
  _id: string;
  formId: string;
  cardUrl?: string;
  issuedAt?: number;
  expiresAt?: number;
  verificationToken?: string;
  status?: HealthCardStatus;
  form?: {
    _id: string;
    applicationType: 'New' | 'Renew';
    position: string;
    organization: string;
    status: 'Submitted' | 'Under Review' | 'Approved' | 'Rejected';
    jobCategory?: {
      _id: string;
      name: string;
      colorCode: string;
      requireOrientation: boolean;
    };
  } | null;
  user?: {
    _id: string;
    fullname: string;
    image: string;
    email: string;
  } | null;
}

/**
 * HealthCard Create Data
 * Used when issuing a new health card
 */
export interface HealthCardCreateData {
  formId: string;
  cardUrl: string;
  issuedAt: number;
  expiresAt: number;
  verificationToken: string;
}

/**
 * HealthCard Update Data
 * Used when updating a health card
 */
export interface HealthCardUpdateData {
  cardUrl?: string;
  expiresAt?: number;
  status?: HealthCardStatus;
}

/**
 * Verification Log Interface
 * Represents a health card verification attempt
 */
export interface VerificationLog {
  _id: string;
  healthCardId: string;
  scannedAt: number;
  userAgent?: string;
  ipAddress?: string;
  status: 'Success' | 'Failed';
  location?: string;
  verifiedBy?: string; // User ID of verifier
}

/**
 * HealthCard Verification Result
 * Result of verifying a health card
 */
export interface VerificationResult {
  isValid: boolean;
  healthCard?: HealthCardData;
  error?: string;
  expirationStatus: 'valid' | 'expired' | 'expiring_soon';
  daysUntilExpiration?: number;
}

/**
 * HealthCard Service Interface
 * Defines methods for working with health cards
 */
export interface HealthCardService {
  issueHealthCard(data: HealthCardCreateData): Promise<HealthCard>;
  updateHealthCard(cardId: string, data: HealthCardUpdateData): Promise<HealthCard>;
  getHealthCardById(cardId: string): Promise<HealthCard | null>;
  getHealthCardByFormId(formId: string): Promise<HealthCard | null>;
  getHealthCardByToken(token: string): Promise<HealthCard | null>;
  getUserHealthCards(userId: string): Promise<HealthCardData[]>;
  verifyHealthCard(token: string): Promise<VerificationResult>;
  logVerificationAttempt(data: Omit<VerificationLog, '_id'>): Promise<VerificationLog>;
  getVerificationLogs(cardId: string): Promise<VerificationLog[]>;
}
