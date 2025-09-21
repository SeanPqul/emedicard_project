import { StyleSheet } from 'react-native';
import { COLORS, FONT_SIZES, FONT_WEIGHTS, SPACING, BORDER_RADIUS, SHADOWS } from '@shared/constants/theme';
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
  cardPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background.primary,
    borderRadius: BORDER_RADIUS.lg,
    padding: moderateScale(SPACING.md),
    ...SHADOWS.md,
  },
  cardIcon: {
    width: moderateScale(56),
    height: moderateScale(56),
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.status.success + '10',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: horizontalScale(SPACING.md),
  },
  icon: {
    color: COLORS.status.success,
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.primary,
    fontWeight: FONT_WEIGHTS.semibold,
    marginBottom: verticalScale(SPACING.xs / 2),
  },
  cardSubtitle: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.text.secondary,
  },
  chevron: {
    marginLeft: horizontalScale(SPACING.sm),
  },
  chevronIcon: {
    color: COLORS.text.secondary,
  },
});
