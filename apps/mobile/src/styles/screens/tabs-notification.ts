import { StyleSheet } from "react-native";
import { theme, getColor, getSpacing, getTypography, getBorderRadius, getShadow } from "@/src/styles/theme";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: getColor('background.secondary'),
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: getColor('background.primary'),
    borderBottomWidth: 1,
    borderBottomColor: getColor('border.light'),
    paddingHorizontal: getSpacing('lg'),
    paddingTop: getSpacing('md'),
    paddingBottom: getSpacing('sm'),
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
    paddingHorizontal: getSpacing('sm'),
    paddingVertical: getSpacing('xs'),
    borderRadius: getBorderRadius('md'),
    backgroundColor: getColor('accent.medicalBlue') + '20',
  },
  markAllButtonText: {
    ...getTypography('bodySmall'),
    color: getColor('accent.medicalBlue'),
    fontWeight: '600',
  },
  categoriesContainer: {
    flexDirection: 'row',
  },
  categoryChip: {
    paddingHorizontal: getSpacing('md'),
    paddingVertical: getSpacing('sm'),
    borderRadius: getBorderRadius('full'),
    backgroundColor: getColor('background.tertiary'),
    marginRight: getSpacing('sm'),
    borderWidth: 1,
    borderColor: getColor('border.light'),
  },
  categoryChipActive: {
    backgroundColor: getColor('accent.medicalBlue'),
    borderColor: getColor('accent.medicalBlue'),
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
    ...getTypography('body'),
    fontWeight: '600',
    color: getColor('text.secondary'),
    marginBottom: getSpacing('sm'),
    paddingHorizontal: getSpacing('xs'),
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: getColor('background.primary'),
    borderRadius: getBorderRadius('lg'),
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
    ...getTypography('body'),
    fontWeight: '600',
    color: getColor('text.primary'),
    flex: 1,
  },
  notificationTime: {
    ...getTypography('caption'),
    color: getColor('text.secondary'),
    marginLeft: getSpacing('sm'),
  },
  notificationMessage: {
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
  },
});
