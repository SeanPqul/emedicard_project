import { moderateScale } from '@/src/utils/scaling-utils';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { TextInput, TextInputProps, TouchableOpacity, View } from 'react-native';

interface CustomTextInputProps extends TextInputProps {
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  containerStyle?: any;
  inputStyle?: any;
  iconColor?: string;
  iconSize?: number;
}

export const CustomTextInput: React.FC<CustomTextInputProps> = ({
  leftIcon,
  rightIcon,
  onRightIconPress,
  containerStyle,
  inputStyle,
  iconColor = '#9CA3AF',
  iconSize = moderateScale(20),
  style,
  ...props
}) => {
  const defaultStyles = {
  container: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: '#F9FAFB',
    borderColor: '#E5E7EB',
    borderRadius: moderateScale(12),
    paddingHorizontal: moderateScale(13),
    paddingVertical: moderateScale(8),
    shadowColor: '#000',
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
  },
  inputWithLeftIcon: {
    marginLeft: moderateScale(12),
  },
  leftIcon: {
    marginRight: 0,
  },
  rightIcon: {
    position: 'absolute' as const,
    right: moderateScale(13),
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
        {...props}
      />
      {rightIcon && (
        <TouchableOpacity
          style={defaultStyles.rightIcon}
          onPress={onRightIconPress}
        >
          <Ionicons
            name={rightIcon}
            size={iconSize}
            color={iconColor}
          />
        </TouchableOpacity>
      )}
    </View>
  );
};