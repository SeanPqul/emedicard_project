import { StyleSheet } from 'react-native';
import { theme } from '@shared/styles/theme';
import { moderateScale, verticalScale, scale, wp, hp } from '@shared/utils/responsive';

export const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: scale(theme.spacing.md),
    paddingVertical: verticalScale(theme.spacing.md),
    backgroundColor: theme.colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  profilePicture: {
    width: moderateScale(50),
    height: moderateScale(50),
    borderRadius: theme.borderRadius.full,
    marginRight: scale(theme.spacing.sm),
    backgroundColor: theme.colors.border.light,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  profileImage: {
    width: moderateScale(50),
    height: moderateScale(50),
    borderRadius: theme.borderRadius.full,
  },
  welcomeText: {
    flex: 1,
    marginRight: scale(theme.spacing.sm),
    minWidth: 0,
  },
  greeting: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    fontWeight: '400' as const,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: theme.colors.text.primary,
    marginTop: verticalScale(theme.spacing.xs / 2),
  },
  currentTime: {
    fontSize: 12,
    color: theme.colors.text.secondary,
    marginTop: verticalScale(theme.spacing.xs / 2),
  },
  notificationButton: {
    width: moderateScale(44),
    height: moderateScale(44),
    borderRadius: theme.borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative' as const,
    marginRight: -scale(theme.spacing.sm),
  },
  notificationIcon: {
    color: theme.colors.text.primary,
  },
  notificationBadge: {
    position: 'absolute' as const,
    top: moderateScale(8),
    right: moderateScale(8),
    backgroundColor: theme.colors.status.error,
    borderRadius: theme.borderRadius.full,
    minWidth: moderateScale(20),
    height: moderateScale(20),
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: scale(4),
  },
  notificationBadgeText: {
    fontSize: 10,
    color: theme.colors.text.inverse,
    fontWeight: '600' as const,
  },
});
