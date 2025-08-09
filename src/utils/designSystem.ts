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

// ===== PERCENTAGE-BASED DIMENSIONS =====

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

export const dimensions = {
  width: screenWidth,
  height: screenHeight,
  isSmallDevice,
  isMediumDevice,
  isLargeDevice,
  isTablet,
};

// ===== FONT SYSTEM =====

// Responsive font sizes using semantic naming
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

export const LINE_HEIGHTS = {
  tight: 1.2,
  snug: 1.375,
  normal: 1.5,
  relaxed: 1.625,
  loose: 2,
} as const;

export const FONT_FAMILIES = {
  sans: 'System',
  serif: 'Georgia',
  mono: 'Courier',
} as const;

// ===== SPACING SYSTEM =====

export const spacing = {
  xs: moderateScale(4),
  sm: moderateScale(8),
  md: moderateScale(16),
  lg: moderateScale(24),
  xl: moderateScale(32),
  xxl: moderateScale(48),
} as const;

// ===== BORDER RADIUS =====

export const borderRadius = {
  xs: moderateScale(4),
  sm: moderateScale(8),
  md: moderateScale(12),
  lg: moderateScale(16),
  xl: moderateScale(24),
  full: 9999,
} as const;

// ===== ICON SIZES =====

export const iconSizes = {
  xs: moderateScale(16),
  sm: moderateScale(20),
  md: moderateScale(24),
  lg: moderateScale(32),
  xl: moderateScale(40),
} as const;

// ===== CONVENIENCE EXPORTS =====

// Export individual font sizes for convenience
export const {
  micro,
  caption,
  action,
  body,
  headline,
  title,
  largeTitle,
} = FONT_SIZES;

// Export individual font weights for convenience
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

// Design system object for theme integration
export const designSystem = {
  fonts: {
    sizes: FONT_SIZES,
    weights: FONT_WEIGHTS,
    lineHeights: LINE_HEIGHTS,
    families: FONT_FAMILIES,
  },
  spacing,
  borderRadius,
  iconSizes,
  dimensions,
  scaling: {
    scale,
    verticalScale,
    moderateScale,
    moderateVerticalScale,
    fontScale,
    wp,
    hp,
  },
} as const;
