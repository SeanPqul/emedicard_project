import { Dimensions, StyleSheet } from "react-native";
import { getBorderRadius, getColor, getShadow, getSpacing, getTypography } from "@/src/styles/theme";

const { width } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: getColor('background.secondary'),
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  contentWrapper: {
    minHeight: '100%',
    paddingBottom: getSpacing('lg'),
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
    ...getTypography('h4'),
    color: getColor('text.primary'),
  },
  headerRight: {
    width: 24,
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: getSpacing('lg'),
    paddingVertical: getSpacing('md'),
    backgroundColor: getColor('background.primary'),
    borderBottomWidth: 1,
    borderBottomColor: getColor('border.light'),
  },
  stepItem: {
    alignItems: 'center',
    flex: 1,
    position: 'relative',
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: getBorderRadius('full'),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: getSpacing('sm'),
    zIndex: 2,
  },
  stepCircleActive: {
    backgroundColor: getColor('accent.medicalBlue'),
  },
  stepCircleInactive: {
    backgroundColor: getColor('border.light'),
  },
  stepNumber: {
    ...getTypography('bodySmall'),
    fontWeight: '600',
  },
  stepNumberActive: {
    color: getColor('text.inverse'),
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
  content: {
    flex: 1,
  },
  stepContent: {
    flex: 1,
    paddingHorizontal: getSpacing('lg'),
    paddingTop: getSpacing('lg'),
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
  radioGroup: {
    marginBottom: getSpacing('lg'),
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: getSpacing('md'),
    paddingHorizontal: getSpacing('md'),
    backgroundColor: getColor('background.primary'),
    borderRadius: getBorderRadius('lg'),
    marginBottom: getSpacing('sm'),
    ...getShadow('medium'),
  },
  radioCircle: {
    width: 24,
    height: 24,
    borderRadius: getBorderRadius('full'),
    borderWidth: 2,
    borderColor: getColor('border.light'),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: getSpacing('sm'),
  },
  radioCircleSelected: {
    borderColor: getColor('accent.medicalBlue'),
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: getBorderRadius('full'),
    backgroundColor: getColor('accent.medicalBlue'),
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
    borderRadius: getBorderRadius('full'),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: getSpacing('sm'),
  },
  categoryName: {
    ...getTypography('bodySmall'),
    fontWeight: '600',
    color: getColor('text.primary'),
    textAlign: 'center',
    marginBottom: getSpacing('xs'),
  },
  categoryRequirement: {
    ...getTypography('caption'),
    color: getColor('text.secondary'),
    textAlign: 'center',
  },
  categorySelected: {
    position: 'absolute',
    top: getSpacing('sm'),
    right: getSpacing('sm'),
  },
  formGroup: {
    marginBottom: getSpacing('lg'),
  },
  label: {
    ...getTypography('body'),
    fontWeight: '600',
    color: getColor('text.primary'),
    marginBottom: getSpacing('sm'),
  },
  input: {
    marginBottom: 0,
  },
  civilStatusContainer: {
    flexDirection: 'row',
  },
  civilStatusOption: {
    paddingHorizontal: getSpacing('md'),
    paddingVertical: getSpacing('sm'),
    backgroundColor: getColor('background.primary'),
    borderRadius: getBorderRadius('full'),
    marginRight: getSpacing('sm'),
    borderWidth: 1,
    borderColor: getColor('border.light'),
  },
  civilStatusOptionSelected: {
    backgroundColor: getColor('accent.medicalBlue'),
    borderColor: getColor('accent.medicalBlue'),
  },
  civilStatusText: {
    ...getTypography('bodySmall'),
    color: getColor('text.primary'),
  },
  civilStatusTextSelected: {
    color: getColor('text.inverse'),
  },
  reviewCard: {
    backgroundColor: getColor('background.primary'),
    borderRadius: getBorderRadius('lg'),
    padding: getSpacing('md'),
    ...getShadow('medium'),
  },
  reviewSection: {
    marginBottom: getSpacing('lg'),
  },
  reviewSectionTitle: {
    ...getTypography('h4'),
    color: getColor('text.primary'),
    marginBottom: getSpacing('sm'),
  },
  reviewItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: getSpacing('sm'),
    borderBottomWidth: 1,
    borderBottomColor: getColor('background.secondary'),
  },
  reviewLabel: {
    ...getTypography('bodySmall'),
    color: getColor('text.secondary'),
  },
  reviewValue: {
    ...getTypography('bodySmall'),
    fontWeight: '600',
    color: getColor('text.primary'),
  },
  totalAmount: {
    ...getTypography('body'),
    color: getColor('accent.medicalBlue'),
  },
  orientationNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: getColor('semanticUI.warningCard'),
    padding: getSpacing('sm'),
    borderRadius: getBorderRadius('md'),
    marginTop: getSpacing('md'),
  },
  orientationText: {
    ...getTypography('bodySmall'),
    color: getColor('semanticUI.warningText'),
    marginLeft: getSpacing('sm'),
    flex: 1,
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: getSpacing('lg'),
    paddingVertical: getSpacing('md'),
    backgroundColor: getColor('background.primary'),
    borderTopWidth: 1,
    borderTopColor: getColor('border.light'),
    ...getShadow('large'),
    position: 'absolute',
    left: 0,
    right: 0,
    // bottom will be set dynamically with safe area insets
  },
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
  },
  nextButtonFull: {
    marginRight: 0,
  },
  errorText: {
    ...getTypography('bodySmall'),
    color: getColor('semanticUI.errorText'),
    marginTop: getSpacing('xs'),
  },
  feeNote: {
    ...getTypography('caption'),
    color: getColor('text.secondary'),
    marginBottom: getSpacing('sm'),
    fontStyle: 'italic',
  },
  categoryNote: {
    ...getTypography('caption'),
    color: getColor('text.secondary'),
    marginBottom: getSpacing('md'),
    fontStyle: 'italic',
    backgroundColor: getColor('background.tertiary'),
    padding: getSpacing('sm'),
    borderRadius: getBorderRadius('sm'),
  },
  // Upload Documents Step Styles
  documentUploadPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: getSpacing('xl'),
    paddingHorizontal: getSpacing('lg'),
    backgroundColor: getColor('background.primary'),
    borderRadius: getBorderRadius('lg'),
    borderWidth: 2,
    borderColor: getColor('border.light'),
    borderStyle: 'dashed',
    ...getShadow('medium'),
  },
  documentUploadText: {
    ...getTypography('body'),
    fontWeight: '600',
    color: getColor('text.primary'),
    marginTop: getSpacing('md'),
  },
  documentUploadSubtext: {
    ...getTypography('bodySmall'),
    color: getColor('text.secondary'),
    marginTop: getSpacing('xs'),
    textAlign: 'center',
  },
  uploadInstructions: {
    backgroundColor: getColor('background.primary'),
    borderRadius: getBorderRadius('lg'),
    padding: getSpacing('md'),
    marginTop: getSpacing('lg'),
    ...getShadow('medium'),
  },
  uploadInstructionsTitle: {
    ...getTypography('body'),
    fontWeight: '600',
    color: getColor('text.primary'),
    marginBottom: getSpacing('sm'),
  },
  uploadInstructionsItem: {
    ...getTypography('bodySmall'),
    color: getColor('text.secondary'),
    marginBottom: getSpacing('xs'),
    paddingLeft: getSpacing('sm'),
  },
});
