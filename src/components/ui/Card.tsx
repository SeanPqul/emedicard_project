/**
 * Card Component
 * 
 * Enhanced card component with comprehensive variant system and responsive design
 */

import React from 'react';
import { TouchableOpacity, View, ViewStyle } from 'react-native';
import { cardVariants, getSpacing } from '../../styles';
import { DesignSystemCardProps } from '../../types/design-system';
import { Column } from '../layout';

export const Card: React.FC<DesignSystemCardProps> = React.memo(({
  children,
  variant = 'default',
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
    <Column>
      {header}
      <View style={{ flex: 1 }}>
        {children}
      </View>
      {footer}
    </Column>
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