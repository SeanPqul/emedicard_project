import { StyleSheet } from 'react-native';
import { theme } from '@shared/styles/theme';
import { moderateScale, verticalScale, scale } from '@shared/utils/responsive';

export const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.borderRadius.lg,
    padding: moderateScale(theme.spacing.md),
    marginVertical: verticalScale(theme.spacing.sm),
    ...theme.shadows.medium,
  },
  // High severity styles
  containerHigh: {
    borderWidth: 1,
    borderColor: theme.colors.status.error,
    backgroundColor: '#FEE2E2',
  },
  // Medium severity styles
  containerMedium: {
    borderWidth: 1,
    borderColor: theme.colors.status.warning,
    backgroundColor: '#FED7AA',
  },
  // Low severity styles
  containerLow: {
    borderWidth: 1,
    borderColor: '#D97706',
    backgroundColor: '#FEF3C7',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(theme.spacing.sm),
  },
  iconContainer: {
    marginRight: scale(theme.spacing.sm),
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: theme.typography.body.fontSize,
    fontWeight: '600' as const,
    lineHeight: theme.typography.body.lineHeight,
    color: theme.colors.text.primary,
  },
  attemptBadge: {
    fontSize: theme.typography.bodySmall.fontSize,
    color: theme.colors.text.secondary,
    marginTop: verticalScale(2),
  },
  reasonSection: {
    marginVertical: verticalScale(theme.spacing.sm),
  },
  reasonTitle: {
    fontSize: theme.typography.bodySmall.fontSize,
    fontWeight: '600' as const,
    color: theme.colors.text.secondary,
    marginBottom: verticalScale(theme.spacing.xs),
  },
  reasonText: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text.primary,
    lineHeight: moderateScale(20),
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: scale(theme.spacing.sm),
    paddingVertical: verticalScale(theme.spacing.xs),
    borderRadius: theme.borderRadius.full,
    marginTop: verticalScale(theme.spacing.xs),
  },
  categoryBadgeHigh: {
    backgroundColor: theme.colors.status.error + '20',
  },
  categoryBadgeMedium: {
    backgroundColor: theme.colors.status.warning + '20',
  },
  categoryBadgeLow: {
    backgroundColor: '#D97706' + '20',
  },
  categoryText: {
    fontSize: theme.typography.bodySmall.fontSize,
    fontWeight: '500' as const,
    marginLeft: scale(theme.spacing.xs),
  },
  categoryTextHigh: {
    color: theme.colors.status.error,
  },
  categoryTextMedium: {
    color: theme.colors.status.warning,
  },
  categoryTextLow: {
    color: '#D97706',
  },
  actionsContainer: {
    flexDirection: 'row',
    marginTop: verticalScale(theme.spacing.md),
    gap: scale(theme.spacing.sm),
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: verticalScale(theme.spacing.sm),
    borderRadius: theme.borderRadius.md,
    gap: scale(theme.spacing.xs),
  },
  primaryButton: {
    backgroundColor: theme.colors.brand.primary,
  },
  secondaryButton: {
    backgroundColor: theme.colors.background.secondary,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
  },
  primaryButtonText: {
    fontSize: theme.typography.body.fontSize,
    fontWeight: '600' as const,
    color: theme.colors.text.inverse,
  },
  secondaryButtonText: {
    fontSize: theme.typography.body.fontSize,
    fontWeight: '600' as const,
    color: theme.colors.text.primary,
  },
});
