/**
 * Responsive Tokens Module
 * 
 * Responsive design tokens that scale based on device dimensions.
 * Uses responsive utilities from the shared utils.
 */

import { scale, verticalScale, fontScale } from '../../utils/responsive';

// Responsive spacing tokens that scale based on device dimensions
export const responsiveSpacing = {
  xs: scale(4),
  sm: scale(8),
  md: scale(16),
  lg: scale(24),
  xl: scale(32),
  xxl: scale(48),
  xxxl: scale(64),
} as const;

// Responsive font sizes
export const responsiveFontSizes = {
  xs: fontScale(10),
  sm: fontScale(12),
  md: fontScale(14),
  base: fontScale(16),
  lg: fontScale(18),
  xl: fontScale(20),
  '2xl': fontScale(24),
  '3xl': fontScale(32),
} as const;

// Responsive border radius
export const responsiveBorderRadius = {
  none: 0,
  sm: scale(4),
  md: scale(8),
  lg: scale(12),
  xl: scale(16),
  xxl: scale(24),
  full: 9999,
} as const;

// Responsive icon sizes
export const responsiveIconSizes = {
  xs: scale(16),
  sm: scale(20),
  md: scale(24),
  lg: scale(32),
  xl: scale(40),
} as const;

// Helper to get responsive spacing value
export const getResponsiveSpacing = (size: keyof typeof responsiveSpacing) => {
  return responsiveSpacing[size];
};

// Helper to get responsive font size
export const getResponsiveFontSize = (size: keyof typeof responsiveFontSizes) => {
  return responsiveFontSizes[size];
};
