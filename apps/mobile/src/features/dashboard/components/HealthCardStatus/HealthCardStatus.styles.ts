import { StyleSheet } from 'react-native';
import { theme } from '@shared/styles/theme';
import { moderateScale, verticalScale, scale, wp, hp } from '@shared/utils/responsive';

export const styles = StyleSheet.create({
  container: {
    paddingHorizontal: scale(theme.spacing.lg),
    paddingVertical: verticalScale(theme.spacing.md),
  },
  sectionTitle: {
    fontSize: moderateScale(18),
    fontWeight: '600' as const,
    color: theme.colors.text.primary,
    marginBottom: verticalScale(theme.spacing.sm),
  },
  cardPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.borderRadius.lg,
    padding: moderateScale(theme.spacing.md),
    ...theme.shadows.medium,
  },
  cardIcon: {
    width: moderateScale(56),
    height: moderateScale(56),
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.status.success + '10',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scale(theme.spacing.md),
  },
  icon: {
    color: theme.colors.status.success,
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: moderateScale(14),
    color: theme.colors.text.primary,
    fontWeight: '600' as const,
    marginBottom: verticalScale(theme.spacing.xs / 2),
  },
  cardSubtitle: {
    fontSize: moderateScale(12),
    color: theme.colors.text.secondary,
  },
  chevron: {
    marginLeft: scale(theme.spacing.sm),
  },
  chevronIcon: {
    color: theme.colors.text.secondary,
  },
});
