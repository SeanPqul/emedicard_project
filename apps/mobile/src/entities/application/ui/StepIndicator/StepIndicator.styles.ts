import { StyleSheet } from 'react-native';
import { COLORS, FONT_SIZES, FONT_WEIGHTS, SPACING, BORDER_RADIUS } from '@shared/constants/theme';
import { moderateScale, verticalScale, horizontalScale } from '@shared/utils/responsive';

export const styles = StyleSheet.create({
  stepIndicator: {
    flexDirection: 'row',
    paddingHorizontal: horizontalScale(SPACING.lg),
    paddingVertical: verticalScale(SPACING.md),
    backgroundColor: COLORS.background.secondary,
  },
  stepItem: {
    flex: 1,
    alignItems: 'center',
    position: 'relative',
  },
  stepCircle: {
    width: moderateScale(32),
    height: moderateScale(32),
    borderRadius: BORDER_RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: verticalScale(SPACING.sm),
    zIndex: 2,
  },
  stepCircleActive: {
    backgroundColor: COLORS.primary.main,
  },
  stepCircleInactive: {
    backgroundColor: COLORS.border.medium,
  },
  stepNumber: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.semibold,
  },
  stepNumberActive: {
    color: COLORS.background.primary,
  },
  stepNumberInactive: {
    color: COLORS.text.secondary,
  },
  stepTitle: {
    fontSize: FONT_SIZES.xs,
    textAlign: 'center',
    marginBottom: verticalScale(SPACING.sm),
  },
  stepTitleActive: {
    color: COLORS.primary.main,
    fontWeight: FONT_WEIGHTS.semibold,
  },
  stepTitleInactive: {
    color: COLORS.text.secondary,
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
    backgroundColor: COLORS.primary.main,
  },
  stepLineInactive: {
    backgroundColor: COLORS.border.light,
  },
});
