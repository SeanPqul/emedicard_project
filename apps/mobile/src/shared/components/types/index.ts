/**
 * Component Types Index
 * 
 * Central export point for all component-related type definitions
 */

// Button component types
export type {
  CTAButtonProps,
  ActionButtonProps,
  LinkTextProps,
  SignOutButtonProps,
} from './buttons';

// Form component types
export type {
  InputProps,
  CustomTextInputProps,
  OtpInputUIProps,
  PasswordStrengthIndicatorProps,
  FormFieldValidation,
  FormFieldConfig,
  FormState,
} from './forms';

// Feedback component types
export type {
  LoadingSpinnerProps,
  EmptyStateProps,
  ErrorStateProps,
  ErrorType,
  NetworkErrorStateProps,
  ServerErrorStateProps,
  UploadErrorStateProps,
  PaymentErrorStateProps,
  ToastProps,
  ToastType,
  FeedbackState,
  FeedbackContextType,
} from './feedback';

// Dashboard component types
export type {
  StatCardProps,
  RecentActivity,
  ActivityItemProps,
  DashboardHeaderProps,
  ScreenHeaderProps,
  ProfileLinkProps,
  DashboardStats,
} from './dashboard';

// Layout component types (re-export from design-system for consistency)
export type {
  LayoutProps,
  SpacingProps,
  FlexDirection,
  JustifyContent,
  AlignItems,
} from '@/src/types/design-system';

// Typography component types (re-export from design-system for consistency)
export type {
  DesignSystemTextProps,
  FontWeight,
  TypographyVariant,
  TypographyProps,
} from '@/src/types/design-system';

// Navigation component types
export interface NavigationWrapperProps {
  children: React.ReactNode;
  loading?: boolean;
  error?: string;
  retry?: () => void;
}

export interface StepNavigationProps {
  currentStep: number;
  totalSteps: number;
  onStepPress?: (step: number) => void;
  stepLabels?: string[];
  completedSteps?: number[];
  disabledSteps?: number[];
  containerStyle?: any;
  stepStyle?: any;
  activeStepStyle?: any;
  completedStepStyle?: any;
}


