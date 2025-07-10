import React from 'react';
import { Text, TextStyle, TouchableOpacity, TouchableOpacityProps, ViewStyle } from 'react-native';
import { heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { theme } from '@/src/styles/theme';

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
      borderRadius: theme.borderRadius.lg,
      justifyContent: 'center',
      alignItems: 'center',
      ...theme.shadows.medium,
    };

    // Size variations
    const sizeStyles = {
      small: { height: hp('5%'), paddingHorizontal: theme.spacing.md },
      medium: { height: hp('6.5%'), paddingHorizontal: theme.spacing.lg },
      large: { height: hp('7.5%'), paddingHorizontal: theme.spacing.xl },
    };

    // Variant styles
    const variantStyles = {
      primary: {
        backgroundColor: theme.colors.primary[500],
        shadowColor: theme.colors.primary[500],
      },
      secondary: {
        backgroundColor: theme.colors.gray[500],
        shadowColor: theme.colors.gray[500],
      },
      outline: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: theme.colors.primary[500],
        shadowOpacity: 0,
        elevation: 0,
      },

      none: {
        backgroundColor: 'transparent',
        shadowOpacity: 0,
        elevation: 0,
      }
    };

    const disabledStyle = (disabled || loading) ? { backgroundColor: theme.colors.gray[400] } : {};

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...variantStyles[variant],
      ...disabledStyle,
    };
  };

  const getTextStyle = (): TextStyle => {
    const baseStyle: TextStyle = {
      ...theme.typography.button,
    };

    const variantTextStyles = {
      primary: { color: theme.colors.text.inverse },
      secondary: { color: theme.colors.text.inverse },
      outline: { color: theme.colors.primary[500] },
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