# FSD Styling Guide - eMediCard Mobile App

## Overview
This guide documents the styling patterns and fixes applied during the Feature-Slice Design (FSD) migration to resolve UI distortion issues.

## Key Issues Resolved

### 1. Mixed Styling Approaches
**Problem**: The FSD project mixed utility functions with direct theme object access.
**Solution**: Created a theme adapter layer that provides consistent access to theme values.

### 2. Runtime Errors with Icon Colors
**Problem**: Components trying to access non-existent style properties (e.g., `styles.notificationIcon.color`)
**Solution**: Use direct color values for icon components instead of StyleSheet references.

### 3. Navigation Route Mismatches
**Problem**: Navigation hooks using incorrect route names (e.g., 'application' vs 'applications')
**Solution**: Updated all route names to match actual file names in the app directory.

## Styling Patterns

### 1. Import Pattern
```typescript
// ✅ CORRECT - Use the adapter functions
import { getColor, getSpacing, getTypography, getBorderRadius, getShadow } from '@shared/styles/theme';

// ❌ INCORRECT - Don't mix approaches
import { theme } from '@shared/styles/theme';
```

### 2. Using Theme Values in StyleSheets
```typescript
// ✅ CORRECT
export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: getColor('background.secondary'),
    padding: getSpacing('md'),
  },
  text: {
    ...getTypography('body'),
    color: getColor('text.primary'),
  },
  card: {
    borderRadius: getBorderRadius('lg'),
    ...getShadow('medium'),
  },
});

// ❌ INCORRECT - Don't access theme object directly
backgroundColor: theme.colors.background.secondary,
```

### 3. Icon Colors
```typescript
// ✅ CORRECT - Use direct color values for icons
<Ionicons name="notifications-outline" size={24} color="#111827" />

// ❌ INCORRECT - Don't reference stylesheet colors
<Ionicons name="notifications-outline" size={24} color={styles.iconColor.color} />
```

### 4. Responsive Scaling
```typescript
// ✅ CORRECT - Use responsive utilities
import { moderateScale, verticalScale, scale, wp, hp } from '@shared/utils/responsive';

paddingHorizontal: scale(theme.spacing.md),
paddingVertical: verticalScale(theme.spacing.sm),
width: moderateScale(50),
```

## Component-Specific Fixes

### Dashboard Components
1. **DashboardHeader**: Fixed icon color references
2. **PriorityAlerts**: Fixed alert and chevron icon colors
3. **StatsOverview**: Applied consistent spacing and typography
4. **ApplicationStatus**: Fixed progress bar colors and dimensions

### Navigation Components
1. **RoleBasedTabLayout**: Fixed tab icon colors using direct theme access
2. **Navigation Hooks**: Updated route names to match file structure

## Theme Structure

### Colors
- Primary: Green (#10B981)
- Secondary: Blue (#3B82F6)  
- Semantic: error (#DC3545), warning (#F59E0B), success (#10B981), info (#3B82F6)
- Job Categories: foodHandler (#FFD700), securityGuard (#4169E1), others (#6B46C1)

### Typography Scale
- h1: 32px, 700 weight
- h2: 24px, 600 weight
- h3: 20px, 600 weight
- h4: 18px, 600 weight
- body: 16px, 400 weight
- bodySmall: 14px, 400 weight
- caption: 12px, 400 weight

### Spacing Scale
- xs: 4px
- sm: 8px
- md: 16px
- lg: 24px
- xl: 32px
- xxl: 48px
- xxxl: 64px

### Border Radius
- sm: 4px
- md: 8px
- lg: 12px
- xl: 16px
- xxl: 24px
- full: 9999px

## Migration Checklist

When migrating a component to FSD styling:

1. [ ] Replace all `getColor('path')` calls from master with adapter function
2. [ ] Remove direct `theme.` object access
3. [ ] Fix icon color props to use direct color values
4. [ ] Apply responsive scaling utilities where needed
5. [ ] Ensure typography uses spread operator with getTypography()
6. [ ] Test on multiple screen sizes
7. [ ] Verify no console errors for undefined style properties

## Common Pitfalls to Avoid

1. **Don't mix utility functions with direct theme access**
2. **Don't reference non-existent style properties in components**
3. **Don't forget to update navigation route names**
4. **Don't use percentage strings without quotes in TypeScript**
5. **Don't forget type casting for style constants (e.g., `'uppercase' as const`)**

## Future Improvements

1. Consider creating a StyleSheet factory function for common patterns
2. Add runtime validation for theme paths
3. Create component-specific style hooks for dynamic styling
4. Consider migrating to a CSS-in-JS solution for better type safety
