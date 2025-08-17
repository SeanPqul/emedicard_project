/**
 * Column Component
 * 
 * A vertical layout component with optional spacing between children
 */

import React from 'react';
import { ViewStyle } from 'react-native';
import { Box } from './Box';
import { LayoutProps, BaseComponentProps, SpacingSize } from '../../types/design-system';

interface ColumnProps extends BaseComponentProps, Omit<LayoutProps, 'flexDirection'> {
  spacing?: SpacingSize;
  align?: 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline';
  justify?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly';
  style?: ViewStyle | ViewStyle[];
}

export const Column: React.FC<ColumnProps> = React.memo(({
  children,
  spacing,
  align = 'stretch',
  justify = 'flex-start',
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
        <Box key={index} {...(!isLast && { marginBottom: spacing })}>
          {child}
        </Box>
      );
    });
  };

  return (
    <Box
      flexDirection="column"
      alignItems={align}
      justifyContent={justify}
      {...(style && { style })}
      {...props}
    >
      {renderChildren()}
    </Box>
  );
});

Column.displayName = 'Column';
