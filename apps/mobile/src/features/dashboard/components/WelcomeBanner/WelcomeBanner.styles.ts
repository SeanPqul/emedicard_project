import { StyleSheet } from 'react-native';
import { COLORS, FONT_SIZES, FONT_WEIGHTS, SPACING, BORDER_RADIUS } from '@/src/shared/constants/theme';
import { moderateScale, verticalScale, horizontalScale, wp, hp } from '@/src/shared/utils/responsive';

export const styles = StyleSheet.create({
  container: {
    marginHorizontal: horizontalScale(SPACING.lg),
    marginVertical: verticalScale(SPACING.md),
    padding: moderateScale(SPACING.lg),
    backgroundColor: COLORS.background.primary,
    borderRadius: BORDER_RADIUS.lg,
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
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.secondary.light + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: verticalScale(SPACING.md),
  },
  icon: {
    color: COLORS.secondary.main,
  },
  title: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.text.primary,
    marginBottom: verticalScale(SPACING.sm),
    textAlign: 'center',
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: verticalScale(SPACING.lg),
    paddingHorizontal: horizontalScale(SPACING.md),
    lineHeight: FONT_SIZES.md * 1.5,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.secondary.main,
    paddingHorizontal: horizontalScale(SPACING.lg),
    paddingVertical: verticalScale(SPACING.sm),
    borderRadius: BORDER_RADIUS.full,
    gap: horizontalScale(SPACING.xs),
  },
  buttonText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.inverse,
    fontWeight: FONT_WEIGHTS.semibold,
  },
  buttonIcon: {
    color: COLORS.text.inverse,
  },
});
