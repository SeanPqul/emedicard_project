# FSD Provider Migration

## Summary
Moved providers from `app/providers/` to `src/app/providers/` to align with Feature-Sliced Design (FSD) architecture.

## Changes Made

### 1. File Movements
- Moved `app/providers/ClerkAndConvexProvider.tsx` → `src/app/providers/ClerkAndConvexProvider.tsx`
- Moved `app/providers/ToastProvider.tsx` → `src/app/providers/ToastProvider.tsx`
- Moved `app/providers/index.ts` → `src/app/providers/index.ts`

### 2. Import Updates
- Updated `app/_layout.tsx` to import providers from `@/src/app/providers/` instead of `@/app/providers/`

## Rationale

In FSD architecture:
- The `app/` folder should only contain routing files (Expo Router requirement)
- Application-level concerns like global providers belong in the `app` layer of the FSD structure
- This keeps routing separate from business logic and follows FSD principles

## Benefits

1. **Clear Separation**: Routing files are now clearly separated from application logic
2. **FSD Compliance**: Providers are now in the correct FSD layer (`src/app/`)
3. **Better Organization**: All non-routing code is consolidated under `src/`

## File Structure After Migration

```
apps/mobile/
├── app/                     # Only routing files (Expo Router)
│   ├── _layout.tsx         # Root layout (imports from src/app/providers)
│   └── ... other routes
└── src/
    ├── app/                # FSD app layer
    │   └── providers/      # Global providers
    │       ├── ClerkAndConvexProvider.tsx
    │       ├── ToastProvider.tsx
    │       └── index.ts
    ├── entities/
    ├── features/
    ├── processes/
    ├── screens/
    ├── shared/
    └── widgets/
```

## Next Steps

With providers properly organized in the FSD structure, we can now proceed with the tabs-first app folder restructure as proposed.
