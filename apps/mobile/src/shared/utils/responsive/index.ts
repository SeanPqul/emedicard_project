/**
 * Responsive Utilities - Unified Export
 * 
 * Single entry point for all responsive design utilities.
 * Consolidates scaling, dimensions, breakpoints, typography, and design tokens.
 */

// Import all modules for comprehensive design system object
import * as scaleModule from './scale';
import * as dimensionsModule from './dimensions';
import * as breakpointsModule from './breakpoints';
import * as typographyModule from './typography';
// Re-export all scaling functions
export {
  scale,
  verticalScale,
  moderateScale,
  moderateVerticalScale,
  fontScale,
  scaleFont,
  scaleSpacing,
  SCALING_CONSTANTS,
} from './scale';

// Re-export all dimension utilities
export {
  wp,
  hp,
  widthPercentageToDP,
  heightPercentageToDP,
  isSmallDevice,
  isMediumDevice,
  isLargeDevice,
  isTablet,
  getDeviceType,
  isMobile,
  isTabletDevice,
  dimensions,
  deviceUtils,
  responsiveDimensions,
  SCREEN_DIMENSIONS,
} from './dimensions';

// Re-export all breakpoint utilities
export {
  getBreakpoint,
  isTablet as isTabletBreakpoint,
  isMobile as isMobileBreakpoint,
  responsiveValue,
  responsiveDimensions as breakpointDimensions,
  when,
  getResponsiveMargin,
  getResponsivePadding,
  getResponsiveBorderRadius,
  BREAKPOINTS,
  screenInfo,
} from './breakpoints';

// Re-export all typography utilities
export {
  FONT_SIZES,
  FONT_WEIGHTS,
  LINE_HEIGHTS,
  FONT_FAMILIES,
  responsiveTypography,
  micro,
  caption,
  action,
  body,
  headline,
  title,
  largeTitle,
  thin,
  extraLight,
  light,
  regular,
  medium,
  semiBold,
  bold,
  extraBold,
  black,
  getTypographyStyle,
  getFontSize,
  getFontWeight,
  getLineHeight,
  TYPOGRAPHY_CONSTANTS,
} from './typography';

// Design tokens have been moved to @shared/styles/theme
// Import from there for spacing, borderRadius, iconSizes, etc.



/**
 * Comprehensive design system object for theme integration
 * Maintains backward compatibility with existing designSystem exports
 */
export const designSystem = {
  fonts: {
    sizes: typographyModule.FONT_SIZES,
    weights: typographyModule.FONT_WEIGHTS,
    lineHeights: typographyModule.LINE_HEIGHTS,
    families: typographyModule.FONT_FAMILIES,
  },
  // Note: spacing, borderRadius, and iconSizes have been moved to @shared/styles/theme
  dimensions: dimensionsModule.dimensions,
  scaling: {
    scale: scaleModule.scale,
    verticalScale: scaleModule.verticalScale,
    moderateScale: scaleModule.moderateScale,
    moderateVerticalScale: scaleModule.moderateVerticalScale,
    fontScale: scaleModule.fontScale,
    wp: dimensionsModule.wp,
    hp: dimensionsModule.hp,
  },
  breakpoints: {
    getBreakpoint: breakpointsModule.getBreakpoint,
    responsiveValue: breakpointsModule.responsiveValue,
    when: breakpointsModule.when,
  },
  typography: typographyModule.responsiveTypography,
} as const;

/**
 * Type definitions for the design system
 */
export type ResponsiveDesignSystem = typeof designSystem;
export type FontSizeKeys = keyof typeof typographyModule.FONT_SIZES;
export type FontWeightKeys = keyof typeof typographyModule.FONT_WEIGHTS;
// Token types are now available from @shared/styles/theme
export type BreakpointKeys = 'sm' | 'md' | 'lg' | 'xl';
export type TypographyVariants = keyof typeof typographyModule.responsiveTypography;