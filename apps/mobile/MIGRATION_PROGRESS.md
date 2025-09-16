# Feature-Slice Design Refactoring Plan

## Pre-Migration Setup

1. Create Migration Branch: `git checkout -b migration`
2. Setup Backup: Ensure current work is committed before starting

INVARIANT: Preserve routing entrypoint
- The Expo Router `app/` folder MUST remain at `apps/mobile/app/`.
- Do NOT move or rename `apps/mobile/app/` into `src/`. All feature files will live under `apps/mobile/src/features/...` and route files will import/re-export those screens.
- After each feature extraction, run the route smoke-test (see below) to confirm routes still work.


## Progress Tracking System

The MIGRATION_PROGRESS.md file will contain:
- ✅ Completed tasks (checked)
- 🔄 In-progress tasks
- ⏳ Pending tasks
- 📝 Notes for each phase
- 🐛 Issues encountered
- ⚡ Performance improvements

## Task Execution Flow

For each task:
1. Update markdown file to mark task as "🔄 In Progress"
2. Execute the refactoring steps
3. Test functionality (ill do the test for the device)
4. Update markdown file to mark as "✅ Completed"
5. Commit changes with descriptive message
6. Move to next task

When you extract a feature, include the following 3-step micro-task for every route touched:
7. Create or update route file in apps/mobile/app/ to lazy-import feature UI from apps/mobile/src/features/<feature>/ui/.....
8. After extracting, run lint and typecheck to detect issues introduced by the change:
9. Commits & pushes the change with: git commit -m "refactor(<feature>): route proxies import from src/features" and includes branch and commit info in the report. ( depends on what you do)

---

# Migration Tasks

## Phase 1: Foundation & Shared Infrastructure ⏳

