/**
 * Stack Component
 * 
 * A flexible layout component that can stack children horizontally or vertically with consistent spacing
 */

import React from 'react';
import { ViewStyle } from 'react-native';
import { Box } from './Box';
import { LayoutProps, BaseComponentProps, SpacingSize } from '../../types/design-system';

interface StackProps extends BaseComponentProps, LayoutProps {
  direction?: 'row' | 'column';
  spacing?: SpacingSize;
  align?: 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline';
  justify?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly';
  wrap?: boolean;
  divider?: React.ReactElement;
  style?: ViewStyle | ViewStyle[];
}

export const Stack: React.FC<StackProps> = React.memo(({
  children,
  direction = 'column',
  spacing,
  align,
  justify,
  wrap = false,
  divider,
  style,
  ...props
}) => {
  const defaultAlign = direction === 'row' ? 'center' : 'stretch';
  const defaultJustify = 'flex-start';

  const renderChildren = () => {
    const childArray = React.Children.toArray(children).filter(Boolean);
    
    if (!spacing && !divider) return childArray;

    return childArray.map((child, index) => {
      const isLast = index === childArray.length - 1;
      const marginProp = direction === 'row' ? 'marginRight' : 'marginBottom';
      
      return (
        <React.Fragment key={index}>
          <Box {...(spacing && !isLast && { [marginProp]: spacing })}>
            {child}
          </Box>
          {divider && !isLast && divider}
        </React.Fragment>
      );
    });
  };

  return (
    <Box
      flexDirection={direction}
      alignItems={align || defaultAlign}
      justifyContent={justify || defaultJustify}
      wrap={wrap}
      style={style}
      {...props}
    >
      {renderChildren()}
    </Box>
  );
});

Stack.displayName = 'Stack';