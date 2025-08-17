/**
 * Text Component
 * 
 * Enhanced text component with typography variants and design system integration
 */

import React from 'react';
import { Text as RNText, TextStyle } from 'react-native';
import { getTypography, getColor } from '../../styles/theme';
import { DesignSystemTextProps, FontWeight } from '../../types/design-system';

const fontWeightMap: Record<FontWeight, TextStyle['fontWeight']> = {
  thin: '100',
  extraLight: '200',
  light: '300',
  regular: '400',
  medium: '500',
  semiBold: '600',
  bold: '700',
  extraBold: '800',
  black: '900',
};

export const Text: React.FC<DesignSystemTextProps> = React.memo(({
  children,
  variant = 'body',
  weight,
  color,
  textAlign,
  numberOfLines,
  ellipsizeMode,
  style,
  ...props
}) => {
  const textStyle: TextStyle[] = [
    getTypography(variant),
    {
      ...(weight && { fontWeight: fontWeightMap[weight] }),
      ...(color && { color: getColor(color) || color }),
      ...(textAlign && { textAlign }),
    },
  ];

  return (
    <RNText
      style={[textStyle, style]}
      numberOfLines={numberOfLines}
      ellipsizeMode={ellipsizeMode}
      {...props}
    >
      {children}
    </RNText>
  );
});

Text.displayName = 'Text';
