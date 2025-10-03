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
    borderRadius: moderateScale(16),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: verticalScale(theme.spacing.sm),
    zIndex: 2,
  },
  stepCircleActive: {
    backgroundColor: '#2E86AB',
  },
  stepCircleInactive: {
    backgroundColor: '#D1D5DB',
  },
  stepNumber: {
    fontSize: moderateScale(14),
    fontWeight: '600' as const,
  },
  stepNumberActive: {
    color: '#FFFFFF',
  },
  stepNumberInactive: {
    color: '#6B7280',
  },
  stepTitle: {
    fontSize: moderateScale(10),
    textAlign: 'center',
    marginTop: verticalScale(2),
  },
  stepTitleActive: {
    color: '#2E86AB',
    fontWeight: '600' as const,
  },
  stepTitleInactive: {
    color: '#6B7280',
  },
  stepLine: {
    position: 'absolute',
    top: moderateScale(16),
    left: '60%',
    width: '80%',
    height: moderateScale(2),
    zIndex: 1,
  },
  stepLineActive: {
    backgroundColor: '#2E86AB',
  },
  stepLineInactive: {
    backgroundColor: '#E5E7EB',
  },
});
