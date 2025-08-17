/**
 * Center Component
 * 
 * A component that centers its children both horizontally and vertically
 */

import React from 'react';
import { ViewStyle } from 'react-native';
import { Box } from './Box';
import { LayoutProps, BaseComponentProps } from '../../types/design-system';

interface CenterProps extends BaseComponentProps, LayoutProps {
  style?: ViewStyle | ViewStyle[];
}

export const Center: React.FC<CenterProps> = React.memo(({
  children,
  style,
  ...props
}) => {
  return (
    <Box
      justifyContent="center"
      alignItems="center"
      style={style}
      {...props}
    >
      {children}
    </Box>
  );
});

Center.displayName = 'Center';