import { StyleSheet } from 'react-native';
import { theme } from '@shared/styles/theme';
import { scale, verticalScale } from '@shared/utils/responsive';
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
    paddingTop: HEADER_CONSTANTS.TOP_PADDING,
    paddingBottom: HEADER_CONSTANTS.BOTTOM_PADDING,
    gap: HEADER_CONSTANTS.ICON_TEXT_GAP,
  },
  iconBadgeContainer: {
    position: 'relative',
    width: HEADER_CONSTANTS.ICON_SIZE,
    height: HEADER_CONSTANTS.ICON_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadge: {
    position: 'absolute',
    top: -4,
    right: -6,
    backgroundColor: HEADER_CONSTANTS.BADGE_COLOR,
    borderRadius: HEADER_CONSTANTS.BADGE_HEIGHT / 2,
    minWidth: HEADER_CONSTANTS.BADGE_MIN_WIDTH,
    height: HEADER_CONSTANTS.BADGE_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: scale(4),
    borderWidth: HEADER_CONSTANTS.BADGE_BORDER_WIDTH,
    borderColor: theme.colors.brand.primary,
  },
  badgeText: {
    fontSize: HEADER_CONSTANTS.BADGE_FONT_SIZE,
    fontWeight: '700',
    color: HEADER_CONSTANTS.WHITE,
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
  unreadCount: {
    fontSize: HEADER_CONSTANTS.SUBTITLE_FONT_SIZE,
    fontWeight: '500',
    color: HEADER_CONSTANTS.WHITE,
    opacity: 0.85,
    marginTop: HEADER_CONSTANTS.TITLE_MARGIN_BOTTOM,
  },
  markAllButton: {
    width: HEADER_CONSTANTS.ACTION_BUTTON_SIZE,
    height: HEADER_CONSTANTS.ACTION_BUTTON_SIZE,
    borderRadius: HEADER_CONSTANTS.ACTION_BUTTON_RADIUS,
    backgroundColor: HEADER_CONSTANTS.WHITE_OVERLAY,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerRight: {
    width: HEADER_CONSTANTS.ACTION_BUTTON_SIZE,
  },
  wave: {
    position: 'absolute',
    bottom: -1,
    left: 0,
    right: 0,
  },
});

