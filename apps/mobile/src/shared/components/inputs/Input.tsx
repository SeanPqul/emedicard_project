/**
 * Input Component
 * 
 * Enhanced input component with variant system and accessibility
 */

import React, { useState } from 'react';
import { TextInput, TextInputProps, ViewStyle, TextStyle } from 'react-native';
import { inputVariants, getTypography } from '@shared/styles';
import type { InputStyleProps, BaseComponentProps, InputVariant, InputState } from '@/src/types/design-system';

interface InputProps extends Omit<TextInputProps, 'style' | keyof BaseComponentProps>, BaseComponentProps, InputStyleProps {
  style?: ViewStyle | ViewStyle[];
  textStyle?: TextStyle | TextStyle[];
}

export const Input: React.FC<InputProps> = React.memo(({
  variant,
  state: propState,
  hasError = false,
  multiline = false,
  style,
  textStyle,
  onFocus,
  onBlur,
  editable = true,
  testID,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = (e: any) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  const getInputState = (): 'base' | 'disabled' | 'success' | 'error' | 'focused' => {
    if (propState === 'disabled') return 'disabled';
    if (propState === 'focused') return 'focused';
    if (!editable) return 'disabled';
    if (isFocused) return 'focused';
    return 'base';
  };

  const getInputVariant = (): 'base' | 'disabled' | 'success' | 'error' | 'focused' => {
    if (hasError) return 'error';
    if (variant === 'success') return 'success';
    if (variant === 'error') return 'error';
    return 'base';
  };

  const inputState = getInputState();
  const inputVariant = getInputVariant();

  const inputStyle: any[] = [
    inputVariants.base,
    inputVariant !== 'base' ? inputVariants[inputVariant] : {},
    inputState !== 'base' ? inputVariants[inputState] : {},
    multiline ? { minHeight: 80, textAlignVertical: 'top' as const } : {},
  ];

  const inputTextStyle: TextStyle[] = [
    getTypography('body'),
  ];

  return (
    <TextInput
      style={[inputStyle, inputTextStyle, style, textStyle] as any}
      onFocus={handleFocus}
      onBlur={handleBlur}
      editable={editable}
      multiline={multiline}
      textAlignVertical={multiline ? 'top' : 'center'}
      testID={testID}
      accessibilityRole="text"
      {...props}
    />
  );
});

Input.displayName = 'Input';