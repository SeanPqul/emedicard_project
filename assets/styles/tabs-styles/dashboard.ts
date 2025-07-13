import { StyleSheet } from "react-native";
import { theme, getColor, getSpacing, getTypography, getBorderRadius, getShadow } from "../../../src/styles/theme";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: getColor('background.secondary'),
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: getSpacing('md'),
    paddingVertical: getSpacing('md'),
    backgroundColor: getColor('background.primary'),
    borderBottomWidth: 1,
    borderBottomColor: getColor('border.light'),
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  profilePicture: {
    width: 50,
    height: 50,
    borderRadius: getBorderRadius('full'),
    marginRight: getSpacing('sm'),
    backgroundColor: getColor('border.light'),
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: getBorderRadius('full'),
  },
  welcomeText: {
    flex: 1,
    marginRight: getSpacing('sm'),
    minWidth: 0,
  },
  greeting: {
    ...getTypography('bodySmall'),
    color: getColor('text.secondary'),
  },
  userName: {
    ...getTypography('h4'),
    color: getColor('text.primary'),
    marginTop: getSpacing('xs') / 2,
  },
  currentTime: {
    ...getTypography('caption'),
    color: getColor('text.secondary'),
    marginTop: getSpacing('xs') / 2,
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: getBorderRadius('full'),
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginRight: -getSpacing('sm'),
  },
  notificationBadge: {
    position: 'absolute',
    top: getSpacing('sm'),
    right: getSpacing('sm'),
    backgroundColor: getColor('semantic.error'),
    borderRadius: getBorderRadius('full'),
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadgeText: {
    ...getTypography('caption'),
    color: getColor('text.inverse'),
    fontWeight: '600',
  },
  statsContainer: {
    paddingHorizontal: getSpacing('lg'),
    paddingVertical: getSpacing('md'),
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: getSpacing('sm'),
  },
  quickActionsContainer: {
    paddingHorizontal: getSpacing('lg'),
    paddingBottom: getSpacing('md'),
  },
  sectionTitle: {
    ...getTypography('h4'),
    color: getColor('text.primary'),
    marginBottom: getSpacing('sm'),
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  recentActivityContainer: {
    paddingHorizontal: getSpacing('lg'),
    paddingBottom: getSpacing('lg'),
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: getSpacing('sm'),
  },
  viewAllText: {
    ...getTypography('bodySmall'),
    color: getColor('accent.medicalBlue'),
    fontWeight: '600',
  },
  activityList: {
    backgroundColor: getColor('background.primary'),
    borderRadius: getBorderRadius('lg'),
    ...getShadow('medium'),
  },
});
