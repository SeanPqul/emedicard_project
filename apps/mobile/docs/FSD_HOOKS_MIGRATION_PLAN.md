# FSD Hooks Migration Plan

## Overview
This document outlines the migration plan for moving business logic from `src/shared/hooks/` to their appropriate features and entities following Feature-Sliced Design principles.

## Migration Mapping

### 1. useApplications.ts → features/application/hooks/
**Why**: This hook handles application creation, updates, and submission - core business logic for the application feature.
**New location**: `src/features/application/hooks/useApplications.ts`
**Dependencies to update**:
- Will use entity types from `entities/application/model/types.ts`
- May need to create additional hooks for specific workflows

### 2. useHealthCards.ts → features/healthCards/hooks/
**Why**: Manages health card issuance and verification - specific to health card feature workflow.
**New location**: `src/features/healthCards/hooks/useHealthCards.ts`
**Related utilities to move**:
- `shared/utils/health-card-utils.ts` → `features/healthCards/lib/`
- `shared/utils/health-card-display-utils.ts` → `features/healthCards/lib/`

### 3. usePayments.ts → features/payment/hooks/
**Why**: Contains payment creation and status management - core payment feature logic.
**New location**: `src/features/payment/hooks/usePayments.ts`
**Note**: Already has `usePaymentFlow.ts`, this will complement it.

### 4. useUsers.ts → entities/user/api/
**Why**: User CRUD operations are entity-level concerns, not feature-specific.
**New location**: `src/entities/user/api/useUsers.ts`
**Alternative structure**:
```
entities/user/
  api/
    useUsers.ts        # Main user data hook
    useCurrentUser.ts  # Current user specific hook
  model/
    types.ts
    service.ts
```

### 5. useNotifications.ts → features/notification/hooks/
**Why**: Notification management is a feature with its own workflows.
**New location**: `src/features/notification/hooks/useNotifications.ts`
**Note**: Need to create the notification feature folder structure.

### 6. useVerification.ts → features/scanner/hooks/
**Why**: Verification and QR scanning are part of the scanner feature workflow.
**New location**: `src/features/scanner/hooks/useVerification.ts`
**Alternative**: Could also be `features/verification/` if scanning is just one aspect.

### 7. useRequirements.ts → features/upload/hooks/
**Why**: Document requirements and uploads are managed by the upload feature.
**New location**: `src/features/upload/hooks/useRequirements.ts`
**Related**: Works closely with application feature for document validation.

### 8. useJobCategories.ts → entities/jobCategory/api/
**Why**: Job categories are domain entities used across multiple features.
**New location**: `src/entities/jobCategory/api/useJobCategories.ts`
**New structure needed**:
```
entities/jobCategory/
  api/
    useJobCategories.ts
  model/
    types.ts
  lib/
    utils.ts  # Move job-category-utils.ts here
```

### 9. Other Shared Hooks to Keep
These hooks should remain in shared as they don't contain business logic:
- `useNetwork.ts` - Generic network status
- `useNetworkStatus.ts` - Generic network monitoring
- `useStorage.ts` - Generic storage utilities
- `useDeepLink.ts` - Generic deep linking
- `useDocumentUpload.ts` - If it's generic upload logic
- `useOptimizedDashboard.ts` - May need review
- `useRoleBasedNavigation.ts` - May need review

## Implementation Order

1. **Phase 1: Entity Hooks** (Less complex, foundational)
   - Move `useUsers.ts` to `entities/user/api/`
   - Move `useJobCategories.ts` to `entities/jobCategory/api/`
   - Create necessary folder structures

2. **Phase 2: Feature Hooks** (More complex, depend on entities)
   - Move `useApplications.ts` to `features/application/hooks/`
   - Move `usePayments.ts` to `features/payment/hooks/`
   - Move `useHealthCards.ts` to `features/healthCards/hooks/`

3. **Phase 3: New Feature Creation**
   - Create `features/notification/` and move `useNotifications.ts`
   - Create proper structure for `features/scanner/` and move `useVerification.ts`
   - Enhance `features/upload/` and move `useRequirements.ts`

4. **Phase 4: Cleanup**
   - Update all imports across the codebase
   - Remove old hooks from shared
   - Update barrel exports in features/entities

## Notes

- Each hook migration should preserve the existing API to minimize breaking changes
- Consider creating facade hooks in features that combine entity hooks when needed
- Document any breaking changes clearly
- Test each migration thoroughly before proceeding to the next

## Related Utilities Migration

Along with hooks, these utilities need to be moved:
- `shared/utils/health-card-*.ts` → `features/healthCards/lib/`
- `shared/utils/job-category-utils.ts` → `entities/jobCategory/lib/`
- `shared/utils/activity-utils.ts` → `entities/activity/lib/`
- `shared/utils/orientation-utils.ts` → `features/orientation/lib/`
- Application-specific validation from `shared/validation/form-validation.ts` → `features/application/lib/`
