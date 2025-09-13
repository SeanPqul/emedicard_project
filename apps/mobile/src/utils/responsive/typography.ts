/**
 * Responsive Typography System
 * 
 * Font scaling, typography scales, and responsive text sizing utilities.
 * Provides both semantic font scales and responsive typography patterns.
 */

import { moderateScale } from './scale';
import { responsiveValue } from './breakpoints';

/**
 * Font size scale using semantic naming
 */
export const FONT_SIZES = {
  micro: moderateScale(10),
  caption: moderateScale(12),
  action: moderateScale(14),
  body: moderateScale(16),
  headline: moderateScale(24),
  title: moderateScale(28),
  largeTitle: moderateScale(34),
  // Static fallbacks for compatibility
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
  '5xl': 48,
} as const;

/**
 * Font weight constants
 */
export const FONT_WEIGHTS = {
  thin: '100' as const,
  extraLight: '200' as const,
  light: '300' as const,
  regular: '400' as const,
  medium: '500' as const,
  semiBold: '600' as const,
  bold: '700' as const,
  extraBold: '800' as const,
  black: '900' as const,
};

/**
 * Line height scale
 */
export const LINE_HEIGHTS = {
  tight: 1.2,
  snug: 1.375,
  normal: 1.5,
  relaxed: 1.625,
  loose: 2,
} as const;

/**
 * Font family definitions
 */
export const FONT_FAMILIES = {
  sans: 'System',
  serif: 'Georgia',
  mono: 'Courier',
} as const;

/**
 * Responsive typography scale with breakpoint-aware sizing
 */
export const responsiveTypography = {
  h1: {
    fontSize: responsiveValue({
      sm: 28,
      md: 32,
      lg: 36,
      xl: 40,
      default: 28,
    }),
    lineHeight: responsiveValue({
      sm: 36,
      md: 40,
      lg: 44,
      xl: 48,
      default: 36,
    }),
    fontWeight: FONT_WEIGHTS.bold,
  },
  h2: {
    fontSize: responsiveValue({
      sm: 22,
      md: 24,
      lg: 26,
      xl: 28,
      default: 22,
    }),
    lineHeight: responsiveValue({
      sm: 28,
      md: 32,
      lg: 34,
      xl: 36,
      default: 28,
    }),
    fontWeight: FONT_WEIGHTS.semiBold,
  },
  h3: {
    fontSize: responsiveValue({
      sm: 18,
      md: 20,
      lg: 22,
      xl: 24,
      default: 18,
    }),
    lineHeight: responsiveValue({
      sm: 24,
      md: 28,
      lg: 30,
      xl: 32,
      default: 24,
    }),
    fontWeight: FONT_WEIGHTS.semiBold,
  },
  h4: {
    fontSize: responsiveValue({
      sm: 16,
      md: 18,
      lg: 20,
      xl: 22,
      default: 16,
    }),
    lineHeight: responsiveValue({
      sm: 22,
      md: 24,
      lg: 26,
      xl: 28,
      default: 22,
    }),
    fontWeight: FONT_WEIGHTS.semiBold,
  },
  body: {
    fontSize: responsiveValue({
      sm: 14,
      md: 16,
      lg: 16,
      xl: 18,
      default: 14,
    }),
    lineHeight: responsiveValue({
      sm: 20,
      md: 24,
      lg: 24,
      xl: 26,
      default: 20,
    }),
    fontWeight: FONT_WEIGHTS.regular,
  },
  bodySmall: {
    fontSize: responsiveValue({
      sm: 12,
      md: 14,
      lg: 14,
      xl: 16,
      default: 12,
    }),
    lineHeight: responsiveValue({
      sm: 16,
      md: 20,
      lg: 20,
      xl: 22,
      default: 16,
    }),
    fontWeight: FONT_WEIGHTS.regular,
  },
  caption: {
    fontSize: responsiveValue({
      sm: 10,
      md: 12,
      lg: 12,
      xl: 14,
      default: 10,
    }),
    lineHeight: responsiveValue({
      sm: 14,
      md: 16,
      lg: 16,
      xl: 18,
      default: 14,
    }),
    fontWeight: FONT_WEIGHTS.regular,
  },
  button: {
    fontSize: responsiveValue({
      sm: 14,
      md: 16,
      lg: 16,
      xl: 18,
      default: 14,
    }),
    lineHeight: responsiveValue({
      sm: 20,
      md: 24,
      lg: 24,
      xl: 26,
      default: 20,
    }),
    fontWeight: FONT_WEIGHTS.semiBold,
  },
};

/**
 * Individual font size exports for convenience
 */
export const {
  micro,
  caption,
  action,
  body,
  headline,
  title,
  largeTitle,
} = FONT_SIZES;

/**
 * Individual font weight exports for convenience
 */
export const {
  thin,
  extraLight,
  light,
  regular,
  medium,
  semiBold,
  bold,
  extraBold,
  black,
} = FONT_WEIGHTS;

/**
 * Typography utility functions
 */
export const getTypographyStyle = (variant: keyof typeof responsiveTypography) => {
  return responsiveTypography[variant];
};

export const getFontSize = (size: keyof typeof FONT_SIZES) => {
  return FONT_SIZES[size];
};

export const getFontWeight = (weight: keyof typeof FONT_WEIGHTS) => {
  return FONT_WEIGHTS[weight];
};

export const getLineHeight = (height: keyof typeof LINE_HEIGHTS) => {
  return LINE_HEIGHTS[height];
};

/**
 * Typography constants for external use
 */
export const TYPOGRAPHY_CONSTANTS = {
  fontSizes: FONT_SIZES,
  fontWeights: FONT_WEIGHTS,
  lineHeights: LINE_HEIGHTS,
  fontFamilies: FONT_FAMILIES,
  responsiveTypography,
} as const;