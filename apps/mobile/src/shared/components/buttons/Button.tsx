/**
 * Button Component
 * 
 * Enhanced button component with comprehensive variant system, accessibility, and responsive design
 */

import React from 'react';
import { Text, TouchableOpacity, ActivityIndicator, ViewStyle, TextStyle, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { 
  buttonVariants, 
  buttonTextVariants, 
  buttonSizeVariants,
  getSpacing
} from '@shared/styles';
import { theme } from '@shared/styles/theme';
// Using local type definition instead of importing from types
interface DesignSystemButtonProps {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'outline' | 'ghost' | 'error' | 'success' | 'warning' | 'none';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  loadingText?: string;
  fullWidth?: boolean;
  buttonStyle?: any;
  textStyle?: any;
  children?: React.ReactNode;
  title?: string;
  onPress?: () => void;
  accessibilityLabel?: string;
  accessibilityRole?: 'button' | 'link' | 'none';
  accessibilityState?: any;
  accessibilityHint?: string;
  testID?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  iconPosition?: 'left' | 'right';
  style?: any;
  minimumTouchTarget?: boolean;
  loadingIndicatorColor?: string;
}

export const Button: React.FC<DesignSystemButtonProps> = React.memo(({
  title,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  fullWidth = false,
  icon,
  iconPosition = 'left',
  loadingText,
  onPress,
  style,
  children,
  accessibilityLabel,
  accessibilityHint,
  accessibilityRole = 'button',
  testID,
  // Legacy CustomButton compatibility props
  minimumTouchTarget = true,
  loadingIndicatorColor,
  buttonStyle,
  textStyle,
  ...props
}) => {
  // Support legacy CustomButton responsive heights and styling
  const getCustomButtonStyle = (): ViewStyle => {
    if (variant === 'none') {
      return {
        backgroundColor: 'transparent',
        shadowOpacity: 0,
        elevation: 0,
        borderRadius: theme.borderRadius.lg,
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: minimumTouchTarget ? 44 : undefined,
        minWidth: minimumTouchTarget ? 44 : undefined,
      };
    }

    const sizeStyles = {
      small: { height: hp('5%'), paddingHorizontal: theme.spacing.md },
      medium: { height: hp('6.5%'), paddingHorizontal: theme.spacing.lg },
      large: { height: hp('7.5%'), paddingHorizontal: theme.spacing.xl },
    };

    return {
      ...sizeStyles[size],
      minHeight: minimumTouchTarget ? 44 : undefined,
      minWidth: minimumTouchTarget ? 44 : undefined,
    };
  };

  const finalButtonStyle: ViewStyle[] = [
    buttonVariants.base,
    buttonVariants[disabled || loading ? 'disabled' : (variant === 'none' ? 'ghost' : variant)],
    buttonSizeVariants[size],
    getCustomButtonStyle(),
    ...(fullWidth ? [{ alignSelf: 'stretch' as const }] : []),
  ];

  const finalTextStyle: TextStyle[] = [
    buttonTextVariants[disabled || loading ? 'disabled' : (variant === 'none' ? 'ghost' : variant)],
  ];

  const renderIcon = (position: 'left' | 'right') => {
    if (!icon || iconPosition !== position) return null;
    
    const iconColor = disabled || loading 
      ? buttonTextVariants.disabled.color 
      : buttonTextVariants[variant === 'none' ? 'ghost' : variant].color;
    
    const iconSize = size === 'small' ? 16 : size === 'large' ? 24 : 20;
    
    return (
      <Ionicons 
        name={icon as any} 
        size={iconSize} 
        color={iconColor}
        style={{ 
          marginLeft: position === 'right' ? getSpacing('xs') : 0,
          marginRight: position === 'left' ? getSpacing('xs') : 0,
        }}
      />
    );
  };

  const renderContent = () => {
    if (loading) {
      return (
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: getSpacing('xs') }}>
          <ActivityIndicator 
            size="small" 
            color={loadingIndicatorColor || buttonTextVariants[variant === 'none' ? 'ghost' : variant].color}
          />
          {loadingText && (
            <Text style={[finalTextStyle, textStyle]}>
              {loadingText}
            </Text>
          )}
        </View>
      );
    }

    if (children) {
      return children;
    }

    if (!title && !icon) {
      return null;
    }

    if (icon && !title) {
      return renderIcon(iconPosition);
    }

    return (
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: getSpacing('xs') }}>
        {renderIcon('left')}
        {title && (
          <Text style={[finalTextStyle, textStyle]}>
            {title}
          </Text>
        )}
        {renderIcon('right')}
      </View>
    );
  };

  return (
    <TouchableOpacity
      style={[finalButtonStyle, buttonStyle, style]}
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityLabel={accessibilityLabel || title || 'Button'}
      accessibilityHint={accessibilityHint}
      accessibilityRole={accessibilityRole}
      accessibilityState={{
        disabled: disabled || loading,
        busy: loading,
      }}
      testID={testID}
      activeOpacity={0.8}
      {...props}
    >
      {renderContent()}
    </TouchableOpacity>
  );
});

Button.displayName = 'Button';

// Legacy CustomButton compatibility export
export const CustomButton = Button;