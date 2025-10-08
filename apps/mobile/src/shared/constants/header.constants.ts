import { scale, verticalScale, moderateScale } from '@shared/utils/responsive';
import { theme } from '@shared/styles/theme';

/**
 * Standardized Header Layout Constants
 * Use these constants across all green branded headers for consistency
 */
export const HEADER_CONSTANTS = {
  // Padding & Spacing
  HORIZONTAL_PADDING: scale(20), // Consistent horizontal padding
  TOP_PADDING: verticalScale(48), // Top padding for status bar + spacing
  BOTTOM_PADDING: verticalScale(16), // Bottom padding before wave/content
  
  // Icon Sizes
  ICON_SIZE: moderateScale(24), // Standard icon size
  ICON_BUTTON_SIZE: moderateScale(40), // Clickable icon button container
  
  // Text Spacing
  TITLE_MARGIN_BOTTOM: verticalScale(2), // Space between title and subtitle
  ICON_TEXT_GAP: scale(12), // Gap between icon and text content
  
  // Typography
  TITLE_FONT_SIZE: moderateScale(22),
  TITLE_LINE_HEIGHT: moderateScale(28),
  SUBTITLE_FONT_SIZE: moderateScale(13),
  
  // Badge
  BADGE_MIN_WIDTH: moderateScale(18),
  BADGE_HEIGHT: moderateScale(18),
  BADGE_BORDER_WIDTH: moderateScale(2),
  BADGE_FONT_SIZE: moderateScale(10),
  
  // Action Button (right side)
  ACTION_BUTTON_SIZE: moderateScale(40),
  ACTION_BUTTON_RADIUS: moderateScale(20),
  ACTION_BUTTON_ICON_SIZE: moderateScale(20),
  
  // Colors
  BADGE_COLOR: '#EF4444',
  WHITE: '#FFFFFF',
  WHITE_OVERLAY: 'rgba(255, 255, 255, 0.2)',
  WHITE_TRANSPARENT: 'rgba(255, 255, 255, 0.85)',
} as const;

