import { moderateScale } from '@/src/utils/scaling-utils';
import React from 'react';
import { Text, TextStyle, TouchableOpacity, TouchableOpacityProps, ViewStyle } from 'react-native';
import { heightPercentageToDP as hp } from 'react-native-responsive-screen';

interface CustomButtonProps extends TouchableOpacityProps {
  title?: string; // Make title optional
  variant?: 'primary' | 'secondary' | 'outline' | 'none'; // Add 'none' variant
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  loadingText?: string;
  buttonStyle?: ViewStyle | ViewStyle[];
  textStyle?: TextStyle;
  children?: React.ReactNode; // Add children prop
}

export const CustomButton: React.FC<CustomButtonProps> = ({
  title,
  variant = 'primary',
  size = 'medium',
  loading = false,
  loadingText,
  buttonStyle,
  textStyle,
  disabled,
  children, // Add children to props
  ...props
}) => {
  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: moderateScale(11),
      justifyContent: 'center',
      alignItems: 'center',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: moderateScale(8),
      elevation: 8,
    };

    // Size variations
    const sizeStyles = {
      small: { height: hp('5%'), paddingHorizontal: moderateScale(16) },
      medium: { height: hp('6.5%'), paddingHorizontal: moderateScale(20) },
      large: { height: hp('7.5%'), paddingHorizontal: moderateScale(24) },
    };

    // Variant styles
    const variantStyles = {
      primary: {
        backgroundColor: '#10B981',
        shadowColor: '#10B981',
      },
      secondary: {
        backgroundColor: '#6B7280',
        shadowColor: '#6B7280',
      },
      outline: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: '#10B981',
        shadowOpacity: 0,
        elevation: 0,
      },

      none: {
        backgroundColor: 'transparent',
        shadowOpacity: 0,
        elevation: 0,
      }
    };

    const disabledStyle = (disabled || loading) ? { backgroundColor: '#9CA3AF' } : {};

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...variantStyles[variant],
      ...disabledStyle,
    };
  };

  const getTextStyle = (): TextStyle => {
    const baseStyle: TextStyle = {
      fontSize: 16,
      fontWeight: 'bold',
    };

    const variantTextStyles = {
      primary: { color: 'white' },
      secondary: { color: 'white' },
      outline: { color: '#10B981' },
      none: {},
    };

    return {
      ...baseStyle,
      ...variantTextStyles[variant],
    };
  };

  const renderContent = () => {
    if (loading) {
      return (
        <Text style={[getTextStyle(), textStyle]}>
          {loadingText || 'Loading...'}
        </Text>
      );
    }

    // If children are provided, render them instead of title
    if (children) {
      return children;
    }

    // Otherwise render the title
    return (
      <Text style={[getTextStyle(), textStyle]}>
        {title}
      </Text>
    );
  };

  return (
    <TouchableOpacity
      style={[getButtonStyle(), buttonStyle]}
      disabled={disabled || loading}
      {...props}
    >
      {renderContent()}
    </TouchableOpacity>
  );
};