import { useQuery, useMutation } from 'convex/react';
import { api } from '@backend/convex/_generated/api';
import { Id } from '@backend/convex/_generated/dataModel';

type ConvexId<T extends string> = Id<T>;

// Backend health card data structure
export interface BackendHealthCard {
  _id: Id<"healthCards">;
  _creationTime: number;
  applicationId: Id<"applications">;
  cardUrl: string;
  issuedAt: number;
  expiresAt: number;
  verificationToken: string;
  application?: {
    _id: Id<"applications">;
    _creationTime: number;
    applicationStatus: string;
    applicationType: "New" | "Renew";
    position: string;
    organization: string;
    jobCategoryId: Id<"jobCategories">;
    userId: Id<"users">;
    civilStatus: string;
  } | null;
  jobCategory?: {
    _id: Id<"jobCategories">;
    name: string;
    colorCode: string;
    requireOrientation?: string | boolean;
  } | null;
}

export function useHealthCards() {
  const userHealthCards = useQuery(api.healthCards.getUserCards.getUserCardsQuery) as BackendHealthCard[] | undefined;
  const createVerificationLogMutation = useMutation(api.verification.createVerificationLog.createVerificationLogMutation);
  const issueHealthCardMutation = useMutation(api.healthCards.issueHealthCard.issueHealthCardMutation);
  const updateHealthCardMutation = useMutation(api.healthCards.updateHealthCard.updateHealthCardMutation);

  const createVerificationLog = async (input: {
    healthCardId: ConvexId<'healthCards'>;
    scannedBy?: ConvexId<'users'>;
    location?: string;
    notes?: string;
  }) => {
    return createVerificationLogMutation(input);
  };

  const issueHealthCard = async (input: {
    applicationId: ConvexId<'applications'>;
    cardUrl: string;
    issuedAt: number;
    expiresAt: number;
    verificationToken: string;
  }) => {
    return issueHealthCardMutation(input);
  };

  const updateHealthCardStatus = async (cardId: ConvexId<'healthCards'>) => {
    return updateHealthCardMutation({ healthCardId: cardId });
  };

  return {
    data: userHealthCards,
    isLoading: userHealthCards === undefined,
    
    mutations: {
      createVerificationLog,
      issueHealthCard,
      updateHealthCardStatus,
    }
  };
}
