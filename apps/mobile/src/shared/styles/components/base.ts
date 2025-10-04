/**
 * Base Component Styles
 * 
 * Centralized style definitions for common UI components
 * Provides consistent styling across the application
 */

import { StyleSheet } from 'react-native';
import { theme, getShadow, colorWithOpacity } from '../theme';
import { scale, verticalScale, moderateScale } from '@shared/utils/responsive';

// ===== TYPE EXPORTS =====
// Derive types from the actual StyleSheet objects for type safety
export type ButtonVariant = keyof typeof buttonVariants;
export type ButtonSize = keyof typeof buttonSizeVariants;
export type CardVariant = keyof typeof cardVariants;
export type BadgeVariant = keyof typeof badgeVariants;
export type InputVariant = keyof typeof inputVariants;
export type InputState = 'base' | 'focused' | 'error' | 'success' | 'disabled';

// ===== BUTTON VARIANTS =====
export const buttonVariants = StyleSheet.create({
  base: {
    borderRadius: theme.borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    minHeight: moderateScale(44), // Accessibility minimum touch target
    minWidth: moderateScale(44),
    paddingHorizontal: scale(theme.spacing.lg),
    paddingVertical: verticalScale(theme.spacing.md),
  },
  
  // Primary variant
  primary: {
    backgroundColor: theme.colors.primary[500],
    ...getShadow('medium'),
  },
  
  // Secondary variant
  secondary: {
    backgroundColor: theme.colors.gray[500],
    ...getShadow('medium'),
  },
  
  // Tertiary variant
  tertiary: {
    backgroundColor: colorWithOpacity[10]('primary.500'),
    borderWidth: moderateScale(1),
    borderColor: colorWithOpacity[20]('primary.500'),
    shadowOpacity: 0,
    elevation: 0,
  },
  
  // Outline variant
  outline: {
    backgroundColor: 'transparent',
    borderWidth: moderateScale(1),
    borderColor: theme.colors.primary[500],
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
    backgroundColor: theme.colors.semantic.success,
    ...getShadow('medium'),
  },
  
  // Warning variant
  warning: {
    backgroundColor: theme.colors.semantic.warning,
    ...getShadow('medium'),
  },
  
  // Error variant
  error: {
    backgroundColor: theme.colors.semantic.error,
    ...getShadow('medium'),
  },
  
  // Disabled state
  disabled: {
    backgroundColor: theme.colors.gray[400],
    shadowOpacity: 0,
    elevation: 0,
  },
});

// Button text styles
export const buttonTextVariants = StyleSheet.create({
  primary: {
    fontSize: moderateScale(theme.typography.button.fontSize),
    fontWeight: theme.typography.button.fontWeight,
    lineHeight: moderateScale(theme.typography.button.lineHeight),
    color: theme.colors.text.inverse,
  },
  secondary: {
    fontSize: moderateScale(theme.typography.button.fontSize),
    fontWeight: theme.typography.button.fontWeight,
    lineHeight: moderateScale(theme.typography.button.lineHeight),
    color: theme.colors.text.inverse,
  },
  tertiary: {
    fontSize: moderateScale(theme.typography.button.fontSize),
    fontWeight: theme.typography.button.fontWeight,
    lineHeight: moderateScale(theme.typography.button.lineHeight),
    color: theme.colors.primary[700],
  },
  outline: {
    fontSize: moderateScale(theme.typography.button.fontSize),
    fontWeight: theme.typography.button.fontWeight,
    lineHeight: moderateScale(theme.typography.button.lineHeight),
    color: theme.colors.primary[500],
  },
  ghost: {
    fontSize: moderateScale(theme.typography.button.fontSize),
    fontWeight: theme.typography.button.fontWeight,
    lineHeight: moderateScale(theme.typography.button.lineHeight),
    color: theme.colors.primary[500],
  },
  success: {
    fontSize: moderateScale(theme.typography.button.fontSize),
    fontWeight: theme.typography.button.fontWeight,
    lineHeight: moderateScale(theme.typography.button.lineHeight),
    color: theme.colors.text.inverse,
  },
  warning: {
    fontSize: moderateScale(theme.typography.button.fontSize),
    fontWeight: theme.typography.button.fontWeight,
    lineHeight: moderateScale(theme.typography.button.lineHeight),
    color: theme.colors.text.inverse,
  },
  error: {
    fontSize: moderateScale(theme.typography.button.fontSize),
    fontWeight: theme.typography.button.fontWeight,
    lineHeight: moderateScale(theme.typography.button.lineHeight),
    color: theme.colors.text.inverse,
  },
  disabled: {
    fontSize: moderateScale(theme.typography.button.fontSize),
    fontWeight: theme.typography.button.fontWeight,
    lineHeight: moderateScale(theme.typography.button.lineHeight),
    color: theme.colors.text.tertiary,
  },
});

