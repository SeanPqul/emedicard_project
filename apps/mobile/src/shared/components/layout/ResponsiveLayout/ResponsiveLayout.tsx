import React from 'react';
import { View, ViewProps, StyleSheet } from 'react-native';
import { dimensions } from '@shared/utils/responsive';
import { theme } from '@shared/styles/theme';

interface ResponsiveLayoutProps extends ViewProps {
  children: React.ReactNode;
  maxWidth?: number;
  centerContent?: boolean;
  paddingHorizontal?: 'sm' | 'md' | 'lg' | 'xl';
  paddingVertical?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'mobile' | 'tablet' | 'desktop';
}

export const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({
  children,
  maxWidth,
  centerContent = false,
  paddingHorizontal = 'md',
  paddingVertical = 'md',
  variant,
  style,
  ...props
}) => {
  const getVariant = () => {
    if (variant) return variant;
    if (dimensions.isTablet) return 'tablet';
    if (dimensions.isLargeDevice) return 'desktop';
    return 'mobile';
  };

  const currentVariant = getVariant();
  
  const getHorizontalPadding = () => {
    const baseSpacing = {
      sm: theme.spacing.sm,
      md: theme.spacing.md,
      lg: theme.spacing.lg,
      xl: theme.spacing.xl,
    };
    
    // Increase padding for larger screens
    if (currentVariant === 'tablet') {
      return baseSpacing[paddingHorizontal] * 1.5;
    }
    if (currentVariant === 'desktop') {
      return baseSpacing[paddingHorizontal] * 2;
    }
    return baseSpacing[paddingHorizontal];
  };

  const getVerticalPadding = () => {
    const baseSpacing = {
      sm: theme.spacing.sm,
      md: theme.spacing.md,
      lg: theme.spacing.lg,
      xl: theme.spacing.xl,
    };
    
    return baseSpacing[paddingVertical];
  };

  const getMaxWidth = () => {
    if (maxWidth) return maxWidth;
    
    // Default max widths for different screen sizes
    switch (currentVariant) {
      case 'tablet':
        return Math.min(dimensions.width * 0.8, 600);
      case 'desktop':
        return Math.min(dimensions.width * 0.7, 800);
      case 'mobile':
      default:
        return dimensions.width;
    }
  };

  const containerStyle = [
    styles.container,
    {
      maxWidth: getMaxWidth(),
      paddingHorizontal: getHorizontalPadding(),
      paddingVertical: getVerticalPadding(),
      alignSelf: centerContent ? 'center' : 'stretch',
    },
    style,
  ];

  return (
    <View style={containerStyle} {...props}>
      {children}
    </View>
  );
};

// Specialized responsive components
export const ResponsiveRow: React.FC<{
  children: React.ReactNode;
  spacing?: 'sm' | 'md' | 'lg';
  wrap?: boolean;
  style?: any;
}> = ({ children, spacing = 'md', wrap = false, style }) => {
  const gap = theme.spacing[spacing];
  
  return (
    <View
      style={[
        styles.row,
        {
          gap: gap,
          flexWrap: wrap ? 'wrap' : 'nowrap',
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};

export const ResponsiveColumn: React.FC<{
  children: React.ReactNode;
  spacing?: 'sm' | 'md' | 'lg';
  style?: any;
}> = ({ children, spacing = 'md', style }) => {
  const gap = theme.spacing[spacing];
  
  return (
    <View
      style={[
        styles.column,
        {
          gap: gap,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};

// Grid component for responsive layouts
export const ResponsiveGrid: React.FC<{
  children: React.ReactNode;
  columns?: number;
  spacing?: 'sm' | 'md' | 'lg';
  style?: any;
}> = ({ children, columns = 2, spacing = 'md', style }) => {
  const gap = theme.spacing[spacing];
  
  // Adjust columns based on screen size
  const getColumns = () => {
    if (dimensions.isTablet) return Math.max(columns, 3);
    if (dimensions.isSmallDevice) return Math.min(columns, 2);
    return columns;
  };

  const actualColumns = getColumns();
  const flexBasis = `${100 / actualColumns}%`;

  return (
    <View
      style={[
        styles.grid,
        {
          gap: gap,
        },
        style,
      ]}
    >
      {React.Children.map(children, (child, index) => (
        <View
          key={index}
          style={[
            styles.gridItem,
            {
              flexBasis: flexBasis,
              marginRight: (index + 1) % actualColumns === 0 ? 0 : gap,
            },
          ]}
        >
          {child}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  column: {
    flexDirection: 'column',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  gridItem: {
    flexGrow: 1,
  },
});
