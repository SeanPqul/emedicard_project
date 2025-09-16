import React from 'react';
import { View, StyleSheet } from 'react-native';
import { getColor } from '../../styles/theme';
import { StepIndicator } from './StepIndicator';
import { NavigationButtons } from './NavigationButtons';

interface StepNavigationProps {
  currentStep: number;
  totalSteps: number;
  stepTitles: string[];
  onNext?: () => void;
  onPrevious?: () => void;
  onCancel?: () => void;
  nextButtonText?: string;
  previousButtonText?: string;
  nextButtonDisabled?: boolean;
  previousButtonDisabled?: boolean;
  loading?: boolean;
  error?: Error | string;
  onRetry?: () => void;
  showStepIndicator?: boolean;
  canNavigateDirectly?: boolean;
  onStepPress?: (step: number) => void;
  allowSkip?: boolean;
  onSkip?: () => void;
  skipButtonText?: string;
}

export const StepNavigation: React.FC<StepNavigationProps> = ({
  currentStep,
  totalSteps,
  stepTitles,
  onNext,
  onPrevious,
  onCancel,
  nextButtonText = 'Next',
  previousButtonText = 'Previous',
  nextButtonDisabled = false,
  previousButtonDisabled = false,
  loading = false,
  error,
  onRetry,
  showStepIndicator = true,
  canNavigateDirectly = false,
  onStepPress,
  allowSkip = false,
  onSkip,
  skipButtonText = 'Skip',
}) => {
  return (
    <View style={styles.container}>
      <StepIndicator
        currentStep={currentStep}
        stepTitles={stepTitles}
        showStepIndicator={showStepIndicator}
        canNavigateDirectly={canNavigateDirectly}
        onStepPress={onStepPress}
      />
      <NavigationButtons
        currentStep={currentStep}
        onNext={onNext}
        onPrevious={onPrevious}
        onCancel={onCancel}
        nextButtonText={nextButtonText}
        previousButtonText={previousButtonText}
        nextButtonDisabled={nextButtonDisabled}
        previousButtonDisabled={previousButtonDisabled}
        loading={loading}
        error={error}
        onRetry={onRetry}
        allowSkip={allowSkip}
        onSkip={onSkip}
        skipButtonText={skipButtonText}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: getColor('background.primary'),
    borderTopWidth: 1,
    borderTopColor: getColor('border.light'),
  },
});
