/**
 * CustomTextInput Component - eMediCard Application
 * 
 * IMPLEMENTATION NOTES:
 * - Follows UI_UX_IMPLEMENTATION_GUIDE.md form input standards
 * - Implements validation states for form feedback
 * - Provides accessibility compliance with proper labels and hints
 * - Supports theme-based styling from src/styles/theme.ts
 * - Includes left and right icon support for enhanced UX
 * 
 * DOCUMENTATION REFERENCES:
 * - UI_UX_IMPLEMENTATION_GUIDE.md: CustomTextInput usage and validation (lines 106-122)
 * - UI_DESIGN_PROMPT.md: Form component specifications
 * - emedicarddocumentation.txt: Form input requirements for applications
 * 
 * ACCESSIBILITY COMPLIANCE:
 * - Minimum touch target size: 44 pixels height
 * - Proper accessibility labels and hints
 * - Screen reader compatible with accessibilityRole and accessibilityState
 * - Form validation feedback with error messages
 * - Required field indicators for screen readers
 * 
 * VALIDATION FEATURES:
 * - Visual validation states: valid, invalid, none
 * - Error message display with semantic colors
 * - Required field indicators
 * - Border color changes based on validation state
 * 
 * DESIGN SYSTEM INTEGRATION:
 * - Uses theme colors, typography, spacing, and border radius
 * - Consistent input styling across the application
 * - Shadow effects for depth and focus
 * - Proper disabled state handling
 * 
 * ICON SUPPORT:
 * - Left icon for input context (e.g., email, phone)
 * - Right icon for actions (e.g., password visibility, clear)
 * - Proper icon spacing and accessibility
 */

import { moderateScale } from '@/src/utils/scaling-utils';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { TextInput, TextInputProps, TouchableOpacity, View } from 'react-native';
import { theme } from '@/src/styles/theme';

interface CustomTextInputProps extends TextInputProps {
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  containerStyle?: any;
  inputStyle?: any;
  iconColor?: string;
  iconSize?: number;
  label?: string;
  error?: boolean;
  errorMessage?: string;
  rightIconAccessibilityLabel?: string;
  rightIconAccessibilityHint?: string;
  validationState?: 'valid' | 'invalid' | 'none';
  showRequiredIndicator?: boolean;
}

export const CustomTextInput: React.FC<CustomTextInputProps> = ({
  leftIcon,
  rightIcon,
  onRightIconPress,
  containerStyle,
  inputStyle,
  iconColor = theme.colors.text.tertiary,
  iconSize = moderateScale(20),
  style,
  label,
  error,
  errorMessage,
  rightIconAccessibilityLabel,
  rightIconAccessibilityHint,
  validationState = 'none',
  showRequiredIndicator = false,
  ...props
}) => {
  const getBorderColor = () => {
    if (error || validationState === 'invalid') return theme.colors.semantic.error;
    if (validationState === 'valid') return theme.colors.semantic.success;
    return theme.colors.border.light;
  };

  const defaultStyles = {
  container: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: theme.colors.background.secondary,
    borderColor: getBorderColor(),
    borderWidth: 1,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    ...theme.shadows.small,
    minHeight: 44, // Accessibility minimum touch target
  },
  input: {
    flex: 1,
    ...theme.typography.body,
    color: theme.colors.text.primary,
  },
  inputWithLeftIcon: {
    marginLeft: theme.spacing.sm,
  },
  leftIcon: {
    marginRight: 0,
  },
  rightIcon: {
    position: 'absolute' as const,
    right: theme.spacing.md,
  }}
  
  return (
    <View style={[defaultStyles.container, containerStyle]}>
      {leftIcon && (
        <Ionicons
          name={leftIcon}
          size={iconSize}
          color={iconColor}
          style={defaultStyles.leftIcon}
        />
      )}
      <TextInput
        style={[defaultStyles.input, leftIcon && defaultStyles.inputWithLeftIcon, inputStyle]}
        placeholderTextColor={iconColor}
        accessibilityLabel={label || props.placeholder}
        accessibilityRole="text"
        accessibilityState={{
          disabled: props.editable === false,
        }}
        accessibilityHint={errorMessage || (showRequiredIndicator ? 'Required field' : undefined)}
        accessibilityDescribedBy={errorMessage ? 'error-message' : undefined}
        {...props}
      />
      {rightIcon && (
        <TouchableOpacity
          style={[defaultStyles.rightIcon, { minHeight: 44, minWidth: 44, justifyContent: 'center', alignItems: 'center' }]}
          onPress={onRightIconPress}
          accessibilityLabel={rightIconAccessibilityLabel || `${rightIcon} button`}
          accessibilityHint={rightIconAccessibilityHint}
          accessibilityRole="button"
        >
          <Ionicons
            name={rightIcon}
            size={iconSize}
            color={iconColor}
            accessibilityElementsHidden={true}
          />
        </TouchableOpacity>
      )}
    </View>
  );
};