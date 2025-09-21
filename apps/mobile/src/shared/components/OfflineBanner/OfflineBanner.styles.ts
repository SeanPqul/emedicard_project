import { StyleSheet } from 'react-native';
import { COLORS, FONT_SIZES, FONT_WEIGHTS, SPACING } from '@/shared/constants/theme';
import { verticalScale, horizontalScale } from '@/shared/utils/responsive';

export const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.status.warning,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: verticalScale(SPACING.xs),
    paddingHorizontal: horizontalScale(SPACING.sm),
    gap: horizontalScale(SPACING.xs),
  },
  icon: {
    color: COLORS.text.inverse,
  },
  text: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.inverse,
    fontWeight: FONT_WEIGHTS.medium,
  },
});
