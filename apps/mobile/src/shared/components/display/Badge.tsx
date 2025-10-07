/**
 * Badge Component
 * 
 * Enhanced badge component with comprehensive variant system and responsive design
 */

import React from 'react';
import { View, Text, ViewStyle, TextStyle } from 'react-native';
import { badgeVariants, badgeTextVariants, getSpacing } from '@shared/styles';
import type { BadgeStyleProps, BaseComponentProps, BadgeVariant, BadgeSize } from '@/src/types/design-system';
import { Ionicons } from '@expo/vector-icons';

interface BadgeProps extends BaseComponentProps, BadgeStyleProps {
  text: string;
  icon?: string;
  iconPosition?: 'left' | 'right';
  style?: ViewStyle | ViewStyle[];
}

export const Badge: React.FC<BadgeProps> = React.memo(({
  text,
  variant = 'neutral' as BadgeVariant,
  size = 'medium' as BadgeSize,
  icon,
  iconPosition = 'left',
  style,
  testID,
  ...props
}) => {
  const { moderateScale } = require('@shared/utils/responsive');
  const sizeMap = {
    small: {
      paddingHorizontal: getSpacing('xs'),
      paddingVertical: getSpacing('xs') / 2,
      iconSize: moderateScale(12),
    },
    medium: {
      paddingHorizontal: getSpacing('sm'),
      paddingVertical: getSpacing('xs'),
      iconSize: moderateScale(14),
    },
    large: {
      paddingHorizontal: getSpacing('md'),
      paddingVertical: getSpacing('sm'),
      iconSize: moderateScale(16),
    },
  };

  const badgeStyle: ViewStyle[] = [
    badgeVariants.base,
    badgeVariants[variant],
    {
      paddingHorizontal: sizeMap[size].paddingHorizontal,
      paddingVertical: sizeMap[size].paddingVertical,
    },
  ];

  const textStyle: TextStyle[] = [
    badgeTextVariants[variant],
  ];

  const renderIcon = (position: 'left' | 'right') => {
    if (!icon || iconPosition !== position) return null;
    
    return (
      <Ionicons 
        name={icon as any} 
        size={sizeMap[size].iconSize} 
        color={badgeTextVariants[variant].color}
      />
    );
  };

  const renderContent = () => {
    if (!icon) {
      return (
        <Text style={textStyle}>
          {text}
        </Text>
      );
    }

    return (
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: getSpacing('xs') }}>
        {renderIcon('left')}
        <Text style={textStyle}>
          {text}
        </Text>
        {renderIcon('right')}
      </View>
    );
  };

  return (
    <View
      style={[badgeStyle, style]}
      testID={testID}
      {...props}
    >
      {renderContent()}
    </View>
  );
});

Badge.displayName = 'Badge';