# App Configuration Migration to App Layer

## Summary
Moved application configuration from `src/shared/config/` to `src/app/config/` to align with Feature-Sliced Design (FSD) architecture principles.

## Changes Made

### 1. File Movement
- **From**: `src/shared/config/index.ts`
- **To**: `src/app/config/index.ts`

### 2. Directory Structure Update
- Removed empty `src/shared/config/` directory
- Created `src/app/config/` directory

### 3. App Layer Index Update
- Updated `src/app/index.ts` to export configuration
- Updated documentation to reflect current structure

## Rationale

The configuration file contains app-level concerns that belong in the app layer according to FSD:

1. **APP_CONFIG**: Application-wide settings like:
   - App name and version
   - API configuration
   - Upload limits
   - UI settings
   - Storage keys

2. **ENV_CONFIG**: Environment-specific settings like:
   - Development/Production flags
   - Feature flags
   - Performance settings
   - Debug options

These are all app-layer responsibilities in FSD architecture.

## Current App Layer Structure

```
src/app/
├── index.ts       # App layer exports
├── config/        # App-level configuration ✅
│   └── index.ts   # APP_CONFIG, ENV_CONFIG, CONFIG
├── layouts/       # Root layouts ✅
│   ├── InitialLayout.tsx
│   └── index.ts
└── providers/     # Global providers ✅
    ├── ClerkAndConvexProvider.tsx
    ├── ToastProvider.tsx
    └── index.ts
```

## Benefits

1. **Architectural Consistency**: All app-level concerns are now in the app layer
2. **Clear Organization**: Config, layouts, and providers are logically grouped
3. **FSD Compliance**: Follows the principle that app-level configuration belongs in the app layer
4. **Better Discoverability**: Developers can find all app-level concerns in one place

## Usage

The configuration can now be imported from the app layer:

```typescript
// Before (if it was being used)
import { APP_CONFIG, ENV_CONFIG } from '@/src/shared/config';

// After
import { APP_CONFIG, ENV_CONFIG } from '@/src/app/config';
// or
import { APP_CONFIG, ENV_CONFIG } from '@/src/app';
```

## No Breaking Changes

Since no files were currently importing from `@shared/config`, this migration introduces no breaking changes to the codebase.
