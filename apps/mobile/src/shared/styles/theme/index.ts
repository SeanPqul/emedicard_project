/**
 * Theme Barrel Export
 * 
 * Central export point for all theme modules.
 * Composes the complete theme object and exports utilities.
*/

// Import all modules
import { colors } from './colors';
import { typography } from './typography';
import { spacing, borderRadius, breakpoints, layoutPatterns } from './spacing';
import { shadows } from './shadows';

// Import utilities and responsive tokens separately for re-export
export * from './responsive-tokens';

// Export adapter utilities as the primary interface (these override utilities exports)
export { getColor, getSpacing, getTypography, getBorderRadius, getShadow } from './adapter';


// Compose the complete theme object
export const theme = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  breakpoints,
} as const;

// Export type
export type Theme = typeof theme;

// Re-export specific modules for convenience
export { colors } from './colors';
export { typography } from './typography';
export { spacing, borderRadius, breakpoints, layoutPatterns } from './spacing';
export { shadows } from './shadows';
