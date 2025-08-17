/**
 * Grid Component
 * 
 * A responsive grid layout component with customizable columns and spacing
 */

import React from 'react';
import { ViewStyle } from 'react-native';
import { Box } from './Box';
import { BaseComponentProps, SpacingSize } from '../../types/design-system';

interface GridProps extends BaseComponentProps {
  columns?: number;
  spacing?: SpacingSize;
  style?: ViewStyle | ViewStyle[];
}

export const Grid: React.FC<GridProps> = React.memo(({
  children,
  columns = 2,
  spacing = 'md',
  style,
  ...props
}) => {
  const childArray = React.Children.toArray(children).filter(Boolean);
  
  const renderRows = () => {
    const rows = [];
    for (let i = 0; i < childArray.length; i += columns) {
      const rowChildren = childArray.slice(i, i + columns);
      
      rows.push(
        <Box 
          key={i} 
          flexDirection="row" 
          justifyContent="space-between"
          marginBottom={i + columns < childArray.length ? spacing : undefined}
        >
          {rowChildren.map((child, index) => {
            const isLast = index === rowChildren.length - 1;
            const width = `${(100 / columns) - (spacing ? 2 : 0)}%`;
            
            return (
              <Box
                key={index}
                style={{ width }}
                marginRight={!isLast && rowChildren.length === columns ? spacing : undefined}
              >
                {child}
              </Box>
            );
          })}
          
          {/* Add empty boxes to fill incomplete rows */}
          {rowChildren.length < columns &&
            Array.from({ length: columns - rowChildren.length }).map((_, index) => (
              <Box
                key={`empty-${index}`}
                style={{ width: `${(100 / columns) - (spacing ? 2 : 0)}%` }}
              />
            ))
          }
        </Box>
      );
    }
    return rows;
  };

  return (
    <Box style={style} {...props}>
      {renderRows()}
    </Box>
  );
});

Grid.displayName = 'Grid';