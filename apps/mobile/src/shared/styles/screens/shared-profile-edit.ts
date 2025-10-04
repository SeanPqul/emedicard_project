import { StyleSheet } from 'react-native';
import { getBorderRadius, getColor, getSpacing, getTypography } from '../../styles/theme';

export const profileEditStyles = StyleSheet.create({
  // Main container
  container: {
    flex: 1,
    backgroundColor: getColor('background.primary'),
    padding: getSpacing('lg'),
  },

  // Title
  title: {
    ...getTypography('h4'),
    textAlign: 'center',
    marginVertical: getSpacing('md'),
    color: getColor('text.primary'),
  },

  // Input fields
  input: {
    borderColor: getColor('border.light'),
    borderWidth: 1,
    borderRadius: getBorderRadius('md'),
    marginBottom: getSpacing('sm'),
    padding: getSpacing('sm'),
    backgroundColor: getColor('background.primary'),
  },

  // Form section
  formSection: {
    marginBottom: getSpacing('lg'),
  },

  // Button container
  buttonContainer: {
    marginTop: getSpacing('lg'),
  },

  // Save button
  saveButton: {
    backgroundColor: getColor('accent.medicalBlue'),
    paddingVertical: getSpacing('md'),
    paddingHorizontal: getSpacing('lg'),
    borderRadius: getBorderRadius('md'),
    alignItems: 'center',
  },

  saveButtonText: {
    ...getTypography('body'),
    color: getColor('background.primary'),
    fontWeight: '600',
  },

  // Loading state
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingText: {
    ...getTypography('body'),
    color: getColor('text.secondary'),
  },
});