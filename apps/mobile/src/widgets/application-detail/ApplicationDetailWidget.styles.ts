import { StyleSheet } from 'react-native';
import { theme } from '@shared/styles/theme';
import { moderateScale, verticalScale, scale, wp, hp } from '@shared/utils/responsive';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.secondary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background.primary,
  },
  loadingText: {
    fontSize: moderateScale(16),
    color: theme.colors.text.secondary,
    marginTop: verticalScale(theme.spacing.md),
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: scale(theme.spacing.lg),
    paddingVertical: verticalScale(theme.spacing.md),
    backgroundColor: theme.colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  backButton: {
    padding: moderateScale(theme.spacing.xs),
  },
  headerTitle: {
    fontSize: moderateScale(18),
    fontWeight: '600' as const,
    color: theme.colors.text.primary,
    flex: 1,
    textAlign: 'center',
  },
  headerRight: {
    width: moderateScale(24),
  },

  // Status Card
  statusCard: {
    backgroundColor: theme.colors.background.primary,
    margin: moderateScale(theme.spacing.md),
    padding: moderateScale(theme.spacing.lg),
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.medium,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(theme.spacing.md),
  },
  statusIconContainer: {
    width: moderateScale(48),
    height: moderateScale(48),
    borderRadius: theme.borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scale(theme.spacing.md),
  },
  statusInfo: {
    flex: 1,
  },
  statusText: {
    fontSize: moderateScale(18),
    fontWeight: '700' as const,
  },
  applicationId: {
    fontSize: moderateScale(14),
    color: theme.colors.text.secondary,
    marginTop: verticalScale(theme.spacing.xs),
  },
  urgencyBanner: {
    padding: moderateScale(theme.spacing.sm),
    borderRadius: theme.borderRadius.md,
    marginBottom: verticalScale(theme.spacing.md),
  },
  urgencyText: {
    fontSize: moderateScale(14),
    fontWeight: '600' as const,
    textAlign: 'center',
  },
  remarksContainer: {
    backgroundColor: theme.colors.background.tertiary,
    padding: moderateScale(theme.spacing.md),
    borderRadius: theme.borderRadius.md,
  },
  remarksLabel: {
    fontSize: moderateScale(14),
    fontWeight: '600' as const,
    color: theme.colors.text.secondary,
    marginBottom: verticalScale(theme.spacing.xs),
  },
  remarksText: {
    fontSize: moderateScale(14),
    color: theme.colors.text.primary,
    lineHeight: moderateScale(14 * 1.5),
  },

  // Info Card
  infoCard: {
    backgroundColor: theme.colors.background.primary,
    marginHorizontal: scale(theme.spacing.md),
    marginBottom: verticalScale(theme.spacing.md),
    padding: moderateScale(theme.spacing.lg),
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.medium,
  },
  sectionTitle: {
    fontSize: moderateScale(16),
    fontWeight: '600' as const,
    color: theme.colors.text.primary,
    marginBottom: verticalScale(theme.spacing.md),
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: verticalScale(theme.spacing.sm),
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light + '30',
  },
  infoLabel: {
    fontSize: moderateScale(14),
    color: theme.colors.text.secondary,
    flex: 1,
  },
  infoValue: {
    fontSize: moderateScale(14),
    color: theme.colors.text.primary,
    fontWeight: '500' as const,
    flex: 2,
    textAlign: 'right',
  },
  jobCategoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    flex: 2,
  },
  jobCategoryDot: {
    width: moderateScale(10),
    height: moderateScale(10),
    borderRadius: theme.borderRadius.full,
    marginRight: scale(theme.spacing.xs),
  },

  // Payment Card
  paymentCard: {
    backgroundColor: theme.colors.background.primary,
    marginHorizontal: scale(theme.spacing.md),
    marginBottom: verticalScale(theme.spacing.md),
    padding: moderateScale(theme.spacing.lg),
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.medium,
  },
  paymentAmount: {
    fontSize: moderateScale(32),
    fontWeight: '700' as const,
    color: theme.colors.brand.secondary,
    textAlign: 'center',
    marginVertical: verticalScale(theme.spacing.md),
  },
  paymentBreakdown: {
    fontSize: moderateScale(12),
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: verticalScale(theme.spacing.lg),
  },
  paymentMethods: {
    gap: verticalScale(theme.spacing.sm),
  },
  paymentMethodButton: {
    backgroundColor: theme.colors.brand.secondary,
    paddingVertical: verticalScale(theme.spacing.md),
    paddingHorizontal: scale(theme.spacing.lg),
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
  },
  manualPaymentButton: {
    backgroundColor: theme.colors.blue[500],
  },
  paymentMethodText: {
    fontSize: moderateScale(16),
    color: theme.colors.text.inverse,
    fontWeight: '600' as const,
  },

  // Action Buttons
  actionButtons: {
    paddingHorizontal: scale(theme.spacing.md),
    paddingBottom: verticalScale(theme.spacing.xl),
    gap: verticalScale(theme.spacing.sm),
  },
});
