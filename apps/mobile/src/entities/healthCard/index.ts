/**
 * Health Card Entity - Public API
 *
 * This file defines the public interface for the Health Card entity.
 * Other parts of the application should import from this file only.
 */

// ===== TYPES & INTERFACES =====
export type {
  HealthCard,
  HealthCardData,
  HealthCardStatus,
  HealthCardVerification,
  IssueHealthCardInput,
  UpdateHealthCardInput,
} from './model';

// ===== BUSINESS LOGIC =====
export {
  isHealthCardExpired,
  isHealthCardActive,
  getCardDisplayStatus,
  getDaysUntilExpiration,
} from './model';

// ===== API HOOKS =====
export {
  useUserHealthCards,
  useHealthCard,
  useHealthCardByToken,
  useIssueHealthCard,
  useUpdateHealthCard,
  useVerifyHealthCard,
  useHealthCardMutations,
} from './api';

// ===== UTILITY FUNCTIONS =====
export {
  getCardColor,
  getStatusColor,
  getCardStatus,
  formatDate,
  isExpired,
  generateVerificationUrl,
  isValidVerificationToken,
  formatCardNumber,
  getCardTitle,
  generateCardHtml,
} from './lib';
