import { StyleSheet } from 'react-native';
import { theme } from '@shared/styles/theme';
import { scale, verticalScale, moderateScale } from '@shared/utils/responsive';
import { HEADER_CONSTANTS } from '@shared/constants/header.constants';

export const styles = StyleSheet.create({
  gradientContainer: {
    borderBottomLeftRadius: moderateScale(24),
    borderBottomRightRadius: moderateScale(24),
    paddingTop: HEADER_CONSTANTS.TOP_PADDING,
    paddingBottom: verticalScale(20),
    overflow: 'hidden',
  },
  container: {
    paddingHorizontal: HEADER_CONSTANTS.HORIZONTAL_PADDING,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(16),
  },
  titleSection: {
    flex: 1,
  },
  title: {
    fontSize: moderateScale(28),
    fontWeight: '700',
    color: theme.colors.ui.white,
    marginBottom: verticalScale(4),
  },
  subtitle: {
    fontSize: moderateScale(14),
    color: theme.colors.ui.white,
    opacity: 0.9,
    fontWeight: '500',
  },
  filterButton: {
    width: HEADER_CONSTANTS.ACTION_BUTTON_SIZE,
    height: HEADER_CONSTANTS.ACTION_BUTTON_SIZE,
    borderRadius: HEADER_CONSTANTS.ACTION_BUTTON_RADIUS,
    backgroundColor: HEADER_CONSTANTS.WHITE_OVERLAY,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: moderateScale(12),
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(10),
  },
  searchIcon: {
    marginRight: scale(8),
  },
  searchInput: {
    flex: 1,
    fontSize: moderateScale(15),
    color: theme.colors.ui.white,
    padding: 0,
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

