/**
 * SpaceBetween Component
 * 
 * A component that distributes children with space between them
 */

import React from 'react';
import { ViewStyle } from 'react-native';
import { Box } from './Box';
import { LayoutProps, BaseComponentProps } from '../../types/design-system';

interface SpaceBetweenProps extends BaseComponentProps, LayoutProps {
  direction?: 'row' | 'column';
  align?: 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline';
  style?: ViewStyle | ViewStyle[];
}

export const SpaceBetween: React.FC<SpaceBetweenProps> = React.memo(({
  children,
  direction = 'row',
  align = 'center',
  style,
  ...props
}) => {
  return (
    <Box
      flexDirection={direction}
      justifyContent="space-between"
      alignItems={align}
      style={style}
      {...props}
    >
      {children}
    </Box>
  );
});

SpaceBetween.displayName = 'SpaceBetween';