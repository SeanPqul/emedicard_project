import { StyleSheet } from 'react-native';
import { theme } from '@shared/styles/theme';
import { moderateScale, verticalScale, scale, wp, hp } from '@shared/utils/responsive';

export const styles = StyleSheet.create({
  container: {
    marginHorizontal: scale(theme.spacing.lg),
    marginVertical: verticalScale(theme.spacing.md),
    padding: moderateScale(theme.spacing.lg),
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    width: moderateScale(80),
    height: moderateScale(80),
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.blue[300] + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: verticalScale(theme.spacing.md),
  },
  icon: {
    color: theme.colors.blue[500],
  },
  title: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: theme.colors.text.primary,
    marginBottom: verticalScale(theme.spacing.sm),
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: verticalScale(theme.spacing.lg),
    paddingHorizontal: scale(theme.spacing.md),
    lineHeight: 16 * 1.5,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.blue[500],
    paddingHorizontal: scale(theme.spacing.lg),
    paddingVertical: verticalScale(theme.spacing.sm),
    borderRadius: theme.borderRadius.full,
    gap: scale(theme.spacing.xs),
  },
  buttonText: {
    fontSize: 14,
    color: theme.colors.text.inverse,
    fontWeight: '600' as const,
  },
  buttonIcon: {
    color: theme.colors.text.inverse,
  },
});
