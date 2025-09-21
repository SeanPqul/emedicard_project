# Mobile App Architecture Migration Plan V2

## Overview
This document tracks the migration of the mobile app from a navigation-driven architecture to a clean, feature-first architecture. Each task includes detailed steps and verification criteria.

## Migration Phases

### Phase 1: Foundation Setup (Day 1)

#### 1.1 Create Base Folder Structure
- [x] Create `src/features/` directory
- [x] Create `src/features/auth/` structure
- [x] Create `src/features/dashboard/` structure  
- [x] Create `src/features/application/` structure
- [x] Create `src/features/payment/` structure
- [x] Create `src/features/profile/` structure
- [x] Create `src/features/health-card/` structure
- [x] Create `src/features/notification/` structure
- [x] Create `src/shared/` reorganization
- [x] Create `src/core/` directory

**Files to create:**
```
src/features/
├── auth/
│   ├── screens/
│   ├── components/
│   ├── hooks/
│   ├── services/
│   ├── constants.ts
│   ├── types.ts
│   └── index.ts
├── dashboard/
│   └── (same structure)
├── application/
│   └── (same structure)
└── ... (other features)
```

#### 1.2 Update TypeScript Configuration
- [x] Update `tsconfig.json` with new path aliases
- [x] Add feature paths (@features/*)
- [x] Update shared paths (@shared/*)
- [ ] Test path resolution

**Changes to `tsconfig.json`:**
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@features/*": ["./src/features/*"],
      "@shared/*": ["./src/shared/*"],
      "@core/*": ["./src/core/*"],
      "@app/*": ["./app/*"]
    }
  }
}
```

#### 1.3 Create Core Infrastructure
- [x] Create navigation types in `src/core/navigation/types.ts`
- [x] Create base screen component in `src/core/components/BaseScreen.tsx`
- [x] Create feature module template
- [x] Set up barrel exports pattern

### Phase 2: Auth Feature Migration

#### 2.1 Extract Auth Screens
- [x] Create `src/features/auth/screens/SignInScreen/`
  - [x] Move logic from `app/(auth)/sign-in.tsx`
  - [x] Create `SignInScreen.tsx`
  - [x] Create `SignInScreen.styles.ts`
  - [ ] Create `SignInScreen.types.ts`
  - [x] Create `index.ts` barrel export
- [x] Create `src/features/auth/screens/SignUpScreen/`
  - [x] Move logic from `app/(auth)/sign-up.tsx`
  - [x] Follow same pattern as SignIn
- [x] Create `src/features/auth/screens/VerificationScreen/`
  - [x] Move logic from `app/(auth)/verification.tsx`
- [x] Create `src/features/auth/screens/ResetPasswordScreen/`
  - [x] Move logic from `app/(auth)/reset-password.tsx`

#### 2.2 Extract Auth Components
- [x] Move `src/components/auth/OtpInputUI.tsx` to `src/features/auth/components/OtpInput/`
- [x] Move `src/components/auth/PasswordStrengthIndicator.tsx` to feature
- [x] Move `src/components/auth/SignOutButton.tsx` to feature
- [ ] Move `src/components/auth/VerificationPage.tsx` to feature
- [ ] Update all imports in moved components

#### 2.3 Create Auth Services
- [x] Create `src/features/auth/services/authService.ts`
  - [x] Extract Clerk-related logic
  - [x] Create clean API interface
- [x] Create `src/features/auth/hooks/useAuth.ts`
  - [x] Consolidate auth state management
- [x] Update auth types in `src/features/auth/types.ts`

#### 2.4 Update Route Files
- [x] Update `app/(auth)/sign-in.tsx` to thin route
- [x] Update `app/(auth)/sign-up.tsx` to thin route
- [x] Update `app/(auth)/verification.tsx` to thin route
- [x] Update `app/(auth)/reset-password.tsx` to thin route
- [ ] Test all auth flows still work

### Phase 3: Dashboard Feature Migration 

#### 3.1 Extract Dashboard Screen
- [ ] Create `src/features/dashboard/screens/DashboardScreen/`
  - [ ] Move logic from `app/(tabs)/index.tsx`
  - [ ] Create proper screen structure
- [ ] Extract dashboard data fetching logic
- [ ] Create dashboard-specific hooks

#### 3.2 Migrate Dashboard Components
- [ ] Move all components from `src/components/dashboard/` to feature
  - [ ] ApplicationStatus → `features/dashboard/components/`
  - [ ] DashboardHeader → `features/dashboard/components/`
  - [ ] HealthCardStatus → `features/dashboard/components/`
  - [ ] OfflineBanner → `shared/components/` (used globally)
  - [ ] PriorityAlerts → `features/dashboard/components/`
  - [ ] QuickActionsGrid → `features/dashboard/components/`
  - [ ] RecentActivityList → `features/dashboard/components/`
  - [ ] StatsOverview → `features/dashboard/components/`
  - [ ] WelcomeBanner → `features/dashboard/components/`

#### 3.3 Create Dashboard Services
- [ ] Create `src/features/dashboard/services/dashboardService.ts`
- [ ] Move `useDashboard` hook to feature
- [ ] Update all dashboard-related types

### Phase 4: Application Feature Migration 

#### 4.1 Extract Application Screens
- [ ] Create `src/features/application/screens/ApplyScreen/`
  - [ ] Move complex logic from `app/(tabs)/apply.tsx`
  - [ ] Break down into smaller components
- [ ] Create `src/features/application/screens/ApplicationListScreen/`
  - [ ] Move from `app/(tabs)/application.tsx`
- [ ] Create `src/features/application/screens/ApplicationDetailScreen/`
  - [ ] Move from `app/application/[id].tsx`

#### 4.2 Organize Application Components
- [ ] Move step components to feature
  - [ ] `src/screens/apply/steps/*` → `features/application/components/steps/`
- [ ] Move other application components
  - [ ] StepIndicator
  - [ ] DocumentSourceModal
  - [ ] All form-related components

#### 4.3 Extract Application Logic
- [ ] Move `useApplicationForm` hook
- [ ] Move `useDocumentSelection` hook
- [ ] Move `useSubmission` hook
- [ ] Create application service layer
- [ ] Update all imports

### Phase 5: Shared Components & Services 

#### 5.1 Reorganize Shared Components
- [ ] Move truly shared UI components to `src/shared/components/`
  - [ ] Button variations
  - [ ] Input components
  - [ ] Card components
  - [ ] Loading states
  - [ ] Empty states
  - [ ] Error components
- [ ] Update component structure with proper patterns

#### 5.2 Extract Shared Services
- [ ] Create `src/shared/services/api/client.ts`
- [ ] Create `src/shared/services/storage/`
- [ ] Move utility functions to `src/shared/utils/`
- [ ] Create shared hooks in `src/shared/hooks/`

#### 5.3 Update Global Providers
- [ ] Move providers to `src/core/providers/`
- [ ] Update ClerkAndConvexProvider imports
- [ ] Update ToastProvider location
- [ ] Ensure all context providers work

### Phase 6: Import Updates & Testing 

#### 6.1 Update All Imports
- [ ] Run TypeScript compiler to find import errors
- [ ] Update imports in all moved files
- [ ] Update imports in route files
- [ ] Update imports in tests
- [ ] Fix circular dependencies

#### 6.2 Test Each Feature
- [ ] Test auth flows (sign in, sign up, verification)
- [ ] Test dashboard functionality
- [ ] Test application submission flow
- [ ] Test navigation between features
- [ ] Test data persistence

#### 6.3 Code Quality
- [ ] Run linter and fix issues
- [ ] Run TypeScript type check
- [ ] Update tests for new structure
- [ ] Update documentation

### Phase 7: Cleanup & Optimization 

#### 7.1 Remove Old Code
- [ ] Delete moved files from old locations
- [ ] Remove unused imports
- [ ] Clean up temporary code
- [ ] Update file references

#### 7.2 Optimize Bundle
- [ ] Check for duplicate code
- [ ] Ensure proper code splitting
- [ ] Verify lazy loading works
- [ ] Test app performance

#### 7.3 Documentation
- [ ] Update README with new structure
- [ ] Document new architecture patterns
- [ ] Create feature module template
- [ ] Update WARP.md with new structure

## Verification Checklist

### After Each Feature Migration:
- [ ] App builds without errors
- [ ] No TypeScript errors
- [ ] Feature works as before
- [ ] All tests pass
- [ ] No console warnings
- [ ] Navigation works correctly
- [ ] Data fetching works
- [ ] State management intact

### Final Verification:
- [ ] All features working
- [ ] Performance not degraded
- [ ] Bundle size acceptable
- [ ] Code is more maintainable
- [ ] Team can understand new structure

## Rollback Plan
If issues arise:
1. All changes are in `migrationv2` branch
2. Can revert individual features
3. Keep old code until verified
4. Test thoroughly before merging

## Example Migration Pattern

### Before (Navigation-driven):
```typescript
// app/(tabs)/apply.tsx - 300+ lines of mixed concerns
export default function ApplyScreen() {
  // API calls
  // State management
  // Business logic
  // UI rendering
  // Event handlers
  return <View>...</View>;
}
```

### After (Feature-first):
```typescript
// app/(tabs)/apply.tsx - Thin route file
import { ApplyScreen } from '@features/application/screens/ApplyScreen';

export default function ApplyRoute() {
  return <ApplyScreen />;
}

// src/features/application/screens/ApplyScreen/ApplyScreen.tsx
export function ApplyScreen() {
  const { form, handlers } = useApplicationForm();
  
  return (
    <BaseScreen>
      <ApplicationForm {...form} {...handlers} />
    </BaseScreen>
  );
}
```

## Success Metrics
- [ ] Reduced file sizes (no file > 200 lines)
- [ ] Clear separation of concerns
- [ ] Improved testability
- [ ] Faster development for new features
- [ ] Easier onboarding for new developers

## Notes
- Keep PR small and focused
- Test on both iOS and Android
- Get team feedback early
- Document decisions as we go
