import { scale, verticalScale, moderateScale } from '@shared/utils/responsive';
import { theme } from '@shared/styles/theme';

/**
 * Standardized Header Layout Constants
 * Use these constants across all green branded headers for consistency
 */
export const HEADER_CONSTANTS = {
  // Padding & Spacing
  HORIZONTAL_PADDING: scale(20), // Consistent horizontal padding
  TOP_PADDING: verticalScale(32), // Top padding for status bar + spacing
  BOTTOM_PADDING: verticalScale(28), // Bottom padding before wave/content
  
  // Icon Sizes
  ICON_SIZE: moderateScale(24), // Standard icon size
  ICON_BUTTON_SIZE: moderateScale(40), // Clickable icon button container
  
  // Text Spacing
  TITLE_MARGIN_BOTTOM: verticalScale(2), // Space between title and subtitle
  ICON_TEXT_GAP: scale(12), // Gap between icon and text content
  
  // Typography
  TITLE_FONT_SIZE: moderateScale(22),
  TITLE_LINE_HEIGHT: moderateScale(28),
  TITLE_FONT_WEIGHT: '700' as const,
  SUBTITLE_FONT_SIZE: moderateScale(13),
  SUBTITLE_OPACITY: 0.85,
  
  // Border Radius
  BORDER_RADIUS: 20,
  
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
  PRIMARY_GREEN: theme.colors.brand.primary,
  
  // Shadow & Elevation (for consistent depth across headers)
  SHADOW: {
    color: '#000',
    offset: { width: 0, height: 4 },
    opacity: 0.15,
    radius: 12,
  } as const,
  ELEVATION: 8,
  
  // Layout Presets (standardized header heights)
  LAYOUT: {
    // Full height - For headers with multiple rows (date pickers, filters, etc.)
    FULL: {
      paddingTop: verticalScale(32),
      paddingBottom: verticalScale(28),
    },
    // Compact - For simple single-row headers (title + optional action)
    COMPACT: {
      paddingTop: verticalScale(20),
      paddingBottom: verticalScale(20),
    },
    // Extended - For headers with secondary info row
    EXTENDED: {
      paddingTop: verticalScale(24),
      paddingBottom: verticalScale(24),
    },
  } as const,
} as const;

