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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: HEADER_CONSTANTS.HORIZONTAL_PADDING,
    paddingTop: verticalScale(32),
    paddingBottom: verticalScale(8),
    gap: HEADER_CONSTANTS.ICON_TEXT_GAP,
  },
  iconContainer: {
    width: HEADER_CONSTANTS.ICON_SIZE,
    height: HEADER_CONSTANTS.ICON_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: HEADER_CONSTANTS.TITLE_FONT_SIZE,
    fontWeight: '700',
    color: HEADER_CONSTANTS.WHITE,
    lineHeight: HEADER_CONSTANTS.TITLE_LINE_HEIGHT,
  },
  subtitle: {
    fontSize: HEADER_CONSTANTS.SUBTITLE_FONT_SIZE,
    fontWeight: '500',
    color: HEADER_CONSTANTS.WHITE,
    opacity: 0.85,
    marginTop: HEADER_CONSTANTS.TITLE_MARGIN_BOTTOM,
  },
  filterButton: {
    width: HEADER_CONSTANTS.ACTION_BUTTON_SIZE,
    height: HEADER_CONSTANTS.ACTION_BUTTON_SIZE,
    borderRadius: HEADER_CONSTANTS.ACTION_BUTTON_RADIUS,
    backgroundColor: HEADER_CONSTANTS.WHITE_OVERLAY,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: HEADER_CONSTANTS.WHITE,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: moderateScale(12),
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(12),
    marginHorizontal: HEADER_CONSTANTS.HORIZONTAL_PADDING,
    marginTop: verticalScale(10),
    marginBottom: verticalScale(24),
  },
  searchIcon: {
    marginRight: scale(8),
  },
  searchInput: {
    flex: 1,
    fontSize: moderateScale(15),
    color: HEADER_CONSTANTS.WHITE,
    padding: 0,
  },
  wave: {
    position: 'absolute',
    bottom: -1,
    left: 0,
    right: 0,
  },
});
