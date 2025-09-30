/**
 * Feedback Component Types
 * 
 * Centralized type definitions for feedback, loading, and state components
 */

import { ViewStyle, TextStyle } from 'react-native';
import { BaseComponentProps } from '@/src/types/design-system';

// ===== LOADING SPINNER TYPES =====
export interface LoadingSpinnerProps extends BaseComponentProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
  overlay?: boolean;
  text?: string;
  textStyle?: TextStyle;
  containerStyle?: ViewStyle;
}

// ===== EMPTY STATE TYPES =====
export interface EmptyStateProps {
  icon: string;
  title: string;
  subtitle: string;
  actionText?: string;
  onActionPress?: () => void;
  iconSize?: number;
  iconColor?: string;
  containerStyle?: ViewStyle;
  titleStyle?: TextStyle;
  subtitleStyle?: TextStyle;
}

// ===== ERROR STATE TYPES =====
export type ErrorType = 'network' | 'server' | 'upload' | 'payment' | 'general';

export interface ErrorStateProps {
  type?: ErrorType;
  title?: string;
  message?: string;
  actionText?: string;
  onActionPress?: () => void;
  icon?: string;
  containerStyle?: ViewStyle;
  showIcon?: boolean;
}

export interface NetworkErrorStateProps extends Omit<ErrorStateProps, 'type'> {}
export interface ServerErrorStateProps extends Omit<ErrorStateProps, 'type'> {}
export interface UploadErrorStateProps extends Omit<ErrorStateProps, 'type'> {}
export interface PaymentErrorStateProps extends Omit<ErrorStateProps, 'type'> {}

// ===== TOAST TYPES =====
export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
  position?: 'top' | 'bottom' | 'center';
  onPress?: () => void;
  onDismiss?: () => void;
  actionText?: string;
  onActionPress?: () => void;
  showCloseButton?: boolean;
  style?: ViewStyle;
}

// ===== FEEDBACK SYSTEM TYPES =====
export interface FeedbackState {
  isVisible: boolean;
  type: ToastType;
  title?: string;
  message: string;
  duration: number;
  onDismiss?: () => void;
}

export interface FeedbackContextType {
  showFeedback: (config: Omit<FeedbackState, 'isVisible'>) => void;
  hideFeedback: () => void;
  feedback: FeedbackState | null;
}

