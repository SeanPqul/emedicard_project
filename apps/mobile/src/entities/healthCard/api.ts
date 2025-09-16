import { createQueryHook, createMutationHook } from '../../shared/api/convex';
import { api } from '../../../../../backend/convex/_generated/api';
import type { Id } from '../../../../../backend/convex/_generated/dataModel';
import type { HealthCard, HealthCardData, IssueHealthCardInput, UpdateHealthCardInput } from './model';

/**
 * Health Card Entity - API Layer
 * Centralized health card API operations using shared Convex hooks
 */

// ===== QUERY HOOKS =====

/**
 * Get health cards for current user
 */
export const useUserHealthCards = createQueryHook<void, HealthCardData[]>(
  api.healthCards.getUserHealthCards,
  {
    errorMessage: 'Failed to load health cards'
  }
);

/**
 * Get health card by ID
 */
export const useHealthCard = createQueryHook<{ id: Id<"healthCards"> }, HealthCard>(
  api.healthCards.getById,
  {
    skipWhen: (input) => !input.id,
    errorMessage: 'Failed to load health card'
  }
);

/**
 * Get health card by verification token
 */
export const useHealthCardByToken = createQueryHook<{ token: string }, HealthCard>(
  api.healthCards.getByVerificationToken,
  {
    skipWhen: (input) => !input.token,
    errorMessage: 'Invalid verification token'
  }
);

// ===== MUTATION HOOKS =====

/**
 * Issue a new health card
 */
export const useIssueHealthCard = createMutationHook<IssueHealthCardInput, Id<"healthCards">>(
  api.healthCards.issue,
  {
    errorMessage: 'Failed to issue health card'
  }
);

/**
 * Update health card
 */
export const useUpdateHealthCard = createMutationHook<UpdateHealthCardInput, void>(
  api.healthCards.update,
  {
    errorMessage: 'Failed to update health card'
  }
);

/**
 * Verify health card
 */
export const useVerifyHealthCard = createMutationHook<{ token: string; location?: string }, boolean>(
  api.healthCards.verify,
  {
    errorMessage: 'Failed to verify health card'
  }
);

// ===== COMBINED HOOKS =====

/**
 * All health card mutations in one hook
 */
export const useHealthCardMutations = () => {
  const issueHealthCard = useIssueHealthCard();
  const updateHealthCard = useUpdateHealthCard();
  const verifyHealthCard = useVerifyHealthCard();

  return {
    issueHealthCard,
    updateHealthCard,
    verifyHealthCard,

    // Convenience methods
    mutations: {
      issue: issueHealthCard.mutate,
      update: updateHealthCard.mutate,
      verify: verifyHealthCard.mutate,
    },

    isLoading: issueHealthCard.isLoading || updateHealthCard.isLoading || verifyHealthCard.isLoading,
    error: issueHealthCard.error || updateHealthCard.error || verifyHealthCard.error,
  };
};