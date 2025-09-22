import { StyleSheet } from 'react-native';
import { theme } from '@shared/styles/theme';
import { moderateScale, verticalScale, scale, wp, hp } from '@shared/utils/responsive';

export const styles = StyleSheet.create({
  container: {
    marginHorizontal: scale(theme.spacing.lg),
    marginVertical: verticalScale(theme.spacing.md),
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.borderRadius.lg,
    padding: moderateScale(theme.spacing.md),
    ...theme.shadows.medium,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(theme.spacing.md),
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(theme.spacing.sm),
    paddingVertical: verticalScale(theme.spacing.xs),
    borderRadius: theme.borderRadius.full,
  },
  categoryIcon: {
    color: theme.colors.text.inverse,
  },
  categoryText: {
    fontSize: 12,
    color: theme.colors.text.inverse,
    fontWeight: '600' as const,
    marginLeft: scale(theme.spacing.xs),
  },
  applicationId: {
    fontSize: 12,
    color: theme.colors.text.secondary,
  },
  progressContainer: {
    marginTop: verticalScale(theme.spacing.sm),
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(theme.spacing.sm),
  },
  progressTitle: {
    fontSize: 14,
    color: theme.colors.text.primary,
    fontWeight: '600' as const,
  },
  statusBadge: {
    paddingHorizontal: scale(theme.spacing.sm),
    paddingVertical: verticalScale(theme.spacing.xs / 2),
    borderRadius: theme.borderRadius.md,
  },
  progressStatus: {
    fontSize: 12,
    textTransform: 'uppercase',
    fontWeight: '600' as const,
  },
  progressBar: {
    height: 6,
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borderRadius.full,
    marginBottom: verticalScale(theme.spacing.xs),
  },
  progressFill: {
    height: '100%',
    borderRadius: theme.borderRadius.full,
  },
  progressText: {
    fontSize: 12,
    color: theme.colors.text.secondary,
  },
  // Status colors
  statusApproved: {
    color: theme.colors.status.success,
  },
  statusApprovedBg: {
    backgroundColor: theme.colors.status.success + '20',
  },
  statusReview: {
    color: theme.colors.status.warning,
  },
  statusReviewBg: {
    backgroundColor: theme.colors.status.warning + '20',
  },
  statusSubmitted: {
    color: theme.colors.brand.secondary,
  },
  statusSubmittedBg: {
    backgroundColor: theme.colors.brand.secondary + '20',
  },
});
