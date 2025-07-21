import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { getColor, getSpacing } from '../../styles/theme';
import { LoadingSpinner } from '../LoadingSpinner';
import { ErrorState } from '../ErrorState';

interface NavigationWrapperProps {
  children: React.ReactNode;
  showBackButton?: boolean;
  onBackPress?: () => void;
  loading?: boolean;
  error?: Error | string;
  onRetry?: () => void;
  loadingMessage?: string;
  errorTitle?: string;
  errorMessage?: string;
  backgroundColor?: string;
}

export const NavigationWrapper: React.FC<NavigationWrapperProps> = ({
  children,
  showBackButton = true,
  onBackPress,
  loading = false,
  error,
  onRetry,
  loadingMessage = 'Loading...',
  errorTitle,
  errorMessage,
  backgroundColor = getColor('background.secondary'),
}) => {
  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/');
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <LoadingSpinner
          visible={true}
          message={loadingMessage}
          type="pulse"
          size="large"
          style={styles.loadingContainer}
        />
      );
    }

    if (error) {
      return (
        <ErrorState
          error={error}
          title={errorTitle}
          message={errorMessage}
          onRetry={onRetry}
          showDetails={__DEV__}
          variant="fullscreen"
        />
      );
    }

    return children;
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      {showBackButton && (
        <View style={styles.backButtonContainer}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBackPress}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={24} color={getColor('text.primary')} />
          </TouchableOpacity>
        </View>
      )}
      {renderContent()}
    </View>
  );
};

// Enhanced navigation functions
export const navigateToUploadDocuments = (formId: string, params?: Record<string, string>) => {
  router.push({
    pathname: '/(screens)/(shared)/upload-documents',
    params: { formId, ...params }
  });
};

export const navigateToPayment = (formId: string, params?: Record<string, string>) => {
  router.push({
    pathname: '/(screens)/(shared)/payment',
    params: { formId, ...params }
  });
};

export const navigateToOrientation = (formId?: string, params?: Record<string, string>) => {
  router.push({
    pathname: '/(screens)/(shared)/orientation',
    params: { ...(formId && { formId }), ...params }
  });
};

export const navigateToHealthCards = (cardId?: string, params?: Record<string, string>) => {
  router.push({
    pathname: '/(screens)/(shared)/health-cards',
    params: { ...(cardId && { cardId }), ...params }
  });
};

export const navigateToApplication = (applicationId?: string, params?: Record<string, string>) => {
  if (applicationId) {
    router.push({
      pathname: '/(tabs)/application',
      params: { highlightId: applicationId, ...params }
    });
  } else {
    router.push('/(tabs)/application');
  }
};

export const navigateWithRetry = (
  navigationFn: () => void,
  maxRetries: number = 3,
  onError?: (error: Error) => void
) => {
  let retryCount = 0;
  
  const attemptNavigation = () => {
    try {
      navigationFn();
    } catch (error) {
      console.error('Navigation failed:', error);
      
      if (retryCount < maxRetries) {
        retryCount++;
        setTimeout(() => attemptNavigation(), 500 * retryCount);
      } else if (onError) {
        onError(error as Error);
      }
    }
  };
  
  attemptNavigation();
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backButtonContainer: {
    position: 'absolute',
    top: getSpacing('md'),
    left: getSpacing('md'),
    zIndex: 1000,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: getColor('background.primary'),
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
