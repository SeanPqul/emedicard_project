// =============================================================================
// SHARED UTILS INDEX - Generic utilities only
// =============================================================================
// Note: Business logic utilities have been moved to their respective features/entities:

export { designSystem, scale, verticalScale, moderateScale, moderateVerticalScale, fontScale,
   micro, caption, action, body, headline, title, largeTitle } from './responsive';

export { wp as widthPercentageToDP, hp as heightPercentageToDP } from './responsive';

// User utilities (generic formatting only)
export { generateDisplayNameFromEmail, getUserDisplayName,
  hasPlaceholderName } from './user-utils';

// Document status utilities
export {
  getDocumentStatusInfo,
  formatRelativeTime,
  formatFileSize,
  getDocumentTypeLabel
} from './documentStatus';

export type { DocumentStatusInfo, DocumentUploadStatus, UploadState } from './documentStatus';

// Error handling utilities
export { extractConvexErrorMessage, getErrorTitle } from './convexErrorParser';
