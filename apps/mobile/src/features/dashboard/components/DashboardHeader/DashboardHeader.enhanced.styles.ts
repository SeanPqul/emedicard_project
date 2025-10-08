import { StyleSheet } from 'react-native';
import { theme } from '@shared/styles/theme';
import { scale, verticalScale, moderateScale } from '@shared/utils/responsive';

export const styles = StyleSheet.create({
  gradientContainer: {
    borderBottomLeftRadius: moderateScale(24),
    borderBottomRightRadius: moderateScale(24),
    paddingTop: verticalScale(4), // Reduced from 50
    overflow: 'hidden',
  },
  container: {
    paddingHorizontal: scale(20),
    paddingTop: verticalScale(12),
    paddingBottom: verticalScale(20),
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(12),
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateIcon: {
    marginRight: scale(6),
  },
  dateText: {
    fontSize: moderateScale(14),
    color: theme.colors.ui.white,
    opacity: 0.9,
    fontWeight: '500',
  },
  notificationButton: {
    padding: scale(8),
  },
  notificationIconContainer: {
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -scale(4),
    right: -scale(4),
    backgroundColor: theme.colors.semantic.error,
    minWidth: moderateScale(18),
    height: moderateScale(18),
    borderRadius: moderateScale(9),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: moderateScale(2),
    borderColor: theme.colors.primary[500],
  },
  notificationBadgeText: {
    fontSize: moderateScale(10),
    fontWeight: '700',
    color: theme.colors.ui.white,
  },
  mainContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(16),
  },
  profileSection: {
    marginRight: scale(16),
    position: 'relative',
  },
  profileImage: {
    width: moderateScale(56),
    height: moderateScale(56),
    borderRadius: moderateScale(28),
    borderWidth: moderateScale(2),
    borderColor: theme.colors.ui.white,
  },
  profileImagePlaceholder: {
    width: moderateScale(56),
    height: moderateScale(56),
    borderRadius: moderateScale(28),
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: moderateScale(2),
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  profileInitials: {
    fontSize: moderateScale(20),
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  greetingSection: {
    flex: 1,
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  greetingText: {
    fontSize: moderateScale(16),
    color: theme.colors.ui.white,
    opacity: 0.9,
    fontWeight: '500',
  },
  userName: {
    fontSize: moderateScale(24),
    fontWeight: '700',
    color: theme.colors.ui.white,
    marginTop: verticalScale(2),
  },
  welcomeMessage: {
    fontSize: moderateScale(14),
    color: theme.colors.ui.white,
    opacity: 0.8,
    marginTop: verticalScale(4),
  },
  quickStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: moderateScale(12),
    padding: scale(12),
    justifyContent: 'space-between',
  },
  quickStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  quickStatText: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    color: theme.colors.ui.white,
    marginLeft: scale(8),
  },
  quickStatDivider: {
    width: moderateScale(1),
    height: moderateScale(20),
    backgroundColor: theme.colors.ui.white,
    opacity: 0.3,
    marginHorizontal: scale(12),
  },
  waveContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: moderateScale(20),
    overflow: 'hidden',
  },
  wave: {
    position: 'absolute',
    bottom: 0,
    left: -scale(50),
    right: -scale(50),
    height: moderateScale(40),
    backgroundColor: theme.colors.primary[500],
    borderTopLeftRadius: moderateScale(100),
    borderTopRightRadius: moderateScale(100),
    transform: [{ scaleX: 2 }],
  },
});