- [x] **Task 1.0**: Ensure routing entrypoint remains apps/mobile/app/ and add proxy route files that import from src/features/*
  - ✅ Verified apps/mobile/app/ routing entrypoint structure exists

- [x] **Task 1.1**: Create New Directory Structure
  - [x] Create src/shared/ directory with subdirectories: ui/, api/, lib/
  - [x] Create src/entities/ directory with subdirectories: user/, application/, healthCard/, payment/
  - [x] Create src/features/ directory with subdirectories: auth/, application-form/, document-upload/, payment-flow/, dashboard/
  - [x] Verify directory structure matches Feature-Slice Design pattern

- [x] **Task 1.2**: Extract Shared API Layer
  - [x] Create src/shared/api/convex.ts - centralized Convex hook factory
  - [x] Create src/shared/api/types.ts - shared API types
  - [x] Move common API patterns from existing hooks into shared layer
  - [x] Test API layer functionality

- [x] **Task 1.3**: Migrate Shared Utilities
  - [x] Move src/utils/storage.ts → src/shared/lib/storage.ts
  - [x] Move src/utils/formStorage.ts → src/shared/lib/formStorage.ts
  - [x] Move src/utils/responsive/ → src/shared/lib/responsive/
  - [x] Move src/utils/accessibility.tsx → src/shared/lib/accessibility.ts
  - [x] Update import paths for moved utilities

- [x] **Task 1.4**: Extract Design System
  - [x] Move src/components/ui/ → src/shared/ui/
  - [x] Move src/components/LoadingSpinner.tsx → src/shared/ui/LoadingSpinner.tsx
  - [x] Move src/components/ErrorState.tsx → src/shared/ui/ErrorState.tsx
  - [x] Move src/components/FeedbackSystem.tsx → src/shared/ui/FeedbackSystem.tsx
  - [x] Update import paths for UI components

- [x] **Task 1.5**: Migrate Shared Validation
  - [x] Move src/shared/validation/ → src/shared/lib/validation/
  - [x] Move src/shared/formatting/ → src/shared/lib/formatting/
  - [x] Update validation imports across the app
  - [x] Verify validation still works

## Phase 2: Extract Domain Entities ⏳

- [ ] **Task 2.1**: Create User Entity
  - [ ] Create src/entities/user/model.ts - user domain types and interfaces
  - [ ] Create src/entities/user/api.ts - centralized user API calls from useUsers.ts
  - [ ] Create src/entities/user/lib.ts - user utility functions from user-utils.ts
  - [ ] Create src/entities/user/index.ts - public exports
  - [ ] Test user entity functionality

- [ ] **Task 2.2**: Create Application Entity
  - [ ] Create src/entities/application/model.ts - application domain types
  - [ ] Create src/entities/application/api.ts - extract from useApplications.ts
  - [ ] Create src/entities/application/lib.ts - application utilities
  - [ ] Create src/entities/application/index.ts - public exports
  - [ ] Test application entity functionality

- [ ] **Task 2.3**: Create Health Card Entity
  - [ ] Create src/entities/healthCard/model.ts - health card types
  - [ ] Create src/entities/healthCard/api.ts - extract from useHealthCards.ts
  - [ ] Create src/entities/healthCard/lib.ts - health card utilities
  - [ ] Create src/entities/healthCard/index.ts - public exports
  - [ ] Test health card entity functionality

- [ ] **Task 2.4**: Create Payment Entity
  - [ ] Create src/entities/payment/model.ts - payment domain types
  - [ ] Create src/entities/payment/api.ts - extract from usePayments.ts
  - [ ] Create src/entities/payment/lib.ts - payment utilities
  - [ ] Create src/entities/payment/index.ts - public exports
  - [ ] Test payment entity functionality

## Phase 3: Feature Migration ⏳

- [ ] **Task 3.1**: Migrate Authentication Feature
  - [ ] Create src/features/auth/ui/ - move auth-related components
  - [ ] Create src/features/auth/model/ - auth state management
  - [ ] Create src/features/auth/api/ - auth-specific API calls
  - [ ] Create src/features/auth/index.ts - public exports
  - [ ] Update auth-related imports across app
  - [ ] Test authentication flows

- [ ] **Task 3.2**: Migrate Application Form Feature
  - [ ] Create src/features/application-form/ui/ - move form step components
  - [ ] Extract useApplicationForm.ts → src/features/application-form/model/
  - [ ] Create src/features/application-form/api/ - form-specific API calls
  - [ ] Create src/features/application-form/lib/ - form utilities
  - [ ] Create src/features/application-form/index.ts - public exports
  - [ ] Test application form functionality

- [ ] **Task 3.3**: Migrate Document Upload Feature
  - [ ] Create src/features/document-upload/ui/ - upload components
  - [ ] Extract useDocumentUpload.ts → src/features/document-upload/model/
  - [ ] Extract useDocumentSelection.ts → src/features/document-upload/model/
  - [ ] Create src/features/document-upload/api/ - upload API calls
  - [ ] Create src/features/document-upload/lib/ - upload utilities
  - [ ] Create src/features/document-upload/index.ts - public exports
  - [ ] Test document upload functionality

- [ ] **Task 3.4**: Migrate Payment Flow Feature
  - [ ] Break down PaymentSubmissionScreen.tsx (502 lines) into smaller components
  - [ ] Create src/features/payment-flow/ui/ - payment components
  - [ ] Extract usePaymentFlow.ts → src/features/payment-flow/model/
  - [ ] Create src/features/payment-flow/api/ - payment API calls
  - [ ] Create src/features/payment-flow/lib/ - payment utilities
  - [ ] Create src/features/payment-flow/index.ts - public exports
  - [ ] Test payment flow functionality

- [ ] **Task 3.5**: Migrate Dashboard Feature
  - [ ] Extract useOptimizedDashboard.ts → src/features/dashboard/model/
  - [ ] Create src/features/dashboard/ui/ - dashboard components
  - [ ] Create src/features/dashboard/api/ - dashboard data calls
  - [ ] Create src/features/dashboard/lib/ - dashboard utilities
  - [ ] Create src/features/dashboard/index.ts - public exports
  - [ ] Test dashboard functionality

## Phase 4: Component Refactoring ⏳

- [ ] **Task 4.1**: Refactor Large Components
  - [ ] Break down LoadingSpinner.tsx (437 lines) - extract spinner variants
  - [ ] Break down QRCodeScanner.tsx (403 lines) - separate scanning logic
  - [ ] Break down StepNavigation.tsx (392 lines) - extract step components
  - [ ] Break down VerificationPage.tsx (345 lines) - separate verification logic
  - [ ] Break down DashboardHeader.tsx (316 lines) - extract header sections

- [ ] **Task 4.2**: Consolidate Navigation
  - [ ] Move src/components/navigation/ → src/shared/ui/navigation/
  - [ ] Update navigation imports across app
  - [ ] Extract useRoleBasedNavigation.ts → src/features/auth/model/
  - [ ] Test navigation functionality

- [ ] **Task 4.3**: Migrate Remaining Components
  - [ ] Move remaining src/components/ to appropriate feature directories
  - [ ] Move inspector-specific components to src/features/inspection/
  - [ ] Move profile-related components to src/features/profile/
  - [ ] Update all component imports

## Phase 5: Cleanup & Optimization ⏳

- [ ] **Task 5.1**: Update Import Paths
  - [ ] Update all imports in app/ directory to use new structure
  - [ ] Update imports in remaining src/screens/ (if any)
  - [ ] Search and replace old import patterns with new ones
  - [ ] Fix any broken imports

- [ ] **Task 5.2**: Remove Old Structure
  - [ ] Remove old src/components/ directory (after verifying all moved)
  - [ ] Remove old src/hooks/ directory (after verifying all moved)
  - [ ] Remove old src/utils/ directory (after verifying all moved)
  - [ ] Remove old src/shared/ subdirectories (if any conflicts)

- [ ] **Task 5.3**: Update Index Files
  - [ ] Create src/shared/index.ts - export shared modules
  - [ ] Create src/entities/index.ts - export all entities
  - [ ] Create src/features/index.ts - export all features
  - [ ] Update main src/index.ts with new exports

- [ ] **Task 5.4**: Testing & Verification
  - [ ] Run npm run typecheck - fix any TypeScript errors
  - [ ] Run npm run lint - fix any linting issues
  - [ ] Test core user flows: sign up, application submission, payment
  - [ ] Test role-based navigation and permissions
  - [ ] Verify QR code scanning and health card generation

- [ ] **Task 5.5**: Performance Optimization
  - [ ] Add lazy loading for feature modules
  - [ ] Optimize bundle size with proper tree shaking
  - [ ] Add performance monitoring for key user flows
  - [ ] Document new architecture patterns

---

## Progress Tracking

**Overall Progress**: 5/26 tasks completed (19%)

**Phase Status**:
- ✅ Phase 1: Foundation & Shared Infrastructure (5/6 tasks)
- ⏳ Phase 2: Extract Domain Entities (0/4 tasks)
- ⏳ Phase 3: Feature Migration (0/5 tasks)
- ⏳ Phase 4: Component Refactoring (0/3 tasks)
- ⏳ Phase 5: Cleanup & Optimization (0/5 tasks)

**Notes**:
- [x] Migration branch created
- [x] Backup verified before starting
- [ ] All routes tested after each feature extraction

