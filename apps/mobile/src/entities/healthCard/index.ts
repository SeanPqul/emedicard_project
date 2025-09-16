import { ConvexId, convexUseQuery, convexUseMutation, apiEndpoints } from '../../shared/api';

/**
 * Health Card Entity - Complete Domain Model
 */

// ===== TYPES =====
export type HealthCardStatus = "Active" | "Expired" | "Suspended";

export interface HealthCard {
  _id: ConvexId<"healthCards">;
  applicationId: ConvexId<"applications">;
  userId: ConvexId<"users">;
  cardNumber: string;
  issueDate: string;
  expiryDate: string;
  status: HealthCardStatus;
  qrCodeData: string;
  issuedAt?: number;
  expiresAt?: number;
  verificationToken?: string;
  _creationTime: number;
}

export interface CreateHealthCardInput {
  applicationId: ConvexId<"applications">;
  cardUrl: string;
  issuedAt: number;
  expiresAt: number;
  verificationToken: string;
}

// ===== DOMAIN LOGIC =====
export const isHealthCardValid = (card: HealthCard): boolean => {
  if (card.status !== "Active") return false;
  
  if (card.expiresAt) {
    return Date.now() < card.expiresAt;
  }
  
  if (card.expiryDate) {
    return new Date() < new Date(card.expiryDate);
  }
  
  return true;
};

export const getCardStatusColor = (status: HealthCardStatus): string => {
  const colors = {
    "Active": "#10B981",
    "Expired": "#EF4444", 
    "Suspended": "#F59E0B",
  };
  return colors[status];
};

// ===== API HOOKS =====
export const useHealthCards = () => {
  const userHealthCards = convexUseQuery(apiEndpoints.healthCards.getUserCards || (() => null), {});
  
  return {
    data: userHealthCards as HealthCard[] | undefined,
    isLoading: userHealthCards === undefined,
    error: null,
  };
};

export const useCreateHealthCard = () => {
  const issueHealthCardMutation = convexUseMutation(apiEndpoints.healthCards.create || (() => Promise.resolve(null)));
  
  const issueHealthCard = async (input: CreateHealthCardInput): Promise<HealthCard | null> => {
    try {
      // Transform input to match API expectations
      const payload = {
        applicationId: input.applicationId,
        cardUrl: input.cardUrl,
        issuedAt: input.issuedAt,
        expiresAt: input.expiresAt,
        verificationToken: input.verificationToken,
      };
      const result = await issueHealthCardMutation(payload);
      return result as HealthCard;
    } catch (error) {
      console.error('Issue health card error:', error);
      return null;
    }
  };

  return {
    issueHealthCard,
    isLoading: false,
  };
};