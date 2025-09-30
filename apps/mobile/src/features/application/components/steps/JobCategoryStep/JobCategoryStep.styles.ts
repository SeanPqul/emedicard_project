import { StyleSheet } from 'react-native';
import { theme } from '@shared/styles/theme';
import { scale, verticalScale, moderateScale } from '@shared/utils/responsive';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: verticalScale(theme.spacing.lg),
  },
  title: {
    fontSize: moderateScale(theme.typography.h3.fontSize),
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: verticalScale(theme.spacing.xs),
  },
  subtitle: {
    fontSize: moderateScale(theme.typography.bodySmall.fontSize),
    color: theme.colors.text.secondary,
    marginBottom: verticalScale(theme.spacing.lg),
    lineHeight: moderateScale(theme.typography.bodySmall.lineHeight),
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: verticalScale(theme.spacing.md),
  },
  categoriesGrid: {
    gap: verticalScale(theme.spacing.sm),
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.borderRadius.md,
    padding: scale(theme.spacing.md),
    borderWidth: moderateScale(1.5),
    borderColor: theme.colors.border.light,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: moderateScale(1),
    },
    shadowOpacity: 0.03,
    shadowRadius: moderateScale(4),
    elevation: 1,
  },
  categoryCardSelected: {
    borderColor: theme.colors.brand.secondary,
    backgroundColor: theme.colors.background.tertiary,
  },
  colorIndicator: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: theme.borderRadius.sm,
    marginRight: scale(theme.spacing.sm),
  },
  categoryName: {
    flex: 1,
    fontSize: moderateScale(theme.typography.body.fontSize),
    fontWeight: '500',
    color: theme.colors.text.primary,
  },
  categoryNameSelected: {
    color: theme.colors.brand.secondary,
    fontWeight: '600',
  },
  orientationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.semantic.warning + '15',
    paddingHorizontal: scale(theme.spacing.xs),
    paddingVertical: verticalScale(2),
    borderRadius: theme.borderRadius.md,
    marginRight: scale(theme.spacing.xs),
  },
  orientationText: {
    fontSize: moderateScale(11),
    color: theme.colors.semantic.warning,
    marginLeft: scale(2),
    fontWeight: '500',
  },
  checkmark: {
    width: moderateScale(24),
    height: moderateScale(24),
    borderRadius: moderateScale(12),
    borderWidth: moderateScale(1.5),
    borderColor: theme.colors.border.light,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkSelected: {
    borderColor: theme.colors.brand.secondary,
    backgroundColor: theme.colors.brand.secondary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: verticalScale(80),
  },
  loadingText: {
    marginTop: verticalScale(theme.spacing.md),
    fontSize: moderateScale(theme.typography.bodySmall.fontSize),
    color: theme.colors.text.secondary,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: verticalScale(64),
  },
  emptyText: {
    marginTop: verticalScale(theme.spacing.md),
    fontSize: moderateScale(theme.typography.bodySmall.fontSize),
    color: theme.colors.text.secondary,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: verticalScale(theme.spacing.md),
  },
  errorText: {
    marginLeft: scale(theme.spacing.xs),
    color: theme.colors.semantic.error,
    fontSize: moderateScale(theme.typography.bodySmall.fontSize),
  },
});

export default styles;
