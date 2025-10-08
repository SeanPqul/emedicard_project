import { StyleSheet } from 'react-native';
import { theme } from '@shared/styles/theme';
import { HEADER_CONSTANTS } from '@shared/constants/header.constants';

export const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: theme.colors.brand.secondary,
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
  backButton: {
    width: HEADER_CONSTANTS.ICON_BUTTON_SIZE,
    height: HEADER_CONSTANTS.ICON_BUTTON_SIZE,
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
  applicationId: {
    fontSize: HEADER_CONSTANTS.SUBTITLE_FONT_SIZE,
    fontWeight: '500',
    color: HEADER_CONSTANTS.WHITE,
    opacity: 0.85,
    marginTop: HEADER_CONSTANTS.TITLE_MARGIN_BOTTOM,
  },
  headerRight: {
    width: HEADER_CONSTANTS.ICON_BUTTON_SIZE,
  },
  wave: {
    position: 'absolute',
    bottom: -1,
    left: 0,
    right: 0,
  },
});

