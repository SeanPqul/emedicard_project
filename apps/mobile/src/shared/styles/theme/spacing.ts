/**
 * Theme Spacing Module
 * 
 * Spacing scale, breakpoints, and layout utilities.
 * Provides consistent spacing throughout the application.
 */

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
} as const;

export const borderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,
  full: 9999,
} as const;

export const breakpoints = {
  sm: 480,
  md: 768,
  lg: 1024,
  xl: 1280,
} as const;

// Layout pattern helpers - for common inline style patterns
export const layoutPatterns = {
  // Flexbox patterns
  row: {
    flexDirection: 'row' as const,
  },
  rowCenter: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  },
  rowCenterSpaceBetween: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
  },
  column: {
    flexDirection: 'column' as const,
  },
  center: {
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  centerHorizontal: {
    alignItems: 'center' as const,
  },
  centerVertical: {
    justifyContent: 'center' as const,
  },
  spaceBetween: {
    justifyContent: 'space-between' as const,
  },
  flex1: {
    flex: 1,
  },
  
  // Spacing helpers for common spacing patterns
  spacer: (size: keyof typeof spacing) => ({
    height: spacing[size],
  }),
  horizontalSpacer: (size: keyof typeof spacing) => ({
    width: spacing[size],
  }),
  marginBottom: (size: keyof typeof spacing) => ({
    marginBottom: spacing[size],
  }),
  marginTop: (size: keyof typeof spacing) => ({
    marginTop: spacing[size],
  }),
  marginHorizontal: (size: keyof typeof spacing) => ({
    marginHorizontal: spacing[size],
  }),
  marginVertical: (size: keyof typeof spacing) => ({
    marginVertical: spacing[size],
  }),
  padding: (size: keyof typeof spacing) => ({
    padding: spacing[size],
  }),
  paddingHorizontal: (size: keyof typeof spacing) => ({
    paddingHorizontal: spacing[size],
  }),
  paddingVertical: (size: keyof typeof spacing) => ({
    paddingVertical: spacing[size],
  }),
};

export type Spacing = typeof spacing;
export type BorderRadius = typeof borderRadius;
export type Breakpoints = typeof breakpoints;
