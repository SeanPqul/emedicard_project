# Phase 6.1 Migration Analysis - src/components
Date: September 21, 2025

## Executive Summary
This analysis identifies which components in `src/components` have already been migrated, which are still being used, and provides recommendations for Phase 6.1 of the FSD migration.

## Current Directory Structure
```
src/components/
├── activity/          # Contains ActivityItem (USED)
├── common/           # Contains shared UI components (PARTIALLY USED)
├── feedback/         # Contains FeedbackSystem & Toast (USED)
├── navigation/       # Navigation wrappers (NOT USED)
├── payment/          # Payment screens (NOT USED)
├── profile/          # Profile components (NOT USED)
├── scanner/          # QR scanner (NOT USED)
├── stats/            # Contains StatCard (USED)
├── ui/               # UI components (PARTIALLY USED)
├── upload/           # Upload components (NOT USED)
└── index.tsx         # Barrel export

src/archive/migration_v2_archived_2025_09_21/
├── auth/             # Previously migrated
├── dashboard/        # Previously migrated
├── application/      # Previously removed (duplicates)
└── components_outdated_tests/  # Old test files
```

## Component Usage Analysis

### ✅ Components Currently Being Used

| Component | Location | Used By | Import Path |
|-----------|----------|---------|-------------|
| StatCard | `stats/StatCard.tsx` | `features/dashboard/components/StatsOverview` | `@/src/components/stats` |
| ActivityItem | `activity/ActivityItem.tsx` | `features/dashboard/components/RecentActivityList` | `@/src/components/activity/ActivityItem` |
| FeedbackSystem | `feedback/FeedbackSystem.tsx` | `features/application/screens/ApplyScreen` | `@/src/components/feedback/FeedbackSystem` |
| Toast | `feedback/Toast.tsx` | `core/providers/ToastProvider` | `@/src/components` |
| CustomTextInput | `ui/CustomTextInput.tsx` | `features/application/components/steps/PaymentMethodStep` | `@/src/components` |
| EmptyState | `common/EmptyState.tsx` | `features/application/screens/ApplicationListScreen` | `@/src/components` |
| CustomButton | via barrel export | `features/application/screens/ApplicationDetailScreen` | `@/src/components` |

### ❌ Components NOT Being Used (Safe to Archive)

| Component | Location | Reason |
|-----------|----------|--------|
| NavigationWrapper | `navigation/NavigationWrapper.tsx` | No imports found |
| RoleBasedTabLayout | `navigation/RoleBasedTabLayout.tsx` | No imports found |
| StepNavigation | `navigation/StepNavigation.tsx` | No imports found |
| EnhancedPaymentScreen | `payment/EnhancedPaymentScreen.tsx` | No imports found |
| ImprovedPaymentScreen | `payment/ImprovedPaymentScreen.tsx` | No imports found |
| PaymentSubmissionScreen | `payment/PaymentSubmissionScreen.tsx` | No imports found |
| PaymentMethodCard | `payment/PaymentMethodCard.tsx` | No imports found |
| ProfileLink | `profile/ProfileLink.tsx` | No imports found |
| QRCodeScanner | `scanner/QRCodeScanner.tsx` | No imports found |
| DragDropUpload | `upload/DragDropUpload.tsx` | No imports found |

## Migration Recommendations for Phase 6.1

### 1. Archive Unused Components
Move the following directories to archive:
```bash
src/components/navigation/ → src/archive/migration_v2_archived_2025_09_21/
src/components/payment/ → src/archive/migration_v2_archived_2025_09_21/
src/components/profile/ → src/archive/migration_v2_archived_2025_09_21/
src/components/scanner/ → src/archive/migration_v2_archived_2025_09_21/
src/components/upload/ → src/archive/migration_v2_archived_2025_09_21/
```

### 2. Components to Migrate to Features

#### High Priority (Feature-Specific):
- **StatCard** → `src/features/dashboard/components/StatCard/`
  - Only used by dashboard feature
  - Clear feature ownership
  
- **ActivityItem** → `src/features/dashboard/components/ActivityItem/`
  - Only used by dashboard feature
  - Clear feature ownership

- **FeedbackSystem** → `src/features/application/components/FeedbackSystem/`
  - Only used by application feature
  - Contains feature-specific logic

#### Medium Priority (Evaluate for Shared):
- **Toast** → Consider moving to `src/shared/components/feedback/Toast/`
  - Used by core providers (cross-cutting concern)
  - Could be genuinely shared
  
- **EmptyState** → Already exists in `src/shared/components/feedback/`
  - Check if this is a duplicate
  - If different, consolidate into one

- **CustomTextInput** → Already exists in `src/shared/components/inputs/`
  - Check if this is a duplicate
  - If different, consolidate into one

### 3. Update Import Paths
After migration, update all imports:
```typescript
// Before
import { StatCard } from '@/src/components/stats';

// After
import { StatCard } from '@/src/features/dashboard/components/StatCard';
```

### 4. Components Requiring Special Attention

#### common/ directory
- Check each component for duplicates in `src/shared/components/`
- Components like EmptyState, LoadingSpinner might already exist in shared

#### ui/ directory  
- Check each component for duplicates in `src/shared/components/`
- CustomTextInput, Button variants might already exist in shared

## Migration Checklist

- [ ] Archive unused component directories (navigation, payment, profile, scanner, upload)
- [ ] Migrate StatCard to dashboard feature
- [ ] Migrate ActivityItem to dashboard feature
- [ ] Migrate FeedbackSystem to application feature
- [ ] Evaluate Toast for shared components
- [ ] Check for duplicates between common/ui and shared/components
- [ ] Update all import statements
- [ ] Remove migrated components from src/components
- [ ] Update barrel exports in index.tsx
- [ ] Run TypeScript compiler to check for errors
- [ ] Test affected features

## Success Criteria
- No TypeScript errors after migration
- All features work as before
- No components remain in src/components that belong to specific features
- Clear separation between feature-specific and shared components
- All imports updated to new paths
