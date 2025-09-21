# Constants Migration Plan - FSD Architecture

## Current Structure Analysis

The `src/constants` folder contains various constants that should be distributed according to FSD principles:

### 1. **activity-filters.ts** → `src/features/activity/constants.ts`
- Used by activity feature
- Feature-specific filters

### 2. **api.ts** → `src/shared/constants/api.ts`
- Generic API constants (HTTP status codes, methods, content types)
- Used across multiple features
- Truly shared infrastructure

### 3. **app.ts** → `src/shared/constants/app.ts`
- Application-wide constants
- User roles, date formats, validation rules
- Used across entire application

### 4. **application.ts** → `src/features/application/constants.ts`
- Application feature specific (step titles, civil status options)
- Only used by application feature

### 5. **payment-methods.ts** → `src/features/payment/constants.ts`
- Payment feature specific
- Payment methods, types, configurations

### 6. **ui.ts** → `src/shared/constants/ui.ts`
- UI/UX constants (animations, dimensions, z-index)
- Used across multiple features
- Shared UI behavior

## FSD Distribution

```
src/
├── features/
│   ├── activity/
│   │   └── constants.ts        # ACTIVITY_FILTERS
│   ├── application/
│   │   └── constants.ts        # STEP_TITLES, CIVIL_STATUS_OPTIONS
│   └── payment/
│       └── constants.ts        # PAYMENT_METHODS, payment types
└── shared/
    └── constants/
        ├── api.ts              # API_CONSTANTS
        ├── app.ts              # APP_CONSTANTS
        ├── ui.ts               # UI_CONSTANTS
        └── index.ts            # Re-export all shared constants
```

## Benefits
1. **Feature Isolation**: Feature-specific constants stay with their features
2. **Shared Resources**: Truly shared constants are in the shared layer
3. **Clear Dependencies**: Easy to see what each feature depends on
4. **Better Maintenance**: Constants are co-located with the code that uses them
