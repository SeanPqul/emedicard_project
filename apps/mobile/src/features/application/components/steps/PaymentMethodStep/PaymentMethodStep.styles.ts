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
    ...getTypography('bodyMedium'),
    color: getColor('text.secondary'),
    lineHeight: 20,
    marginBottom: getSpacing('lg'),
  },

  // Fee Breakdown Styles
  feeBreakdownContainer: {
    backgroundColor: getColor('background.secondary'),
    padding: getSpacing('md'),
    borderRadius: getBorderRadius('md'),
    marginBottom: getSpacing('lg'),
  },

  feeBreakdownTitle: {
    ...getTypography('bodySmall'),
    color: getColor('text.primary'),
    fontWeight: '600',
    marginBottom: getSpacing('sm'),
  },

  feeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },

  feeLabel: {
    ...getTypography('bodySmall'),
    color: getColor('text.secondary'),
  },

  feeValue: {
    ...getTypography('bodySmall'),
    color: getColor('text.primary'),
  },

  feeRowTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: getSpacing('xs'),
    borderTopWidth: 1,
    borderTopColor: getColor('border.light'),
  },

  feeTotalLabel: {
    ...getTypography('bodyMedium'),
    color: getColor('text.primary'),
    fontWeight: '700',
  },

  feeTotalValue: {
    ...getTypography('bodyMedium'),
    color: getColor('text.primary'),
    fontWeight: '700',
  },

  // Payment Method Styles
  methodsContainer: {
    gap: getSpacing('md'),
  },

  methodCard: {
    backgroundColor: getColor('background.primary'),
    borderWidth: 1,
    borderColor: getColor('border.light'),
    borderRadius: getBorderRadius('lg'),
    padding: getSpacing('md'),
    ...getShadow('small'),
  },

  selectedCard: {
    borderWidth: 3,
    transform: [{ scale: 1.02 }],
  },

  methodCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  methodIcon: {
    width: 48,
    height: 48,
    borderRadius: getBorderRadius('full'),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: getSpacing('md'),
  },

  methodInfo: {
    flex: 1,
  },

  methodName: {
    ...getTypography('bodyMedium'),
    color: getColor('text.primary'),
    fontWeight: '600',
    marginBottom: 2,
  },

  methodDescription: {
    ...getTypography('bodySmall'),
    color: getColor('text.secondary'),
    lineHeight: 16,
  },

  selectedIndicator: {
    borderRadius: getBorderRadius('full'),
    padding: 4,
  },

  // Reference Input Styles
  referenceContainer: {
    marginTop: getSpacing('lg'),
  },

  referenceLabel: {
    ...getTypography('bodyMedium'),
    color: getColor('text.primary'),
    fontWeight: '600',
    marginBottom: getSpacing('sm'),
  },

  referenceInput: {
    backgroundColor: getColor('background.primary'),
    borderWidth: 1,
    borderColor: getColor('border.medium'),
    borderRadius: getBorderRadius('md'),
    paddingHorizontal: getSpacing('md'),
    paddingVertical: getSpacing('sm'),
    ...getTypography('bodyMedium'),
    color: getColor('text.primary'),
    minHeight: hp(5.5),
  },

  referenceNote: {
    ...getTypography('caption'),
    color: getColor('text.secondary'),
    marginTop: getSpacing('xs'),
    lineHeight: 16,
  },

  // Instructions Styles
  instructionsContainer: {
    backgroundColor: getColor('accent.warningOrange') + '10',
    padding: getSpacing('md'),
    borderRadius: getBorderRadius('md'),
    borderLeftWidth: 4,
    borderLeftColor: getColor('accent.warningOrange'),
    marginTop: getSpacing('lg'),
  },

  instructionsContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  instructionsText: {
    flex: 1,
    marginLeft: getSpacing('sm'),
  },

  instructionsTitle: {
    ...getTypography('bodySmall'),
    color: getColor('accent.warningOrange'),
    fontWeight: '600',
    marginBottom: getSpacing('xs'),
  },

  instructionsBody: {
    ...getTypography('bodySmall'),
    color: getColor('accent.warningOrange'),
    lineHeight: 18,
  },

  // Error Styles
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: getSpacing('md'),
  },

  errorText: {
    ...getTypography('bodySmall'),
    color: getColor('semantic.error'),
    marginLeft: getSpacing('xs'),
    flex: 1,
  },
});
