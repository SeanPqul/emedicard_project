import { Dimensions, StyleSheet } from "react-native";
import { theme, getColor, getSpacing, getTypography, getBorderRadius, getShadow } from "../../../src/styles/theme";

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
    paddingHorizontal: getSpacing('sm'),
    paddingVertical: getSpacing('xs'),
    borderRadius: getBorderRadius('full'),
    backgroundColor: getColor('accent.medicalBlue') + '20',
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
    borderRadius: getBorderRadius('xl'),
    padding: getSpacing('md'),
    marginBottom: getSpacing('md'),
    ...getShadow('medium'),
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: getSpacing('sm'),
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
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
  },
  applicationId: {
    ...getTypography('body'),
    fontWeight: '600',
    color: getColor('text.primary'),
  },
  applicationDate: {
    ...getTypography('caption'),
    color: getColor('text.secondary'),
    marginTop: getSpacing('xs') / 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: getSpacing('sm'),
    paddingVertical: getSpacing('xs'),
    borderRadius: getBorderRadius('lg'),
  },
  statusText: {
    ...getTypography('caption'),
    fontWeight: '600',
    marginLeft: getSpacing('xs'),
  },
  cardContent: {
    marginBottom: getSpacing('sm'),
  },
  jobCategory: {
    ...getTypography('h4'),
    color: getColor('text.primary'),
    marginBottom: getSpacing('xs'),
  },
  position: {
    ...getTypography('body'),
    fontWeight: '500',
    color: getColor('text.secondary'),
    marginBottom: getSpacing('xs') / 2,
  },
  organization: {
    ...getTypography('bodySmall'),
    color: getColor('text.secondary'),
    marginBottom: getSpacing('sm'),
  },
  applicationDetails: {
    marginBottom: getSpacing('sm'),
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: getSpacing('xs'),
  },
  detailLabel: {
    ...getTypography('bodySmall'),
    color: getColor('text.secondary'),
    flex: 1,
  },
  detailValue: {
    ...getTypography('bodySmall'),
    color: getColor('text.primary'),
    flex: 2,
    textAlign: 'right',
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
