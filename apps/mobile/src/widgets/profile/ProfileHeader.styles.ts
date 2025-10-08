import { StyleSheet } from 'react-native';
import { theme } from '@shared/styles/theme';
import { scale, verticalScale, moderateScale } from '@shared/utils/responsive';
import { HEADER_CONSTANTS } from '@shared/constants/header.constants';

export const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: theme.colors.brand.primary,
    position: 'relative',
  },
  headerContent: {
    alignItems: 'center',
    paddingHorizontal: HEADER_CONSTANTS.HORIZONTAL_PADDING,
    paddingTop: HEADER_CONSTANTS.TOP_PADDING,
    paddingBottom: HEADER_CONSTANTS.BOTTOM_PADDING,
  },
  profilePictureContainer: {
    position: 'relative',
    marginBottom: verticalScale(theme.spacing.sm),
  },
  profilePicture: {
    width: moderateScale(80),
    height: moderateScale(80),
    borderRadius: moderateScale(40),
    borderWidth: moderateScale(3),
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  profilePicturePlaceholder: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profilePicturePlaceholderText: {
    fontSize: moderateScale(48),
  },
  editButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: moderateScale(28),
    height: moderateScale(28),
    borderRadius: moderateScale(14),
    backgroundColor: theme.colors.brand.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: moderateScale(2),
    borderColor: 'rgba(255, 255, 255, 0.9)',
  },
  userInfo: {
    alignItems: 'center',
  },
  userName: {
    fontSize: moderateScale(20),
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: verticalScale(2),
  },
  userEmail: {
    fontSize: moderateScale(13),
    fontWeight: '500',
    color: '#FFFFFF',
    opacity: 0.9,
    marginBottom: verticalScale(4),
  },
  memberSince: {
    fontSize: moderateScale(11),
    fontWeight: '500',
    color: '#FFFFFF',
    opacity: 0.75,
  },
  wave: {
    position: 'absolute',
    bottom: -1,
    left: 0,
    right: 0,
  },
});

