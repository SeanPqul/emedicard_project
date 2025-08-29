import { StyleSheet } from 'react-native';
import { getBorderRadius, getColor, getShadow, getSpacing, getTypography } from '../theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: getColor('background.primary'),
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
  sectionTitle: {
    ...getTypography('h3'),
    color: getColor('text.primary'),
    marginBottom: getSpacing('md'),
    marginTop: getSpacing('xs'),
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: getSpacing('lg'),
    paddingHorizontal: getSpacing('lg'),
    backgroundColor: getColor('background.primary'),
    borderRadius: getBorderRadius('lg'),
    marginBottom: getSpacing('sm'),
    borderWidth: 2,
    borderColor: 'transparent',
    ...getShadow('small'),
  },
  paymentOptionSelected: {
    borderColor: getColor('success.main'),
  },
  paymentDetails: {
    flex: 1,
    marginLeft: getSpacing('sm'),
  },
  paymentName: {
    ...getTypography('body'),
    fontWeight: '600',
    color: getColor('text.primary'),
  },
  paymentDescription: {
    ...getTypography('body'),
    color: getColor('text.secondary'),
  },
  paymentFee: {
    ...getTypography('body'),
    fontWeight: '600',
    color: getColor('success.main'),
    marginTop: getSpacing('xs'),
  },
  paymentDetailsContainer: {
    backgroundColor: getColor('background.primary'),
    borderRadius: getBorderRadius('lg'),
    padding: getSpacing('lg'),
    marginTop: getSpacing('lg'),
    ...getShadow('small'),
  },
  feeBreakdown: {
    marginBottom: getSpacing('lg'),
  },
  feeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: getSpacing('xs'),
  },
  feeLabel: {
    ...getTypography('body'),
    color: getColor('text.secondary'),
  },
  feeValue: {
    ...getTypography('body'),
    fontWeight: '600',
    color: getColor('text.primary'),
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: getColor('border.light'),
    paddingTop: getSpacing('sm'),
    marginTop: getSpacing('xs'),
  },
  totalLabel: {
    ...getTypography('body'),
    fontWeight: '600',
    color: getColor('text.primary'),
  },
  totalValue: {
    ...getTypography('body'),
    fontWeight: '700',
    color: getColor('success.main'),
  },
  inputContainer: {
    marginBottom: getSpacing('lg'),
  },
  inputLabel: {
    ...getTypography('body'),
    fontWeight: '600',
    color: getColor('text.primary'),
    marginBottom: getSpacing('xs'),
  },
  textInput: {
    borderWidth: 1,
    borderColor: getColor('border.light'),
    borderRadius: getBorderRadius('md'),
    padding: getSpacing('sm'),
    ...getTypography('body'),
    backgroundColor: getColor('background.primary'),
    color: getColor('text.primary'),
  },
  uploadContainer: {
    marginBottom: getSpacing('lg'),
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: getSpacing('md'),
    borderWidth: 2,
    borderColor: getColor('primary.main'),
    borderStyle: 'dashed',
    borderRadius: getBorderRadius('md'),
    backgroundColor: getColor('background.secondary'),
  },
  uploadButtonText: {
    ...getTypography('body'),
    color: getColor('primary.main'),
    fontWeight: '600',
    marginLeft: getSpacing('xs'),
  },
  uploadedFileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: getColor('success.light'),
    padding: getSpacing('sm'),
    borderRadius: getBorderRadius('md'),
    marginTop: getSpacing('sm'),
  },
  uploadedFileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  uploadedFileName: {
    ...getTypography('body'),
    color: getColor('success.main'),
    marginLeft: getSpacing('xs'),
    flex: 1,
  },
  removeButton: {
    padding: getSpacing('xs'),
  },
  instructionsContainer: {
    backgroundColor: getColor('background.secondary'),
    padding: getSpacing('md'),
    borderRadius: getBorderRadius('md'),
    marginTop: getSpacing('lg'),
  },
  instructionsTitle: {
    ...getTypography('body'),
    fontWeight: '600',
    color: getColor('text.primary'),
    marginBottom: getSpacing('xs'),
  },
  instructionsText: {
    ...getTypography('body'),
    color: getColor('text.secondary'),
    lineHeight: 20,
  },
  existingPaymentContainer: {
    marginTop: getSpacing('lg'),
  },
  paymentStatusCard: {
    backgroundColor: getColor('background.primary'),
    borderRadius: getBorderRadius('lg'),
    padding: getSpacing('md'),
    ...getShadow('small'),
  },
  paymentStatusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: getSpacing('sm'),
  },
  paymentStatusText: {
    ...getTypography('body'),
    fontWeight: '600',
    color: getColor('text.primary'),
  },
  statusBadge: {
    paddingHorizontal: getSpacing('xs'),
    paddingVertical: getSpacing('xs'),
    borderRadius: getBorderRadius('sm'),
  },
  statusBadgeText: {
    ...getTypography('caption'),
    fontWeight: '600',
    color: getColor('text.white'),
  },
  paymentReference: {
    ...getTypography('body'),
    color: getColor('text.secondary'),
    marginBottom: getSpacing('xs'),
  },
  paymentAmount: {
    ...getTypography('body'),
    fontWeight: '600',
    color: getColor('text.primary'),
  },
  submitContainer: {
    paddingVertical: getSpacing('xxxl'),
    paddingHorizontal: getSpacing('md'),
    paddingBottom: getSpacing('xxxl'),
  },
  paymentButton: {
    width: '100%',
    height: 56,
    minHeight: 56,
  },
});