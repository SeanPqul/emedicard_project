# FSD with Expo Router: Handling Barrel Export Warnings

## The Issue

When using Feature-Sliced Design (FSD) with Expo Router, you may encounter warnings like:
```
WARN Route "./(auth)/sign-in.tsx" is missing the required default export
```

This happens because:
1. Expo Router uses static analysis to detect default exports in route files
2. When importing from barrel exports (index.ts files), the bundler can't trace the export chain
3. Metro bundler's limitations prevent it from following re-exports during initial scanning

## Solutions

### Solution 1: Direct Imports in Route Files (Recommended)

**Pattern**: Import directly from the component file in route files only.

```tsx
// ❌ BAD - Causes warnings
// app/(auth)/sign-in.tsx
import { SignInScreen } from '@/src/screens/auth';

// ✅ GOOD - No warnings
// app/(auth)/sign-in.tsx
import { SignInScreen } from '@/src/screens/auth/SignInScreen';
```

**Benefits:**
- Eliminates all warnings
- Routes load faster (no barrel export overhead)
- Clear dependency path for bundler
- Still maintain barrel exports for non-route imports

### Solution 2: Hybrid FSD Pattern

Keep barrel exports for everything except route files:

```
src/
├── screens/
│   └── auth/
│       ├── index.ts              # Barrel export for non-route usage
│       ├── SignInScreen.tsx      # Component implementation
│       └── SignInScreen.route.ts # Optional: Route-specific exports
```

### Solution 3: Re-export Pattern (Not Recommended)

You could create wrapper components that Expo Router can analyze:

```tsx
// app/(auth)/sign-in.tsx
import { SignInScreen as ImportedSignInScreen } from '@/src/screens/auth';

// Re-export with explicit default
const SignInScreen = ImportedSignInScreen;
export default SignInScreen;
```

**Note**: This adds unnecessary complexity and doesn't provide benefits over direct imports.

## Best Practices for FSD with Expo Router

1. **Use direct imports only in route files** (`app/` directory)
2. **Maintain barrel exports for all other imports** (features, entities, shared)
3. **Document the pattern** in your project README
4. **Use ESLint rules** to enforce the pattern:

```js
// .eslintrc.js
module.exports = {
  rules: {
    'no-restricted-imports': ['error', {
      patterns: [{
        group: ['@/src/screens/**/index', '@/src/screens/*/'],
        message: 'Import directly from component files in route files'
      }]
    }]
  }
};
```

## Example Project Structure

```
app/                              # Expo Router files
├── (auth)/
│   └── sign-in.tsx              # Direct import from SignInScreen.tsx
├── (tabs)/
│   └── index.tsx                # Direct import from DashboardScreen.tsx
└── _layout.tsx                  # Can use barrel exports (not a route)

src/                             # FSD structure
├── screens/                     # Pages layer
│   └── auth/
│       ├── index.ts            # Barrel export for non-route usage
│       ├── SignInScreen.tsx    # Component implementation
│       └── types.ts            # Shared types
├── features/                   # Features layer (use barrel exports)
├── entities/                   # Entities layer (use barrel exports)
└── shared/                     # Shared layer (use barrel exports)
```

## Why This Pattern Works

1. **Route files are thin wrappers** - They only import and export the screen component
2. **FSD benefits preserved** - All other layers maintain barrel exports
3. **No runtime overhead** - Direct imports in routes improve performance
4. **Clear separation** - Route files are clearly different from feature code

## Migration Checklist

- [ ] Update all route files to use direct imports
- [ ] Keep barrel exports in all FSD layers
- [ ] Update import statements in route files only
- [ ] Test the app to ensure warnings are gone
- [ ] Document the pattern for your team
- [ ] Consider adding linting rules

## Conclusion

While this issue is a limitation of Expo Router's static analysis, the direct import pattern is actually beneficial:
- Clearer dependency graphs
- Faster route loading
- Explicit route definitions
- Maintains FSD architecture benefits everywhere else

This pattern respects both FSD principles and Expo Router's requirements, creating a harmonious architecture.
