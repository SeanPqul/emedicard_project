/**
 * Card Component
 * 
 * Enhanced card component with comprehensive variant system and responsive design
 */

import React from 'react';
import { TouchableOpacity, View, ViewStyle } from 'react-native';
import { cardVariants, getSpacing } from '@shared/styles';
import { CardStyleProps, BaseComponentProps, CardVariant } from '@/src/types/design-system';

export interface CardProps extends BaseComponentProps, CardStyleProps {
  children: React.ReactNode;
  onPress?: () => void;
  header?: React.ReactNode;
  footer?: React.ReactNode;
}

export const Card: React.FC<CardProps> = React.memo(({
  children,
  variant = 'default' as CardVariant,
  padding = 'medium',
  margin = 'none',
  onPress,
  header,
  footer,
  style,
  accessibilityLabel,
  accessibilityHint,
  accessibilityRole,
  testID,
  ...props
}) => {
  const paddingMap = {
    none: undefined,
    small: getSpacing('sm'),
    medium: getSpacing('lg'),
    large: getSpacing('xl'),
  };

  const marginMap = {
    none: undefined,
    small: getSpacing('sm'),
    medium: getSpacing('md'),
    large: getSpacing('lg'),
  };

  const cardStyle: ViewStyle[] = [
    cardVariants.base,
    cardVariants[variant],
    {
      ...(paddingMap[padding] && { padding: paddingMap[padding] }),
      ...(marginMap[margin] && { marginBottom: marginMap[margin] }),
    },
  ];

  const Container = onPress ? TouchableOpacity : View;

  const renderContent = () => (
    <View style={{ flexDirection: 'column' }}>
      {header}
      <View style={{ flex: 1 }}>
        {children}
      </View>
      {footer}
    </View>
  );

  return (
    <Container
      style={[cardStyle, style]}
      onPress={onPress}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityRole={accessibilityRole || (onPress ? 'button' : 'none')}
      testID={testID}
      activeOpacity={onPress ? 0.8 : 1}
      {...props}
    >
      {renderContent()}
    </Container>
  );
});

Card.displayName = 'Card';