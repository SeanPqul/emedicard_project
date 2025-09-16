export interface StepNavigationProps {
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

export interface StepIndicatorProps {
  stepTitles: string[];
  currentStep: number;
  canNavigateDirectly: boolean;
  onStepPress?: (step: number) => void;
}

export interface StepItemProps {
  title: string;
  index: number;
  currentStep: number;
  canNavigateDirectly: boolean;
  onStepPress?: (step: number) => void;
  isLast: boolean;
}

export interface NavigationButtonsProps {
  currentStep: number;
  totalSteps: number;
  onNext?: () => void;
  onPrevious?: () => void;
  onCancel: () => void;
  nextButtonText: string;
  previousButtonText: string;
  nextButtonDisabled: boolean;
  previousButtonDisabled: boolean;
  loading: boolean;
  error?: Error | string;
  onRetry?: () => void;
  allowSkip: boolean;
  onSkip?: () => void;
  skipButtonText: string;
}

export interface NavigationActionsProps {
  currentStep: number;
  onPrevious?: () => void;
  onNext?: () => void;
  allowSkip: boolean;
  onSkip?: () => void;
  nextButtonText: string;
  previousButtonText: string;
  skipButtonText: string;
  nextButtonDisabled: boolean;
  previousButtonDisabled: boolean;
}

export interface StepState {
  isActive: boolean;
  isCompleted: boolean;
  isClickable: boolean;
  isAccessible: boolean;
}
