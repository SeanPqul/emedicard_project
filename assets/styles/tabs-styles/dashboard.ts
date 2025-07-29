import { StyleSheet } from "react-native";
import { getBorderRadius, getColor, getShadow, getSpacing, getTypography } from "../../../src/styles/theme";

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
  sectionTitle: {
    ...getTypography('h4'),
    color: getColor('text.primary'),
    marginBottom: getSpacing('sm'),
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
  // Current Application Status Styles
  currentApplicationContainer: {
    marginHorizontal: getSpacing('lg'),
    marginVertical: getSpacing('md'),
    backgroundColor: getColor('background.primary'),
    borderRadius: getBorderRadius('lg'),
    padding: getSpacing('md'),
    ...getShadow('medium'),
  },
  currentApplicationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: getSpacing('md'),
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: getColor('accent.medicalBlue'),
    paddingHorizontal: getSpacing('sm'),
    paddingVertical: getSpacing('xs'),
    borderRadius: getBorderRadius('full'),
  },
  categoryText: {
    ...getTypography('caption'),
    color: getColor('text.inverse'),
    fontWeight: '600',
    marginLeft: getSpacing('xs'),
  },
  applicationId: {
    ...getTypography('caption'),
    color: getColor('text.secondary'),
  },
  progressContainer: {
    marginTop: getSpacing('sm'),
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: getSpacing('sm'),
  },
  progressTitle: {
    ...getTypography('bodySmall'),
    color: getColor('text.primary'),
    fontWeight: '600',
  },
  progressStatus: {
    ...getTypography('caption'),
    color: getColor('text.secondary'),
    textTransform: 'uppercase' as const,
    fontWeight: '600',
  },
  progressBar: {
    height: 6,
    backgroundColor: getColor('background.secondary'),
    borderRadius: getBorderRadius('full'),
    marginBottom: getSpacing('xs'),
  },
  progressFill: {
    height: '100%',
    borderRadius: getBorderRadius('full'),
  },
  progressText: {
    ...getTypography('caption'),
    color: getColor('text.secondary'),
  },
  // Primary Actions Styles
  primaryActionsContainer: {
    paddingHorizontal: getSpacing('lg'),
    paddingVertical: getSpacing('lg'),
    backgroundColor: getColor('background.secondary'),
    marginTop: getSpacing('sm'),
  },
  primaryActionsRow: {
    marginTop: getSpacing('md'),
  },
  // Collapsible panel styles
  collapsibleHeader: {
    paddingVertical: getSpacing('xs'),
  },
  expandButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getSpacing('xs'),
  },
  viewFullActivityLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: getSpacing('md'),
    marginTop: getSpacing('sm'),
    borderTopWidth: 1,
    borderTopColor: getColor('border.light'),
    gap: getSpacing('xs'),
  },
  viewFullActivityText: {
    ...getTypography('bodySmall'),
    color: getColor('accent.medicalBlue'),
    fontWeight: '600',
  },
  // Activity item card styling
  activityCard: {
    backgroundColor: getColor('background.primary'),
    borderRadius: getBorderRadius('md'),
    padding: getSpacing('md'),
    marginBottom: getSpacing('sm'),
    ...getShadow('small'),
  },
});
