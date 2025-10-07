import { StyleSheet } from 'react-native';
import { theme } from '@shared/styles/theme';
import { moderateScale, verticalScale, scale, wp, hp } from '@shared/utils/responsive';

export const styles = StyleSheet.create({
  container: {
    marginHorizontal: scale(theme.spacing.lg),
    marginVertical: verticalScale(theme.spacing.sm),
    padding: moderateScale(theme.spacing.md),
    backgroundColor: theme.colors.status.error + '10',
    borderRadius: theme.borderRadius.lg,
    borderWidth: moderateScale(1),
    borderColor: theme.colors.status.error + '30',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(theme.spacing.sm),
    gap: scale(theme.spacing.xs),
  },
  headerIcon: {
    color: theme.colors.status.error,
  },
  title: {
    fontSize: moderateScale(14),
    color: theme.colors.status.error,
    fontWeight: '600' as const,
  },
  alertItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: verticalScale(theme.spacing.xs),
  },
  alertText: {
    fontSize: moderateScale(14),
    color: theme.colors.text.primary,
    flex: 1,
    marginRight: scale(theme.spacing.xs),
  },
  chevronIcon: {
    color: theme.colors.status.error,
  },
});
