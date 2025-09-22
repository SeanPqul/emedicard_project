import { StyleSheet } from 'react-native';
import { theme } from '@shared/styles/theme';
import { moderateScale, verticalScale, scale, wp } from '@shared/utils/responsive';

export const styles = StyleSheet.create({
  stepIndicator: {
    flexDirection: 'row',
    paddingHorizontal: scale(theme.spacing.lg),
    paddingVertical: verticalScale(theme.spacing.md),
    backgroundColor: theme.colors.background.secondary,
  },
  stepItem: {
    flex: 1,
    alignItems: 'center',
    position: 'relative',
  },
  stepCircle: {
    width: moderateScale(32),
    height: moderateScale(32),
    borderRadius: theme.borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: verticalScale(theme.spacing.sm),
    zIndex: 2,
  },
  stepCircleActive: {
    backgroundColor: theme.colors.brand.secondary,
  },
  stepCircleInactive: {
    backgroundColor: theme.colors.border.medium,
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  stepNumberActive: {
    color: theme.colors.background.primary,
  },
  stepNumberInactive: {
    color: theme.colors.text.secondary,
  },
  stepTitle: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: verticalScale(theme.spacing.sm),
  },
  stepTitleActive: {
    color: theme.colors.brand.secondary,
    fontWeight: '600' as const,
  },
  stepTitleInactive: {
    color: theme.colors.text.secondary,
  },
  stepLine: {
    position: 'absolute',
    top: moderateScale(16),
    left: '60%',
    width: '80%',
    height: 2,
    zIndex: 1,
  },
  stepLineActive: {
    backgroundColor: theme.colors.brand.secondary,
  },
  stepLineInactive: {
    backgroundColor: theme.colors.border.light,
  },
});
