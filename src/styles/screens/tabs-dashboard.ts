import { StyleSheet } from "react-native";
import { getBorderRadius, getColor, getShadow, getSpacing, getTypography } from "@/src/styles/theme";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: getColor('background.secondary'),
  },
  offlineBanner: {
    backgroundColor: getColor('semantic.warning'),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: getSpacing('xs'),
    gap: getSpacing('xs'),
  },
  offlineText: {
    ...getTypography('bodySmall'),
    color: getColor('ui.white'),
    fontWeight: '500',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
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
    paddingVertical: getSpacing('md'),
    marginTop: getSpacing('sm'),
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
    padding: getSpacing('xs'),
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
    paddingVertical: getSpacing('md'),
    backgroundColor: getColor('background.secondary'),
  },
  primaryActionsRow: {
    gap: getSpacing('sm'),
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
    backgroundColor: 'transparent',
    borderRadius: getBorderRadius('md'),
    padding: getSpacing('md'),
    marginBottom: getSpacing('xs'),
    borderBottomWidth: 1,
    borderBottomColor: getColor('border.light'),
  },
  // Priority Alert Styles
  priorityAlertContainer: {
    marginHorizontal: getSpacing('lg'),
    marginVertical: getSpacing('sm'),
    backgroundColor: getColor('semantic.error') + '10',
    borderRadius: getBorderRadius('lg'),
    borderLeftWidth: 4,
    borderLeftColor: getColor('semantic.error'),
    padding: getSpacing('md'),
  },
  priorityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: getSpacing('sm'),
  },
  priorityTitle: {
    ...getTypography('bodySmall'),
    color: getColor('semantic.error'),
    fontWeight: '700',
    marginLeft: getSpacing('xs'),
  },
  priorityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: getSpacing('xs'),
  },
  priorityText: {
    ...getTypography('bodySmall'),
    color: getColor('text.primary'),
    flex: 1,
    marginRight: getSpacing('sm'),
  },
  // Enhanced Application Status styles
  statusBadge: {
    paddingHorizontal: getSpacing('sm'),
    paddingVertical: getSpacing('xs') / 2,
    borderRadius: getBorderRadius('full'),
  },
  // Welcome Container styles
  welcomeContainer: {
    marginHorizontal: getSpacing('lg'),
    marginVertical: getSpacing('md'),
    backgroundColor: getColor('background.primary'),
    borderRadius: getBorderRadius('lg'),
    padding: getSpacing('lg'),
    alignItems: 'center',
    ...getShadow('medium'),
  },
  welcomeIcon: {
    width: 80,
    height: 80,
    borderRadius: getBorderRadius('full'),
    backgroundColor: getColor('accent.medicalBlue') + '10',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: getSpacing('md'),
  },
  welcomeTitle: {
    ...getTypography('h3'),
    color: getColor('text.primary'),
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: getSpacing('sm'),
  },
  welcomeSubtitle: {
    ...getTypography('body'),
    color: getColor('text.secondary'),
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: getSpacing('lg'),
  },
  welcomeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: getColor('accent.medicalBlue'),
    paddingHorizontal: getSpacing('lg'),
    paddingVertical: getSpacing('sm'),
    borderRadius: getBorderRadius('full'),
    ...getShadow('small'),
  },
  welcomeButtonText: {
    ...getTypography('bodySmall'),
    color: getColor('text.inverse'),
    fontWeight: '600',
    marginRight: getSpacing('xs'),
  },
  // Quick Actions Grid styles
  quickActionsContainer: {
    paddingHorizontal: getSpacing('lg'),
    paddingBottom: getSpacing('md'),
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  // Health Card Status styles
  healthCardStatusContainer: {
    paddingHorizontal: getSpacing('lg'),
    paddingBottom: getSpacing('lg'),
  },
  healthCardPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: getColor('background.primary'),
    borderRadius: getBorderRadius('lg'),
    padding: getSpacing('md'),
    ...getShadow('medium'),
  },
  healthCardIcon: {
    width: 48,
    height: 48,
    borderRadius: getBorderRadius('full'),
    backgroundColor: getColor('accent.safetyGreen') + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: getSpacing('md'),
  },
  healthCardInfo: {
    flex: 1,
  },
  healthCardTitle: {
    ...getTypography('bodySmall'),
    color: getColor('text.primary'),
    fontWeight: '600',
    marginBottom: getSpacing('xs') / 2,
  },
  healthCardSubtitle: {
    ...getTypography('caption'),
    color: getColor('text.secondary'),
  },
  healthCardButton: {
    width: 44,
    height: 44,
    borderRadius: getBorderRadius('full'),
    justifyContent: 'center',
    alignItems: 'center',
  },
});
