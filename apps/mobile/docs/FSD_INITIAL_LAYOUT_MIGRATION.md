# InitialLayout Migration to App Layer

## Summary
Moved `InitialLayout.tsx` from the shared components layer to the app layer to align with Feature-Sliced Design (FSD) architecture principles.

## Changes Made

### 1. File Movement
- **From**: `src/shared/components/layout/InitialLayout.tsx`
- **To**: `src/app/layouts/InitialLayout.tsx`

### 2. Import Updates
- Updated LoadingSpinner import from relative path to absolute path:
  - Before: `import { LoadingSpinner } from "../components/LoadingSpinner";`
  - After: `import { LoadingSpinner } from "@/src/shared/components/LoadingSpinner";`

### 3. Created Layout Index
- Added `src/app/layouts/index.ts` for proper exports

## Rationale

The `InitialLayout` component was identified as an app-level concern because it:
1. Handles application initialization logic (Clerk auth loading)
2. Configures root-level navigation (Stack navigator)
3. Manages app-wide loading states

In FSD architecture, these responsibilities belong in the app layer rather than the shared components layer.

## Current Structure

```
src/
├── app/
│   ├── layouts/
│   │   ├── InitialLayout.tsx    # App initialization layout
│   │   └── index.ts             # Public exports
│   └── providers/               # Global providers
└── shared/
    └── components/
        └── layout/
            ├── BaseScreenLayout.tsx  # Stays here (pure UI component)
            └── index.ts
```

## Benefits

1. **Better Architecture Alignment**: App-level concerns are now in the app layer
2. **Clear Separation**: Business logic (app initialization) separated from pure UI components
3. **Maintainability**: Easier to find and modify app initialization logic

## Notes

- `BaseScreenLayout.tsx` remains in shared components as it's a pure UI component without business logic
- No external imports to `InitialLayout` were found, so no additional updates were needed
- The component maintains all its original functionality
