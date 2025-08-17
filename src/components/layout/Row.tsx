/**
 * Row Component
 * 
 * A horizontal layout component with optional spacing between children
 */

import React from 'react';
import { ViewStyle } from 'react-native';
import { Box } from './Box';
import { LayoutProps, BaseComponentProps, SpacingSize } from '../../types/design-system';

interface RowProps extends BaseComponentProps, Omit<LayoutProps, 'flexDirection'> {
  spacing?: SpacingSize;
  align?: 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline';
  justify?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly';
  wrap?: boolean;
  style?: ViewStyle | ViewStyle[];
}

export const Row: React.FC<RowProps> = React.memo(({
  children,
  spacing,
  align = 'center',
  justify = 'flex-start',
  wrap = false,
  style,
  ...props
}) => {
  // If spacing is provided, wrap each child in a Box with margin
  const renderChildren = () => {
    if (!spacing) return children;

    return React.Children.map(children, (child, index) => {
      if (!React.isValidElement(child)) return child;
      
      const isLast = index === React.Children.count(children) - 1;
      return (
        <Box key={index} marginRight={!isLast ? spacing : undefined}>
          {child}
        </Box>
      );
    });
  };

  return (
    <Box
      flexDirection="row"
      alignItems={align}
      justifyContent={justify}
      wrap={wrap}
      style={style}
      {...props}
    >
      {renderChildren()}
    </Box>
  );
});

Row.displayName = 'Row';