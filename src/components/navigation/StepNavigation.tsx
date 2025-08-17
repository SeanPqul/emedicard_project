import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { getBorderRadius, getColor, getSpacing, getTypography } from '../../styles/theme';
import { ErrorState } from '../ErrorState';
import { LoadingSpinner } from '../LoadingSpinner';

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
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/');
    }
  };

  const renderStepIndicator = () => {
    if (!showStepIndicator) return null;

    return (
      <View style={styles.stepIndicatorContainer}>
        {stepTitles.map((title, index) => {
          const isActive = index === currentStep;
          const isCompleted = index < currentStep;
          const isClickable = canNavigateDirectly && onStepPress;
          const isAccessible = index <= currentStep || canNavigateDirectly;

          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.stepItem,
                !isClickable && styles.stepItemDisabled,
              ]}
              onPress={() => isClickable && onStepPress(index)}
              disabled={!isClickable}
              accessibilityRole="button"
              accessibilityLabel={`Step ${index + 1}: ${title}${isActive ? ' (current)' : ''}${isCompleted ? ' (completed)' : ''}`}
              accessibilityState={{
                selected: isActive,
                disabled: !isAccessible,
              }}
            >
              <View style={styles.stepItemContent}>
                <View
                  style={[
                    styles.stepCircle,
                    isActive && styles.stepCircleActive,
                    isCompleted && styles.stepCircleCompleted,
                    !isAccessible && styles.stepCircleDisabled,
                  ]}
                >
                  {isCompleted ? (
                    <Ionicons name="checkmark" size={16} color={getColor('background.primary')} />
                  ) : (
                    <Text
                      style={[
                        styles.stepNumber,
                        isActive && styles.stepNumberActive,
                        !isAccessible && styles.stepNumberDisabled,
                      ]}
                    >
                      {index + 1}
                    </Text>
                  )}
                </View>
                <Text
                  style={[
                    styles.stepTitle,
                    isActive && styles.stepTitleActive,
                    !isAccessible && styles.stepTitleDisabled,
                  ]}
                >
                  {title}
                </Text>
              </View>
              {index < stepTitles.length - 1 && (
                <View
                  style={[
                    styles.stepConnector,
                    isCompleted && styles.stepConnectorCompleted,
                  ]}
                />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  const renderNavigationButtons = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <LoadingSpinner
            visible={true}
            size="small"
            message="Processing..."
            type="dots"
          />
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.errorContainer}>
          <ErrorState
            error={error}
            onRetry={onRetry || (() => {})}
            variant="inline"
            showDetails={false}
          />
        </View>
      );
    }

    return (
      <View style={styles.navigationButtonsContainer}>
        <View style={styles.leftButtons}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleCancel}
            accessibilityRole="button"
            accessibilityLabel="Cancel"
          >
            <Ionicons name="close" size={20} color={getColor('text.secondary')} />
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.rightButtons}>
          {allowSkip && onSkip && (
            <TouchableOpacity
              style={styles.skipButton}
              onPress={onSkip}
              accessibilityRole="button"
              accessibilityLabel={skipButtonText}
            >
              <Text style={styles.skipButtonText}>{skipButtonText}</Text>
            </TouchableOpacity>
          )}

          {currentStep > 0 && onPrevious && (
            <TouchableOpacity
              style={[
                styles.previousButton,
                previousButtonDisabled && styles.buttonDisabled,
              ]}
              onPress={onPrevious}
              disabled={previousButtonDisabled}
              accessibilityRole="button"
              accessibilityLabel={previousButtonText}
            >
              <Ionicons name="chevron-back" size={20} color={getColor('text.secondary')} />
              <Text style={styles.previousButtonText}>{previousButtonText}</Text>
            </TouchableOpacity>
          )}

          {onNext && (
            <TouchableOpacity
              style={[
                styles.nextButton,
                nextButtonDisabled && styles.buttonDisabled,
              ]}
              onPress={onNext}
              disabled={nextButtonDisabled}
              accessibilityRole="button"
              accessibilityLabel={nextButtonText}
            >
              <Text style={styles.nextButtonText}>{nextButtonText}</Text>
              <Ionicons name="chevron-forward" size={20} color={getColor('background.primary')} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {renderStepIndicator()}
      {renderNavigationButtons()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: getColor('background.primary'),
    borderTopWidth: 1,
    borderTopColor: getColor('border.light'),
  },
  stepIndicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: getSpacing('lg'),
    paddingVertical: getSpacing('md'),
    backgroundColor: getColor('background.secondary'),
  },
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
