import { convex } from '../lib/convexClient';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';

/**
 * Health Cards API Module
 * 
 * Feature-scoped API functions for health card operations.
 * Each function is small, focused, and uses Id types.
 */

/**
 * Get health card by verification token (for QR code scanning)
 */
export async function getByVerificationToken(token: string) {
  return convex.query(api.healthCards.getHealthCardByVerificationToken, { verificationToken: token });
}

/**
 * Get all health cards for the current user
 */
export async function getUserCards() {
  return convex.query(api.healthCards.getUserHealthCards, {});
}

/**
 * Get health card by form ID
 */
export async function getHealthCardByFormId(formId: Id<'forms'>) {
  return convex.query(api.healthCards.getByFormId, { formId });
}

/**
 * Issue a new health card
 */
export async function issueHealthCard(input: {
  formId: Id<'forms'>;
  expiryDate: number;
  metadata?: Record<string, any>;
}) {
  return convex.mutation(api.healthCards.issueHealthCard, input);
}

/**
 * Update health card status
 */
export async function updateHealthCardStatus(
  cardId: Id<'healthCards'>,
  status: string
) {
  return convex.mutation(api.healthCards.updateHealthCard, { cardId, status });
}

