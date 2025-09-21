import { StyleSheet } from 'react-native';
import { COLORS, FONT_SIZES, FONT_WEIGHTS, SPACING, BORDER_RADIUS } from '@shared/constants/theme';
import { moderateScale, verticalScale, horizontalScale, wp, hp } from '@shared/utils/responsive';

export const styles = StyleSheet.create({
  container: {
    paddingHorizontal: horizontalScale(SPACING.lg),
    paddingVertical: verticalScale(SPACING.md),
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.text.primary,
    marginBottom: verticalScale(SPACING.sm),
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: verticalScale(SPACING.sm),
  },
});
