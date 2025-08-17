/**
 * Responsive Design Utilities
 * 
 * Utilities for handling responsive design across different screen sizes
 */

import { Dimensions, PixelRatio } from 'react-native';
import { theme } from './theme';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// ===== BREAKPOINT DETECTION =====
export const getBreakpoint = () => {
  if (screenWidth >= theme.breakpoints.xl) return 'xl';
  if (screenWidth >= theme.breakpoints.lg) return 'lg';
  if (screenWidth >= theme.breakpoints.md) return 'md';
  return 'sm';
};

export const isTablet = () => screenWidth >= theme.breakpoints.md;
export const isMobile = () => screenWidth < theme.breakpoints.md;

// ===== RESPONSIVE SCALING =====
export const scaleFont = (size: number) => {
  const baseWidth = 375; // iPhone 11 Pro width
  const ratio = screenWidth / baseWidth;
  const scaledSize = size * ratio;
  
  // Apply minimum and maximum constraints
  const minSize = size * 0.85;
  const maxSize = size * 1.15;
  
  return Math.max(minSize, Math.min(scaledSize, maxSize));
};

export const scaleSpacing = (size: number) => {
  const baseWidth = 375;
  const ratio = screenWidth / baseWidth;
  return Math.round(size * ratio);
};

// ===== RESPONSIVE VALUES =====
export const responsiveValue = <T>(values: {
  sm?: T;
  md?: T;
  lg?: T;
  xl?: T;
  default: T;
}): T => {
  const breakpoint = getBreakpoint();
  return values[breakpoint] || values.default;
};

// ===== RESPONSIVE DIMENSIONS =====
export const responsiveDimensions = {
  // Container widths
  containerWidth: responsiveValue({
    sm: screenWidth - 32,
    md: Math.min(screenWidth - 64, 768),
    lg: Math.min(screenWidth - 80, 1024),
    xl: Math.min(screenWidth - 96, 1200),
    default: screenWidth - 32,
  }),
  
  // Grid columns
  gridColumns: responsiveValue({
    sm: 1,
    md: 2,
    lg: 3,
    xl: 4,
    default: 1,
  }),
  
  // Card width for grids
  cardWidth: responsiveValue({
    sm: '100%',
    md: '48%',
    lg: '31%',
    xl: '23%',
    default: '100%',
  }),
  
  // Header heights
  headerHeight: responsiveValue({
    sm: 56,
    md: 64,
    lg: 72,
    xl: 80,
    default: 56,
  }),
  
  // Button heights
  buttonHeight: {
    small: responsiveValue({
      sm: 36,
      md: 40,
      lg: 44,
      xl: 48,
      default: 36,
    }),
    medium: responsiveValue({
      sm: 44,
      md: 48,
      lg: 52,
      xl: 56,
      default: 44,
    }),
    large: responsiveValue({
      sm: 52,
      md: 56,
      lg: 60,
      xl: 64,
      default: 52,
    }),
  },
};

// ===== RESPONSIVE TYPOGRAPHY =====
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
  },
};

// ===== RESPONSIVE SPACING =====
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

// ===== UTILITY FUNCTIONS =====
export const getResponsiveMargin = (size: keyof typeof responsiveSpacing) => ({
  margin: responsiveSpacing[size],
});

export const getResponsivePadding = (size: keyof typeof responsiveSpacing) => ({
  padding: responsiveSpacing[size],
});

export const getResponsiveBorderRadius = () => responsiveValue({
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  default: 8,
});

// ===== MEDIA QUERY LIKE UTILITIES =====
export const when = {
  mobile: <T>(value: T) => isMobile() ? value : undefined,
  tablet: <T>(value: T) => isTablet() ? value : undefined,
  smallScreen: <T>(value: T) => screenWidth < theme.breakpoints.md ? value : undefined,
  largeScreen: <T>(value: T) => screenWidth >= theme.breakpoints.lg ? value : undefined,
};

// ===== DEVICE SPECIFIC UTILITIES =====
export const deviceUtils = {
  isSmallDevice: screenWidth < 375,
  isMediumDevice: screenWidth >= 375 && screenWidth < 414,
  isLargeDevice: screenWidth >= 414,
  isTablet: screenWidth >= 768,
  pixelRatio: PixelRatio.get(),
  screenWidth,
  screenHeight,
  statusBarHeight: responsiveValue({
    sm: 20,
    md: 24,
    lg: 28,
    xl: 32,
    default: 20,
  }),
};