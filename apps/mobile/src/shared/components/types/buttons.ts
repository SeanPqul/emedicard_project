/**
 * Button Component Types
 * 
 * Centralized type definitions for all button-related components
 */

import { TouchableOpacityProps, ViewStyle, TextStyle } from 'react-native';
import { BaseComponentProps } from '@/src/types/design-system';

// ===== CTA BUTTON TYPES =====
export interface CTAButtonProps extends TouchableOpacityProps {
  title: string;
  subtitle?: string;
  icon?: string;
  iconPosition?: 'left' | 'right' | 'top';
  primaryColor?: string;
  textColor?: string;
  loading?: boolean;
  loadingText?: string;
  fullWidth?: boolean;
  size?: 'small' | 'medium' | 'large';
  variant?: 'primary' | 'secondary' | 'outline';
  buttonStyle?: ViewStyle | ViewStyle[];
  textStyle?: TextStyle;
  containerStyle?: ViewStyle;
  onPress: () => void;
}

// ===== ACTION BUTTON TYPES =====
export interface ActionButtonProps {
  icon: string;
  title: string;
  subtitle: string;
  onPress: () => void;
  isPrimary?: boolean;
  disabled?: boolean;
  loading?: boolean;
  iconColor?: string;
  backgroundColor?: string;
  borderColor?: string;
}

// ===== LINK TEXT TYPES =====
export interface LinkTextProps extends BaseComponentProps {
  children: React.ReactNode;
  onPress: () => void;
  underline?: boolean;
  color?: string;
  size?: 'small' | 'medium' | 'large';
  weight?: 'normal' | 'medium' | 'semiBold' | 'bold';
}

// ===== SIGN OUT BUTTON TYPES =====
export interface SignOutButtonProps {
  onPress?: () => void;
  variant?: 'text' | 'outlined' | 'contained';
  size?: 'small' | 'medium' | 'large';
  color?: string;
  loading?: boolean;
  style?: ViewStyle;
}