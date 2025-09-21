import { Dimensions, StyleSheet } from 'react-native';
import { getBorderRadius, getColor, getShadow, getSpacing, getTypography } from '../theme';
import { hp } from '../../utils/responsive';

const { width } = Dimensions.get('window');

export const styles = StyleSheet.create({
  // Container and Layout
  container: {
    flex: 1,
    backgroundColor: getColor('background.primary'),
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  contentWrapper: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },

  // Header Section
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
  headerRight: {
    width: 24, // Same as back button to center title
  },

  // Step Indicator
  stepIndicator: {
    flexDirection: 'row',
    paddingHorizontal: getSpacing('lg'),
    paddingVertical: getSpacing('md'),
    backgroundColor: getColor('background.secondary'),
  },
  stepItem: {
    flex: 1,
    alignItems: 'center',
    position: 'relative',
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: getBorderRadius('full'),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: getSpacing('sm'),
    zIndex: 2,
  },
  stepCircleActive: {
    backgroundColor: getColor('accent.medicalBlue'),
  },
  stepCircleInactive: {
    backgroundColor: getColor('border.medium'),
  },
  stepNumber: {
    ...getTypography('bodySmall'),
    fontWeight: '600',
  },
  stepNumberActive: {
    color: getColor('background.primary'),
  },
  stepNumberInactive: {
    color: getColor('text.secondary'),
  },
  stepTitle: {
    ...getTypography('caption'),
    textAlign: 'center',
    marginBottom: getSpacing('sm'),
  },
  stepTitleActive: {
    color: getColor('accent.medicalBlue'),
    fontWeight: '600',
  },
  stepTitleInactive: {
    color: getColor('text.secondary'),
  },
  stepLine: {
    position: 'absolute',
    top: 16,
    left: '60%',
    width: '80%',
    height: 2,
    zIndex: 1,
  },
  stepLineActive: {
    backgroundColor: getColor('accent.medicalBlue'),
  },
  stepLineInactive: {
    backgroundColor: getColor('border.light'),
  },

  // Step Content
  stepContent: {
    padding: getSpacing('lg'),
    flex: 1,
  },
  stepHeading: {
    ...getTypography('h2'),
    color: getColor('text.primary'),
    marginBottom: getSpacing('sm'),
  },
  stepDescription: {
    ...getTypography('body'),
    color: getColor('text.secondary'),
    marginBottom: getSpacing('lg'),
    lineHeight: 24,
  },

  // Radio Group (Application Type Step)
  radioGroup: {
    gap: getSpacing('md'),
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: getSpacing('md'),
    paddingHorizontal: getSpacing('lg'),
    borderRadius: getBorderRadius('lg'),
    borderWidth: 2,
    borderColor: getColor('border.light'),
    backgroundColor: getColor('background.primary'),
  },
  radioOptionSelected: {
    borderColor: getColor('primary.500'),
    backgroundColor: getColor('primary.50'),
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: getColor('border.medium'),
    marginRight: getSpacing('md'),
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleSelected: {
    borderColor: getColor('primary.500'),
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: getColor('primary.500'),
  },
  radioContent: {
    flex: 1,
  },
  radioTitle: {
    ...getTypography('body'),
    fontWeight: '600',
    color: getColor('text.primary'),
    marginBottom: getSpacing('xs'),
  },
  radioSubtitle: {
    ...getTypography('bodySmall'),
    color: getColor('text.secondary'),
  },

  // Category Grid (Job Category Step)
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: getSpacing('xl'),
  },
  categoryCard: {
    width: (width - 52) / 2,
    minHeight: 150,
    backgroundColor: getColor('background.primary'),
    borderRadius: getBorderRadius('lg'),
    padding: getSpacing('md'),
    marginBottom: getSpacing('sm'),
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: getColor('border.light'),
    ...getShadow('medium'),
    position: 'relative',
  },
  categoryCardSelected: {
    borderWidth: 2,
  },
  categoryCardCentered: {
    alignSelf: 'center',
    width: (width - 52) / 2,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: getSpacing('sm'),
  },
  categoryName: {
    ...getTypography('body'),
    fontWeight: '600',
    color: getColor('text.primary'),
    textAlign: 'center',
    marginBottom: getSpacing('xs'),
  },
  categoryRequirement: {
    ...getTypography('caption'),
    color: getColor('text.secondary'),
    textAlign: 'center',
    fontStyle: 'italic',
  },
  categorySelected: {
    position: 'absolute',
    top: getSpacing('sm'),
    right: getSpacing('sm'),
  },

  // Form Groups (Personal Details Step)
  formGroup: {
    marginBottom: getSpacing('lg'),
  },
  label: {
    ...getTypography('bodySmall'),
    fontWeight: '600',
    color: getColor('text.primary'),
    marginBottom: getSpacing('xs'),
  },
  input: {
    borderWidth: 1,
    borderColor: getColor('border.light'),
    borderRadius: getBorderRadius('md'),
    backgroundColor: getColor('background.primary'),
    ...getShadow('small'),
  },
  civilStatusContainer: {
    flexDirection: 'row',
    paddingVertical: getSpacing('xs'),
  },
  civilStatusOption: {
    paddingVertical: getSpacing('sm'),
    paddingHorizontal: getSpacing('md'),
    borderRadius: getBorderRadius('full'),
    borderWidth: 1,
    borderColor: getColor('border.light'),
    backgroundColor: getColor('background.primary'),
    marginRight: getSpacing('sm'),
  },
  civilStatusOptionSelected: {
    borderColor: getColor('accent.medicalBlue'),
    backgroundColor: getColor('accent.medicalBlue'),
  },
  civilStatusText: {
    ...getTypography('bodySmall'),
    color: getColor('text.secondary'),
  },
  civilStatusTextSelected: {
    color: getColor('text.inverse'),
    fontWeight: '600',
  },

  // Document Upload Styles
  documentCard: {
    backgroundColor: getColor('background.primary'),
    borderRadius: getBorderRadius('md'),
    padding: getSpacing('md'),
    marginBottom: getSpacing('md'),
    ...getShadow('small'),
  },
  documentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: getSpacing('sm'),
  },
  documentInfo: {
    flex: 1,
  },
  documentTitle: {
    ...getTypography('body'),
    fontWeight: '600',
    color: getColor('text.primary'),
    marginBottom: getSpacing('xs'),
  },
  documentDescription: {
    ...getTypography('bodySmall'),
    color: getColor('text.secondary'),
    marginBottom: getSpacing('xs'),
  },
  documentFormats: {
    ...getTypography('caption'),
    color: getColor('text.secondary'),
    fontStyle: 'italic',
  },
  documentStatus: {
    marginLeft: getSpacing('sm'),
  },

  // Upload Progress
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: getSpacing('sm'),
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: getColor('border.light'),
    borderRadius: getBorderRadius('sm'),
    marginRight: getSpacing('sm'),
  },
  progressFill: {
    height: '100%',
    backgroundColor: getColor('primary.500'),
    borderRadius: getBorderRadius('sm'),
  },
  progressText: {
    ...getTypography('caption'),
    color: getColor('text.secondary'),
    minWidth: 35,
  },

  // Error States
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: getColor('semanticUI.dangerCard'),
    padding: getSpacing('sm'),
    borderRadius: getBorderRadius('sm'),
    marginBottom: getSpacing('sm'),
  },
  errorMessage: {
    ...getTypography('bodySmall'),
    color: getColor('semantic.error'),
    flex: 1,
    marginLeft: getSpacing('xs'),
  },
  retryButton: {
    paddingHorizontal: getSpacing('sm'),
    paddingVertical: getSpacing('xs'),
    borderRadius: getBorderRadius('sm'),
    backgroundColor: getColor('semantic.error'),
    marginLeft: getSpacing('sm'),
  },
  retryButtonText: {
    ...getTypography('caption'),
    color: getColor('background.primary'),
    fontWeight: '600',
  },

  // Document Preview
  documentPreview: {
    position: 'relative',
    marginBottom: getSpacing('sm'),
  },
  documentImage: {
    width: '100%',
    height: 120,
    borderRadius: getBorderRadius('sm'),
    backgroundColor: getColor('background.secondary'),
  },
  removeDocumentButton: {
    position: 'absolute',
    top: getSpacing('sm'),
    right: getSpacing('sm'),
    backgroundColor: getColor('background.primary'),
    borderRadius: getBorderRadius('sm'),
    padding: getSpacing('xs'),
  },

  // Upload Button
  uploadButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: getSpacing('lg'),
    paddingVertical: getSpacing('sm'),
    borderRadius: getBorderRadius('sm'),
    borderWidth: 1,
    borderColor: getColor('primary.500'),
    backgroundColor: getColor('background.primary'),
  },
  uploadButtonText: {
    ...getTypography('bodySmall'),
    color: getColor('primary.500'),
    fontWeight: '600',
    marginLeft: getSpacing('sm'),
  },

  // Review Step Styles
  reviewCard: {
    backgroundColor: getColor('background.primary'),
    borderRadius: getBorderRadius('lg'),
    ...getShadow('medium'),
    marginBottom: getSpacing('lg'),
  },
  reviewSection: {
    padding: getSpacing('lg'),
    borderBottomWidth: 1,
    borderBottomColor: getColor('border.light'),
  },
  reviewSectionTitle: {
    ...getTypography('h4'),
    color: getColor('text.primary'),
    marginBottom: getSpacing('md'),
  },
  editButton: {
    paddingHorizontal: getSpacing('sm'),
    paddingVertical: getSpacing('xs'),
    borderRadius: getBorderRadius('sm'),
    backgroundColor: getColor('primary.50'),
    borderWidth: 1,
    borderColor: getColor('primary.500'),
  },
  editButtonText: {
    ...getTypography('caption'),
    color: getColor('primary.500'),
    fontWeight: '600',
  },
  reviewItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: getSpacing('xs'),
    borderBottomWidth: 1,
    borderBottomColor: getColor('border.light'),
  },
  reviewLabel: {
    ...getTypography('bodySmall'),
    color: getColor('text.secondary'),
    flex: 1,
  },
  reviewValue: {
    ...getTypography('bodySmall'),
    color: getColor('text.primary'),
    fontWeight: '600',
    flex: 2,
    textAlign: 'right',
  },
  totalAmount: {
    ...getTypography('body'),
    color: getColor('text.primary'),
    fontWeight: '700',
  },

  // Document Summary
  documentSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: getSpacing('md'),
    padding: getSpacing('md'),
    backgroundColor: getColor('background.secondary'),
    borderRadius: getBorderRadius('md'),
  },
  summaryColumn: {
    alignItems: 'center',
  },
  summaryNumber: {
    ...getTypography('h4'),
    fontWeight: '700',
    marginBottom: getSpacing('xs'),
  },
  summaryLabel: {
    ...getTypography('caption'),
    color: getColor('text.secondary'),
  },

  // Document Status List
  documentStatusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: getSpacing('sm'),
    borderBottomWidth: 1,
    borderBottomColor: getColor('border.light'),
  },
  documentStatusContent: {
    flex: 1,
  },
  documentStatusTitle: {
    ...getTypography('bodyMedium'),
    color: getColor('text.primary'),
    fontWeight: '600',
  },
  documentStatusFile: {
    ...getTypography('bodySmall'),
    color: getColor('text.secondary'),
  },
  documentStatusIndicator: {
    alignItems: 'center',
  },
  documentStatusText: {
    ...getTypography('bodySmall'),
  },

  // Fee Section
  feeNote: {
    ...getTypography('bodySmall'),
    color: getColor('text.secondary'),
    fontStyle: 'italic',
    marginBottom: getSpacing('md'),
    lineHeight: 18,
  },

  // Orientation Notice
  orientationNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: getColor('semanticUI.warningCard'),
    padding: getSpacing('md'),
    borderRadius: getBorderRadius('md'),
    marginTop: getSpacing('md'),
  },
  orientationText: {
    ...getTypography('bodySmall'),
    color: getColor('semantic.warning'),
    flex: 1,
    marginLeft: getSpacing('sm'),
    lineHeight: 18,
  },

  // Validation Warning
  validationWarning: {
    backgroundColor: getColor('semanticUI.dangerCard'),
    padding: getSpacing('md'),
    borderRadius: getBorderRadius('md'),
    marginTop: getSpacing('md'),
  },
  validationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: getSpacing('sm'),
  },
  validationTitle: {
    ...getTypography('bodySmall'),
    color: getColor('semantic.error'),
    fontWeight: '600',
    marginLeft: getSpacing('sm'),
  },
  validationMessage: {
    ...getTypography('caption'),
    color: getColor('semantic.error'),
    marginBottom: getSpacing('xs'),
  },

  // Terms Section
  termsContainer: {
    backgroundColor: getColor('background.secondary'),
    padding: getSpacing('md'),
    borderRadius: getBorderRadius('md'),
    marginTop: getSpacing('md'),
  },
  termsTitle: {
    ...getTypography('bodySmall'),
    color: getColor('text.primary'),
    fontWeight: '600',
    marginBottom: getSpacing('sm'),
  },
  termsText: {
    ...getTypography('caption'),
    color: getColor('text.secondary'),
    lineHeight: 16,
  },

  // Navigation Buttons
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: getSpacing('lg'),
    paddingVertical: getSpacing('sm'),
    backgroundColor: getColor('background.primary'),
    borderTopWidth: 1,
    borderTopColor: getColor('border.light'),
    ...getShadow('large'),
    position: 'absolute',
    bottom: hp(0), // 9% from bottom - positioned just above tab bar
    left: 0,
    right: 0,
    //minHeight: hp(8), // 8% of screen height
  },

  // Progress Card
  progressCard: {
    backgroundColor: getColor('background.primary'),
    borderRadius: getBorderRadius('md'),
    padding: getSpacing('md'),
    marginHorizontal: getSpacing('lg'),
    marginBottom: getSpacing('md'),
    borderWidth: 1,
    borderColor: getColor('border.light'),
    ...getShadow('small'),
  },
  progressCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: getSpacing('sm'),
  },
  progressStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressStatusText: {
    ...getTypography('body'),
    fontWeight: '600',
    marginLeft: getSpacing('xs'),
  },
  saveProgressButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: getSpacing('sm'),
    paddingVertical: getSpacing('xs'),
    borderRadius: getBorderRadius('sm'),
    backgroundColor: getColor('primary.50'),
  },
  saveProgressText: {
    ...getTypography('bodySmall'),
    color: getColor('accent.medicalBlue'),
    marginLeft: getSpacing('xs'),
    fontWeight: '500',
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: getSpacing('sm'),
  },
  progressBarBackground: {
    flex: 1,
    height: 6,
    backgroundColor: getColor('border.light'),
    borderRadius: 3,
    marginRight: getSpacing('sm'),
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressPercentageText: {
    ...getTypography('bodySmall'),
    color: getColor('text.secondary'),
    fontWeight: '600',
    minWidth: 40,
    textAlign: 'right',
  },
  uploadProgressContainer: {
    marginBottom: getSpacing('xs'),
  },
  uploadProgressText: {
    ...getTypography('bodySmall'),
    color: getColor('text.secondary'),
    marginBottom: getSpacing('xs'),
  },
  failedUploadsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: getSpacing('xs'),
  },
  failedUploadsText: {
    ...getTypography('bodySmall'),
    marginLeft: getSpacing('xs'),
    marginRight: getSpacing('sm'),
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: getSpacing('xs'),
    paddingVertical: 2,
  },
  retryButtonText: {
    ...getTypography('bodySmall'),
    marginLeft: getSpacing('xs'),
    fontWeight: '500',
  },
  validationErrorsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: getSpacing('xs'),
  },
  validationErrorsText: {
    ...getTypography('bodySmall'),
    marginLeft: getSpacing('xs'),
    flex: 1,
  },
  resumeInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: getSpacing('xs'),
    paddingTop: getSpacing('xs'),
    borderTopWidth: 1,
    borderTopColor: getColor('border.light'),
  },
  resumeInfoText: {
    ...getTypography('bodySmall'),
    color: getColor('text.secondary'),
    marginLeft: getSpacing('xs'),
    fontStyle: 'italic',
  },

  // Resume Application Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: getSpacing('lg'),
  },
  resumeModalContainer: {
    backgroundColor: getColor('background.primary'),
    borderRadius: getBorderRadius('lg'),
    padding: getSpacing('lg'),
    width: '100%',
    maxWidth: 400,
    ...getShadow('large'),
  },
  resumeModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: getSpacing('md'),
  },
  resumeModalTitle: {
    ...getTypography('h3'),
    color: getColor('text.primary'),
    fontWeight: '600',
    marginLeft: getSpacing('sm'),
  },
  resumeModalContent: {
    marginBottom: getSpacing('lg'),
  },
  resumeModalDescription: {
    ...getTypography('body'),
    color: getColor('text.secondary'),
    lineHeight: 22,
    marginBottom: getSpacing('md'),
  },
  resumeProgressSummary: {
    backgroundColor: getColor('background.secondary'),
    borderRadius: getBorderRadius('md'),
    padding: getSpacing('md'),
    marginBottom: getSpacing('md'),
  },
  resumeProgressItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: getSpacing('xs'),
  },
  resumeProgressLabel: {
    ...getTypography('bodySmall'),
    color: getColor('text.secondary'),
    minWidth: 100,
  },
  resumeProgressValue: {
    ...getTypography('bodySmall'),
    color: getColor('text.primary'),
    fontWeight: '500',
    marginLeft: getSpacing('sm'),
  },
  resumeWarningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: getSpacing('sm'),
    backgroundColor: getColor('status.warning') + '20',
    borderRadius: getBorderRadius('sm'),
    borderLeftWidth: 3,
    borderLeftColor: getColor('status.warning'),
  },
  resumeWarningText: {
    ...getTypography('bodySmall'),
    marginLeft: getSpacing('xs'),
    flex: 1,
  },
  resumeModalActions: {
    flexDirection: 'row',
    gap: getSpacing('md'),
    marginBottom: getSpacing('md'),
  },
  resumeActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: getSpacing('md'),
    borderRadius: getBorderRadius('md'),
  },
  resumeSecondaryButton: {
    backgroundColor: getColor('background.secondary'),
    borderWidth: 1,
    borderColor: getColor('border.medium'),
  },
  resumePrimaryButton: {
    backgroundColor: getColor('accent.medicalBlue'),
  },
  resumeSecondaryButtonText: {
    ...getTypography('body'),
    color: getColor('text.secondary'),
    marginLeft: getSpacing('xs'),
    fontWeight: '500',
  },
  resumePrimaryButtonText: {
    ...getTypography('body'),
    color: getColor('background.primary'),
    marginLeft: getSpacing('xs'),
    fontWeight: '600',
  },
  resumeCancelButton: {
    alignItems: 'center',
    paddingVertical: getSpacing('sm'),
  },
  resumeCancelButtonText: {
    ...getTypography('body'),
    color: getColor('text.secondary'),
    fontWeight: '500',
  },

  // Previous Button
  previousButton: {
    paddingHorizontal: getSpacing('lg'),
    paddingVertical: getSpacing('sm'),
    borderRadius: getBorderRadius('md'),
    borderWidth: 1,
    borderColor: getColor('border.light'),
    backgroundColor: getColor('background.primary'),
    marginRight: getSpacing('sm'),
  },
  previousButtonText: {
    ...getTypography('body'),
    color: getColor('text.secondary'),
    fontWeight: '600',
  },
  nextButton: {
    flex: 1,
    backgroundColor: getColor('accent.medicalBlue'),
    paddingVertical: getSpacing('md'),
    borderRadius: getBorderRadius('md'),
    alignItems: 'center',
  },
  nextButtonFull: {
    marginRight: 0,
  },
  nextButtonText: {
    ...getTypography('body'),
    color: getColor('background.primary'),
    fontWeight: '600',
  },

  // Error Text
  errorText: {
    ...getTypography('caption'),
    color: getColor('semantic.error'),
    marginTop: getSpacing('xs'),
  },

  // Info Card
  infoCard: {
    flexDirection: 'row',
    padding: getSpacing('md'),
    backgroundColor: getColor('semanticUI.infoCard'),
    borderRadius: getBorderRadius('md'),
    marginBottom: getSpacing('md'),
  },
  infoContent: {
    flex: 1,
    marginLeft: getSpacing('sm'),
  },
  infoTitle: {
    ...getTypography('body'),
    color: getColor('primary.500'),
    fontWeight: '600',
    marginBottom: getSpacing('xs'),
  },
  infoText: {
    ...getTypography('bodySmall'),
    color: getColor('primary.500'),
    lineHeight: 16,
  },

  // Additional styles for inline patterns found in apply.tsx
  
  // Required asterisk pattern
  requiredAsterisk: {
    color: getColor('semantic.error'),
  },
  
  // Review section header with edit button
  reviewSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: getSpacing('md'),
  },
  
  // Review item with category color indicator
  reviewItemWithIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  categoryColorIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: getSpacing('sm'),
  },
  
  // Document summary overview styles
  documentOverview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: getSpacing('md'),
    padding: getSpacing('md'),
    backgroundColor: getColor('background.secondary'),
    borderRadius: getBorderRadius('md'),
  },
  
  overviewItem: {
    alignItems: 'center',
  },
  
  overviewNumber: {
    ...getTypography('headingSmall'),
    fontWeight: '700',
    marginBottom: getSpacing('xs'),
  },
  
  overviewNumberSuccess: {
    color: getColor('semantic.success'),
  },
  
  overviewNumberError: {
    color: getColor('semantic.error'),
  },
  
  overviewNumberWarning: {
    color: getColor('semantic.warning'),
  },
  
  overviewLabel: {
    ...getTypography('bodySmall'),
    color: getColor('text.secondary'),
  },
  
  // Document review item pattern
  documentReviewItem: {
    backgroundColor: getColor('background.primary'),
    borderRadius: getBorderRadius('lg'),
    padding: getSpacing('md'),
    marginBottom: getSpacing('sm'),
    flexDirection: 'row',
    alignItems: 'flex-start',
    ...getShadow('small'),
  },
  
  documentReviewContent: {
    flex: 1,
  },
  
  documentReviewTitle: {
    ...getTypography('body'),
    color: getColor('text.primary'),
    fontWeight: '600',
    marginBottom: getSpacing('xs'),
  },
  
  documentReviewDescription: {
    ...getTypography('bodySmall'),
    color: getColor('text.secondary'),
    marginBottom: getSpacing('xs'),
  },
  
  documentActionContainer: {
    alignItems: 'center',
  },
  
  documentActionButton: {
    backgroundColor: getColor('primary.50'),
    borderWidth: 1,
    borderColor: getColor('primary.500'),
    borderRadius: getBorderRadius('sm'),
    paddingHorizontal: getSpacing('sm'),
    paddingVertical: getSpacing('xs'),
    marginTop: getSpacing('xs'),
  },
  
  documentActionText: {
    ...getTypography('caption'),
    color: getColor('primary.500'),
    fontWeight: '600',
  },
  
  // Payment summary section
  paymentSummaryContainer: {
    backgroundColor: getColor('background.secondary'),
    padding: getSpacing('lg'),
    borderRadius: getBorderRadius('lg'),
    marginBottom: getSpacing('lg'),
  },
  
  paymentSummaryTitle: {
    ...getTypography('h4'),
    color: getColor('text.primary'),
    marginBottom: getSpacing('md'),
  },
  
  paymentSummaryText: {
    ...getTypography('body'),
    color: getColor('text.secondary'),
    marginBottom: getSpacing('lg'),
    lineHeight: 22,
  },

  // Form container with margin bottom
  formGroupWithMargin: {
    marginBottom: getSpacing('lg'),
  },
  
  // Queue status styles
  queueStats: {
    padding: getSpacing('md'),
    backgroundColor: getColor('background.tertiary'),
    borderRadius: getBorderRadius('md'),
    marginTop: getSpacing('sm'),
  },
  
  queueStatsText: {
    ...getTypography('body'),
    color: getColor('text.secondary'),
    marginBottom: getSpacing('xs'),
  },
  
  // Cancel button style
  cancelButton: {
    padding: getSpacing('xs'),
  },

  // Retry section styles for failed uploads
  retrySection: {
    backgroundColor: getColor('status.warning') + '20',
    padding: getSpacing('md'),
    borderRadius: getBorderRadius('md'),
    marginBottom: getSpacing('md'),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  retryText: {
    ...getTypography('body'),
    color: getColor('status.warning'),
    flex: 1,
  },
  retryButton: {
    backgroundColor: getColor('accent.medicalBlue'),
    paddingHorizontal: getSpacing('md'),
    paddingVertical: getSpacing('sm'),
    borderRadius: getBorderRadius('sm'),
  },
  retryButtonText: {
    ...getTypography('bodySmall'),
    color: getColor('background.primary'),
    fontWeight: '600',
  },
});