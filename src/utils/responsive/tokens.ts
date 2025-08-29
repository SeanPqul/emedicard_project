/**
 * Design Tokens
 * 
 * Responsive design tokens including spacing, border radius, icon sizes,
 * and other design system values that scale with screen size.
 */

import { moderateScale } from './scale';
import { responsiveValue } from './breakpoints';

/**
 * Responsive spacing scale
 */
export const spacing = {
  xs: moderateScale(4),
  sm: moderateScale(8),
  md: moderateScale(16),
  lg: moderateScale(24),
  xl: moderateScale(32),
  xxl: moderateScale(48),
} as const;

/**
 * Responsive border radius scale
 */
export const borderRadius = {
  xs: moderateScale(4),
  sm: moderateScale(8),
  md: moderateScale(12),
  lg: moderateScale(16),
  xl: moderateScale(24),
  full: 9999,
} as const;

/**
 * Responsive icon sizes
 */
export const iconSizes = {
  xs: moderateScale(16),
  sm: moderateScale(20),
  md: moderateScale(24),
  lg: moderateScale(32),
  xl: moderateScale(40),
} as const;

/**
 * Responsive spacing with breakpoint-aware values
 */
export const responsiveSpacing = {
  xs: responsiveValue({
    sm: 4,
    md: 4,
    lg: 6,
    xl: 8,
    default: 4,
  }),
  sm: responsiveValue({
    sm: 8,
    md: 8,
    lg: 10,
    xl: 12,
    default: 8,
  }),
  md: responsiveValue({
    sm: 16,
    md: 16,
    lg: 18,
    xl: 20,
    default: 16,
  }),
  lg: responsiveValue({
    sm: 24,
    md: 24,
    lg: 28,
    xl: 32,
    default: 24,
  }),
  xl: responsiveValue({
    sm: 32,
    md: 32,
    lg: 36,
    xl: 40,
    default: 32,
  }),
  xxl: responsiveValue({
    sm: 48,
    md: 48,
    lg: 56,
    xl: 64,
    default: 48,
  }),
};

/**
 * Legacy compatibility exports
 */
export const responsiveBorderRadius = borderRadius;
export const responsiveIconSizes = iconSizes;

/**
 * Design token utility functions
 */
export const getSpacing = (size: keyof typeof spacing) => {
  return spacing[size];
};

export const getBorderRadius = (size: keyof typeof borderRadius) => {
  return borderRadius[size];
};

export const getIconSize = (size: keyof typeof iconSizes) => {
  return iconSizes[size];
};

export const getResponsiveSpacing = (size: keyof typeof responsiveSpacing) => {
  return responsiveSpacing[size];
};

/**
 * Design tokens constants for external use
 */
export const DESIGN_TOKENS = {
  spacing,
  borderRadius,
  iconSizes,
  responsiveSpacing,
} as const;