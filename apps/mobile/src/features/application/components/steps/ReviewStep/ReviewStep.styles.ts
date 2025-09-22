import { StyleSheet } from 'react-native';
import { 
  getColor, 
  getSpacing, 
  getBorderRadius, 
  getTypography, 
  getShadow 
} from '@shared/styles/theme';
import { hp, wp } from '@shared/utils/responsive';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: getSpacing('md'),
    paddingTop: getSpacing('sm'),
  },

  heading: {
    ...getTypography('h3'),
    color: getColor('text.primary'),
    fontWeight: '700',
    marginBottom: getSpacing('sm'),
  },

  description: {
    ...getTypography('body'),
    color: getColor('text.secondary'),
    lineHeight: 20,
    marginBottom: getSpacing('lg'),
  },

  // Review Card Styles
  reviewCard: {
    backgroundColor: getColor('background.primary'),
    borderRadius: getBorderRadius('lg'),
    ...getShadow('medium'),
    overflow: 'hidden',
    marginBottom: getSpacing('lg'),
  },

  reviewSection: {
    padding: getSpacing('md'),
    borderBottomWidth: 1,
    borderBottomColor: getColor('border.light'),
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: getSpacing('md'),
  },

  sectionTitle: {
    ...getTypography('h4'),
    color: getColor('text.primary'),
    fontWeight: '700',
  },

  editButton: {
    backgroundColor: getColor('accent.medicalBlue') + '10',
    paddingHorizontal: getSpacing('sm'),
    paddingVertical: getSpacing('xs'),
    borderRadius: getBorderRadius('sm'),
  },

  editButtonText: {
    ...getTypography('bodySmall'),
    color: getColor('accent.medicalBlue'),
    fontWeight: '600',
  },

  // Detail Item Styles
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: getSpacing('sm'),
    borderBottomWidth: 1,
    borderBottomColor: getColor('border.light'),
  },

  lastItem: {
    borderBottomWidth: 0,
  },

  detailLabel: {
    ...getTypography('body'),
    color: getColor('text.secondary'),
    flex: 1,
  },

  detailValue: {
    ...getTypography('body'),
    color: getColor('text.primary'),
    fontWeight: '500',
    textAlign: 'right',
    flex: 2,
  },

  totalAmount: {
    fontWeight: '700',
    color: getColor('accent.medicalBlue'),
  },

  // Job Category Styles
  jobCategoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    flex: 2,
  },

  colorIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: getSpacing('sm'),
  },

  // Document Status Styles
  documentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: getSpacing('sm'),
    borderBottomWidth: 1,
    borderBottomColor: getColor('border.light'),
  },

  documentContent: {
    flex: 1,
    marginRight: getSpacing('md'),
  },

  documentTitle: {
    ...getTypography('body'),
    color: getColor('text.primary'),
    fontWeight: '500',
    marginBottom: 2,
  },

  requiredAsterisk: {
    color: getColor('semantic.error'),
    fontWeight: '700',
  },

  documentFileName: {
    ...getTypography('bodySmall'),
    color: getColor('text.secondary'),
    fontStyle: 'italic',
  },

  documentStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getSpacing('xs'),
  },

  documentStatusText: {
    ...getTypography('bodySmall'),
    fontWeight: '500',
  },

  // Fee Note Styles
  feeNote: {
    ...getTypography('bodySmall'),
    color: getColor('text.secondary'),
    lineHeight: 18,
    marginBottom: getSpacing('md'),
    fontStyle: 'italic',
  },

  // Orientation Notice Styles
  orientationNotice: {
    backgroundColor: '#F18F01' + '10',
    padding: getSpacing('md'),
    borderRadius: getBorderRadius('md'),
    borderLeftWidth: 4,
    borderLeftColor: '#F18F01',
    flexDirection: 'row',
    alignItems: 'flex-start',
    margin: getSpacing('md'),
  },

  orientationText: {
    ...getTypography('bodySmall'),
    color: '#F18F01',
    lineHeight: 18,
    marginLeft: getSpacing('sm'),
    flex: 1,
  },

  // Validation Warning Styles
  validationWarning: {
    backgroundColor: getColor('semantic.error') + '10',
    padding: getSpacing('md'),
    borderRadius: getBorderRadius('md'),
    borderLeftWidth: 4,
    borderLeftColor: getColor('semantic.error'),
    margin: getSpacing('md'),
  },

  validationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: getSpacing('sm'),
  },

  validationTitle: {
    ...getTypography('body'),
    color: getColor('semantic.error'),
    fontWeight: '700',
    marginLeft: getSpacing('sm'),
  },

  validationMessage: {
    ...getTypography('bodySmall'),
    color: getColor('semantic.error'),
    lineHeight: 18,
    marginTop: getSpacing('xs'),
  },

  // Terms and Conditions Styles
  termsContainer: {
    backgroundColor: getColor('background.secondary'),
    padding: getSpacing('md'),
    borderRadius: getBorderRadius('md'),
    marginBottom: getSpacing('xl'),
  },

  termsTitle: {
    ...getTypography('body'),
    color: getColor('text.primary'),
    fontWeight: '600',
    marginBottom: getSpacing('sm'),
  },

  termsText: {
    ...getTypography('bodySmall'),
    color: getColor('text.secondary'),
    lineHeight: 18,
  },
});
