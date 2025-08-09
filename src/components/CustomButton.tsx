/**
 * CustomButton Component - eMediCard Application
 * 
 * IMPLEMENTATION NOTES:
 * - Follows UI_UX_IMPLEMENTATION_GUIDE.md accessibility standards
 * - Implements minimum 44x44 pixel touch targets for accessibility
 * - Provides multiple variants (primary, secondary, outline, none) per design system
 * - Includes loading states with proper accessibility indicators
 * - Supports theme-based styling from src/styles/theme.ts
 * 
 * DOCUMENTATION REFERENCES:
 * - UI_UX_IMPLEMENTATION_GUIDE.md: CustomButton usage and accessibility (lines 84-104)
 * - UI_DESIGN_PROMPT.md: Button specifications and design system
 * - emedicarddocumentation.txt: Interactive element requirements
 * 
 * ACCESSIBILITY COMPLIANCE:
 * - Minimum touch target size: 44x44 pixels (per WCAG guidelines)
 * - Proper accessibility labels and hints
 * - Screen reader compatible with accessibilityRole and accessibilityState
 * - Loading states with busy indicator for screen readers
 * - Support for accessibilityLabel, accessibilityHint, and accessibilityState
 * 
 * DESIGN SYSTEM INTEGRATION:
 * - Uses theme colors, typography, spacing, and border radius
 * - Consistent button variants across the application
 * - Responsive sizing with small, medium, and large options
 * - Proper disabled and loading states
 * 
 * FEATURES:
 * - Loading indicator with customizable color
 * - Children support for custom button content
 * - Flexible styling with buttonStyle and textStyle props
 * - Proper disabled state handling
 */

import React from 'react';
import { Text, TextStyle, TouchableOpacity, TouchableOpacityProps, ViewStyle, ActivityIndicator } from 'react-native';
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
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityRole?: 'button' | 'link' | 'none';
  minimumTouchTarget?: boolean; // Ensure 44x44 minimum touch target
  loadingIndicatorColor?: string;
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
  accessibilityLabel,
  accessibilityHint,
  accessibilityRole = 'button',
  minimumTouchTarget = true,
  loadingIndicatorColor,
  ...props
}) => {
  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: theme.borderRadius.lg,
      justifyContent: 'center',
      alignItems: 'center',
      ...theme.shadows.medium,
      // Ensure minimum touch target size for accessibility
      minHeight: minimumTouchTarget ? 44 : undefined,
      minWidth: minimumTouchTarget ? 44 : undefined,
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
        <>
          <ActivityIndicator 
            size="small" 
            color={loadingIndicatorColor || theme.colors.text.inverse}
            style={{ marginRight: theme.spacing.xs }}
          />
          <Text style={[getTextStyle(), textStyle]}>
            {loadingText || 'Loading...'}
          </Text>
        </>
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
      accessibilityLabel={accessibilityLabel || title || 'Button'}
      accessibilityHint={accessibilityHint}
      accessibilityRole={accessibilityRole}
      accessibilityState={{
        disabled: disabled || loading,
        busy: loading,
      }}
      {...props}
    >
      {renderContent()}
    </TouchableOpacity>
  );
};