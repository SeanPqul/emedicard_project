import { StyleSheet } from 'react-native';
import { COLORS, FONT_SIZES, SPACING } from '@/shared/constants/theme';
import { verticalScale } from '@/shared/utils/responsive';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background.primary,
  },
  message: {
    marginTop: verticalScale(SPACING.md),
    fontSize: FONT_SIZES.md,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
});
