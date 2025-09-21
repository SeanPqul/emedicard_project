// Responsive utilities
export { designSystem, scale, verticalScale, moderateScale, moderateVerticalScale, fontScale,
   micro, caption, action, body, headline, title, largeTitle } from './responsive';

export { wp as widthPercentageToDP, hp as heightPercentageToDP } from './responsive';

// User utilities
export { default as userUtils, generateDisplayNameFromEmail, getUserDisplayName,
  hasPlaceholderName } from './user-utils';

// Health card utilities
export { getHealthCardTypeName, getPaymentMethods } from './health-card-utils';

export { 
  getCardColor, 
  getCardStatus, 
  getStatusColor, 
  generateVerificationUrl, 
  formatDate, 
  generateCardHtml,
  type HealthCardData 
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
