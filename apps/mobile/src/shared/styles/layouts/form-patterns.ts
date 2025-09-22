import { StyleSheet } from 'react-native';
import { getColor, getSpacing, getBorderRadius, getTypography, getShadow } from '../theme/index';

// Form-specific style patterns
export const formPatterns = StyleSheet.create({
  // Form containers
  formContainer: {
    padding: getSpacing('lg'),
  },
  
  formGroup: {
    marginBottom: getSpacing('md'),
  },
  
  formGroupLarge: {
    marginBottom: getSpacing('lg'),
  },
  
  formRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: getSpacing('md'),
  },
  
  // Input patterns
  inputContainer: {
    marginBottom: getSpacing('md'),
  },
  
  inputLabel: {
    ...getTypography('body'),
    color: getColor('text.primary'),
    marginBottom: getSpacing('xs'),
  },
  
  inputLabelWithRequired: {
    ...getTypography('body'),
    color: getColor('text.primary'),
    marginBottom: getSpacing('xs'),
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  requiredIndicator: {
    color: getColor('semantic.error'),
    marginLeft: getSpacing('xs'),
  },
  
  inputField: {
    borderWidth: 1,
    borderColor: getColor('border.light'),
    borderRadius: getBorderRadius('md'),
    paddingHorizontal: getSpacing('md'),
    paddingVertical: getSpacing('sm'),
    backgroundColor: getColor('background.primary'),
    ...getTypography('body'),
    color: getColor('text.primary'),
  },
  
  inputFieldFocused: {
    borderColor: getColor('primary.500'),
    ...getShadow('small'),
  },
  
  inputFieldError: {
    borderColor: getColor('semantic.error'),
  },
  
  // Selection patterns
  selectionContainer: {
    marginBottom: getSpacing('lg'),
  },
  
  selectionTitle: {
    ...getTypography('h4'),
    color: getColor('text.primary'),
    marginBottom: getSpacing('md'),
  },
  
  selectionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  
  selectionItem: {
    width: '48%',
    backgroundColor: getColor('background.primary'),
    borderRadius: getBorderRadius('lg'),
    padding: getSpacing('md'),
    marginBottom: getSpacing('sm'),
    borderWidth: 2,
    borderColor: getColor('border.light'),
    alignItems: 'center',
    ...getShadow('small'),
  },
  
  selectionItemSelected: {
    borderColor: getColor('primary.500'),
    backgroundColor: getColor('primary.50'),
  },
  
  selectionItemText: {
    ...getTypography('body'),
    color: getColor('text.primary'),
    textAlign: 'center',
    marginTop: getSpacing('xs'),
  },
  
  selectionItemTextSelected: {
    color: getColor('primary.500'),
    fontWeight: '600',
  },
  
  // Document upload patterns
  uploadContainer: {
    backgroundColor: getColor('background.primary'),
    borderRadius: getBorderRadius('lg'),
    padding: getSpacing('md'),
    marginBottom: getSpacing('md'),
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: getColor('border.light'),
    alignItems: 'center',
  },
  
  uploadContainerActive: {
    borderColor: getColor('primary.500'),
    backgroundColor: getColor('primary.50'),
  },
  
  uploadButton: {
    backgroundColor: getColor('primary.500'),
    borderRadius: getBorderRadius('md'),
    paddingHorizontal: getSpacing('lg'),
    paddingVertical: getSpacing('sm'),
    alignItems: 'center',
    marginTop: getSpacing('sm'),
  },
  
  uploadButtonText: {
    ...getTypography('button'),
    color: getColor('text.inverse'),
  },
  
  uploadedItem: {
    backgroundColor: getColor('background.secondary'),
    borderRadius: getBorderRadius('md'),
    padding: getSpacing('sm'),
    marginTop: getSpacing('sm'),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  
  uploadedItemText: {
    ...getTypography('body'),
    color: getColor('text.primary'),
    flex: 1,
    marginRight: getSpacing('sm'),
  },
  
  // Validation patterns
  errorText: {
    ...getTypography('caption'),
    color: getColor('semantic.error'),
    marginTop: getSpacing('xs'),
  },
  
  successText: {
    ...getTypography('caption'),
    color: getColor('semantic.success'),
    marginTop: getSpacing('xs'),
  },
  
  validationIcon: {
    marginLeft: getSpacing('xs'),
  },
  
  // Step navigation patterns
  stepContainer: {
    backgroundColor: getColor('background.primary'),
    paddingHorizontal: getSpacing('lg'),
    paddingVertical: getSpacing('md'),
    borderBottomWidth: 1,
    borderBottomColor: getColor('border.light'),
  },
  
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: getSpacing('sm'),
  },
  
  stepDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: getColor('border.light'),
  },
  
  stepDotActive: {
    backgroundColor: getColor('primary.500'),
  },
  
  stepDotCompleted: {
    backgroundColor: getColor('semantic.success'),
  },
  
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: getColor('border.light'),
    marginHorizontal: getSpacing('xs'),
  },
  
  stepLineActive: {
    backgroundColor: getColor('primary.500'),
  },
  
  stepTitle: {
    ...getTypography('h4'),
    color: getColor('text.primary'),
  },
  
  stepDescription: {
    ...getTypography('body'),
    color: getColor('text.secondary'),
    marginTop: getSpacing('xs'),
  },
});

// Form button patterns
export const formButtonPatterns = StyleSheet.create({
  buttonContainer: {
    paddingHorizontal: getSpacing('lg'),
    paddingVertical: getSpacing('md'),
    backgroundColor: getColor('background.primary'),
  },
  
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  backButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: getColor('border.medium'),
    borderRadius: getBorderRadius('md'),
    paddingHorizontal: getSpacing('lg'),
    paddingVertical: getSpacing('sm'),
    flex: 0.45,
  },
  
  nextButton: {
    backgroundColor: getColor('primary.500'),
    borderRadius: getBorderRadius('md'),
    paddingHorizontal: getSpacing('lg'),
    paddingVertical: getSpacing('sm'),
    flex: 0.45,
  },
  
  backButtonText: {
    ...getTypography('button'),
    color: getColor('text.primary'),
    textAlign: 'center',
  },
  
  nextButtonText: {
    ...getTypography('button'),
    color: getColor('text.inverse'),
    textAlign: 'center',
  },
  
  submitButton: {
    backgroundColor: getColor('semantic.success'),
    borderRadius: getBorderRadius('md'),
    paddingVertical: getSpacing('md'),
    alignItems: 'center',
    marginTop: getSpacing('md'),
  },
  
  submitButtonText: {
    ...getTypography('button'),
    color: getColor('text.inverse'),
  },
  
  disabledButton: {
    backgroundColor: getColor('border.light'),
  },
  
  disabledButtonText: {
    color: getColor('text.tertiary'),
  },
});