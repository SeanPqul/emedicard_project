import { StyleSheet } from 'react-native';
import { theme } from '@shared/styles/theme';
import { moderateScale, verticalScale, scale, wp, hp } from '@shared/utils/responsive';

export const styles = StyleSheet.create({
  container: {
    paddingHorizontal: scale(theme.spacing.lg),
    paddingVertical: verticalScale(theme.spacing.md),
    marginTop: verticalScale(theme.spacing.sm),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(theme.spacing.sm),
  },
  sectionTitle: {
    fontSize: moderateScale(18),
    fontWeight: '600' as const,
    color: theme.colors.text.primary,
  },
  viewAllText: {
    fontSize: moderateScale(14),
    color: theme.colors.blue[500],
    fontWeight: '600' as const,
  },
  activityList: {
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.borderRadius.lg,
    padding: moderateScale(theme.spacing.xs),
    ...theme.shadows.medium,
  },
});
