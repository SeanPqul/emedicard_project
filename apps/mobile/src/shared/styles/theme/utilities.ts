/**
 * Theme Utilities Module
 * 
 * Helper functions for working with theme values.
 * Includes color manipulation, getters, and utility functions.
 */

import { colors } from './colors';
import { typography } from './typography';
import { spacing, borderRadius } from './spacing';
import { shadows } from './shadows';

// Color path getter
export const getColor = (colorPath: string) => {
  const keys = colorPath.split('.');
  let current: any = colors;

  for (const key of keys) {
    current = current[key];
    if (!current) return undefined;
  }

  return current;
};

// Enhanced color utilities with alpha channel support
export const getColorWithAlpha = (colorPath: string, alpha: number = 1) => {
  const color = getColor(colorPath);
  if (!color) return undefined;
  
  // Convert hex to rgba if alpha is not 1
  if (alpha !== 1) {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  
  return color;
};

// Create color variants with predefined alpha values
export const colorWithOpacity = {
  10: (colorPath: string) => getColorWithAlpha(colorPath, 0.1),
  20: (colorPath: string) => getColorWithAlpha(colorPath, 0.2),
  30: (colorPath: string) => getColorWithAlpha(colorPath, 0.3),
  40: (colorPath: string) => getColorWithAlpha(colorPath, 0.4),
  50: (colorPath: string) => getColorWithAlpha(colorPath, 0.5),
  60: (colorPath: string) => getColorWithAlpha(colorPath, 0.6),
  70: (colorPath: string) => getColorWithAlpha(colorPath, 0.7),
  80: (colorPath: string) => getColorWithAlpha(colorPath, 0.8),
  90: (colorPath: string) => getColorWithAlpha(colorPath, 0.9),
};

// Theme value getters
export const getSpacing = (size: keyof typeof spacing) => {
  return spacing[size];
};

export const getTypography = (variant: keyof typeof typography) => {
  return typography[variant];
};

export const getBorderRadius = (size: keyof typeof borderRadius) => {
  return borderRadius[size];
};

export const getShadow = (size: keyof typeof shadows) => {
  return shadows[size];
};

// Color helper for category colors with opacity (for the dynamic background pattern)
export const getCategoryColorWithOpacity = (categoryColor: string, opacity: number = 0.2) => {
  // Handle both hex codes with and without #
  const hex = categoryColor.startsWith('#') ? categoryColor.slice(1) : categoryColor;
  
  // Parse hex color
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

// Helper function to convert hex to hex with alpha (for simpler usage)
export const hexWithOpacity = (hex: string, opacity: number) => {
  const alpha = Math.round(opacity * 255).toString(16).padStart(2, '0');
  return `${hex}${alpha}`;
};
