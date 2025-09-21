import { StyleSheet } from 'react-native';
import { COLORS, FONT_SIZES, FONT_WEIGHTS, SPACING, BORDER_RADIUS, SHADOWS } from '@/src/shared/constants/theme';
import { moderateScale, verticalScale, horizontalScale, wp, hp } from '@/src/shared/utils/responsive';

export const styles = StyleSheet.create({
  container: {
    paddingHorizontal: horizontalScale(SPACING.lg),
    paddingVertical: verticalScale(SPACING.md),
    marginTop: verticalScale(SPACING.sm),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(SPACING.sm),
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.text.primary,
  },
  viewAllText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.secondary.main,
    fontWeight: FONT_WEIGHTS.semibold,
  },
  activityList: {
    backgroundColor: COLORS.background.primary,
    borderRadius: BORDER_RADIUS.lg,
    padding: moderateScale(SPACING.xs),
    ...SHADOWS.md,
  },
});
