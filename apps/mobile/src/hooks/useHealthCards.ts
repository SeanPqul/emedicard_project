import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../../backend/convex/_generated/api';
import { Id } from '../../../../backend/convex/_generated/dataModel';
import { HealthCardData } from '../entities/healthCard';

type ConvexId<T extends string> = Id<T>;

export function useHealthCards() {
  const rawData = useQuery(api.healthCards.getUserCards.getUserCardsQuery);
  const createVerificationLogMutation = useMutation(api.verification.createVerificationLog.createVerificationLogMutation);
  const issueHealthCardMutation = useMutation(api.healthCards.issueHealthCard.issueHealthCardMutation);
  const updateHealthCardMutation = useMutation(api.healthCards.updateHealthCard.updateHealthCardMutation);

  // Transform the data to match HealthCardData interface
  const userHealthCards: HealthCardData[] | undefined = rawData?.map((card) => ({
    _id: card._id,
    application: card.application,
    cardUrl: card.cardUrl,
    issuedAt: card.issuedAt,
    expiresAt: card.expiresAt,
    verificationToken: card.verificationToken,
    status: card.status,
    cardNumber: card.cardNumber,
    qrCode: card.qrCode,
    // Transform the jobCategory to the expected format
    jobCategory: card.jobCategory ? {
      name: card.jobCategory.name,
      colorCode: card.jobCategory.colorCode,
    } : undefined,
  }));

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
    isLoading: rawData === undefined,

    mutations: {
      createVerificationLog,
      issueHealthCard,
      updateHealthCardStatus,
    }
  };
}