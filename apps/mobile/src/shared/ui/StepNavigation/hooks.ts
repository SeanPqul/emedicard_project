import { router } from 'expo-router';
import { StepState } from './types';

export const useStepState = (
  index: number,
  currentStep: number,
  canNavigateDirectly: boolean,
  onStepPress?: (step: number) => void
): StepState => {
  const isActive = index === currentStep;
  const isCompleted = index < currentStep;
  const isClickable = canNavigateDirectly && !!onStepPress;
  const isAccessible = index <= currentStep || canNavigateDirectly;

  return {
    isActive,
    isCompleted,
    isClickable,
    isAccessible,
  };
};

export const useNavigationHandlers = (onCancel?: () => void) => {
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/');
    }
  };

  return {
    handleCancel,
  };
};

export const useStepAccessibilityProps = (
  index: number,
  title: string,
  stepState: StepState
) => {
  return {
    accessibilityRole: 'button' as const,
    accessibilityLabel: `Step ${index + 1}: ${title}${stepState.isActive ? ' (current)' : ''}${stepState.isCompleted ? ' (completed)' : ''}`,
    accessibilityState: {
      selected: stepState.isActive,
      disabled: !stepState.isAccessible,
    },
  };
};
