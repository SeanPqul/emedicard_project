// Responsive utilities
export { designSystem, scale, verticalScale, moderateScale, moderateVerticalScale, fontScale,
   micro, caption, action, body, headline, title, largeTitle } from './responsive';

export { wp as widthPercentageToDP, hp as heightPercentageToDP } from './responsive';

// User utilities
export { generateDisplayNameFromEmail, getUserDisplayName,
  hasPlaceholderName } from './user-utils';

// Health card utilities
export { getHealthCardTypeName, getPaymentMethods } from './health-card-utils';

// Job category utilities
export { getJobCategoryColor, getJobCategoryIcon, getCardTypeLabel } from './job-category-utils';

export { 
  getCardColor, 
  getCardStatus, 
  getStatusColor, 
  generateVerificationUrl, 
  formatDate, 
  generateCardHtml,
  type HealthCardData,
  type BackendHealthCard
} from './health-card-display-utils';

// Orientation utilities
export {
  formatDate as formatOrientationDate,
  formatTime,
  getOrientationStatus,
  getStatusColor as getOrientationStatusColor,
  getStatusText
} from './orientation-utils';

// Activity utilities
export {
  getActivityIcon,
  getActivityStatusColor,
  formatTimestamp,
  type Activity
} from './activity-utils';
