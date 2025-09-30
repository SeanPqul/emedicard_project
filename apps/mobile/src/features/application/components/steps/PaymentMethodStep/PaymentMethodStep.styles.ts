import { StyleSheet } from 'react-native';
import { theme } from '@shared/styles/theme';
import { scale, verticalScale, moderateScale } from '@shared/utils/responsive';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: scale(theme.spacing.md),
    paddingTop: verticalScale(theme.spacing.sm),
  },

  heading: {
    fontSize: moderateScale(theme.typography.h3.fontSize),
    fontWeight: '700',
    color: theme.colors.text.primary,
    marginBottom: verticalScale(theme.spacing.sm),
  },

  description: {
    fontSize: moderateScale(theme.typography.body.fontSize),
    color: theme.colors.text.secondary,
    lineHeight: moderateScale(20),
    marginBottom: verticalScale(theme.spacing.lg),
  },

  // Fee Breakdown Styles
  feeBreakdownContainer: {
    backgroundColor: theme.colors.background.secondary,
    padding: scale(theme.spacing.md),
    borderRadius: theme.borderRadius.md,
    marginBottom: verticalScale(theme.spacing.lg),
  },

  feeBreakdownTitle: {
    fontSize: moderateScale(theme.typography.bodySmall.fontSize),
    color: theme.colors.text.primary,
    fontWeight: '600',
    marginBottom: verticalScale(theme.spacing.sm),
  },

  feeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: verticalScale(4),
  },

  feeLabel: {
    fontSize: moderateScale(theme.typography.bodySmall.fontSize),
    color: theme.colors.text.secondary,
  },

  feeValue: {
    fontSize: moderateScale(theme.typography.bodySmall.fontSize),
    color: theme.colors.text.primary,
  },

  feeRowTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: verticalScale(theme.spacing.xs),
    borderTopWidth: moderateScale(1),
    borderTopColor: theme.colors.border.light,
  },

  feeTotalLabel: {
    fontSize: moderateScale(theme.typography.body.fontSize),
    color: theme.colors.text.primary,
    fontWeight: '700',
  },

  feeTotalValue: {
    fontSize: moderateScale(theme.typography.body.fontSize),
    color: theme.colors.text.primary,
    fontWeight: '700',
  },

  // Payment Method Styles
  methodsContainer: {
    gap: verticalScale(theme.spacing.md),
  },

  methodCard: {
    backgroundColor: theme.colors.background.primary,
    borderWidth: moderateScale(1),
    borderColor: theme.colors.border.light,
    borderRadius: theme.borderRadius.lg,
    padding: scale(theme.spacing.md),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: moderateScale(2),
    },
    shadowOpacity: 0.1,
    shadowRadius: moderateScale(4),
    elevation: 2,
  },

  selectedCard: {
    borderWidth: moderateScale(3),
    transform: [{ scale: 1.02 }],
  },

  methodCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  methodIcon: {
    width: moderateScale(48),
    height: moderateScale(48),
    borderRadius: theme.borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scale(theme.spacing.md),
  },

  methodInfo: {
    flex: 1,
  },

  methodName: {
    fontSize: moderateScale(theme.typography.body.fontSize),
    color: theme.colors.text.primary,
    fontWeight: '600',
    marginBottom: verticalScale(2),
  },

  methodDescription: {
    fontSize: moderateScale(theme.typography.bodySmall.fontSize),
    color: theme.colors.text.secondary,
    lineHeight: moderateScale(16),
  },

  selectedIndicator: {
    borderRadius: theme.borderRadius.full,
    padding: moderateScale(4),
  },

  // Reference Input Styles
  referenceContainer: {
    marginTop: verticalScale(theme.spacing.lg),
  },

  referenceLabel: {
    fontSize: moderateScale(theme.typography.body.fontSize),
    color: theme.colors.text.primary,
    fontWeight: '600',
    marginBottom: verticalScale(theme.spacing.sm),
  },

  referenceInput: {
    backgroundColor: theme.colors.background.primary,
    borderWidth: moderateScale(1),
    borderColor: theme.colors.border.medium,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: scale(theme.spacing.md),
    paddingVertical: verticalScale(theme.spacing.sm),
    fontSize: moderateScale(theme.typography.body.fontSize),
    color: theme.colors.text.primary,
    minHeight: verticalScale(44),
  },

  referenceNote: {
    fontSize: moderateScale(theme.typography.caption.fontSize),
    color: theme.colors.text.secondary,
    marginTop: verticalScale(theme.spacing.xs),
    lineHeight: moderateScale(16),
  },

  // Instructions Styles
  instructionsContainer: {
    backgroundColor: theme.colors.semantic.warning + '10',
    padding: scale(theme.spacing.md),
    borderRadius: theme.borderRadius.md,
    borderLeftWidth: moderateScale(4),
    borderLeftColor: theme.colors.semantic.warning,
    marginTop: verticalScale(theme.spacing.lg),
  },

  instructionsContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  instructionsText: {
    flex: 1,
    marginLeft: scale(theme.spacing.sm),
  },

  instructionsTitle: {
    fontSize: moderateScale(theme.typography.bodySmall.fontSize),
    color: theme.colors.semantic.warning,
    fontWeight: '600',
    marginBottom: verticalScale(theme.spacing.xs),
  },

  instructionsBody: {
    fontSize: moderateScale(theme.typography.bodySmall.fontSize),
    color: theme.colors.semantic.warning,
    lineHeight: moderateScale(18),
  },

  // Error Styles
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: verticalScale(theme.spacing.md),
  },

  errorText: {
    fontSize: moderateScale(theme.typography.bodySmall.fontSize),
    color: theme.colors.semantic.error,
    marginLeft: scale(theme.spacing.xs),
    flex: 1,
  },
});
