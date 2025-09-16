import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { getBorderRadius, getColor, getSpacing, getTypography } from '../../styles/theme';
import { LoadingSpinner } from '../LoadingSpinner';
import { ErrorState } from '../ErrorState';

interface NavigationButtonsProps {
  currentStep: number;
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
  allowSkip?: boolean;
  onSkip?: () => void;
  skipButtonText?: string;
}

export const NavigationButtons: React.FC<NavigationButtonsProps> = ({
  currentStep,
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
    <View style={styles.container}>
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

const styles = StyleSheet.create({
  container: {
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
  loadingContainer: {
    padding: getSpacing('md'),
    alignItems: 'center',
  },
  errorContainer: {
    padding: getSpacing('md'),
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
