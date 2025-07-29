/**
 * CTAButton Component - eMediCard Application
 * 
 * A prominent Call-to-Action button component designed for primary health card actions.
 * Features enhanced touch affordance and medical blue theming.
 * 
 * FEATURES:
 * - Large touch target (minimum 56px height) for easy mobile interaction
 * - Prominent visual design with medical blue accent color
 * - Icon support for better visual recognition
 * - Ripple effect and press feedback for touch affordance
 * - Accessibility compliant with proper labels and hints
 * - Loading state support
 */

import React from 'react';
import { 
  Text, 
  TextStyle, 
  TouchableOpacity, 
  TouchableOpacityProps, 
  ViewStyle, 
  ActivityIndicator, 
  View,
  Dimensions,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { theme, getColor, getSpacing, getTypography, getBorderRadius, getShadow } from '@/src/styles/theme';

const { width } = Dimensions.get('window');

interface CTAButtonProps extends TouchableOpacityProps {
  title: string;
  subtitle?: string;
  icon?: string;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'large' | 'medium';
  loading?: boolean;
  loadingText?: string;
  buttonStyle?: ViewStyle | ViewStyle[];
  textStyle?: TextStyle;
  iconColor?: string;
  fullWidth?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

/**
 * CTAButton - Call-to-Action Button Component
 * 
 * @param {CTAButtonProps} props - Component props
 * @returns {React.ReactElement} Rendered CTA button
 * 
 * @example
 * <CTAButton
 *   title="Apply for Health Card"
 *   subtitle="Start new application"
 *   icon="add-circle-outline"
 *   variant="primary"
 *   onPress={handleApply}
 * />
 */
export const CTAButton: React.FC<CTAButtonProps> = ({
  title,
  subtitle,
  icon,
  variant = 'primary',
  size = 'large',
  loading = false,
  loadingText,
  buttonStyle,
  textStyle,
  iconColor,
  fullWidth = true,
  disabled,
  accessibilityLabel,
  accessibilityHint,
  ...props
}) => {
  /**
   * Generates button styles based on variant, size, and state
   * Ensures minimum touch target of 56px (Material Design recommendation)
   */
  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: getBorderRadius('xl'),
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'row',
      paddingHorizontal: getSpacing('xl'),
      width: fullWidth ? width - (getSpacing('lg') * 2) : 'auto',
      ...getShadow('large'),
      // Enhanced elevation for prominence
      ...(Platform.OS === 'android' && { elevation: 8 }),
    };

    // Size variations - larger for better touch targets
    const sizeStyles = {
      medium: { 
        minHeight: 56, 
        paddingVertical: getSpacing('md'),
      },
      large: { 
        minHeight: 64, 
        paddingVertical: getSpacing('lg'),
      },
    };

    // Variant styles with medical blue theming
    const variantStyles = {
      primary: {
        backgroundColor: getColor('accent.medicalBlue'),
        shadowColor: getColor('accent.medicalBlue'),
        borderWidth: 2,
        borderColor: getColor('accent.medicalBlue'),
      },
      secondary: {
        backgroundColor: getColor('background.primary'),
        shadowColor: getColor('gray.400'),
        borderWidth: 2,
        borderColor: getColor('accent.medicalBlue'),
      },
      outline: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: getColor('accent.medicalBlue'),
        shadowOpacity: 0,
        elevation: 0,
      },
    };

    const disabledStyle = (disabled || loading) ? { 
      backgroundColor: getColor('gray.300'),
      borderColor: getColor('gray.300'),
      shadowOpacity: 0.3,
      elevation: 2,
    } : {};

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...variantStyles[variant],
      ...disabledStyle,
    };
  };

  const getTextStyle = (): TextStyle => {
    const baseStyle: TextStyle = {
      ...getTypography(size === 'large' ? 'h4' : 'button'),
      fontWeight: '700',
      letterSpacing: 0.5,
    };

    const variantTextStyles = {
      primary: { color: getColor('text.inverse') },
      secondary: { color: getColor('accent.medicalBlue') },
      outline: { color: getColor('accent.medicalBlue') },
    };

    const disabledTextStyle = (disabled || loading) ? {
      color: getColor('text.secondary'),
    } : {};

    return {
      ...baseStyle,
      ...variantTextStyles[variant],
      ...disabledTextStyle,
    };
  };

  const getIconColor = () => {
    if (iconColor) return iconColor;
    if (disabled || loading) return getColor('text.secondary');
    
    switch (variant) {
      case 'primary':
        return getColor('text.inverse');
      case 'secondary':
      case 'outline':
        return getColor('accent.medicalBlue');
      default:
        return getColor('text.inverse');
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <>
          <ActivityIndicator 
            size="small" 
            color={getIconColor()}
            style={{ marginRight: getSpacing('sm') }}
          />
          <Text style={[getTextStyle(), textStyle]}>
            {loadingText || 'Loading...'}
          </Text>
        </>
      );
    }

    return (
      <>
        {icon && (
          <View style={{ marginRight: getSpacing('sm') }}>
            <Ionicons 
              name={icon as any} 
              size={size === 'large' ? 28 : 24} 
              color={getIconColor()} 
            />
          </View>
        )}
        <View style={{ alignItems: 'center' }}>
          <Text style={[getTextStyle(), textStyle]}>
            {title}
          </Text>
          {subtitle && (
            <Text style={[
              getTypography('caption'),
              { 
                color: variant === 'primary' 
                  ? getColor('text.inverse') + 'CC' 
                  : getColor('text.secondary'),
                marginTop: 2,
              }
            ]}>
              {subtitle}
            </Text>
          )}
        </View>
      </>
    );
  };

  return (
    <TouchableOpacity
      style={[getButtonStyle(), buttonStyle]}
      disabled={disabled || loading}
      accessibilityLabel={accessibilityLabel || title}
      accessibilityHint={accessibilityHint || `Tap to ${title.toLowerCase()}`}
      accessibilityRole="button"
      accessibilityState={{
        disabled: disabled || loading,
        busy: loading,
      }}
      activeOpacity={0.8}
      {...props}
    >
      {renderContent()}
    </TouchableOpacity>
  );
};
