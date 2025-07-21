import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getColor, getTypography, getSpacing, getBorderRadius } from '../styles/theme';
import { CustomButton } from './CustomButton';

export type ErrorType = 
  | 'network' 
  | 'server' 
  | 'timeout' 
  | 'not_found' 
  | 'unauthorized' 
  | 'validation' 
  | 'upload' 
  | 'payment' 
  | 'generic';

interface ErrorStateProps {
  type?: ErrorType;
  title?: string;
  message?: string;
  error?: Error | string;
  onRetry?: () => void;
  onResolve?: () => void;
  onDismiss?: () => void;
  retryText?: string;
  resolveText?: string;
  dismissText?: string;
  style?: ViewStyle;
  titleStyle?: TextStyle;
  messageStyle?: TextStyle;
  showDetails?: boolean;
  showSupportContact?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  variant?: 'inline' | 'fullscreen' | 'card';
  actions?: Array<{
    text: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'danger';
    loading?: boolean;
  }>;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  type = 'generic',
  title,
  message,
  error,
  onRetry,
  onResolve,
  onDismiss,
  retryText = 'Retry',
  resolveText = 'Resolve',
  dismissText = 'Dismiss',
  style,
  titleStyle,
  messageStyle,
  showDetails = false,
  showSupportContact = false,
  icon,
  variant = 'inline',
  actions,
}) => {
  const getErrorConfig = () => {
    switch (type) {
      case 'network':
        return {
          icon: 'wifi-off',
          title: 'Network Error',
          message: 'Please check your internet connection and try again.',
          color: getColor('semantic.warning'),
        };
      case 'server':
        return {
          icon: 'server',
          title: 'Server Error',
          message: 'Something went wrong on our end. Please try again later.',
          color: getColor('semantic.error'),
        };
      case 'timeout':
        return {
          icon: 'time',
          title: 'Request Timeout',
          message: 'The request took too long to complete. Please try again.',
          color: getColor('semantic.warning'),
        };
      case 'not_found':
        return {
          icon: 'search',
          title: 'Not Found',
          message: 'The requested resource could not be found.',
          color: getColor('text.secondary'),
        };
      case 'unauthorized':
        return {
          icon: 'lock-closed',
          title: 'Access Denied',
          message: 'You don\'t have permission to access this resource.',
          color: getColor('semantic.error'),
        };
      case 'validation':
        return {
          icon: 'warning',
          title: 'Validation Error',
          message: 'Please check your input and try again.',
          color: getColor('semantic.warning'),
        };
      case 'upload':
        return {
          icon: 'cloud-upload',
          title: 'Upload Failed',
          message: 'Failed to upload file. Please check your connection and try again.',
          color: getColor('semantic.error'),
        };
      case 'payment':
        return {
          icon: 'card',
          title: 'Payment Error',
          message: 'Payment could not be processed. Please try again or contact support.',
          color: getColor('semantic.error'),
        };
      case 'generic':
      default:
        return {
          icon: 'alert-circle',
          title: 'Something went wrong',
          message: 'An unexpected error occurred. Please try again.',
          color: getColor('semantic.error'),
        };
    }
  };

  const errorConfig = getErrorConfig();
  const displayTitle = title || errorConfig.title;
  const displayMessage = message || errorConfig.message;
  const displayIcon = icon || errorConfig.icon;
  const iconColor = errorConfig.color;

  const handleContactSupport = () => {
    Alert.alert(
      'Contact Support',
      'Would you like to contact our support team for help?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Contact', 
          onPress: () => {
            // In a real app, you'd implement support contact functionality
            Alert.alert('Support', 'Support contact functionality would be implemented here');
          }
        },
      ]
    );
  };

  const handleShowDetails = () => {
    if (error) {
      const errorDetails = error instanceof Error ? error.message : String(error);
      Alert.alert('Error Details', errorDetails);
    }
  };

  const renderActions = () => {
    const allActions = [];

    // Add custom actions first
    if (actions && actions.length > 0) {
      allActions.push(...actions);
    }

    // Add default actions
    if (onRetry) {
      allActions.push({
        text: retryText,
        onPress: onRetry,
        variant: 'primary' as const,
      });
    }

    if (onResolve) {
      allActions.push({
        text: resolveText,
        onPress: onResolve,
        variant: 'secondary' as const,
      });
    }

    if (onDismiss) {
      allActions.push({
        text: dismissText,
        onPress: onDismiss,
        variant: 'secondary' as const,
      });
    }

    if (allActions.length === 0) return null;

    return (
      <View style={styles.actionsContainer}>
        {allActions.map((action, index) => (
          <CustomButton
            key={index}
            title={action.text}
            onPress={action.onPress}
            loading={action.loading}
            variant={action.variant}
            size="small"
            style={[
              styles.actionButton,
              index > 0 && styles.actionButtonSpacing,
            ]}
          />
        ))}
      </View>
    );
  };

  const renderSupportOptions = () => {
    if (!showSupportContact && !showDetails) return null;

    return (
      <View style={styles.supportContainer}>
        {showDetails && error && (
          <TouchableOpacity
            style={styles.supportButton}
            onPress={handleShowDetails}
          >
            <Ionicons name="information-circle-outline" size={16} color={getColor('primary.500')} />
            <Text style={styles.supportButtonText}>Show Details</Text>
          </TouchableOpacity>
        )}
        
        {showSupportContact && (
          <TouchableOpacity
            style={styles.supportButton}
            onPress={handleContactSupport}
          >
            <Ionicons name="help-circle-outline" size={16} color={getColor('primary.500')} />
            <Text style={styles.supportButtonText}>Contact Support</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const containerStyle = [
    styles.container,
    variant === 'fullscreen' && styles.fullscreenContainer,
    variant === 'card' && styles.cardContainer,
    style,
  ];

  return (
    <View style={containerStyle}>
      <View style={styles.iconContainer}>
        <Ionicons name={displayIcon} size={48} color={iconColor} />
      </View>
      
      <Text style={[styles.title, titleStyle]}>
        {displayTitle}
      </Text>
      
      <Text style={[styles.message, messageStyle]}>
        {displayMessage}
      </Text>
      
      {renderActions()}
      {renderSupportOptions()}
    </View>
  );
};

// Specialized error components for common scenarios
export const NetworkErrorState: React.FC<Omit<ErrorStateProps, 'type'>> = (props) => (
  <ErrorState {...props} type="network" />
);

export const ServerErrorState: React.FC<Omit<ErrorStateProps, 'type'>> = (props) => (
  <ErrorState {...props} type="server" />
);

export const UploadErrorState: React.FC<Omit<ErrorStateProps, 'type'>> = (props) => (
  <ErrorState {...props} type="upload" />
);

export const PaymentErrorState: React.FC<Omit<ErrorStateProps, 'type'>> = (props) => (
  <ErrorState {...props} type="payment" />
);

// Error boundary fallback component
export const ErrorFallback: React.FC<{
  error: Error;
  resetError: () => void;
}> = ({ error, resetError }) => (
  <ErrorState
    type="generic"
    title="Application Error"
    message="Something went wrong in the application. Please try restarting."
    error={error}
    onRetry={resetError}
    showDetails={__DEV__}
    showSupportContact={true}
    variant="fullscreen"
  />
);

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: getSpacing('xl'),
  },
  fullscreenContainer: {
    flex: 1,
    backgroundColor: getColor('background.primary'),
  },
  cardContainer: {
    backgroundColor: getColor('background.primary'),
    borderRadius: getBorderRadius('lg'),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    margin: getSpacing('md'),
  },
  iconContainer: {
    marginBottom: getSpacing('lg'),
  },
  title: {
    ...getTypography('headingMedium'),
    color: getColor('text.primary'),
    textAlign: 'center',
    marginBottom: getSpacing('md'),
  },
  message: {
    ...getTypography('bodyMedium'),
    color: getColor('text.secondary'),
    textAlign: 'center',
    marginBottom: getSpacing('xl'),
    lineHeight: 24,
  },
  actionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: getSpacing('md'),
  },
  actionButton: {
    minWidth: 100,
  },
  actionButtonSpacing: {
    marginLeft: getSpacing('sm'),
  },
  supportContainer: {
    marginTop: getSpacing('lg'),
    alignItems: 'center',
    gap: getSpacing('sm'),
  },
  supportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: getSpacing('md'),
    paddingVertical: getSpacing('sm'),
  },
  supportButtonText: {
    ...getTypography('bodySmall'),
    color: getColor('primary.500'),
    marginLeft: getSpacing('xs'),
  },
});
