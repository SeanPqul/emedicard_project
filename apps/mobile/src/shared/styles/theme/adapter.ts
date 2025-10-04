/**
 * Theme Adapter
 * Provides backward compatibility with the master project's styling approach
 * while maintaining FSD architecture principles
 */

import { colors } from './colors';
import { typography } from './typography';
import { spacing, borderRadius, breakpoints } from './spacing';
import { shadows } from './shadows';
import {
  getColor as getColorUtility,
  getSpacing as getSpacingUtility,
  getTypography as getTypographyUtility,
  getBorderRadius as getBorderRadiusUtility,
  getShadow as getShadowUtility,
  colorWithOpacity as colorWithOpacityUtility,
} from './utilities';

// Re-export utilities directly - no duplication, just clean interface
export const getColor = getColorUtility;
export const getSpacing = getSpacingUtility;
export const getTypography = getTypographyUtility;
export const getBorderRadius = getBorderRadiusUtility;
export const getShadow = getShadowUtility;
export const colorWithOpacity = colorWithOpacityUtility;

// Compose theme directly to avoid circular dependency
export const theme = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  breakpoints,
} as const;
