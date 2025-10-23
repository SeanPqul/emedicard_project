import { StyleSheet } from 'react-native';
import { theme } from '../theme';
import { HEADER_CONSTANTS } from '@shared/constants/header.constants';
import { scale, verticalScale, moderateScale } from '@shared/utils/responsive';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.secondary,
  },
  header: {
    backgroundColor: theme.colors.primary[500],
    borderBottomLeftRadius: moderateScale(24),
    borderBottomRightRadius: moderateScale(24),
    paddingHorizontal: HEADER_CONSTANTS.HORIZONTAL_PADDING,
    paddingTop: HEADER_CONSTANTS.TOP_PADDING,
    paddingBottom: HEADER_CONSTANTS.BOTTOM_PADDING,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerTextContainer: {
    marginLeft: HEADER_CONSTANTS.ICON_TEXT_GAP,
    flex: 1,
  },
  title: {
    fontSize: HEADER_CONSTANTS.TITLE_FONT_SIZE,
    fontWeight: '600',
    color: HEADER_CONSTANTS.WHITE,
    lineHeight: HEADER_CONSTANTS.TITLE_LINE_HEIGHT,
  },
  subtitle: {
    fontSize: HEADER_CONSTANTS.SUBTITLE_FONT_SIZE,
    color: HEADER_CONSTANTS.WHITE_TRANSPARENT,
    marginTop: verticalScale(2),
  },
  scanHistoryButton: {
    width: HEADER_CONSTANTS.ACTION_BUTTON_SIZE,
    height: HEADER_CONSTANTS.ACTION_BUTTON_SIZE,
    borderRadius: HEADER_CONSTANTS.ACTION_BUTTON_RADIUS,
    backgroundColor: HEADER_CONSTANTS.WHITE_OVERLAY,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  upcomingSection: {
    paddingHorizontal: scale(16),
    marginTop: verticalScale(24),
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(12),
  },
  sectionTitle: {
    fontSize: moderateScale(12),
    fontWeight: '700',
    color: theme.colors.text.tertiary,
    letterSpacing: 1,
  },
  viewAllText: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    color: theme.colors.primary[500],
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: scale(16),
    marginTop: verticalScale(24),
    gap: scale(12),
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.background.primary,
    paddingVertical: verticalScale(16),
    borderRadius: moderateScale(12),
    gap: scale(8),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  actionButtonText: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    color: theme.colors.primary[500],
  },
  bottomSpacer: {
    height: verticalScale(24),
  },
  unauthorizedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: scale(20),
    backgroundColor: theme.colors.background.secondary,
  },
  unauthorizedText: {
    fontSize: moderateScale(24),
    fontWeight: 'bold',
    color: theme.colors.semantic.error,
    marginBottom: verticalScale(8),
  },
  unauthorizedSubtext: {
    fontSize: moderateScale(16),
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
});
