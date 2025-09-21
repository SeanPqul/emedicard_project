/**
 * Screen Dimensions and Device Detection
 * 
 * Utilities for handling screen dimensions, percentage-based calculations,
 * and device type detection for responsive design.
 */

import { Dimensions, PixelRatio } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const pixelRatio = PixelRatio.get();

/**
 * Convert percentage to device pixels for width
 * @param percentage - Percentage of screen width (0-100)
 * @returns Width in pixels
 */
export const wp = (percentage: number): number => {
  const value = (percentage * screenWidth) / 100;
  return Math.round(value);
};

/**
 * Convert percentage to device pixels for height
 * @param percentage - Percentage of screen height (0-100)
 * @returns Height in pixels
 */
export const hp = (percentage: number): number => {
  const value = (percentage * screenHeight) / 100;
  return Math.round(value);
};

// Aliases for compatibility with react-native-responsive-screen
export const widthPercentageToDP = wp;
export const heightPercentageToDP = hp;

/**
 * Device type detection based on screen width
 */
export const isSmallDevice = screenWidth < 375;
export const isMediumDevice = screenWidth >= 375 && screenWidth < 414;
export const isLargeDevice = screenWidth >= 414;
export const isTablet = screenWidth >= 768;

/**
 * Device detection functions for dynamic usage
 */
export const getDeviceType = () => {
  if (screenWidth >= 768) return 'tablet';
  if (screenWidth >= 414) return 'large';
  if (screenWidth >= 375) return 'medium';
  return 'small';
};

export const isMobile = () => screenWidth < 768;
export const isTabletDevice = () => screenWidth >= 768;

/**
 * Comprehensive dimensions object with device information
 */
export const dimensions = {
  width: screenWidth,
  height: screenHeight,
  isSmallDevice,
  isMediumDevice,
  isLargeDevice,
  isTablet,
  pixelRatio,
  deviceType: getDeviceType(),
} as const;

/**
 * Device utility functions (for compatibility with styles/responsive.ts)
 */
export const deviceUtils = {
  isSmallDevice,
  isMediumDevice,
  isLargeDevice,
  isTablet,
  pixelRatio,
  screenWidth,
  screenHeight,
  statusBarHeight: isTablet ? 32 : 20,
};

/**
 * Legacy compatibility exports
 */
export const responsiveDimensions = dimensions;

/**
 * Screen dimension constants for external use
 */
export const SCREEN_DIMENSIONS = {
  width: screenWidth,
  height: screenHeight,
  pixelRatio,
  aspectRatio: screenWidth / screenHeight,
} as const;