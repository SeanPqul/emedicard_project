/**
 * Base Component Styles
 * 
 * Centralized style definitions for common UI components
 * Provides consistent styling across the application
 */

import { StyleSheet } from 'react-native';
import { theme, getColor, getSpacing, getBorderRadius, getShadow, getTypography, colorWithOpacity } from '../theme';

// ===== BUTTON VARIANTS =====
export const buttonVariants = StyleSheet.create({
  base: {
    borderRadius: getBorderRadius('lg'),
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    minHeight: 44, // Accessibility minimum touch target
    minWidth: 44,
    paddingHorizontal: getSpacing('lg'),
    paddingVertical: getSpacing('md'),
  },
  
  // Primary variant
  primary: {
    backgroundColor: getColor('primary.500'),
    ...getShadow('medium'),
  },
  
  // Secondary variant
  secondary: {
    backgroundColor: getColor('gray.500'),
    ...getShadow('medium'),
  },
  
  // Outline variant
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: getColor('primary.500'),
    shadowOpacity: 0,
    elevation: 0,
  },
  
  // Ghost variant
  ghost: {
    backgroundColor: 'transparent',
    shadowOpacity: 0,
    elevation: 0,
  },
  
  // Success variant
  success: {
    backgroundColor: getColor('semantic.success'),
    ...getShadow('medium'),
  },
  
  // Warning variant
  warning: {
    backgroundColor: getColor('semantic.warning'),
    ...getShadow('medium'),
  },
  
  // Error variant
  error: {
    backgroundColor: getColor('semantic.error'),
    ...getShadow('medium'),
  },
  
  // Disabled state
  disabled: {
    backgroundColor: getColor('gray.400'),
    shadowOpacity: 0,
    elevation: 0,
  },
});

// Button text styles
export const buttonTextVariants = StyleSheet.create({
  primary: {
    ...getTypography('button'),
    color: getColor('text.inverse'),
  },
  secondary: {
    ...getTypography('button'),
    color: getColor('text.inverse'),
  },
  outline: {
    ...getTypography('button'),
    color: getColor('primary.500'),
  },
  ghost: {
    ...getTypography('button'),
    color: getColor('primary.500'),
  },
  success: {
    ...getTypography('button'),
    color: getColor('text.inverse'),
  },
  warning: {
    ...getTypography('button'),
    color: getColor('text.inverse'),
  },
  error: {
    ...getTypography('button'),
    color: getColor('text.inverse'),
  },
  disabled: {
    ...getTypography('button'),
    color: getColor('text.tertiary'),
  },
});

// Button size variants
export const buttonSizeVariants = StyleSheet.create({
  small: {
    height: 36,
    paddingHorizontal: getSpacing('md'),
    paddingVertical: getSpacing('sm'),
  },
  medium: {
    height: 44,
    paddingHorizontal: getSpacing('lg'),
    paddingVertical: getSpacing('md'),
  },
  large: {
    height: 52,
    paddingHorizontal: getSpacing('xl'),
    paddingVertical: getSpacing('lg'),
  },
});

// ===== CARD VARIANTS =====
export const cardVariants = StyleSheet.create({
  base: {
    backgroundColor: getColor('background.primary'),
    borderRadius: getBorderRadius('lg'),
    padding: getSpacing('lg'),
  },
  
  // Default card with shadow
  default: {
    ...getShadow('medium'),
  },
  
  // Flat card without shadow
  flat: {
    borderWidth: 1,
    borderColor: getColor('border.light'),
  },
  
  // Elevated card with larger shadow
  elevated: {
    ...getShadow('large'),
  },
  
  // Interactive card for touch interactions
  interactive: {
    ...getShadow('medium'),
  },
  
  // Status cards
  success: {
    backgroundColor: colorWithOpacity[10]('semantic.success'),
    borderWidth: 1,
    borderColor: colorWithOpacity[20]('semantic.success'),
  },
  
  warning: {
    backgroundColor: colorWithOpacity[10]('semantic.warning'),
    borderWidth: 1,
    borderColor: colorWithOpacity[20]('semantic.warning'),
  },
  
  error: {
    backgroundColor: colorWithOpacity[10]('semantic.error'),
    borderWidth: 1,
    borderColor: colorWithOpacity[20]('semantic.error'),
  },
  
  info: {
    backgroundColor: colorWithOpacity[10]('semantic.info'),
    borderWidth: 1,
    borderColor: colorWithOpacity[20]('semantic.info'),
  },
});

