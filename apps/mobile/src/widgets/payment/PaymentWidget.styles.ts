import { StyleSheet } from 'react-native';
import { theme } from '@shared/styles/theme';
import { hp, wp, moderateScale, scale, verticalScale } from '@shared/utils/responsive';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  contentContainer: {
    paddingBottom: hp(10),
  },
  paymentGrid: {
    marginHorizontal: theme.spacing.md,
    gap: verticalScale(theme.spacing.md),
  },
  sectionTitle: {
    ...theme.typography.h4,
    color: theme.colors.text.primary,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    marginHorizontal: theme.spacing.md,
  },
  paymentOption: {
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: theme.colors.background.secondary,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
    minHeight: verticalScale(120),
  },
  paymentOptionSelected: {
    borderColor: theme.colors.primary[500],
    backgroundColor: theme.colors.primary[100] + '10',
  },
  checkIcon: {
    position: 'absolute',
    top: theme.spacing.sm,
    right: theme.spacing.sm,
  },
  paymentDetails: {
    flex: 1,
    marginTop: theme.spacing.sm,
    alignItems: 'center',
  },
  paymentName: {
    ...theme.typography.body,
    color: theme.colors.text.primary,
    fontWeight: '600',
    textAlign: 'center',
  },
  paymentDescription: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
    marginTop: verticalScale(4),
    textAlign: 'center',
  },
  paymentFee: {
    ...theme.typography.h3,
    color: theme.colors.primary[500],
    marginTop: verticalScale(8),
    fontWeight: 'bold',
  },
  paymentDetailsContainer: {
    marginTop: theme.spacing.lg,
  },
  feeBreakdown: {
    backgroundColor: theme.colors.background.secondary,
    marginHorizontal: theme.spacing.md,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  feeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.xs,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.light,
    marginTop: theme.spacing.sm,
    paddingTop: theme.spacing.md,
  },
  feeLabel: {
    ...theme.typography.body,
    color: theme.colors.text.secondary,
  },
  feeValue: {
    ...theme.typography.body,
    color: theme.colors.text.primary,
  },
  totalLabel: {
    ...theme.typography.h4,
    color: theme.colors.text.primary,
  },
  totalValue: {
    ...theme.typography.h4,
    color: theme.colors.primary[500],
  },
  inputContainer: {
    marginHorizontal: theme.spacing.md,
    marginTop: theme.spacing.lg,
  },
  inputLabel: {
    ...theme.typography.body,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  textInput: {
    backgroundColor: theme.colors.background.secondary,
    borderRadius: moderateScale(theme.borderRadius.md),
    borderWidth: scale(1),
    borderColor: theme.colors.border.light,
    padding: moderateScale(theme.spacing.md),
    fontSize: moderateScale(16),
    color: theme.colors.text.primary,
  },
  instructionsContainer: {
    backgroundColor: theme.colors.blue[100] + '10',
    marginHorizontal: scale(theme.spacing.md),
    marginTop: verticalScale(theme.spacing.lg),
    padding: moderateScale(theme.spacing.md),
    borderRadius: moderateScale(theme.borderRadius.md),
    borderWidth: scale(1),
    borderColor: theme.colors.blue[200],
  },
  instructionsTitle: {
    ...theme.typography.body,
    color: theme.colors.blue[600],
    fontWeight: '600',
    marginBottom: verticalScale(theme.spacing.sm),
  },
  instructionsText: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
    lineHeight: verticalScale(20),
  },
  existingPaymentContainer: {
    marginTop: theme.spacing.xl,
  },
  paymentStatusCard: {
    backgroundColor: theme.colors.background.secondary,
    marginHorizontal: theme.spacing.md,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  paymentStatusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  paymentStatusText: {
    ...theme.typography.body,
    color: theme.colors.text.primary,
  },
  statusBadge: {
    paddingHorizontal: scale(theme.spacing.sm),
    paddingVertical: verticalScale(2),
    borderRadius: moderateScale(theme.borderRadius.sm),
  },
  statusBadgeText: {
    ...theme.typography.caption,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  paymentReference: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.xs,
  },
  paymentAmount: {
    ...theme.typography.body,
    color: theme.colors.text.primary,
    marginTop: theme.spacing.xs,
  },
  submitContainer: {
    marginHorizontal: theme.spacing.md,
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.md,
  },
  paymentButton: {
    backgroundColor: theme.colors.primary[500],
  },
});