// Button size variants
export const buttonSizeVariants = StyleSheet.create({
  small: {
    height: moderateScale(36),
    paddingHorizontal: scale(theme.spacing.md),
    paddingVertical: verticalScale(theme.spacing.sm),
  },
  medium: {
    height: moderateScale(44),
    paddingHorizontal: scale(theme.spacing.lg),
    paddingVertical: verticalScale(theme.spacing.md),
  },
  large: {
    height: moderateScale(52),
    paddingHorizontal: scale(theme.spacing.xl),
    paddingVertical: verticalScale(theme.spacing.lg),
  },
});

// ===== CARD VARIANTS =====
export const cardVariants = StyleSheet.create({
  base: {
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.borderRadius.lg,
    padding: scale(theme.spacing.lg),
  },
  
  // Default card with shadow
  default: {
    ...getShadow('medium'),
  },
  
  // Flat card without shadow
  flat: {
    borderWidth: 1,
    borderColor: theme.colors.border.light,
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
    paddingHorizontal: scale(theme.spacing.sm),
    paddingVertical: verticalScale(theme.spacing.xs),
    borderRadius: theme.borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  
  // Status badges
  success: {
    backgroundColor: theme.colors.semantic.success,
  },
  
  warning: {
    backgroundColor: theme.colors.semantic.warning,
  },
  
  error: {
    backgroundColor: theme.colors.semantic.error,
  },
  
  info: {
    backgroundColor: theme.colors.semantic.info,
  },
  
  neutral: {
    backgroundColor: theme.colors.gray[500],
  },
  
  // Outline badges
  successOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.semantic.success,
  },
  
  warningOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.semantic.warning,
  },
  
  errorOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.semantic.error,
  },
  
  infoOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.semantic.info,
  },
});

// Badge text styles
export const badgeTextVariants = StyleSheet.create({
  success: {
    fontSize: moderateScale(theme.typography.caption.fontSize),
    lineHeight: moderateScale(theme.typography.caption.lineHeight),
    color: theme.colors.text.inverse,
    fontWeight: '600',
  },
  warning: {
    fontSize: moderateScale(theme.typography.caption.fontSize),
    lineHeight: moderateScale(theme.typography.caption.lineHeight),
    color: theme.colors.text.inverse,
    fontWeight: '600',
  },
  error: {
    fontSize: moderateScale(theme.typography.caption.fontSize),
    lineHeight: moderateScale(theme.typography.caption.lineHeight),
    color: theme.colors.text.inverse,
    fontWeight: '600',
  },
  info: {
    fontSize: moderateScale(theme.typography.caption.fontSize),
    lineHeight: moderateScale(theme.typography.caption.lineHeight),
    color: theme.colors.text.inverse,
    fontWeight: '600',
  },
  neutral: {
    fontSize: moderateScale(theme.typography.caption.fontSize),
    lineHeight: moderateScale(theme.typography.caption.lineHeight),
    color: theme.colors.text.inverse,
    fontWeight: '600',
  },
  successOutline: {
    fontSize: moderateScale(theme.typography.caption.fontSize),
    lineHeight: moderateScale(theme.typography.caption.lineHeight),
    color: theme.colors.semantic.success,
    fontWeight: '600',
  },
  warningOutline: {
    fontSize: moderateScale(theme.typography.caption.fontSize),
    lineHeight: moderateScale(theme.typography.caption.lineHeight),
    color: theme.colors.semantic.warning,
    fontWeight: '600',
  },
  errorOutline: {
    fontSize: moderateScale(theme.typography.caption.fontSize),
    lineHeight: moderateScale(theme.typography.caption.lineHeight),
    color: theme.colors.semantic.error,
    fontWeight: '600',
  },
  infoOutline: {
    fontSize: moderateScale(theme.typography.caption.fontSize),
    lineHeight: moderateScale(theme.typography.caption.lineHeight),
    color: theme.colors.semantic.info,
    fontWeight: '600',
  },
});

// ===== INPUT VARIANTS =====
export const inputVariants = StyleSheet.create({
  base: {
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: scale(theme.spacing.md),
    paddingVertical: verticalScale(theme.spacing.md),
    fontSize: moderateScale(theme.typography.body.fontSize),
    lineHeight: moderateScale(theme.typography.body.lineHeight),
    color: theme.colors.text.primary,
    backgroundColor: theme.colors.background.primary,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
    minHeight: 48, // Accessibility minimum touch target
  },
  
  focused: {
    borderColor: theme.colors.primary[500],
    borderWidth: 2,
  },
  
  error: {
    borderColor: theme.colors.semantic.error,
    borderWidth: 1,
  },
  
  success: {
    borderColor: theme.colors.semantic.success,
    borderWidth: 1,
  },
  
  disabled: {
    backgroundColor: theme.colors.gray[100],
    color: theme.colors.text.tertiary,
  },
});

// ===== ICON BUTTON VARIANTS =====
export const iconButtonVariants = StyleSheet.create({
  base: {
    width: 44,
    height: 44,
    borderRadius: theme.borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  primary: {
    backgroundColor: theme.colors.primary[500],
  },
  
  secondary: {
    backgroundColor: theme.colors.gray[500],
  },
  
  ghost: {
    backgroundColor: 'transparent',
  },
  
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.border.medium,
  },
});
