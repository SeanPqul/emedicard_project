import { StyleSheet } from 'react-native';
import { COLORS, FONT_SIZES, FONT_WEIGHTS, SPACING, BORDER_RADIUS, SHADOWS } from '@shared/constants/theme';
import { moderateScale, verticalScale, horizontalScale, wp, hp } from '@shared/utils/responsive';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.secondary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background.primary,
  },
  loadingText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text.secondary,
    marginTop: verticalScale(SPACING.md),
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: horizontalScale(SPACING.lg),
    paddingVertical: verticalScale(SPACING.md),
    backgroundColor: COLORS.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
  },
  backButton: {
    padding: moderateScale(SPACING.xs),
  },
  headerTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.text.primary,
    flex: 1,
    textAlign: 'center',
  },
  headerRight: {
    width: moderateScale(24),
  },

  // Status Card
  statusCard: {
    backgroundColor: COLORS.background.primary,
    margin: moderateScale(SPACING.md),
    padding: moderateScale(SPACING.lg),
    borderRadius: BORDER_RADIUS.lg,
    ...SHADOWS.md,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(SPACING.md),
  },
  statusIconContainer: {
    width: moderateScale(48),
    height: moderateScale(48),
    borderRadius: BORDER_RADIUS.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: horizontalScale(SPACING.md),
  },
  statusInfo: {
    flex: 1,
  },
  statusText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
  },
  applicationId: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
    marginTop: verticalScale(SPACING.xs),
  },
  urgencyBanner: {
    padding: moderateScale(SPACING.sm),
    borderRadius: BORDER_RADIUS.md,
    marginBottom: verticalScale(SPACING.md),
  },
  urgencyText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.semibold,
    textAlign: 'center',
  },
  remarksContainer: {
    backgroundColor: COLORS.background.tertiary,
    padding: moderateScale(SPACING.md),
    borderRadius: BORDER_RADIUS.md,
  },
  remarksLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.text.secondary,
    marginBottom: verticalScale(SPACING.xs),
  },
  remarksText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.primary,
    lineHeight: FONT_SIZES.sm * 1.5,
  },

  // Info Card
  infoCard: {
    backgroundColor: COLORS.background.primary,
    marginHorizontal: horizontalScale(SPACING.md),
    marginBottom: verticalScale(SPACING.md),
    padding: moderateScale(SPACING.lg),
    borderRadius: BORDER_RADIUS.lg,
    ...SHADOWS.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.text.primary,
    marginBottom: verticalScale(SPACING.md),
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: verticalScale(SPACING.sm),
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light + '30',
  },
  infoLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
    flex: 1,
  },
  infoValue: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.primary,
    fontWeight: FONT_WEIGHTS.medium,
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
    borderRadius: BORDER_RADIUS.full,
    marginRight: horizontalScale(SPACING.xs),
  },

  // Payment Card
  paymentCard: {
    backgroundColor: COLORS.background.primary,
    marginHorizontal: horizontalScale(SPACING.md),
    marginBottom: verticalScale(SPACING.md),
    padding: moderateScale(SPACING.lg),
    borderRadius: BORDER_RADIUS.lg,
    ...SHADOWS.md,
  },
  paymentAmount: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.primary.main,
    textAlign: 'center',
    marginVertical: verticalScale(SPACING.md),
  },
  paymentBreakdown: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: verticalScale(SPACING.lg),
  },
  paymentMethods: {
    gap: verticalScale(SPACING.sm),
  },
  paymentMethodButton: {
    backgroundColor: COLORS.primary.main,
    paddingVertical: verticalScale(SPACING.md),
    paddingHorizontal: horizontalScale(SPACING.lg),
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
  },
  manualPaymentButton: {
    backgroundColor: COLORS.secondary.main,
  },
  paymentMethodText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text.inverse,
    fontWeight: FONT_WEIGHTS.semibold,
  },

  // Action Buttons
  actionButtons: {
    paddingHorizontal: horizontalScale(SPACING.md),
    paddingBottom: verticalScale(SPACING.xl),
    gap: verticalScale(SPACING.sm),
  },
});
