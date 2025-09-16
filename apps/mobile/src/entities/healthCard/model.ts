import { Id } from '../../../../../backend/convex/_generated/dataModel';

/**
 * Health Card Entity - Domain Model
 * Contains all health card-related types, interfaces, and business logic
 */

// ===== CORE HEALTH CARD TYPES =====

export type HealthCardStatus = 'Active' | 'Expired' | 'Suspended' | 'Revoked';

export interface HealthCard {
  _id: Id<"healthCards">;
  applicationId: Id<"applications">;
  cardUrl: string;
  issuedAt: number;
  expiresAt: number;
  verificationToken: string;
  status?: HealthCardStatus;
  cardNumber?: string;
  qrCode?: string;
  digitalSignature?: string;
  createdAt?: number;
  updatedAt?: number;
}

export interface HealthCardData {
  _id?: Id<"healthCards">;
  application: {
    _id: Id<"applications">;
    applicationType: 'New' | 'Renew';
    position: string;
    organization: string;
    applicationStatus: string;
    _creationTime: number;
    updatedAt?: number;
    approvedAt?: number;
    adminRemarks?: string;
    jobCategoryId: Id<"jobCategories">;
    userId: Id<"users">;
    civilStatus: string;
  } | null;
  cardUrl?: string; // Optional to handle cards without generated URLs yet
  issuedAt?: number;
  expiresAt?: number;
  verificationToken?: string;
  status?: HealthCardStatus;
  cardNumber?: string;
  qrCode?: string;
  jobCategory?: {
    name: string;
    colorCode: string;
  };
}

// ===== HEALTH CARD VERIFICATION TYPES =====

export interface HealthCardVerification {
  isValid: boolean;
  healthCard?: HealthCard;
  errors: string[];
  warnings: string[];
  verificationId?: string;
  verifiedAt: number;
}

// ===== HEALTH CARD OPERATION TYPES =====

export interface IssueHealthCardInput {
  applicationId: Id<'applications'>;
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

// ===== BUSINESS LOGIC FUNCTIONS =====

export const isHealthCardExpired = (card: HealthCard): boolean => {
  return Date.now() > card.expiresAt;
};

export const isHealthCardActive = (card: HealthCard): boolean => {
  return card.status === 'Active' && !isHealthCardExpired(card);
};

export const getCardDisplayStatus = (card: HealthCardData): string => {
  if (!card.cardUrl) return 'Processing';
  if (card.expiresAt && Date.now() > card.expiresAt) return 'Expired';
  return card.status || 'Active';
};

export const getDaysUntilExpiration = (card: HealthCard): number => {
  const now = Date.now();
  const expiry = card.expiresAt;
  const diffTime = expiry - now;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};