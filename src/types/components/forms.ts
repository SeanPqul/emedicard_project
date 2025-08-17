/**
 * Form Component Types
 * 
 * Centralized type definitions for all form-related components
 */

import { TextInputProps, ViewStyle, TextStyle } from 'react-native';
import { BaseComponentProps, InputStyleProps } from '../design-system';

// ===== INPUT TYPES =====
export interface InputProps extends TextInputProps, BaseComponentProps, InputStyleProps {
  style?: ViewStyle | ViewStyle[];
  textStyle?: TextStyle | TextStyle[];
  label?: string;
  errorText?: string;
  helperText?: string;
  leftIcon?: string;
  rightIcon?: string;
  onRightIconPress?: () => void;
  containerStyle?: ViewStyle;
}

// ===== CUSTOM TEXT INPUT TYPES =====
export interface CustomTextInputProps extends TextInputProps {
  label?: string;
  errorText?: string;
  helperText?: string;
  leftIcon?: string;
  rightIcon?: string;
  variant?: 'default' | 'filled' | 'outlined';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  labelStyle?: TextStyle;
  errorStyle?: TextStyle;
  helperStyle?: TextStyle;
  onRightIconPress?: () => void;
}

// ===== OTP INPUT TYPES =====
export interface OtpInputUIProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  autoFocus?: boolean;
  disabled?: boolean;
  secureTextEntry?: boolean;
  cellStyle?: ViewStyle;
  cellTextStyle?: TextStyle;
  focusedCellStyle?: ViewStyle;
  errorCellStyle?: ViewStyle;
  containerStyle?: ViewStyle;
  error?: boolean;
  placeholder?: string;
}

// ===== PASSWORD STRENGTH INDICATOR TYPES =====
export interface PasswordStrengthIndicatorProps {
  password: string;
  showText?: boolean;
  containerStyle?: ViewStyle;
  barStyle?: ViewStyle;
  textStyle?: TextStyle;
  minLength?: number;
  requirements?: {
    minLength?: boolean;
    uppercase?: boolean;
    lowercase?: boolean;
    numbers?: boolean;
    specialChars?: boolean;
  };
}

// ===== FORM VALIDATION TYPES =====
export interface FormFieldValidation {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
}

export interface FormFieldConfig {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'phone' | 'select' | 'date' | 'file';
  validation?: FormFieldValidation;
  placeholder?: string;
  defaultValue?: any;
  options?: { label: string; value: any }[];
}

export interface FormState {
  values: Record<string, any>;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isSubmitting: boolean;
  isValid: boolean;
}