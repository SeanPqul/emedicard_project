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
    color: theme.colors.text.primary,
    fontWeight: '700',
    marginBottom: verticalScale(theme.spacing.sm),
  },

  description: {
    fontSize: moderateScale(theme.typography.body.fontSize),
    color: theme.colors.text.secondary,
    lineHeight: moderateScale(20),
    marginBottom: verticalScale(theme.spacing.lg),
  },

  // Review Card Styles
  reviewCard: {
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.borderRadius.lg,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: moderateScale(4),
    },
    shadowOpacity: 0.15,
    shadowRadius: moderateScale(8),
    elevation: 4,
    overflow: 'hidden',
    marginBottom: verticalScale(theme.spacing.lg),
  },

  reviewSection: {
    padding: scale(theme.spacing.md),
    borderBottomWidth: moderateScale(1),
    borderBottomColor: theme.colors.border.light,
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(theme.spacing.md),
  },

  sectionTitle: {
    fontSize: moderateScale(theme.typography.h4.fontSize),
    color: theme.colors.text.primary,
    fontWeight: '700',
  },

  editButton: {
    backgroundColor: theme.colors.brand.primary + '10',
    paddingHorizontal: scale(theme.spacing.sm),
    paddingVertical: verticalScale(theme.spacing.xs),
    borderRadius: theme.borderRadius.sm,
  },

  editButtonText: {
    fontSize: moderateScale(theme.typography.bodySmall.fontSize),
    color: theme.colors.brand.primary,
    fontWeight: '600',
  },

  // Detail Item Styles
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: verticalScale(theme.spacing.sm),
    borderBottomWidth: moderateScale(1),
    borderBottomColor: theme.colors.border.light,
  },

  lastItem: {
    borderBottomWidth: 0,
  },

  detailLabel: {
    fontSize: moderateScale(theme.typography.body.fontSize),
    color: theme.colors.text.secondary,
    flex: 1,
  },

  detailValue: {
    fontSize: moderateScale(theme.typography.body.fontSize),
    color: theme.colors.text.primary,
    fontWeight: '500',
    textAlign: 'right',
    flex: 2,
  },

  totalAmount: {
    fontWeight: '700',
    color: theme.colors.brand.primary,
  },

  // Job Category Styles
  jobCategoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    flex: 2,
  },

  colorIndicator: {
    width: moderateScale(12),
    height: moderateScale(12),
    borderRadius: moderateScale(6),
    marginRight: scale(theme.spacing.sm),
  },

  // Document Status Styles
  documentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: verticalScale(theme.spacing.sm),
    borderBottomWidth: moderateScale(1),
    borderBottomColor: theme.colors.border.light,
  },

  documentContent: {
    flex: 1,
    marginRight: scale(theme.spacing.md),
  },

  documentTitle: {
    fontSize: moderateScale(theme.typography.body.fontSize),
    color: theme.colors.text.primary,
    fontWeight: '500',
    marginBottom: verticalScale(2),
  },

  requiredAsterisk: {
    color: theme.colors.semantic.error,
    fontWeight: '700',
  },

  documentFileName: {
    fontSize: moderateScale(theme.typography.bodySmall.fontSize),
    color: theme.colors.text.secondary,
    fontStyle: 'italic',
  },

  documentStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(theme.spacing.xs),
  },

  documentStatusText: {
    fontSize: moderateScale(theme.typography.bodySmall.fontSize),
    fontWeight: '500',
  },

  // Fee Note Styles
  feeNote: {
    fontSize: moderateScale(theme.typography.bodySmall.fontSize),
    color: theme.colors.text.secondary,
    lineHeight: moderateScale(18),
    marginBottom: verticalScale(theme.spacing.md),
    fontStyle: 'italic',
  },

  // Orientation Notice Styles
  orientationNotice: {
    backgroundColor: theme.colors.semantic.warning + '10',
    padding: scale(theme.spacing.md),
    borderRadius: theme.borderRadius.md,
    borderLeftWidth: moderateScale(4),
    borderLeftColor: theme.colors.semantic.warning,
    flexDirection: 'row',
    alignItems: 'flex-start',
    margin: scale(theme.spacing.md),
  },

  orientationText: {
    fontSize: moderateScale(theme.typography.bodySmall.fontSize),
    color: theme.colors.semantic.warning,
    lineHeight: moderateScale(18),
    marginLeft: scale(theme.spacing.sm),
    flex: 1,
  },

  // Validation Warning Styles
  validationWarning: {
    backgroundColor: theme.colors.semantic.error + '10',
    padding: scale(theme.spacing.md),
    borderRadius: theme.borderRadius.md,
    borderLeftWidth: moderateScale(4),
    borderLeftColor: theme.colors.semantic.error,
    margin: scale(theme.spacing.md),
  },

  validationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(theme.spacing.sm),
  },

  validationTitle: {
    fontSize: moderateScale(theme.typography.body.fontSize),
    color: theme.colors.semantic.error,
    fontWeight: '700',
    marginLeft: scale(theme.spacing.sm),
  },

  validationMessage: {
    fontSize: moderateScale(theme.typography.bodySmall.fontSize),
    color: theme.colors.semantic.error,
    lineHeight: moderateScale(18),
    marginTop: verticalScale(theme.spacing.xs),
  },

  // Terms and Conditions Styles
  termsContainer: {
    backgroundColor: theme.colors.background.secondary,
    padding: scale(theme.spacing.md),
    borderRadius: theme.borderRadius.md,
    marginBottom: verticalScale(theme.spacing.xl),
  },

  termsTitle: {
    fontSize: moderateScale(theme.typography.body.fontSize),
    color: theme.colors.text.primary,
    fontWeight: '600',
    marginBottom: verticalScale(theme.spacing.sm),
  },

  termsText: {
    fontSize: moderateScale(theme.typography.bodySmall.fontSize),
    color: theme.colors.text.secondary,
    lineHeight: moderateScale(18),
  },
});
