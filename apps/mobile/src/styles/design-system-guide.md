# React Native Design System Guide

## Overview

This design system provides a comprehensive set of components, styles, and utilities for building consistent, accessible, and performant React Native applications.

## Core Features

### 🎨 **Centralized Styling**
- Unified theme system with colors, typography, spacing, and shadows
- Responsive design utilities for different screen sizes
- Platform-specific adaptations (iOS/Android)

### 🧩 **Component Library**
- Base components with variant systems (Button, Card, Badge, Input, Text)
- Layout components (Box, Row, Column, Center, SpaceBetween, Stack, Grid)
- Enhanced existing components with design system integration

### ♿ **Accessibility First**
- Comprehensive accessibility props and utilities
- Screen reader support and voice control compatibility
- Minimum touch target sizes (44px) and color contrast validation

### ⚡ **Performance Optimized**
- Memoized components and style calculations
- Efficient re-rendering with shallow comparison
- Performance monitoring utilities for development

## Getting Started

### Basic Usage

```tsx
import { Button, Card, Row, Text } from '@/src/components/design-system';

export const MyComponent = () => (
  <Card variant="elevated" padding="large">
    <Row spacing="md" align="center">
      <Text variant="h3" weight="bold">Hello World</Text>
      <Button variant="primary" size="medium" title="Click me" />
    </Row>
  </Card>
);
```

### Theme Access

```tsx
import { getColor, getSpacing, getTypography } from '@/src/styles';

const styles = StyleSheet.create({
  container: {
    backgroundColor: getColor('background.primary'),
    padding: getSpacing('lg'),
  },
  text: {
    ...getTypography('body'),
    color: getColor('text.primary'),
  },
});
```

## Component Reference

### Layout Components

#### Box
Flexible container with spacing and layout props
```tsx
<Box 
  flex={1} 
  padding="lg" 
  margin="md" 
  backgroundColor={getColor('background.secondary')}
>
  <Text>Content</Text>
</Box>
```

#### Row & Column
Direction-specific layouts with spacing
```tsx
<Row spacing="md" align="center" justify="space-between">
  <Text>Left</Text>
  <Text>Right</Text>
</Row>

<Column spacing="lg" align="stretch">
  <Text>Top</Text>
  <Text>Bottom</Text>
</Column>
```

#### Grid
Responsive grid layout
```tsx
<Grid columns={2} spacing="md">
  <Card>Item 1</Card>
  <Card>Item 2</Card>
  <Card>Item 3</Card>
  <Card>Item 4</Card>
</Grid>
```

### UI Components

#### Button
Enhanced button with variants and accessibility
```tsx
<Button
  variant="primary"
  size="large"
  icon="add-circle-outline"
  title="Add Item"
  onPress={handlePress}
  accessibilityHint="Adds a new item to your list"
/>
```

#### Card
Flexible card container with status variants
```tsx
<Card 
  variant="success" 
  padding="large"
  onPress={handleCardPress}
  header={<Text variant="h4">Header</Text>}
  footer={<Button title="Action" />}
>
  <Text>Card content</Text>
</Card>
```

#### Badge
Status and category indicators
```tsx
<Badge
  variant="success"
  text="Approved"
  icon="checkmark-circle"
  size="medium"
/>
```

## Styling System

### Color System
```tsx
// Semantic colors
getColor('primary.500')
getColor('semantic.success')
getColor('accent.medicalBlue')

// With opacity
colorWithOpacity[20]('primary.500') // 20% opacity
```

### Spacing System
```tsx
// Consistent spacing
getSpacing('xs')  // 4px
getSpacing('sm')  // 8px
getSpacing('md')  // 16px
getSpacing('lg')  // 24px
getSpacing('xl')  // 32px
```

### Typography System
```tsx
getTypography('h1')      // Large headings
getTypography('h2')      // Section headings
getTypography('body')    // Body text
getTypography('caption') // Small text
```

## Responsive Design

### Breakpoints
- `sm`: < 480px (phones)
- `md`: 480px - 768px (large phones)
- `lg`: 768px - 1024px (tablets)
- `xl`: > 1024px (large tablets)

### Responsive Values
```tsx
const fontSize = responsiveValue({
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  default: 14,
});
```

### Device Detection
```tsx
const { isTablet, isMobile, screenWidth } = deviceUtils;

if (isTablet) {
  // Tablet-specific layout
}
```

## Accessibility Features

### Automatic Props
All interactive components include:
- `accessibilityRole`
- `accessibilityLabel`
- `accessibilityState`
- Minimum touch target sizes

### Custom Accessibility
```tsx
import { createAccessibilityProps } from '@/src/utils/accessibility';

const accessibilityProps = createAccessibilityProps({
  label: 'Submit form',
  hint: 'Submits the current form data',
  role: 'button',
  state: { disabled: false }
});
```

### Screen Reader Support
```tsx
import { useScreenReader, useAccessibilityAnnouncement } from '@/src/utils/accessibility';

const isScreenReaderEnabled = useScreenReader();
const announce = useAccessibilityAnnouncement();

if (isScreenReaderEnabled) {
  announce('Form submitted successfully');
}
```

## Performance Optimization

### Memoized Components
All components are memoized with optimized comparison functions:
```tsx
const MyComponent = React.memo(Component, (prevProps, nextProps) => {
  return shallowEqual(prevProps, nextProps);
});
```

### Style Memoization
```tsx
import { useMemoizedStyle } from '@/src/utils/performance';

const styles = useMemoizedStyle(() => ({
  container: {
    backgroundColor: getColor('background.primary'),
    padding: getSpacing('lg'),
  }
}), [theme]);
```

### Performance Monitoring
```tsx
import { useRenderPerformance } from '@/src/utils/performance';

const MyComponent = () => {
  const { renderCount } = useRenderPerformance('MyComponent');
  
  // Component implementation
};
```

## Migration Guide

### From Inline Styles
```tsx
// Before
<View style={{
  backgroundColor: '#FFFFFF',
  padding: 16,
  borderRadius: 8,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 2,
}}>

// After
<Card variant="default" padding="medium">
```

### From Custom Components
```tsx
// Before
<CustomButton 
  style={{ backgroundColor: '#10B981' }}
  textStyle={{ color: '#FFFFFF' }}
  title="Submit"
/>

// After
<Button 
  variant="primary" 
  title="Submit"
/>
```

## Best Practices

1. **Use semantic component names** - Choose components based on purpose, not appearance
2. **Leverage the spacing system** - Use consistent spacing values from the theme
3. **Prefer composition** - Combine simple components rather than creating complex ones
4. **Test accessibility** - Always test with screen readers and voice control
5. **Monitor performance** - Use the provided performance utilities in development
6. **Follow platform conventions** - Respect iOS and Android design guidelines

## Component Architecture

```
src/
├── components/
│   ├── design-system/     # Main export point
│   ├── ui/               # Core UI components
│   ├── layout/           # Layout components
│   └── ...              # Enhanced existing components
├── styles/
│   ├── theme.ts          # Core theme system
│   ├── components/       # Component-specific styles
│   ├── layouts/          # Layout patterns
│   └── responsive.ts     # Responsive utilities
├── types/
│   └── design-system.ts  # TypeScript definitions
└── utils/
    ├── performance.ts    # Performance utilities
    └── accessibility.ts  # Accessibility utilities
```

This design system ensures consistency, accessibility, and performance across the entire application while maintaining flexibility for custom use cases.