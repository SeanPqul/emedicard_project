// =============================================================================
// SHARED UTILS INDEX - Generic utilities only
// =============================================================================
// Note: Business logic utilities have been moved to their respective features/entities:
// - Health card utils -> @features/healthCards/lib
// - Job category utils -> @entities/jobCategory/lib
// - Activity utils -> @entities/activity/lib
// - Orientation utils -> @features/orientation/lib

// Generic/UI utilities (these remain in shared)
// Responsive utilities
export { designSystem, scale, verticalScale, moderateScale, moderateVerticalScale, fontScale,
   micro, caption, action, body, headline, title, largeTitle } from './responsive';

export { wp as widthPercentageToDP, hp as heightPercentageToDP } from './responsive';

// User utilities (generic formatting only)
export { generateDisplayNameFromEmail, getUserDisplayName,
  hasPlaceholderName } from './user-utils';
