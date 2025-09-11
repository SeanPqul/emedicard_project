import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../../backend/convex/_generated/api';
import { Id } from '../../../../backend/convex/_generated/dataModel';
import { HealthCard, HealthCardData } from '../types/domain/health-card';

type ConvexId<T extends string> = Id<T>;

export function useHealthCards() {
  const userHealthCards = useQuery(api.healthCards.getUserCards.getUserCardsQuery);
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
    formId: ConvexId<'applications'>;
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
    
    service: healthCardsService,
    
    mutations: {
      createVerificationLog,
      issueHealthCard,
      updateHealthCardStatus,
    }
  };
}