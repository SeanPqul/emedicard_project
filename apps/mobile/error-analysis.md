# TypeScript Error Analysis - eMedicard Mobile App

## Error Summary
Total Errors: 420
Branch: migrationv4

## Error Categories

### 1. Module Resolution Errors (~40% - 168 errors)
These are "Cannot find module" errors caused by the FSD restructure:

#### Missing Internal Modules:
- `./applicationService` - service file was moved/renamed
- `./useHealthCard` - hook was moved
- `./usePaymentFlow` - hook was moved
- `@shared/utils/job-category-utils` - utility was relocated
- `@/src/utils` - old utils path
- `@/src/styles` - old styles path
- `@/src/shared/utils/application/requirementsMapper` - moved to different location
- `../../shared/components` - relative path issues
- `../../shared/components/feedback` - moved to new structure
- `@features/scanner/components/ui/Button` - incorrect feature import
- `@features/upload/components/ui/Button` - incorrect feature import
- `@shared/components/ui/Button` - moved to new location
- `@/assets/svgs/google-ctn-logo.svg` - asset import issue
- `@/backend/convex/_generated/dataModel` - incorrect backend path

#### Missing from src/index.ts exports:
- `./config`
- `./contexts`
- `./hooks`
- `./utils`
- `./styles`
- `./layouts`

#### Feature module missing exports:
- Scanner feature: `./screens`, `./hooks`, `./services`, `./types`, `./constants`
- User types: `./user.types` in docs/types

### 2. Type Mismatch Errors (~30% - 126 errors)

#### Component Props Issues:
- ApplicationTypeStep, JobCategoryStep, PersonalDetailsStep - missing formData prop
- FeedbackSystem - missing required props
- Button components - variant/size type mismatches
- Navigation props not matching RootStackParamList

#### Data Type Mismatches:
- Activity type: 'notification', 'application', 'payment' not assignable to ActivityType
- Date vs string for timestamps
- jobCategory is Id<"jobCategories"> but code expects object with name property
- User object missing profilePicture property
- Application missing orientationCompleted property
- Notification has isRead but code expects read property
- Notification has notificationType but code expects type property

#### Typography/Style Variants:
- "bodyMedium", "headingMedium", "labelSmall", "headingSmall" not in allowed typography variants
- Responsive functions (wp, hp) expecting number but getting string

### 3. Property Access Errors (~20% - 84 errors)

#### Missing Properties:
- Id<"jobCategories"> treated as object (missing .name, .requireOrientation)
- Application type missing orientationCompleted
- User type missing profilePicture
- Notification using wrong property names (read vs isRead, type vs notificationType)
- HealthCard properties on 'never' type (suggests hook returning wrong type)

#### Function Signature Mismatches:
- getUserDisplayName expecting 1 arg but getting 2
- Convex query missing required args
- hasPlaceholderName expects string but gets user object

### 4. Style/UI Type Issues (~10% - 42 errors)

#### Style Type Conflicts:
- ViewStyle vs TextStyle incompatibilities
- RefreshControl prop type issues
- Style array type mismatches
- userSelect property type issues

#### Responsive Utilities:
- wp/hp functions expecting number but getting string percentages
- Missing responsive exports from utils

## Priority Fix Order

1. **Fix module paths** - Update all imports to match new FSD structure
2. **Update type definitions** - Align types with Convex schema
3. **Fix component interfaces** - Update prop types for all components
4. **Resolve style utilities** - Fix responsive function signatures
5. **Update navigation types** - Match new route structure

## Root Causes

1. **Feature-Sliced Design Migration**: Project was restructured from traditional folder structure to FSD
2. **Convex Schema Updates**: Backend schema doesn't match frontend type expectations
3. **Incomplete Migration**: Some files still reference old paths and structures
4. **Type Definition Gaps**: Missing or outdated TypeScript definitions

## Next Steps

1. Create a mapping of old paths to new paths
2. Update all import statements systematically
3. Generate proper type definitions from Convex schema
4. Update component prop interfaces
5. Fix responsive utility usage
