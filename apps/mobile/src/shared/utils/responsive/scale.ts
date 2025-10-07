/**
 * Responsive Scaling Functions
 * 
 * Core scaling utilities for responsive design across different screen sizes.
 * These functions handle horizontal, vertical, and moderate scaling based on device dimensions.
 */

import { Dimensions, PixelRatio } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Base dimensions (iPhone 11 Pro)
const baseWidth = 375;
const baseHeight = 812;

// Get device pixel ratio for better precision
const pixelRatio = PixelRatio.get();

/**
 * Scales size horizontally based on screen width ratio
 * @param size - Size to scale
 * @returns Scaled size rounded to nearest integer
 */
export const scale = (size: number): number => {
  const ratio = screenWidth / baseWidth;
  return Math.round(size * ratio);
};

/**
 * Scales size vertically based on screen height ratio
 * @param size - Size to scale
 * @returns Scaled size rounded to nearest integer
 */
export const verticalScale = (size: number): number => {
  const ratio = screenHeight / baseHeight;
  return Math.round(size * ratio);
};

/**
 * Moderate horizontal scaling with customizable factor
 * Provides more conservative scaling than pure scale()
 * @param size - Size to scale
 * @param factor - Scaling factor (0-1, default 0.5)
 * @returns Moderately scaled size
 */
export const moderateScale = (size: number, factor = 0.5): number => {
  return Math.round(size + (scale(size) - size) * factor);
};

/**
 * Moderate vertical scaling with customizable factor
 * Provides more conservative vertical scaling than pure verticalScale()
 * @param size - Size to scale
 * @param factor - Scaling factor (0-1, default 0.5)
 * @returns Moderately scaled size vertically
 */
export const moderateVerticalScale = (size: number, factor = 0.5): number => {
  return Math.round(size + (verticalScale(size) - size) * factor);
};

/**
 * Font scaling with pixel ratio consideration
 * Optimized for text readability across different device densities
 * @param size - Font size to scale
 * @returns Scaled font size optimized for readability
 */
export const fontScale = (size: number): number => {
  const scaledSize = moderateScale(size, 0.3);
  return Math.round(scaledSize * Math.min(pixelRatio / 2, 1.2));
};

/**
 * Alternative font scaling for styles/responsive.ts compatibility
 * More conservative scaling with min/max constraints
 * @param size - Font size to scale
 * @returns Constrained scaled font size
 */
export const scaleFont = (size: number): number => {
  const ratio = screenWidth / baseWidth;
  const scaledSize = size * ratio;
  
  // Apply minimum and maximum constraints
  const minSize = size * 0.85;
  const maxSize = size * 1.15;
  
  return Math.max(minSize, Math.min(scaledSize, maxSize));
};

/**
 * Spacing scaling for consistent spacing across devices
 * @param size - Spacing value to scale
 * @returns Scaled spacing value
 */
export const scaleSpacing = (size: number): number => {
  const ratio = screenWidth / baseWidth;
  return Math.round(size * ratio);
};

/**
 * General size scaling (alias for scale function)
 * Used for scaling widths, heights, and other dimensions
 * @param size - Size value to scale
 * @returns Scaled size value
 */
export const scaleSize = (size: number): number => {
  return scale(size);
};

// Export constants for external use
export const SCALING_CONSTANTS = {
  screenWidth,
  screenHeight,
  baseWidth,
  baseHeight,
  pixelRatio,
} as const;