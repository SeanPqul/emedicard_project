import { convex } from '../lib/convexClient';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';

/**
 * Verification API Module
 * 
 * Feature-scoped API functions for verification operations.
 * Each function is small, focused, and uses Id types.
 */

/**
 * Create verification log
 */
export async function createVerificationLog(input: {
  healthCardId: Id<'healthCards'>;
  location?: string;
  metadata?: Record<string, any>;
}) {
  return convex.mutation(api.verification.createVerificationLog.createVerificationLogMutation, input);
}

/**
 * Log QR scan
 */
export async function logQRScan(input: {
  healthCardId: Id<'healthCards'>;
  location?: string;
  scanResult: string;
}) {
  return convex.mutation(api.verification.logQRScan.logQRScanMutation, input);
}

/**
 * Log verification attempt
 */
export async function logVerificationAttempt(input: {
  healthCardId: Id<'healthCards'>;
  success: boolean;
  errorMessage?: string;
}) {
  return convex.mutation(api.verification.logVerificationAttempt.logVerificationAttemptMutation, input);
}

/**
 * Get verification logs by health card
 */
export async function getVerificationLogsByHealthCard(healthCardId: Id<'healthCards'>) {
  return convex.query(api.verification.getVerificationLogsByHealthCard.getVerificationLogsByHealthCardQuery, { healthCardId });
}

/**
 * Get verification logs by user
 */
export async function getVerificationLogsByUser() {
  return convex.query(api.verification.getVerificationLogsByUser.getVerificationLogsByUserQuery, {});
}

/**
 * Get verification stats
 */
export async function getVerificationStats() {
  return convex.query(api.verification.getVerificationStats.getVerificationStatsQuery, {});
}
