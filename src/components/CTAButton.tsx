/**
 * CTAButton Component - eMediCard Application
 * 
 * A prominent Call-to-Action button component designed for primary health card actions.
 * Features enhanced touch affordance and medical blue theming.
 * 
 * REFACTORED: Now uses centralized design system components and patterns
 * - Leverages Button component from design system
 * - Uses layout components for consistent spacing
 * - Maintains backward compatibility with existing props
 */

import React from 'react';
import { 
  TextStyle, 
  TouchableOpacityProps, 
  ViewStyle,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from './ui/Button';
import { Column, Row } from './layout';
import { Text } from './ui/Text';
import { getColor, getSpacing, colorWithOpacity } from '@/src/styles';

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
 * REFACTORED: Uses design system Button component with custom content layout
 * Maintains all original functionality while leveraging centralized styles
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
  // Custom style for enhanced CTA appearance
  const ctaButtonStyle: ViewStyle = {
    minHeight: size === 'large' ? 64 : 56,
    width: fullWidth ? width - (getSpacing('lg') * 2) : 'auto',
    paddingHorizontal: getSpacing('xl'),
    paddingVertical: getSpacing('lg'),
  };

  // Enhanced variant mapping for medical blue theming
  const getVariantForButton = () => {
    switch (variant) {
      case 'secondary':
        return 'outline'; // Map secondary to outline for design system
      default:
        return variant;
    }
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

  const getTextColor = () => {
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

  const renderCustomContent = () => (
    <Row spacing="sm" align="center" justify="center">
      {icon && (
        <Ionicons 
          name={icon as any} 
          size={size === 'large' ? 28 : 24} 
          color={getIconColor()} 
        />
      )}
      <Column align="center">
        <Text 
          variant={size === 'large' ? 'h4' : 'button'}
          weight="bold"
          color={getTextColor()}
          style={[{ letterSpacing: 0.5 }, textStyle]}
        >
          {title}
        </Text>
        {subtitle && (
          <Text 
            variant="caption"
            color={variant === 'primary' 
              ? colorWithOpacity[80]('text.inverse')
              : getColor('text.secondary')
            }
            style={{ marginTop: 2 }}
          >
            {subtitle}
          </Text>
        )}
      </Column>
    </Row>
  );

  return (
    <Button
      variant={getVariantForButton()}
      size={size}
      loading={loading}
      loadingText={loadingText}
      disabled={disabled}
      onPress={props.onPress}
      style={[ctaButtonStyle, buttonStyle]}
      accessibilityLabel={accessibilityLabel || title}
      accessibilityHint={accessibilityHint || `Tap to ${title.toLowerCase()}`}
      {...props}
    >
      {renderCustomContent()}
    </Button>
  );
};
