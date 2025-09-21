import { StyleSheet } from 'react-native';
import { COLORS, FONT_SIZES, FONT_WEIGHTS, SPACING, BORDER_RADIUS } from '@shared/constants/theme';
import { moderateScale, verticalScale, horizontalScale, wp, hp } from '@shared/utils/responsive';

export const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: horizontalScale(SPACING.md),
    paddingVertical: verticalScale(SPACING.md),
    backgroundColor: COLORS.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  profilePicture: {
    width: moderateScale(50),
    height: moderateScale(50),
    borderRadius: BORDER_RADIUS.full,
    marginRight: horizontalScale(SPACING.sm),
    backgroundColor: COLORS.border.light,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  profileImage: {
    width: moderateScale(50),
    height: moderateScale(50),
    borderRadius: BORDER_RADIUS.full,
  },
  welcomeText: {
    flex: 1,
    marginRight: horizontalScale(SPACING.sm),
    minWidth: 0,
  },
  greeting: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
    fontWeight: FONT_WEIGHTS.regular,
  },
  userName: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.text.primary,
    marginTop: verticalScale(SPACING.xs / 2),
  },
  currentTime: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.text.secondary,
    marginTop: verticalScale(SPACING.xs / 2),
  },
  notificationButton: {
    width: moderateScale(44),
    height: moderateScale(44),
    borderRadius: BORDER_RADIUS.full,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative' as const,
    marginRight: -horizontalScale(SPACING.sm),
  },
  notificationIcon: {
    color: COLORS.text.primary,
  },
  notificationBadge: {
    position: 'absolute' as const,
    top: moderateScale(8),
    right: moderateScale(8),
    backgroundColor: COLORS.status.error,
    borderRadius: BORDER_RADIUS.full,
    minWidth: moderateScale(20),
    height: moderateScale(20),
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: horizontalScale(4),
  },
  notificationBadgeText: {
    fontSize: FONT_SIZES.micro,
    color: COLORS.text.inverse,
    fontWeight: FONT_WEIGHTS.semibold,
  },
});
