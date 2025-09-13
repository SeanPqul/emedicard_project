/**
 * Responsive Breakpoints and Conditional Values
 * 
 * Breakpoint system for responsive design with utilities for conditional values
 * based on screen size breakpoints.
 */

import { Dimensions } from 'react-native';
import { theme } from '../../styles/theme';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

/**
 * Get current breakpoint based on screen width
 * @returns Current breakpoint string
 */
export const getBreakpoint = (): 'sm' | 'md' | 'lg' | 'xl' => {
  if (screenWidth >= theme.breakpoints.xl) return 'xl';
  if (screenWidth >= theme.breakpoints.lg) return 'lg';
  if (screenWidth >= theme.breakpoints.md) return 'md';
  return 'sm';
};

/**
 * Check if current screen is tablet size or larger
 * @returns True if tablet or larger
 */
export const isTablet = (): boolean => screenWidth >= theme.breakpoints.md;

/**
 * Check if current screen is mobile size
 * @returns True if mobile size
 */
export const isMobile = (): boolean => screenWidth < theme.breakpoints.md;

/**
 * Responsive value utility - returns appropriate value based on current breakpoint
 * @param values - Object with breakpoint keys and fallback default
 * @returns Value for current breakpoint or default
 */
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

/**
 * Responsive dimensions for common UI elements
 */
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
  
  // Button heights by size
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

/**
 * Media query-like utilities for conditional rendering
 */
export const when = {
  mobile: <T>(value: T): T | undefined => isMobile() ? value : undefined,
  tablet: <T>(value: T): T | undefined => isTablet() ? value : undefined,
  smallScreen: <T>(value: T): T | undefined => screenWidth < theme.breakpoints.md ? value : undefined,
  largeScreen: <T>(value: T): T | undefined => screenWidth >= theme.breakpoints.lg ? value : undefined,
  sm: <T>(value: T): T | undefined => getBreakpoint() === 'sm' ? value : undefined,
  md: <T>(value: T): T | undefined => getBreakpoint() === 'md' ? value : undefined,
  lg: <T>(value: T): T | undefined => getBreakpoint() === 'lg' ? value : undefined,
  xl: <T>(value: T): T | undefined => getBreakpoint() === 'xl' ? value : undefined,
};

/**
 * Responsive spacing utilities
 */
export const getResponsiveMargin = (size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl') => ({
  margin: responsiveValue({
    sm: size === 'xs' ? 4 : size === 'sm' ? 8 : size === 'md' ? 16 : size === 'lg' ? 24 : size === 'xl' ? 32 : 48,
    md: size === 'xs' ? 4 : size === 'sm' ? 8 : size === 'md' ? 16 : size === 'lg' ? 24 : size === 'xl' ? 32 : 48,
    lg: size === 'xs' ? 6 : size === 'sm' ? 10 : size === 'md' ? 18 : size === 'lg' ? 28 : size === 'xl' ? 36 : 56,
    xl: size === 'xs' ? 8 : size === 'sm' ? 12 : size === 'md' ? 20 : size === 'lg' ? 32 : size === 'xl' ? 40 : 64,
    default: size === 'xs' ? 4 : size === 'sm' ? 8 : size === 'md' ? 16 : size === 'lg' ? 24 : size === 'xl' ? 32 : 48,
  }),
});

export const getResponsivePadding = (size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl') => ({
  padding: responsiveValue({
    sm: size === 'xs' ? 4 : size === 'sm' ? 8 : size === 'md' ? 16 : size === 'lg' ? 24 : size === 'xl' ? 32 : 48,
    md: size === 'xs' ? 4 : size === 'sm' ? 8 : size === 'md' ? 16 : size === 'lg' ? 24 : size === 'xl' ? 32 : 48,
    lg: size === 'xs' ? 6 : size === 'sm' ? 10 : size === 'md' ? 18 : size === 'lg' ? 28 : size === 'xl' ? 36 : 56,
    xl: size === 'xs' ? 8 : size === 'sm' ? 12 : size === 'md' ? 20 : size === 'lg' ? 32 : size === 'xl' ? 40 : 64,
    default: size === 'xs' ? 4 : size === 'sm' ? 8 : size === 'md' ? 16 : size === 'lg' ? 24 : size === 'xl' ? 32 : 48,
  }),
});

export const getResponsiveBorderRadius = () => responsiveValue({
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  default: 8,
});

/**
 * Breakpoint constants for external use
 */
export const BREAKPOINTS = theme.breakpoints;

/**
 * Current screen info
 */
export const screenInfo = {
  width: screenWidth,
  height: screenHeight,
  breakpoint: getBreakpoint(),
  isTablet: isTablet(),
  isMobile: isMobile(),
} as const;