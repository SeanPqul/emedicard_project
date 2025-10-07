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
  View,
} from 'react-native';
import { moderateScale, verticalScale } from '@shared/utils/responsive';
import { Ionicons } from '@expo/vector-icons';
import { Button } from './Button';
import { Text } from '../typography/Text';
import { getColor, getSpacing, colorWithOpacity } from '@shared/styles/theme';

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
  onPress,
  ...props
}) => {
  // Custom style for enhanced CTA appearance
  const ctaButtonStyle: ViewStyle = {
    minHeight: size === 'large' ? verticalScale(72) : verticalScale(64),
    width: fullWidth ? width - (getSpacing('lg') * 2) : 'auto',
    paddingHorizontal: getSpacing('lg'),
    paddingVertical: getSpacing('md'),
    alignItems: 'center',
    justifyContent: 'center',
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
    <View style={{ 
      flexDirection: 'row', 
      alignItems: 'center', 
      justifyContent: 'center', 
      gap: getSpacing('sm'),
      flex: 1,
      paddingHorizontal: getSpacing('xs')
    }}>
      {icon && (
        <Ionicons 
          name={icon as any} 
          size={size === 'large' ? moderateScale(24) : moderateScale(20)}
          color={getIconColor()} 
        />
      )}
      <View style={{ 
        flexDirection: 'column', 
        alignItems: 'center',
        flex: 1,
        minWidth: 0
      }}>
        <Text 
          variant={size === 'large' ? 'button' : 'bodySmall'}
          weight="semiBold"
          color={getTextColor()}
          style={[{ 
            letterSpacing: moderateScale(0.3),
            textAlign: 'center',
            lineHeight: size === 'large' ? moderateScale(20) : moderateScale(18)
          }, textStyle]}
          numberOfLines={1}
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
            style={{ 
              marginTop: verticalScale(2),
              textAlign: 'center',
              lineHeight: moderateScale(14)
            }}
            numberOfLines={1}
          >
            {subtitle}
          </Text>
        )}
      </View>
    </View>
  );

  return (
    <Button
      variant={getVariantForButton()}
      size={size}
      loading={loading}
      loadingText={loadingText}
      disabled={disabled}
      onPress={onPress ? () => onPress({} as any) : undefined}
      style={[ctaButtonStyle, buttonStyle]}
      accessibilityLabel={accessibilityLabel || title}
      accessibilityHint={accessibilityHint || `Tap to ${title.toLowerCase()}`}
      testID={props.testID}
    >
      {renderCustomContent()}
    </Button>
  );
};
