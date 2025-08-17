/**
 * Box Component
 * 
 * A flexible container component with spacing, layout, and styling props
 */

import React from 'react';
import { View, ViewStyle } from 'react-native';
import { LayoutProps, BaseComponentProps } from '../../types/design-system';
import { getSpacing } from '../../styles/theme';

interface BoxProps extends BaseComponentProps, LayoutProps {
  style?: ViewStyle | ViewStyle[];
}

export const Box: React.FC<BoxProps> = React.memo(({
  children,
  style,
  flex,
  flexDirection,
  justifyContent,
  alignItems,
  wrap,
  margin,
  marginHorizontal,
  marginVertical,
  marginTop,
  marginBottom,
  marginLeft,
  marginRight,
  padding,
  paddingHorizontal,
  paddingVertical,
  paddingTop,
  paddingBottom,
  paddingLeft,
  paddingRight,
  testID,
  accessibilityRole,
  accessibilityLabel,
  ...props
}) => {
  const boxStyle = React.useMemo(() => ({
    // Flex properties
    ...(flex !== undefined && { flex }),
    ...(flexDirection && { flexDirection }),
    ...(justifyContent && { justifyContent }),
    ...(alignItems && { alignItems }),
    ...(wrap !== undefined && { flexWrap: wrap ? 'wrap' : 'nowrap' }),
    
    // Margin properties
    ...(margin && { margin: getSpacing(margin) }),
    ...(marginHorizontal && { marginHorizontal: getSpacing(marginHorizontal) }),
    ...(marginVertical && { marginVertical: getSpacing(marginVertical) }),
    ...(marginTop && { marginTop: getSpacing(marginTop) }),
    ...(marginBottom && { marginBottom: getSpacing(marginBottom) }),
    ...(marginLeft && { marginLeft: getSpacing(marginLeft) }),
    ...(marginRight && { marginRight: getSpacing(marginRight) }),
    
    // Padding properties
    ...(padding && { padding: getSpacing(padding) }),
    ...(paddingHorizontal && { paddingHorizontal: getSpacing(paddingHorizontal) }),
    ...(paddingVertical && { paddingVertical: getSpacing(paddingVertical) }),
    ...(paddingTop && { paddingTop: getSpacing(paddingTop) }),
    ...(paddingBottom && { paddingBottom: getSpacing(paddingBottom) }),
    ...(paddingLeft && { paddingLeft: getSpacing(paddingLeft) }),
    ...(paddingRight && { paddingRight: getSpacing(paddingRight) }),
  }), [
    flex, flexDirection, justifyContent, alignItems, wrap,
    margin, marginHorizontal, marginVertical, marginTop, marginBottom, marginLeft, marginRight,
    padding, paddingHorizontal, paddingVertical, paddingTop, paddingBottom, paddingLeft, paddingRight
  ]);

  return (
    <View 
      style={[boxStyle, style]} 
      testID={testID}
      accessibilityRole={accessibilityRole}
      accessibilityLabel={accessibilityLabel}
      {...props}
    >
      {children}
    </View>
  );
});

Box.displayName = 'Box';