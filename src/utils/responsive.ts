/**
 * Responsive Design Utilities
 * 
 * Consolidated responsive utilities combining scaling functions and responsive values
 */

import { Dimensions, PixelRatio } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Base dimensions (iPhone 11 Pro)
const baseWidth = 375;
const baseHeight = 812;

// Get device pixel ratio for better precision
const pixelRatio = PixelRatio.get();

// ===== SCALING FUNCTIONS =====

export const scale = (size: number): number => {
  const ratio = screenWidth / baseWidth;
  return Math.round(size * ratio);
};

export const verticalScale = (size: number): number => {
  const ratio = screenHeight / baseHeight;
  return Math.round(size * ratio);
};

export const moderateScale = (size: number, factor = 0.5): number => {
  return Math.round(size + (scale(size) - size) * factor);
};

export const moderateVerticalScale = (size: number, factor = 0.5): number => {
  return Math.round(size + (verticalScale(size) - size) * factor);
};

// Font scaling with pixel ratio consideration
export const fontScale = (size: number): number => {
  const scaledSize = moderateScale(size, 0.3);
  return Math.round(scaledSize * Math.min(pixelRatio / 2, 1.2));
};

// ===== PERCENTAGE HELPERS =====
// Replacements for react-native-responsive-screen

export const wp = (percentage: number): number => {
  const value = (percentage * screenWidth) / 100;
  return Math.round(value);
};

export const hp = (percentage: number): number => {
  const value = (percentage * screenHeight) / 100;
  return Math.round(value);
};

// Aliases for compatibility with react-native-responsive-screen
export const widthPercentageToDP = wp;
export const heightPercentageToDP = hp;

// ===== DEVICE DETECTION =====

export const isSmallDevice = screenWidth < 375;
export const isMediumDevice = screenWidth >= 375 && screenWidth < 414;
export const isLargeDevice = screenWidth >= 414;
export const isTablet = screenWidth >= 768;

// ===== RESPONSIVE DIMENSIONS =====

export const dimensions = {
  width: screenWidth,
  height: screenHeight,
  isSmallDevice,
  isMediumDevice,
  isLargeDevice,
  isTablet,
  pixelRatio,
};

// ===== COMMON RESPONSIVE VALUES =====

export const spacing = {
  xs: moderateScale(4),
  sm: moderateScale(8),
  md: moderateScale(16),
  lg: moderateScale(24),
  xl: moderateScale(32),
  xxl: moderateScale(48),
} as const;

export const borderRadius = {
  xs: moderateScale(4),
  sm: moderateScale(8),
  md: moderateScale(12),
  lg: moderateScale(16),
  xl: moderateScale(24),
  full: 9999,
} as const;

export const iconSizes = {
  xs: moderateScale(16),
  sm: moderateScale(20),
  md: moderateScale(24),
  lg: moderateScale(32),
  xl: moderateScale(40),
} as const;

// ===== LEGACY COMPATIBILITY =====
// For backward compatibility with existing code

export const responsiveDimensions = dimensions;
export const responsiveSpacing = spacing;
export const responsiveBorderRadius = borderRadius;
export const responsiveIconSizes = iconSizes;