// Document types
export * from './types';
// DEPRECATED - Use referral-types instead (excluding DocumentStatus to avoid conflict)
export type { 
  RejectionHistory, 
  RejectionCategory,
  EnrichedRejection,
  EnrichedRejectionHistory,
  GetRejectionHistoryResponse,
  GetRejectedDocumentsCountResponse,
  GetDocumentRejectionDetailsResponse 
} from './rejection-types';
export { RejectionCategoryLabels, RejectionCategoryDescriptions } from './rejection-types';
export * from './referral-types';  // NEW - Proper medical terminology (includes DocumentStatus)
export * from './constants';
