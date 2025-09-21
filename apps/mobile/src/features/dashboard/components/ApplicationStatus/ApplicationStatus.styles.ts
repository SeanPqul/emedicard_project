import { StyleSheet } from 'react-native';
import { COLORS, FONT_SIZES, FONT_WEIGHTS, SPACING, BORDER_RADIUS, SHADOWS } from '@/shared/constants/theme';
import { moderateScale, verticalScale, horizontalScale } from '@/shared/utils/responsive';

export const styles = StyleSheet.create({
  container: {
    marginHorizontal: horizontalScale(SPACING.lg),
    marginVertical: verticalScale(SPACING.md),
    backgroundColor: COLORS.background.primary,
    borderRadius: BORDER_RADIUS.lg,
    padding: moderateScale(SPACING.md),
    ...SHADOWS.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(SPACING.md),
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: horizontalScale(SPACING.sm),
    paddingVertical: verticalScale(SPACING.xs),
    borderRadius: BORDER_RADIUS.full,
  },
  categoryIcon: {
    color: COLORS.text.inverse,
  },
  categoryText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.text.inverse,
    fontWeight: FONT_WEIGHTS.semibold,
    marginLeft: horizontalScale(SPACING.xs),
  },
  applicationId: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.text.secondary,
  },
  progressContainer: {
    marginTop: verticalScale(SPACING.sm),
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(SPACING.sm),
  },
  progressTitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.primary,
    fontWeight: FONT_WEIGHTS.semibold,
  },
  statusBadge: {
    paddingHorizontal: horizontalScale(SPACING.sm),
    paddingVertical: verticalScale(SPACING.xs / 2),
    borderRadius: BORDER_RADIUS.md,
  },
  progressStatus: {
    fontSize: FONT_SIZES.xs,
    textTransform: 'uppercase',
    fontWeight: FONT_WEIGHTS.semibold,
  },
  progressBar: {
    height: 6,
    backgroundColor: COLORS.background.secondary,
    borderRadius: BORDER_RADIUS.full,
    marginBottom: verticalScale(SPACING.xs),
  },
  progressFill: {
    height: '100%',
    borderRadius: BORDER_RADIUS.full,
  },
  progressText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.text.secondary,
  },
  // Status colors
  statusApproved: {
    color: COLORS.status.success,
  },
  statusApprovedBg: {
    backgroundColor: COLORS.status.success + '20',
  },
  statusReview: {
    color: COLORS.status.warning,
  },
  statusReviewBg: {
    backgroundColor: COLORS.status.warning + '20',
  },
  statusSubmitted: {
    color: COLORS.secondary.main,
  },
  statusSubmittedBg: {
    backgroundColor: COLORS.secondary.main + '20',
  },
});
