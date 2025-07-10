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
  rightIconAccessibilityLabel?: string;
  rightIconAccessibilityHint?: string;
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
  rightIconAccessibilityLabel,
  rightIconAccessibilityHint,
  ...props
}) => {
  const defaultStyles = {
  container: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: theme.colors.background.secondary,
    borderColor: error ? theme.colors.semantic.error : theme.colors.border.light,
    borderWidth: 1,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    ...theme.shadows.small,
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
        {...props}
      />
      {rightIcon && (
        <TouchableOpacity
          style={defaultStyles.rightIcon}
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