import { StyleSheet } from 'react-native';
import { theme } from '@shared/styles/theme';
import { hp, wp } from '@shared/utils/responsive';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  contentContainer: {
    paddingBottom: hp(10),
  },
  sectionTitle: {
    ...theme.typography.h4,
    color: theme.colors.text.primary,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    marginHorizontal: theme.spacing.md,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background.secondary,
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
  },
  paymentOptionSelected: {
    borderColor: theme.colors.primary.main,
    backgroundColor: theme.colors.primary.light + '10',
  },
  paymentDetails: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  paymentName: {
    ...theme.typography.body,
    color: theme.colors.text.primary,
    fontWeight: '600',
  },
  paymentDescription: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.xxs,
  },
  paymentFee: {
    ...theme.typography.h4,
    color: theme.colors.primary.main,
    marginTop: theme.spacing.xs,
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
    color: theme.colors.primary.main,
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
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
    padding: theme.spacing.md,
    fontSize: theme.fontSize.md,
    color: theme.colors.text.primary,
  },
  instructionsContainer: {
    backgroundColor: theme.colors.info.light + '10',
    marginHorizontal: theme.spacing.md,
    marginTop: theme.spacing.lg,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.info.light,
  },
  instructionsTitle: {
    ...theme.typography.body,
    color: theme.colors.info.main,
    fontWeight: '600',
    marginBottom: theme.spacing.sm,
  },
  instructionsText: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
    lineHeight: 20,
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
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xxs,
    borderRadius: theme.borderRadius.sm,
  },
  statusBadgeText: {
    ...theme.typography.caption,
    color: theme.colors.white,
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
    backgroundColor: theme.colors.primary.main,
  },
});
