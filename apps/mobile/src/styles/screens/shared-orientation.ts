import { StyleSheet } from 'react-native';
import { getBorderRadius, getColor, getShadow, getSpacing, getTypography } from '../theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: getColor('background.secondary'),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: getSpacing('lg'),
    paddingVertical: getSpacing('md'),
    backgroundColor: getColor('background.primary'),
    borderBottomWidth: 1,
    borderBottomColor: getColor('border.light'),
  },
  headerTitle: {
    ...getTypography('h3'),
    color: getColor('text.primary'),
  },
  headerSpacer: {
    width: 24,
  },
  scrollView: {
    paddingHorizontal: getSpacing('lg'),
    paddingTop: getSpacing('lg'),
  },
  section: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: getSpacing('lg'),
  },
  sectionText: {
    marginLeft: getSpacing('sm'),
  },
  sectionTitle: {
    ...getTypography('h3'),
    color: getColor('text.primary'),
    marginBottom: getSpacing('md'),
    marginTop: getSpacing('xs'),
  },
  sectionSubtitle: {
    ...getTypography('body'),
    color: getColor('text.secondary'),
  },
  orientationCard: {
    backgroundColor: getColor('background.primary'),
    borderRadius: getBorderRadius('lg'),
    marginBottom: getSpacing('md'),
    ...getShadow('small'),
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: getSpacing('md'),
    borderBottomWidth: 1,
    borderBottomColor: getColor('border.light'),
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIndicator: {
    width: 32,
    height: 32,
    borderRadius: getBorderRadius('md'),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: getSpacing('sm'),
  },
  cardHeaderInfo: {
    flex: 1,
  },
  cardTitle: {
    ...getTypography('body'),
    fontWeight: '600',
    color: getColor('text.primary'),
    marginBottom: getSpacing('xs'),
  },
  cardSubtitle: {
    ...getTypography('body'),
    color: getColor('text.secondary'),
  },
  statusBadge: {
    paddingHorizontal: getSpacing('sm'),
    paddingVertical: getSpacing('xs'),
    borderRadius: getBorderRadius('sm'),
  },
  statusText: {
    ...getTypography('caption'),
    fontWeight: '600',
  },
  cardContent: {
    padding: getSpacing('md'),
  },
  scheduleInfo: {
    marginBottom: getSpacing('md'),
  },
  scheduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: getSpacing('xs'),
  },
  scheduleText: {
    ...getTypography('body'),
    color: getColor('text.primary'),
    marginLeft: getSpacing('xs'),
  },
  qrSection: {
    alignItems: 'center',
    marginBottom: getSpacing('lg'),
    padding: getSpacing('md'),
    backgroundColor: getColor('background.secondary'),
    borderRadius: getBorderRadius('lg'),
  },
  qrTitle: {
    ...getTypography('body'),
    fontWeight: '600',
    color: getColor('text.primary'),
    marginBottom: getSpacing('sm'),
  },
  qrContainer: {
    padding: getSpacing('sm'),
    backgroundColor: getColor('background.primary'),
    borderRadius: getBorderRadius('md'),
    marginBottom: getSpacing('sm'),
  },
  qrInstructions: {
    ...getTypography('caption'),
    color: getColor('text.secondary'),
    textAlign: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButton: {
    flex: 1,
    maxWidth: 200,
  },
  checkOutButton: {
    backgroundColor: getColor('warning.main'),
  },
  completionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: getColor('success.light'),
    paddingHorizontal: getSpacing('md'),
    paddingVertical: getSpacing('xs'),
    borderRadius: getBorderRadius('lg'),
  },
  completionText: {
    ...getTypography('body'),
    fontWeight: '600',
    color: getColor('success.main'),
    marginLeft: getSpacing('xs'),
  },
  infoSection: {
    marginTop: getSpacing('xxxl'),
  },
  infoCard: {
    backgroundColor: getColor('background.primary'),
    borderRadius: getBorderRadius('lg'),
    padding: getSpacing('md'),
    ...getShadow('small'),
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: getSpacing('sm'),
  },
  infoText: {
    ...getTypography('body'),
    color: getColor('text.primary'),
    marginLeft: getSpacing('sm'),
    flex: 1,
  },
});