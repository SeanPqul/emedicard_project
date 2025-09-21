import { StyleSheet } from 'react-native';
import { COLORS, FONT_SIZES, FONT_WEIGHTS, SPACING, BORDER_RADIUS } from '@/src/shared/constants/theme';
import { moderateScale, verticalScale, horizontalScale, wp, hp } from '@/src/shared/utils/responsive';

export const styles = StyleSheet.create({
  container: {
    marginHorizontal: horizontalScale(SPACING.lg),
    marginVertical: verticalScale(SPACING.sm),
    padding: moderateScale(SPACING.md),
    backgroundColor: COLORS.status.error + '10',
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.status.error + '30',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(SPACING.sm),
    gap: horizontalScale(SPACING.xs),
  },
  headerIcon: {
    color: COLORS.status.error,
  },
  title: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.status.error,
    fontWeight: FONT_WEIGHTS.semibold,
  },
  alertItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: verticalScale(SPACING.xs),
  },
  alertText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.primary,
    flex: 1,
    marginRight: horizontalScale(SPACING.xs),
  },
  chevronIcon: {
    color: COLORS.status.error,
  },
});
