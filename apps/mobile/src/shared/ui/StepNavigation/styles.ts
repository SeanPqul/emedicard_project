import { StyleSheet } from 'react-native';
import { getBorderRadius, getColor, getSpacing, getTypography } from '../../styles/theme';

export const styles = StyleSheet.create({
  // Container styles
  container: {
    backgroundColor: getColor('background.primary'),
    borderTopWidth: 1,
    borderTopColor: getColor('border.light'),
  },

  // Step Indicator styles
  stepIndicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: getSpacing('lg'),
    paddingVertical: getSpacing('md'),
    backgroundColor: getColor('background.secondary'),
  },

  // Step Item styles
  stepItem: {
    flex: 1,
    alignItems: 'center',
    position: 'relative',
  },
  stepItemDisabled: {
    opacity: 0.7,
  },
  stepItemContent: {
    alignItems: 'center',
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: getColor('background.primary'),
    borderWidth: 2,
    borderColor: getColor('border.default'),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: getSpacing('xs'),
  },
  stepCircleActive: {
    backgroundColor: getColor('interactive'),
    borderColor: getColor('interactive'),
  },
  stepCircleCompleted: {
    backgroundColor: getColor('success'),
    borderColor: getColor('success'),
  },
  stepCircleDisabled: {
    backgroundColor: getColor('background.secondary'),
    borderColor: getColor('border.light'),
    opacity: 0.5,
  },
  stepNumber: {
    ...getTypography('bodySmall'),
    color: getColor('text.secondary'),
    fontWeight: '600',
  },
  stepNumberActive: {
    color: getColor('background.primary'),
  },
  stepNumberDisabled: {
    color: getColor('text.secondary'),
    opacity: 0.5,
  },
  stepTitle: {
    ...getTypography('bodySmall'),
    color: getColor('text.secondary'),
    textAlign: 'center',
    maxWidth: 80,
  },
  stepTitleActive: {
    color: getColor('text.primary'),
    fontWeight: '600',
  },
  stepTitleDisabled: {
    color: getColor('text.secondary'),
    opacity: 0.5,
  },
  stepConnector: {
    position: 'absolute',
    top: 16,
    right: -50,
    width: 100,
    height: 2,
    backgroundColor: getColor('border.default'),
    zIndex: -1,
  },
  stepConnectorCompleted: {
    backgroundColor: getColor('success'),
  },

  // Navigation Buttons styles
  loadingContainer: {
    padding: getSpacing('md'),
    alignItems: 'center',
  },
  errorContainer: {
    padding: getSpacing('md'),
  },
  navigationButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: getSpacing('md'),
  },
  leftButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rightButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getSpacing('sm'),
  },

  // Button styles
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: getSpacing('md'),
    paddingVertical: getSpacing('sm'),
  },
  cancelButtonText: {
    ...getTypography('button'),
    color: getColor('text.secondary'),
    marginLeft: getSpacing('xs'),
  },
  skipButton: {
    paddingHorizontal: getSpacing('md'),
    paddingVertical: getSpacing('sm'),
  },
  skipButtonText: {
    ...getTypography('button'),
    color: getColor('interactive'),
  },
  previousButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: getSpacing('md'),
    paddingVertical: getSpacing('sm'),
    borderRadius: getBorderRadius('sm'),
    backgroundColor: getColor('background.secondary'),
  },
  previousButtonText: {
    ...getTypography('button'),
    color: getColor('text.secondary'),
    marginLeft: getSpacing('xs'),
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: getSpacing('lg'),
    paddingVertical: getSpacing('sm'),
    borderRadius: getBorderRadius('sm'),
    backgroundColor: getColor('interactive'),
  },
  nextButtonText: {
    ...getTypography('button'),
    color: getColor('background.primary'),
    fontWeight: '600',
    marginRight: getSpacing('xs'),
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});