// ===== BADGE VARIANTS =====
export const badgeVariants = StyleSheet.create({
  base: {
    paddingHorizontal: getSpacing('sm'),
    paddingVertical: getSpacing('xs'),
    borderRadius: getBorderRadius('full'),
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  
  // Status badges
  success: {
    backgroundColor: getColor('semantic.success'),
  },
  
  warning: {
    backgroundColor: getColor('semantic.warning'),
  },
  
  error: {
    backgroundColor: getColor('semantic.error'),
  },
  
  info: {
    backgroundColor: getColor('semantic.info'),
  },
  
  neutral: {
    backgroundColor: getColor('gray.500'),
  },
  
  // Outline badges
  successOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: getColor('semantic.success'),
  },
  
  warningOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: getColor('semantic.warning'),
  },
  
  errorOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: getColor('semantic.error'),
  },
  
  infoOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: getColor('semantic.info'),
  },
});

// Badge text styles
export const badgeTextVariants = StyleSheet.create({
  success: {
    ...getTypography('caption'),
    color: getColor('text.inverse'),
    fontWeight: '600',
  },
  warning: {
    ...getTypography('caption'),
    color: getColor('text.inverse'),
    fontWeight: '600',
  },
  error: {
    ...getTypography('caption'),
    color: getColor('text.inverse'),
    fontWeight: '600',
  },
  info: {
    ...getTypography('caption'),
    color: getColor('text.inverse'),
    fontWeight: '600',
  },
  neutral: {
    ...getTypography('caption'),
    color: getColor('text.inverse'),
    fontWeight: '600',
  },
  successOutline: {
    ...getTypography('caption'),
    color: getColor('semantic.success'),
    fontWeight: '600',
  },
  warningOutline: {
    ...getTypography('caption'),
    color: getColor('semantic.warning'),
    fontWeight: '600',
  },
  errorOutline: {
    ...getTypography('caption'),
    color: getColor('semantic.error'),
    fontWeight: '600',
  },
  infoOutline: {
    ...getTypography('caption'),
    color: getColor('semantic.info'),
    fontWeight: '600',
  },
});

// ===== INPUT VARIANTS =====
export const inputVariants = StyleSheet.create({
  base: {
    borderRadius: getBorderRadius('md'),
    paddingHorizontal: getSpacing('md'),
    paddingVertical: getSpacing('md'),
    ...getTypography('body'),
    color: getColor('text.primary'),
    backgroundColor: getColor('background.primary'),
    borderWidth: 1,
    borderColor: getColor('border.light'),
    minHeight: 48, // Accessibility minimum touch target
  },
  
  focused: {
    borderColor: getColor('primary.500'),
    borderWidth: 2,
  },
  
  error: {
    borderColor: getColor('semantic.error'),
    borderWidth: 1,
  },
  
  success: {
    borderColor: getColor('semantic.success'),
    borderWidth: 1,
  },
  
  disabled: {
    backgroundColor: getColor('gray.100'),
    color: getColor('text.tertiary'),
  },
});

// ===== ICON BUTTON VARIANTS =====
export const iconButtonVariants = StyleSheet.create({
  base: {
    width: 44,
    height: 44,
    borderRadius: getBorderRadius('full'),
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  primary: {
    backgroundColor: getColor('primary.500'),
  },
  
  secondary: {
    backgroundColor: getColor('gray.500'),
  },
  
  ghost: {
    backgroundColor: 'transparent',
  },
  
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: getColor('border.medium'),
  },
});