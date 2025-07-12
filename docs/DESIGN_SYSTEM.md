# eMediCard Design System Documentation

## Table of Contents
1. [Introduction](#introduction)
2. [Design Principles](#design-principles)
3. [Theme Structure](#theme-structure)
4. [Components](#components)
5. [Animations](#animations)
6. [Accessibility](#accessibility)
7. [Best Practices](#best-practices)

## Introduction

The eMediCard Design System is a comprehensive collection of reusable components, design tokens, and guidelines that ensure consistency and quality across the entire application. Built with React Native and TypeScript, it prioritizes accessibility, performance, and user experience.

## Design Principles

### 1. **Clarity First**
- Clear visual hierarchy
- Intuitive navigation patterns
- Readable typography
- Meaningful color usage

### 2. **Consistency**
- Unified design tokens
- Predictable component behavior
- Standardized spacing and sizing
- Consistent interaction patterns

### 3. **Accessibility**
- WCAG 2.1 AA compliance
- Screen reader support
- Keyboard navigation
- High contrast ratios

### 4. **Performance**
- Optimized animations
- Efficient re-renders
- Lazy loading patterns
- Minimal bundle size

## Theme Structure

### Colors

```typescript
theme.colors = {
  primary: {
    50-900: // Green shades for primary actions
    500: '#10B981' // Main brand color
  },
  secondary: {
    50-900: // Blue shades for secondary actions
    500: '#3B82F6'
  },
  semantic: {
    success: '#10B981',
    warning: '#F59E0B',
    error: '#DC3545',
    info: '#3B82F6'
  },
  jobCategories: {
    foodHandler: '#FFD700',
    securityGuard: '#4169E1',
    others: '#6B46C1'
  }
}
```

### Typography

```typescript
theme.typography = {
  h1: { fontSize: 32, fontWeight: '700', lineHeight: 40 },
  h2: { fontSize: 24, fontWeight: '600', lineHeight: 32 },
  h3: { fontSize: 20, fontWeight: '600', lineHeight: 28 },
  h4: { fontSize: 18, fontWeight: '600', lineHeight: 24 },
  body: { fontSize: 16, fontWeight: '400', lineHeight: 24 },
  bodySmall: { fontSize: 14, fontWeight: '400', lineHeight: 20 },
  caption: { fontSize: 12, fontWeight: '400', lineHeight: 16 },
  button: { fontSize: 16, fontWeight: '600', lineHeight: 24 }
}
```

### Spacing

```typescript
theme.spacing = {
  xs: 4,   // Minor spacing
  sm: 8,   // Small elements
  md: 16,  // Default spacing
  lg: 24,  // Section spacing
  xl: 32,  // Large spacing
  xxl: 48, // Extra large
  xxxl: 64 // Maximum spacing
}
```

### Shadows

```typescript
theme.shadows = {
  small: { elevation: 2, shadowOpacity: 0.05 },
  medium: { elevation: 4, shadowOpacity: 0.1 },
  large: { elevation: 8, shadowOpacity: 0.15 }
}
```

## Components

### CustomButton

A versatile button component with multiple variants and states.

#### Usage
```tsx
<CustomButton
  title="Submit Application"
  variant="primary" // 'primary' | 'secondary' | 'outline' | 'none'
  size="medium" // 'small' | 'medium' | 'large'
  loading={false}
  onPress={handleSubmit}
  accessibilityLabel="Submit health card application"
  accessibilityHint="Double tap to submit your application"
/>
```

#### Props
- `title`: Button text
- `variant`: Visual style variant
- `size`: Button size
- `loading`: Loading state
- `disabled`: Disabled state
- `accessibilityLabel`: Screen reader label
- `accessibilityHint`: Screen reader hint

### CustomTextInput

An enhanced text input with icon support and accessibility features.

#### Usage
```tsx
<CustomTextInput
  placeholder="Enter your email"
  leftIcon="mail"
  rightIcon="eye-off"
  onRightIconPress={togglePassword}
  value={email}
  onChangeText={setEmail}
  error={emailError}
  accessibilityLabel="Email address"
  rightIconAccessibilityLabel="Toggle password visibility"
/>
```

### AnimatedCard

A pressable card with elevation and scale animations.

#### Usage
```tsx
<AnimatedCard
  onPress={handleCardPress}
  elevation={4}
  accessibilityLabel="Health card application"
>
  <Text>Card Content</Text>
</AnimatedCard>
```

### Toast Notifications

Global feedback system for user actions.

#### Usage
```tsx
<Toast
  visible={showToast}
  message="Application submitted successfully!"
  type="success" // 'success' | 'error' | 'warning' | 'info'
  duration={3000}
  onHide={() => setShowToast(false)}
  position="bottom"
/>
```

### SkeletonLoader

Loading placeholder for content.

#### Usage
```tsx
// Single skeleton
<SkeletonLoader
  width="100%"
  height={60}
  variant="rectangular"
  animation="wave"
/>

// Multiple skeletons
<SkeletonGroup count={3} spacing={16}>
  <SkeletonLoader height={20} variant="text" />
</SkeletonGroup>
```

## Animations

### useAnimation Hook

A custom hook that respects user's motion preferences.

#### Usage
```tsx
const fadeAnimation = useAnimation(0);

// Animate to value
await fadeAnimation.animateTo(1, { duration: 300 });

// Spring animation
await fadeAnimation.spring(1, { tension: 40, friction: 7 });

// Stop animation
fadeAnimation.stop();
```

### Page Transitions

Smooth transitions between screens.

#### Usage
```tsx
<PageTransition type="slideUp" duration={300}>
  <YourScreenContent />
</PageTransition>

// Stagger children animations
<StaggerChildren staggerDelay={100} animationType="fade">
  {items.map(item => <ItemComponent key={item.id} {...item} />)}
</StaggerChildren>
```

## Accessibility

### Guidelines

1. **Labels and Hints**
   - Always provide `accessibilityLabel` for interactive elements
   - Use `accessibilityHint` for complex interactions
   - Ensure labels are descriptive and contextual

2. **Roles and States**
   - Set appropriate `accessibilityRole`
   - Update `accessibilityState` for dynamic content
   - Use `accessibilityLiveRegion` for announcements

3. **Focus Management**
   - Ensure logical tab order
   - Provide focus indicators
   - Handle focus traps in modals

4. **Color and Contrast**
   - Minimum contrast ratio of 4.5:1 for normal text
   - 3:1 for large text (18pt+)
   - Don't rely solely on color for information

### Example Implementation
```tsx
<TouchableOpacity
  accessibilityLabel="Delete application"
  accessibilityHint="Double tap to permanently delete this application"
  accessibilityRole="button"
  accessibilityState={{ disabled: isDeleting }}
>
  <Ionicons name="trash" size={24} accessibilityElementsHidden />
  <Text>Delete</Text>
</TouchableOpacity>
```

## Best Practices

### 1. **Use Theme Tokens**
```tsx
// ❌ Don't hardcode values
<View style={{ padding: 16, backgroundColor: '#F9FAFB' }} />

// ✅ Use theme tokens
<View style={{ 
  padding: theme.spacing.md, 
  backgroundColor: theme.colors.background.secondary 
}} />
```

### 2. **Implement Error Boundaries**
```tsx
<ErrorBoundary fallback={CustomErrorFallback}>
  <YourAppContent />
</ErrorBoundary>
```

### 3. **Optimize Re-renders**
```tsx
// Use React.memo for expensive components
export const ExpensiveComponent = React.memo(({ data }) => {
  return <ComplexVisualization data={data} />;
});
```

### 4. **Responsive Design**
```tsx
// Use responsive utilities
import { widthPercentageToDP as wp } from 'react-native-responsive-screen';

<View style={{ width: wp('90%'), paddingHorizontal: theme.spacing.md }} />
```

### 5. **Loading States**
```tsx
// Always provide loading feedback
{isLoading ? (
  <SkeletonGroup count={3}>
    <SkeletonLoader height={60} variant="rectangular" />
  </SkeletonGroup>
) : (
  <DataList items={data} />
)}
```

### 6. **Error Handling**
```tsx
// Graceful error handling
{error ? (
  <EmptyState
    icon="alert-circle"
    title="Something went wrong"
    description={error.message}
    actionLabel="Try Again"
    onAction={retry}
  />
) : (
  <Content />
)}
```

## Component Status

| Component | Status | Accessibility | Documentation |
|-----------|--------|---------------|---------------|
| CustomButton | ✅ Complete | ✅ Full | ✅ Complete |
| CustomTextInput | ✅ Complete | ✅ Full | ✅ Complete |
| AnimatedCard | ✅ Complete | ✅ Full | ✅ Complete |
| Toast | ✅ Complete | ✅ Full | ✅ Complete |
| SkeletonLoader | ✅ Complete | ⚠️ Partial | ✅ Complete |
| ErrorBoundary | ✅ Complete | ✅ Full | ✅ Complete |
| PageTransition | ✅ Complete | ✅ Full | ✅ Complete |

## Migration Guide

### Updating Existing Components

1. Replace hardcoded colors with theme tokens
2. Add accessibility props to all interactive elements
3. Implement loading and error states
4. Use animated components for better UX

### Example Migration
```tsx
// Before
<TouchableOpacity style={{ backgroundColor: '#10B981' }}>
  <Text>Submit</Text>
</TouchableOpacity>

// After
<CustomButton
  title="Submit"
  variant="primary"
  accessibilityLabel="Submit form"
  onPress={handleSubmit}
/>
```

## Resources

- [React Native Accessibility](https://reactnative.dev/docs/accessibility)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Material Design](https://material.io/design)
- [iOS Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)

---

*Last updated: January 2025*
