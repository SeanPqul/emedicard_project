/**
 * Input Component
 * 
 * Enhanced input component with variant system and accessibility
 */

import React, { useState } from 'react';
import { TextInput, TextInputProps, ViewStyle, TextStyle } from 'react-native';
import { inputVariants, getTypography } from '@shared/styles';
import { InputStyleProps, BaseComponentProps } from '@shared/types/design-system';

interface InputProps extends TextInputProps, BaseComponentProps, InputStyleProps {
  style?: ViewStyle | ViewStyle[];
  textStyle?: TextStyle | TextStyle[];
}

export const Input: React.FC<InputProps> = React.memo(({
  variant = 'default',
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

  const getInputState = () => {
    if (propState) return propState;
    if (!editable) return 'disabled';
    if (isFocused) return 'focused';
    return 'default';
  };

  const getInputVariant = () => {
    if (hasError) return 'error';
    return variant;
  };

  const inputState = getInputState();
  const inputVariant = getInputVariant();

  const inputStyle: ViewStyle[] = [
    inputVariants.base,
    inputVariants[inputVariant],
    ...(inputState !== 'default' ? [inputVariants[inputState]] : []),
    ...(multiline ? [{ minHeight: 80, textAlignVertical: 'top' }] : []),
  ];

  const inputTextStyle: TextStyle[] = [
    getTypography('body'),
  ];

  return (
    <TextInput
      style={[inputStyle, style, inputTextStyle, textStyle]}
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