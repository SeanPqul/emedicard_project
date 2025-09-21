# Migration V2 Archive - September 21, 2025

This directory contains files that were archived as part of the Mobile App Architecture Migration V2.

## Archive Date
September 21, 2025 at 05:17 UTC

## Migration Context
These files were archived after completing phases 1-5 of the migration plan, which involved:
- Moving from a navigation-driven architecture to a feature-first architecture
- Reorganizing code into feature modules (auth, dashboard, application)
- Extracting shared components and services
- Creating a clean separation of concerns

## Archived Contents

### 1. components_auth/
Original location: `src/components/auth/`
- **OtpInputUI.tsx** - Migrated to `src/features/auth/components/OtpInput/`
- **PasswordStrengthIndicator.tsx** - Migrated to `src/features/auth/components/PasswordStrengthIndicator/`
- **SignOutButton.tsx** - Migrated to `src/features/auth/components/SignOutButton/`
- **VerificationPage.tsx** - Migrated to `src/features/auth/components/VerificationPage/`
- **index.ts** - Barrel export file

### 2. components_dashboard/
Original location: `src/components/dashboard/`
- **ApplicationStatus.tsx** - Migrated to `src/features/dashboard/components/ApplicationStatus/`
- **DashboardHeader.tsx** - Migrated to `src/features/dashboard/components/DashboardHeader/`
- **HealthCardStatus.tsx** - Migrated to `src/features/dashboard/components/HealthCardStatus/`
- **OfflineBanner.tsx** - Migrated to `src/shared/components/OfflineBanner/` (shared component)
- **PriorityAlerts.tsx** - Migrated to `src/features/dashboard/components/PriorityAlerts/`
- **QuickActionsGrid.tsx** - Migrated to `src/features/dashboard/components/QuickActionsGrid/`
- **RecentActivityList.tsx** - Migrated to `src/features/dashboard/components/RecentActivityList/`
- **StatsOverview.tsx** - Migrated to `src/features/dashboard/components/StatsOverview/`
- **WelcomeBanner.tsx** - Migrated to `src/features/dashboard/components/WelcomeBanner/`
- **index.ts** - Barrel export file

### 3. screens_apply/ (Already removed)
Original location: `src/screens/apply/`
This directory was already removed in a previous cleanup phase, but contained:
- Application step components that were migrated to `src/features/application/components/steps/`
- StepIndicator and DocumentSourceModal migrated to `src/features/application/components/`

### 4. components_application_duplicates/
Original location: `src/components/application/`
Removed on September 21, 2025 at 05:30 UTC
- **ApplicationTypeStep.tsx** - Duplicate of migrated version in `src/features/application/components/steps/ApplicationTypeStep/`
- **JobCategoryStep.tsx** - Duplicate of migrated version in `src/features/application/components/steps/JobCategoryStep/`
- **PersonalDetailsStep.tsx** - Duplicate of migrated version in `src/features/application/components/steps/PersonalDetailsStep/`
- **StepIndicator.tsx** - Duplicate of migrated version in `src/features/application/components/StepIndicator/`
- **index.ts** - Barrel export file

## Migration Status
- ✅ Auth feature - Fully migrated
- ✅ Dashboard feature - Fully migrated
- ✅ Application feature - Fully migrated
- ✅ Shared components reorganized
- ✅ Global providers moved to core
- 🚧 Import updates in progress (Phase 6.1)

## Features Not Yet Migrated
The following features remain in their original locations and have NOT been migrated:
- Payment (`src/components/payment/`)
- Profile 
- Health Card
- Notification
- Scanner (`src/components/scanner/`)
- Upload (`src/components/upload/`)
- Other UI components in `src/components/`

## Important Notes
1. These archived files should be kept until the migration is fully tested and verified
2. After successful testing, these files can be permanently deleted
3. The new feature-based structure provides better organization and maintainability
4. All imports in the project have been updated to point to the new locations

## Rollback Instructions
If needed, these files can be restored to their original locations:
```powershell
# Restore auth components
Move-Item -Path "components_auth" -Destination "../../components/auth" -Force

# Restore dashboard components
Move-Item -Path "components_dashboard" -Destination "../../components/dashboard" -Force
```

However, note that imports throughout the codebase have been updated to use the new locations, so a full rollback would require reverting those changes as well.
