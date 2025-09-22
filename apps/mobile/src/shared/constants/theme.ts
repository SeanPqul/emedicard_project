/**
 * @deprecated This file has been deprecated in favor of the consolidated theme system.
 * Please use imports from '@shared/styles/theme' instead.
 * 
 * This file now re-exports from the new theme for backward compatibility.
 * All new code should import directly from '@shared/styles/theme'.
 */

import { theme } from '@shared/styles/theme';

// Re-export for backward compatibility - maps old structure to new theme
export const COLORS = {
  // Brand colors - mapped to new structure
  primary: {
    main: theme.colors.brand.secondary, // Blue (was primary, now secondary)
    light: theme.colors.blue[400],
    dark: theme.colors.blue[600],
  },
  secondary: {
    main: '#0891b2', // Cyan - keeping old value for compatibility
    light: '#06b6d4',
    dark: '#0e7490',
  },
  
  // Direct mappings
  background: theme.colors.background,
  text: theme.colors.text,
  border: theme.colors.border,
  status: theme.colors.status,
} as const;

export const FONT_SIZES = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 30,
  micro: 10,
} as const;

export const FONT_WEIGHTS = {
  light: '300' as const,
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
} as const;

export const SPACING = theme.spacing;
export const BORDER_RADIUS = theme.borderRadius;

// Map old shadow structure to new
export const SHADOWS = {
  sm: theme.shadows.small,
  md: theme.shadows.medium,
  lg: theme.shadows.large,
} as const;
