import { StyleSheet } from "react-native";
import { theme, getColor, getSpacing, getTypography, getBorderRadius, getShadow } from "../../../src/styles/theme";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: getColor('background.secondary'),
  },
  header: {
    backgroundColor: getColor('background.primary'),
    borderBottomWidth: 1,
    borderBottomColor: getColor('border.light'),
    paddingHorizontal: getSpacing('lg'),
    paddingTop: getSpacing('md'),
<<<<<<< HEAD
    paddingBottom: getSpacing('sm'),
=======
    paddingBottom: getSpacing('md'),
    ...getShadow('small'),
>>>>>>> 05b3e18 (UI Improvement and Bug fixes)
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: getSpacing('md'),
  },
  headerTitle: {
    ...getTypography('h2'),
    color: getColor('text.primary'),
  },
  markAllButton: {
<<<<<<< HEAD
    paddingHorizontal: getSpacing('sm'),
    paddingVertical: getSpacing('xs'),
    borderRadius: getBorderRadius('md'),
    backgroundColor: getColor('accent.medicalBlue') + '20',
  },
  markAllButtonText: {
    ...getTypography('bodySmall'),
    color: getColor('accent.medicalBlue'),
=======
    paddingHorizontal: getSpacing('md'),
    paddingVertical: getSpacing('sm'),
    borderRadius: getBorderRadius('full'),
    backgroundColor: getColor('accent.medicalBlue'),
    ...getShadow('small'),
  },
  markAllButtonText: {
    ...getTypography('bodySmall'),
    color: getColor('text.inverse'),
>>>>>>> 05b3e18 (UI Improvement and Bug fixes)
    fontWeight: '600',
  },
  categoriesContainer: {
    flexDirection: 'row',
  },
  categoryChip: {
    paddingHorizontal: getSpacing('md'),
    paddingVertical: getSpacing('sm'),
    borderRadius: getBorderRadius('full'),
<<<<<<< HEAD
    backgroundColor: getColor('background.tertiary'),
    marginRight: getSpacing('sm'),
    borderWidth: 1,
    borderColor: getColor('border.light'),
=======
    backgroundColor: getColor('background.secondary'),
    marginRight: getSpacing('sm'),
    borderWidth: 2,
    borderColor: getColor('border.light'),
    ...getShadow('small'),
>>>>>>> 05b3e18 (UI Improvement and Bug fixes)
  },
  categoryChipActive: {
    backgroundColor: getColor('accent.medicalBlue'),
    borderColor: getColor('accent.medicalBlue'),
<<<<<<< HEAD
=======
    transform: [{ scale: 1.05 }],
    ...getShadow('medium'),
>>>>>>> 05b3e18 (UI Improvement and Bug fixes)
  },
  categoryChipText: {
    ...getTypography('bodySmall'),
    color: getColor('text.secondary'),
    fontWeight: '500',
  },
  categoryChipTextActive: {
    color: getColor('text.inverse'),
  },
  content: {
    flex: 1,
  },
  notificationsList: {
    paddingHorizontal: getSpacing('md'),
    paddingTop: getSpacing('md'),
  },
  dateSection: {
    marginBottom: getSpacing('lg'),
  },
  dateLabel: {
<<<<<<< HEAD
    ...getTypography('body'),
    fontWeight: '600',
    color: getColor('text.secondary'),
    marginBottom: getSpacing('sm'),
    paddingHorizontal: getSpacing('xs'),
=======
    ...getTypography('bodyMedium'),
    fontWeight: '700',
    color: getColor('text.primary'),
    marginBottom: getSpacing('md'),
    paddingHorizontal: getSpacing('sm'),
    paddingVertical: getSpacing('xs'),
    backgroundColor: getColor('background.primary'),
    borderRadius: getBorderRadius('sm'),
    alignSelf: 'flex-start',
    ...getShadow('small'),
>>>>>>> 05b3e18 (UI Improvement and Bug fixes)
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: getColor('background.primary'),
    borderRadius: getBorderRadius('lg'),
<<<<<<< HEAD
    padding: getSpacing('md'),
    marginBottom: getSpacing('sm'),
    ...getShadow('small'),
    position: 'relative',
  },
  notificationItemUnread: {
    backgroundColor: getColor('accent.secondaryPale'),
    borderLeftWidth: 4,
    borderLeftColor: getColor('accent.medicalBlue'),
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: getBorderRadius('full'),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: getSpacing('sm'),
=======
    padding: getSpacing('lg'),
    marginBottom: getSpacing('md'),
    ...getShadow('medium'),
    position: 'relative',
    borderWidth: 1,
    borderColor: getColor('border.light'),
  },
  notificationItemUnread: {
    backgroundColor: getColor('accent.medicalBlue') + '08',
    borderLeftWidth: 5,
    borderLeftColor: getColor('accent.medicalBlue'),
    borderColor: getColor('accent.medicalBlue') + '30',
    ...getShadow('large'),
  },
  notificationIcon: {
    width: 48,
    height: 48,
    borderRadius: getBorderRadius('full'),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: getSpacing('md'),
    borderWidth: 2,
    borderColor: 'transparent',
>>>>>>> 05b3e18 (UI Improvement and Bug fixes)
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: getSpacing('xs'),
  },
  notificationTitle: {
<<<<<<< HEAD
    ...getTypography('body'),
    fontWeight: '600',
    color: getColor('text.primary'),
    flex: 1,
=======
    ...getTypography('bodyMedium'),
    fontWeight: '700',
    color: getColor('text.primary'),
    flex: 1,
    marginBottom: 2,
>>>>>>> 05b3e18 (UI Improvement and Bug fixes)
  },
  notificationTime: {
    ...getTypography('caption'),
    color: getColor('text.secondary'),
    marginLeft: getSpacing('sm'),
  },
  notificationMessage: {
<<<<<<< HEAD
    ...getTypography('bodySmall'),
    color: getColor('text.secondary'),
    lineHeight: 20,
    marginBottom: getSpacing('xs'),
  },
  notificationAction: {
    ...getTypography('caption'),
    color: getColor('accent.medicalBlue'),
    fontWeight: '500',
  },
  unreadIndicator: {
    position: 'absolute',
    top: getSpacing('md'),
    right: getSpacing('md'),
    width: 8,
    height: 8,
    borderRadius: getBorderRadius('full'),
    backgroundColor: getColor('accent.medicalBlue'),
=======
    ...getTypography('body'),
    color: getColor('text.secondary'),
    lineHeight: 22,
    marginBottom: getSpacing('sm'),
    marginTop: getSpacing('xs'),
  },
  notificationFooter: {
    marginTop: getSpacing('xs'),
  },
  actionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: getSpacing('xs'),
    borderTopWidth: 1,
    borderTopColor: getColor('border.light'),
  },
  notificationAction: {
    ...getTypography('caption'),
    fontWeight: '600',
    marginLeft: getSpacing('xs'),
  },
  unreadIndicator: {
    position: 'absolute',
    top: getSpacing('lg'),
    right: getSpacing('lg'),
    width: 12,
    height: 12,
    borderRadius: getBorderRadius('full'),
    backgroundColor: getColor('accent.medicalBlue'),
    borderWidth: 2,
    borderColor: getColor('background.primary'),
>>>>>>> 05b3e18 (UI Improvement and Bug fixes)
  },
});
