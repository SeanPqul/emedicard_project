import { ViewStyle, TextStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface BaseLoadingProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
  style?: ViewStyle;
}

export interface LoadingSpinnerProps extends BaseLoadingProps {
  visible?: boolean;
  message?: string;
  overlay?: boolean;
  type?: 'spinner' | 'dots' | 'pulse';
  textStyle?: TextStyle;
  fullScreen?: boolean;
  progress?: number;
  icon?: keyof typeof Ionicons.glyphMap;
}

export interface SpinnerVariantProps extends BaseLoadingProps {
  visible: boolean;
}

export interface DotsVariantProps extends BaseLoadingProps {
  visible: boolean;
}

export interface PulseVariantProps extends BaseLoadingProps {
  visible: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
}

export interface ProgressIndicatorProps {
  progress: number;
  color: string;
  textStyle?: TextStyle;
}

export interface SkeletonLoaderProps {
  count?: number;
  height?: number;
  style?: ViewStyle;
}
