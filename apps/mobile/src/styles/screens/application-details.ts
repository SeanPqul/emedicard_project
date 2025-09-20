import { StyleSheet } from 'react-native';
import { getBorderRadius, getColor, getShadow, getSpacing, getTypography } from '../theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: getColor('background.secondary'),
  },
  
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: getSpacing('lg'),
    paddingVertical: getSpacing('md'),
    backgroundColor: getColor('background.primary'),
    borderBottomWidth: 1,
    borderBottomColor: getColor('border.light'),
  },
  headerTitle: {
    ...getTypography('h3'),
    color: getColor('text.primary'),
    fontWeight: '600',
  },
  
  // Loading State
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: getColor('background.secondary'),
  },
  loadingText: {
    ...getTypography('body'),
    color: getColor('text.secondary'),
    marginTop: getSpacing('md'),
  },
  
  // Content
  content: {
    flex: 1,
    paddingHorizontal: getSpacing('md'),
    paddingTop: getSpacing('md'),
  },
  
  // Status Card
  statusCard: {
    backgroundColor: getColor('background.primary'),
    borderRadius: getBorderRadius('lg'),
    padding: getSpacing('lg'),
    marginBottom: getSpacing('md'),
    ...getShadow('medium'),
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: getSpacing('md'),
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: getSpacing('md'),
    paddingVertical: getSpacing('sm'),
    borderRadius: getBorderRadius('full'),
  },
  statusText: {
    ...getTypography('body'),
    fontWeight: '600',
    marginLeft: getSpacing('sm'),
  },
  applicationId: {
    ...getTypography('bodySmall'),
    color: getColor('text.secondary'),
    fontWeight: '700',
  },
  statusInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusLabel: {
    ...getTypography('bodySmall'),
    color: getColor('text.secondary'),
  },
  statusValue: {
    ...getTypography('bodySmall'),
    color: getColor('text.primary'),
    fontWeight: '600',
  },
  deadlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: getSpacing('md'),
    paddingTop: getSpacing('md'),
    borderTopWidth: 1,
    borderTopColor: getColor('border.light'),
  },
  deadlineText: {
    ...getTypography('bodySmall'),
    fontWeight: '600',
    marginLeft: getSpacing('sm'),
  },
  
  // Details Card
  detailsCard: {
    backgroundColor: getColor('background.primary'),
    borderRadius: getBorderRadius('lg'),
    padding: getSpacing('lg'),
    marginBottom: getSpacing('md'),
    ...getShadow('medium'),
  },
  sectionTitle: {
    ...getTypography('h4'),
    color: getColor('text.primary'),
    fontWeight: '600',
    marginBottom: getSpacing('lg'),
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: getSpacing('sm'),
    borderBottomWidth: 1,
    borderBottomColor: getColor('border.light'),
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
    flex: 2,
    textAlign: 'right',
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 2,
    justifyContent: 'flex-end',
  },
  categoryIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: getSpacing('sm'),
  },
  orientationNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: getColor('accent.warningOrange') + '20',
    padding: getSpacing('sm'),
    borderRadius: getBorderRadius('sm'),
    marginTop: getSpacing('md'),
  },
  orientationText: {
    ...getTypography('caption'),
    color: getColor('accent.warningOrange'),
    fontWeight: '600',
    marginLeft: getSpacing('sm'),
    flex: 1,
  },
  
  // Payment Card
  paymentCard: {
    backgroundColor: getColor('background.primary'),
    borderRadius: getBorderRadius('lg'),
    padding: getSpacing('lg'),
    marginBottom: getSpacing('md'),
    ...getShadow('medium'),
    borderWidth: 2,
    borderColor: getColor('accent.warningOrange') + '30',
  },
  paymentDescription: {
    ...getTypography('bodySmall'),
    color: getColor('text.secondary'),
    marginBottom: getSpacing('lg'),
  },
  feeBreakdown: {
    backgroundColor: getColor('background.secondary'),
    borderRadius: getBorderRadius('md'),
    padding: getSpacing('md'),
    marginBottom: getSpacing('lg'),
  },
  feeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: getSpacing('xs'),
  },
  feeLabel: {
    ...getTypography('bodySmall'),
    color: getColor('text.secondary'),
  },
  feeValue: {
    ...getTypography('bodySmall'),
    color: getColor('text.primary'),
    fontWeight: '600',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: getColor('border.light'),
    marginTop: getSpacing('sm'),
    paddingTop: getSpacing('sm'),
  },
  totalLabel: {
    ...getTypography('body'),
    color: getColor('text.primary'),
    fontWeight: '700',
  },
  totalValue: {
    ...getTypography('body'),
    color: getColor('accent.medicalBlue'),
    fontWeight: '700',
  },
  
  // Payment Methods
  paymentMethodsTitle: {
    ...getTypography('bodySmall'),
    color: getColor('text.primary'),
    fontWeight: '600',
    marginBottom: getSpacing('md'),
  },
  paymentMethods: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: getSpacing('md'),
  },
  paymentMethodCard: {
    width: '47%', // Two columns with gap
    alignItems: 'center',
    padding: getSpacing('md'),
    backgroundColor: getColor('background.secondary'),
    borderRadius: getBorderRadius('lg'),
    borderWidth: 2,
    borderColor: getColor('border.light'),
  },
  paymentMethodCardSelected: {
    borderColor: getColor('primary.500'),
    backgroundColor: getColor('primary.50'),
  },
  paymentMethodName: {
    ...getTypography('body'),
    color: getColor('text.primary'),
    fontWeight: '600',
    marginTop: getSpacing('sm'),
    marginBottom: getSpacing('xs'),
  },
  paymentMethodDesc: {
    ...getTypography('caption'),
    color: getColor('text.secondary'),
    textAlign: 'center',
  },
  
  // Processing
  processingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: getSpacing('lg'),
  },
  processingText: {
    ...getTypography('bodySmall'),
    color: getColor('text.secondary'),
    marginLeft: getSpacing('sm'),
  },
  
  // Payment History Card
  paymentHistoryCard: {
    backgroundColor: getColor('background.primary'),
    borderRadius: getBorderRadius('lg'),
    padding: getSpacing('lg'),
    marginBottom: getSpacing('md'),
    ...getShadow('medium'),
  },
  
  // Remarks Card
  remarksCard: {
    backgroundColor: getColor('semanticUI.warningCard'),
    borderRadius: getBorderRadius('lg'),
    padding: getSpacing('lg'),
    marginBottom: getSpacing('lg'),
  },
  remarksText: {
    ...getTypography('bodySmall'),
    color: getColor('semanticUI.warningText'),
    lineHeight: 20,
  },
});
