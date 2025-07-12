import { Dimensions, PixelRatio } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Base dimensions (iPhone 11 Pro)
const baseWidth = 375;
const baseHeight = 812;

// Get device pixel ratio for better precision
const pixelRatio = PixelRatio.get();

// Scale functions with better performance
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

// Helper functions to replace react-native-responsive-screen
export const wp = (percentage: number): number => {
  const value = (percentage * screenWidth) / 100;
  return Math.round(value);
};

export const hp = (percentage: number): number => {
  const value = (percentage * screenHeight) / 100;
  return Math.round(value);
};

// Aliases for compatibility
export const widthPercentageToDP = wp;
export const heightPercentageToDP = hp;

// Device type detection
export const isSmallDevice = screenWidth < 375;
export const isMediumDevice = screenWidth >= 375 && screenWidth < 414;
export const isLargeDevice = screenWidth >= 414;
export const isTablet = screenWidth >= 768;

// Responsive dimensions object
export const responsiveDimensions = {
  width: screenWidth,
  height: screenHeight,
  isSmallDevice,
  isMediumDevice,
  isLargeDevice,
  isTablet,
};

// Common responsive values
export const responsiveSpacing = {
  xs: moderateScale(4),
  sm: moderateScale(8),
  md: moderateScale(16),
  lg: moderateScale(24),
  xl: moderateScale(32),
  xxl: moderateScale(48),
};

export const responsiveBorderRadius = {
  xs: moderateScale(4),
  sm: moderateScale(8),
  md: moderateScale(12),
  lg: moderateScale(16),
  xl: moderateScale(24),
  full: 9999,
};

export const responsiveIconSizes = {
  xs: moderateScale(16),
  sm: moderateScale(20),
  md: moderateScale(24),
  lg: moderateScale(32),
  xl: moderateScale(40),
};
