// Re-export components from the new modular structure
export { LoadingSpinner, SkeletonLoader } from './LoadingSpinner';

// Export additional components for direct use
export {
  SpinnerVariant,
  DotsVariant,
  PulseVariant,
  ProgressIndicator,
} from './LoadingSpinner';

// Export types for consumers
export type {
  LoadingSpinnerProps,
  SkeletonLoaderProps,
  SpinnerVariantProps,
  DotsVariantProps,
  PulseVariantProps,
  ProgressIndicatorProps,
  BaseLoadingProps,
} from './LoadingSpinner';

// Export hooks for advanced usage
export {
  useFadeAnimation,
  useSpinnerAnimation,
  useDotsAnimation,
  usePulseAnimation,
  useSkeletonAnimation,
} from './LoadingSpinner';
