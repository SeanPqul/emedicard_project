import { Dimensions, StyleSheet } from "react-native";
import { getBorderRadius, getColor, getShadow, getSpacing, getTypography } from "@shared/styles/theme";

const { width } = Dimensions.get('window');

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
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: getSpacing('md'),
    paddingVertical: getSpacing('xs'),
    borderRadius: getBorderRadius('full'),
    backgroundColor: getColor('accent.medicalBlue') + '20',
    marginRight: getSpacing('xs'),
    maxWidth: 100,
  },
  filterButtonText: {
    ...getTypography('bodySmall'),
    color: getColor('accent.medicalBlue'),
    marginLeft: getSpacing('xs'),
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: getColor('background.tertiary'),
    borderRadius: getBorderRadius('lg'),
    paddingHorizontal: getSpacing('sm'),
    paddingVertical: getSpacing('sm'),
    marginBottom: getSpacing('sm'),
  },
  searchIcon: {
    marginRight: getSpacing('sm'),
  },
  searchInput: {
    flex: 1,
    ...getTypography('body'),
    color: getColor('text.primary'),
  },
  filtersContainer: {
    backgroundColor: getColor('background.tertiary'),
    borderRadius: getBorderRadius('lg'),
    padding: getSpacing('sm'),
    marginBottom: getSpacing('sm'),
  },
  filterSection: {
    marginBottom: getSpacing('sm'),
  },
  filterLabel: {
    ...getTypography('bodySmall'),
    fontWeight: '600',
    color: getColor('text.primary'),
    marginBottom: getSpacing('sm'),
  },
  filterChip: {
    paddingHorizontal: getSpacing('sm'),
    paddingVertical: getSpacing('xs'),
    borderRadius: getBorderRadius('xl'),
    backgroundColor: getColor('background.primary'),
    borderWidth: 1,
    borderColor: getColor('border.light'),
    marginRight: getSpacing('sm'),
  },
  filterChipActive: {
    backgroundColor: getColor('accent.medicalBlue'),
    borderColor: getColor('accent.medicalBlue'),
  },
  filterChipText: {
    ...getTypography('caption'),
    color: getColor('text.secondary'),
  },
  filterChipTextActive: {
    color: getColor('text.inverse'),
  },
  content: {
    flex: 1,
  },
  applicationsList: {
    padding: getSpacing('md'),
  },
  applicationCard: {
    backgroundColor: getColor('background.primary'),
    borderRadius: getBorderRadius('lg'),
    padding: getSpacing('lg'),
    marginBottom: getSpacing('lg'), // Increased spacing between cards
    ...getShadow('medium'),
    borderWidth: 1,
    borderColor: 'transparent', // Will be used for hover/press states
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center', // Better vertical alignment
    marginBottom: getSpacing('lg'), // More breathing room
    paddingBottom: getSpacing('sm'),
    borderBottomWidth: 1,
    borderBottomColor: getColor('border.light') + '30', // Subtle divider
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  categoryIndicator: {
    width: 32,
    height: 32,
    borderRadius: getBorderRadius('full'),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: getSpacing('sm'),
  },
  cardHeaderInfo: {
    flex: 1,
    marginLeft: getSpacing('xs'),
  },
  applicationId: {
    ...getTypography('bodySmall'),
    fontWeight: '700',
    color: getColor('text.primary'),
    marginBottom: getSpacing('xs'),
  },
  applicationDate: {
    ...getTypography('caption'),
    color: getColor('text.secondary'),
    fontSize: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: getSpacing('sm'),
    paddingVertical: getSpacing('xs'),
    borderRadius: getBorderRadius('full'),
    alignSelf: 'flex-start',
  },
  statusText: {
    ...getTypography('caption'),
    fontWeight: '600',
    marginLeft: getSpacing('xs'),
  },
  lockIcon: {
    padding: getSpacing('xs'),
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContent: {
    marginBottom: getSpacing('md'),
  },
  jobCategory: {
    ...getTypography('h4'),
    color: getColor('text.primary'),
    fontWeight: '700',
    marginBottom: getSpacing('sm'),
  },
  position: {
    ...getTypography('body'),
    fontWeight: '600',
    color: getColor('text.primary'),
    marginBottom: getSpacing('xs'),
  },
  organization: {
    ...getTypography('bodySmall'),
    color: getColor('text.secondary'),
    marginBottom: getSpacing('md'),
  },
  applicationDetails: {
    backgroundColor: getColor('background.tertiary'),
    borderRadius: getBorderRadius('md'),
    padding: getSpacing('sm'),
    marginBottom: getSpacing('md'),
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: getSpacing('xs'),
    borderBottomWidth: 0,
  },
  detailLabel: {
    ...getTypography('bodySmall'),
    color: getColor('text.secondary'),
    flex: 1,
  },
  detailValue: {
    ...getTypography('bodySmall'),
    color: getColor('text.primary'),
    fontWeight: '600',
    textAlign: 'right',
    maxWidth: '60%',
  },
  remarksContainer: {
    backgroundColor: getColor('semanticUI.warningCard'),
    borderRadius: getBorderRadius('md'),
    padding: getSpacing('sm'),
    marginBottom: getSpacing('sm'),
  },
  remarksLabel: {
    ...getTypography('bodySmall'),
    fontWeight: '600',
    color: getColor('semanticUI.warningText'),
    marginBottom: getSpacing('xs'),
  },
  remarksText: {
    ...getTypography('bodySmall'),
    color: getColor('semanticUI.warningText'),
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressIndicator: {
    flex: 1,
    marginRight: getSpacing('sm'),
  },
  progressBar: {
    height: 4,
    backgroundColor: getColor('border.light'),
    borderRadius: getBorderRadius('sm'),
    marginBottom: getSpacing('xs'),
  },
  progressFill: {
    height: '100%',
    borderRadius: getBorderRadius('sm'),
  },
  progressText: {
    ...getTypography('caption'),
    color: getColor('text.secondary'),
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: getSpacing('sm'),
    paddingVertical: getSpacing('xs'),
    borderRadius: getBorderRadius('md'),
    backgroundColor: getColor('accent.medicalBlue') + '20',
  },
  viewButtonText: {
    ...getTypography('bodySmall'),
    color: getColor('accent.medicalBlue'),
    fontWeight: '600',
    marginRight: getSpacing('xs'),
  },
  fab: {
    position: 'absolute',
    bottom: getSpacing('xxxl'),
    right: getSpacing('lg'),
    width: 56,
    height: 56,
    borderRadius: getBorderRadius('full'),
    backgroundColor: getColor('accent.medicalBlue'),
    justifyContent: 'center',
    alignItems: 'center',
    ...getShadow('large'),
    zIndex: 1,
  },
});
