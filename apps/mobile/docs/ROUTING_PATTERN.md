# Expo Router File Pattern Guide

## Overview
This document describes the standardized pattern for route files in the `app/` directory of our Expo Router mobile application.

## Core Principle: Separation of Concerns

### Route Files (`app/` directory)
- **Purpose**: Define the navigation structure only
- **Content**: One-line re-exports pointing to screen components
- **Location**: `app/` folder and its subdirectories

### Screen Components (`src/screens/` directory)
- **Purpose**: Contain all UI logic, state management, and business logic
- **Content**: Full React component implementations
- **Location**: `src/screens/` folder organized by feature/role

## Standardized Export Pattern

### 1. Route File Pattern (One-Line Export)
All route files in `app/` should use this pattern:

```typescript
// For components with named exports
export { ComponentName as default } from '../../../src/screens/path/to/Component';

// For components with default exports (legacy - should be migrated)
export { default } from '../../../src/screens/path/to/Component';
```

### 2. Screen Component Pattern
All screen components should use named exports:

```typescript
// src/screens/feature/ComponentName.tsx
export function ComponentName() {
  // Component implementation
}
```

## Examples

### Auth Routes
```typescript
// app/(auth)/sign-in.tsx
export { SignInScreen as default } from '../../src/screens/auth/SignInScreen/SignInScreen';

// app/(auth)/sign-up.tsx
export { SignUpScreen as default } from '../../src/screens/auth/SignUpScreen/SignUpScreen';
```

### Tab Routes
```typescript
// app/(tabs)/index.tsx
export { DashboardScreen as default } from '../../src/screens/dashboard/DashboardScreen';

// app/(tabs)/profile.tsx
export { ProfileScreen as default } from '../../src/screens/profile';
```

### Screen Routes
```typescript
// app/(screens)/(shared)/health-cards.tsx
export { HealthCardsScreen as default } from '../../../src/screens/shared/HealthCardsScreen';

// app/(screens)/(inspector)/dashboard.tsx
export { InspectorDashboardScreen as default } from '../../../src/screens/inspector/InspectorDashboardScreen';
```

## Benefits

1. **Clean Navigation Structure**: Easy to see all routes at a glance
2. **No Duplicate Code**: Business logic lives in one place only
3. **Better Testing**: Test components independently from routing
4. **Easier Refactoring**: Move/rename components without touching route definitions
5. **Type Safety**: TypeScript properly tracks imports and exports
6. **Performance**: Smaller route files mean faster Metro bundler processing
7. **Hot Reloading**: Changes in `src/` reflect immediately

## Migration Guide

### Converting Default Exports to Named Exports

#### Before (Default Export):
```typescript
// src/screens/shared/SomeScreen.tsx
export default function SomeScreen() {
  return <View>...</View>;
}

// app/(screens)/some-screen.tsx
export { default } from '../../src/screens/shared/SomeScreen';
```

#### After (Named Export):
```typescript
// src/screens/shared/SomeScreen.tsx
export function SomeScreen() {
  return <View>...</View>;
}

// app/(screens)/some-screen.tsx
export { SomeScreen as default } from '../../src/screens/shared/SomeScreen';
```

### Moving Inline Implementations

If you find a route file with inline implementation:

1. Create a new file in `src/screens/` with the appropriate path
2. Move all the component code to the new file
3. Export the component using a named export
4. Replace the route file content with a one-line export

#### Before:
```typescript
// app/(screens)/example.tsx
import React from 'react';
import { View, Text } from 'react-native';

export default function Example() {
  return (
    <View>
      <Text>Example Screen</Text>
    </View>
  );
}
```

#### After:
```typescript
// src/screens/shared/ExampleScreen.tsx
import React from 'react';
import { View, Text } from 'react-native';

export function ExampleScreen() {
  return (
    <View>
      <Text>Example Screen</Text>
    </View>
  );
}

// app/(screens)/example.tsx
export { ExampleScreen as default } from '../../src/screens/shared/ExampleScreen';
```

## Exceptions

### Layout Files (`_layout.tsx`)
Layout files may contain routing configuration and are exempt from this pattern:

```typescript
// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import { TabBar } from '../../src/components/navigation/TabBar';

export default function TabLayout() {
  return (
    <Tabs tabBar={TabBar}>
      {/* Tab configuration */}
    </Tabs>
  );
}
```

### Route Configuration Files
Files that export route configuration (like `unstable_settings`) may have additional exports:

```typescript
// app/(screens)/special-route.tsx
export { SpecialScreen as default } from '../../src/screens/SpecialScreen';

export const unstable_settings = {
  initialRouteName: 'index',
};
```

## Enforcement

### Manual Review Checklist
- [ ] Route file contains only one line (excluding exceptions)?
- [ ] Uses the `export { ComponentName as default }` pattern?
- [ ] Component implementation is in `src/screens/`?
- [ ] Component uses named export?
- [ ] No business logic in route file?

### Future Improvements
Consider adding:
- ESLint rule to enforce one-line exports in `app/` directory
- Pre-commit hook to validate routing patterns
- Automated migration script for legacy patterns

## Related Documentation
- [Expo Router Documentation](https://docs.expo.dev/router/introduction/)
- [FSD Architecture](./src/README.md)
- [Project Structure](./CLAUDE.md)
