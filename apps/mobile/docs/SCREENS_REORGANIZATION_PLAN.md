# Screens Folder Reorganization Plan

## Overview
This document outlines the step-by-step plan to reorganize the `src/screens` folder structure to match the `app/` folder routing structure, ensuring no code breakage during the migration.

## Progress Tracking

### Using the Progress Tracker
A `MIGRATION_PROGRESS.json` file is used to track migration progress. This allows:
- **Resuming after interruption**: Know exactly where the migration stopped
- **Safe rollback**: Track rollback points for each phase
- **Error logging**: Record any errors encountered
- **Status monitoring**: See overall migration status

### How to Use:

1. **Before Starting Each Step**:
   ```javascript
   // Read current progress
   const progress = JSON.parse(fs.readFileSync('MIGRATION_PROGRESS.json'));
   
   // Check where to resume
   if (!progress.phases.phase_1.steps['1_1_create_folders'].completed) {
     // Execute step 1.1
   }
   ```

2. **After Completing Each Step**:
   ```javascript
   // Update progress
   progress.phases.phase_1.steps['1_1_create_folders'].completed = true;
   progress.phases.phase_1.steps['1_1_create_folders'].completed_at = new Date().toISOString();
   
   // Save progress
   fs.writeFileSync('MIGRATION_PROGRESS.json', JSON.stringify(progress, null, 2));
   ```

3. **If Error Occurs**:
   ```javascript
   // Log error
   progress.errors.push({
     phase: 'phase_1',
     step: '1_1_create_folders',
     error: error.message,
     timestamp: new Date().toISOString()
   });
   ```

4. **Creating Rollback Points**:
   ```javascript
   // After successful phase completion
   progress.rollback_points.push({
     phase: 'phase_1',
     timestamp: new Date().toISOString(),
     state: 'folders_created'
   });
   ```

## Current State

### App Folder Structure (Routes)
```
app/
├── (auth)/
│   ├── sign-in.tsx
│   ├── sign-up.tsx
│   ├── reset-password.tsx
│   └── verification.tsx
├── (screens)/
│   ├── (inspector)/
│   │   ├── dashboard.tsx
│   │   ├── inspection-queue.tsx
│   │   ├── review-applications.tsx
│   │   └── scanner.tsx
│   └── (shared)/
│       ├── activity.tsx
│       ├── health-cards.tsx
│       ├── qr-code.tsx
│       └── qr-scanner.tsx
├── (tabs)/
│   ├── index.tsx (dashboard)
│   ├── application.tsx
│   ├── apply.tsx
│   ├── notification.tsx
│   └── profile.tsx
└── index.tsx
```

### Current Screens Folder Structure
```
src/screens/
├── application/
│   ├── ApplicationDetailScreen/
│   ├── ApplicationListScreen/
│   └── ApplyScreen/
├── auth/
│   ├── SignInScreen/
│   ├── SignUpScreen/
│   ├── ResetPasswordScreen/
│   └── VerificationScreen/
├── dashboard/
│   └── DashboardScreen.tsx
├── inspector/
│   ├── InspectorDashboardScreen.tsx
│   ├── InspectionQueueScreen.tsx
│   ├── ReviewApplicationsScreen.tsx
│   └── InspectorScannerScreen.tsx
├── notification/
│   └── NotificationScreen.tsx
├── profile/
│   └── ProfileScreen.tsx
├── shared/
│   ├── ActivityScreen.tsx
│   ├── ChangePasswordScreen.tsx
│   ├── DocumentRequirementsScreen.tsx
│   ├── HealthCardsScreen.tsx
│   ├── PaymentScreen.tsx
│   ├── ProfileEditScreen.tsx
│   ├── QRCodeScreen.tsx
│   ├── QrScannerScreen.tsx
│   └── UploadDocumentsScreen.tsx
└── index.ts
```

## Target Structure

```
src/screens/
├── auth/                           # Authentication flow screens
│   ├── SignInScreen/
│   ├── SignUpScreen/
│   ├── ResetPasswordScreen/
│   ├── VerificationScreen/
│   └── index.ts
├── tabs/                           # Tab navigation screens
│   ├── DashboardScreen/
│   ├── ApplicationListScreen/
│   ├── ApplicationDetailScreen/
│   ├── ApplyScreen/
│   ├── NotificationScreen/
│   ├── ProfileScreen/
│   └── index.ts
├── inspector/                      # Inspector role screens
│   ├── InspectorDashboardScreen/
│   ├── InspectionQueueScreen/
│   ├── ReviewApplicationsScreen/
│   ├── InspectorScannerScreen/
│   └── index.ts
├── shared/                         # Shared screens across features
│   ├── ActivityScreen/
│   ├── ChangePasswordScreen/
│   ├── DocumentRequirementsScreen/
│   ├── HealthCardsScreen/
│   ├── PaymentScreen/
│   ├── ProfileEditScreen/
│   ├── QRCodeScreen/
│   ├── QrScannerScreen/
│   ├── UploadDocumentsScreen/
│   └── index.ts
└── index.ts
```

## Migration Steps

### Phase 1: Create New Folder Structure (No Breaking Changes)

#### Pre-Phase Checklist:
```bash
# 1. Check progress tracker exists
if [ ! -f "MIGRATION_PROGRESS.json" ]; then
  echo "Error: MIGRATION_PROGRESS.json not found!"
  exit 1
fi

# 2. Create backup if not exists
if [ ! -d "src/screens.backup" ]; then
  cp -r src/screens src/screens.backup
  echo "Backup created at src/screens.backup"
fi

# 3. Mark migration as started
# Update MIGRATION_PROGRESS.json: status = "in_progress", started_at = current_timestamp
```

#### Step 1.1: Create Base Folders
```bash
# Note: These folders will be created alongside existing ones temporarily
# Do NOT delete existing folders yet
mkdir src/screens/auth_new
mkdir src/screens/tabs
mkdir src/screens/inspector_new
mkdir src/screens/shared_new
```

**✅ UPDATE PROGRESS:**
```json
// Update MIGRATION_PROGRESS.json immediately:
{
  "phases.phase_1.steps.1_1_create_folders.completed": true,
  "phases.phase_1.steps.1_1_create_folders.completed_at": "<current_timestamp>"
}
```

#### Step 1.2: Create Temporary Index Files
Create index.ts in each new folder that re-exports from old locations:

**src/screens/auth_new/index.ts**
```typescript
// Temporary re-exports from old location
export * from '../auth';
```

**src/screens/tabs/index.ts**
```typescript
// Temporary re-exports from old locations
export * from '../application';
export * from '../dashboard';
export * from '../notification';
export * from '../profile';
```

**src/screens/inspector_new/index.ts**
```typescript
// Temporary re-exports from old location
export * from '../inspector';
```

**src/screens/shared_new/index.ts**
```typescript
// Temporary re-exports from old location
export * from '../shared';
```

**✅ UPDATE PROGRESS:**
```json
// Update MIGRATION_PROGRESS.json immediately:
{
  "phases.phase_1.steps.1_2_create_temp_indexes.completed": true,
  "phases.phase_1.steps.1_2_create_temp_indexes.completed_at": "<current_timestamp>",
  "phases.phase_1.status": "completed",
  "current_phase": 2
}
```

### Phase 2: Move Auth Screens (Low Risk)

#### Step 2.1: Copy Auth Screens
```bash
# Copy (don't move yet) auth screens to new location
cp -r src/screens/auth/* src/screens/auth_new/
```

**✅ UPDATE PROGRESS:**
```json
// Update MIGRATION_PROGRESS.json immediately:
{
  "phases.phase_2.steps.2_1_copy_auth.completed": true,
  "phases.phase_2.steps.2_1_copy_auth.completed_at": "<current_timestamp>"
}
```

#### Step 2.2: Update auth_new/index.ts
```typescript
// src/screens/auth_new/index.ts
export { SignInScreen } from './SignInScreen';
export { SignUpScreen } from './SignUpScreen';
export { ResetPasswordScreen } from './ResetPasswordScreen';
export { VerificationScreen } from './VerificationScreen';
```

**✅ UPDATE PROGRESS:**
```json
// Update MIGRATION_PROGRESS.json immediately:
{
  "phases.phase_2.steps.2_2_update_auth_index.completed": true,
  "phases.phase_2.steps.2_2_update_auth_index.completed_at": "<current_timestamp>"
}
```

#### Step 2.3: Test Auth Screens
Run the app and test all authentication flows work correctly.

```bash
# Run TypeScript check
npx tsc --noEmit
# Test the app
npm run start
```

**✅ UPDATE PROGRESS:**
```json
// Update MIGRATION_PROGRESS.json immediately after testing:
{
  "phases.phase_2.steps.2_3_test_auth.completed": true,
  "phases.phase_2.steps.2_3_test_auth.completed_at": "<current_timestamp>"
}
```

#### Step 2.4: Update Import Paths
Search and replace all imports:
- FROM: `from '@/src/screens/auth'`
- TO: `from '@/src/screens/auth_new'`

#### Step 2.5: Rename Folders
```bash
# Remove old auth folder and rename new one
rm -rf src/screens/auth
mv src/screens/auth_new src/screens/auth
```

#### Step 2.6: Update Import Paths Again
Search and replace all imports:
- FROM: `from '@/src/screens/auth_new'`
- TO: `from '@/src/screens/auth'`

**✅ UPDATE PROGRESS:**
```json
// Update MIGRATION_PROGRESS.json immediately:
{
  "phases.phase_2.steps.2_6_final_imports.completed": true,
  "phases.phase_2.status": "completed",
  "current_phase": 3,
  "rollback_points": [..., {"phase": 2, "timestamp": "<current_timestamp>"}]
}
```

### Phase 3: Move Tab Screens

#### Step 3.1: Move Dashboard Screen
```bash
# Create folder and move files
mkdir src/screens/tabs/DashboardScreen
mv src/screens/dashboard/* src/screens/tabs/DashboardScreen/
```

Update imports:
- FROM: `from '@/src/screens/dashboard'`
- TO: `from '@/src/screens/tabs'`

#### Step 3.2: Move Application Screens
```bash
mv src/screens/application/ApplicationListScreen src/screens/tabs/
mv src/screens/application/ApplicationDetailScreen src/screens/tabs/
mv src/screens/application/ApplyScreen src/screens/tabs/
```

#### Step 3.3: Move Notification Screen
```bash
mkdir src/screens/tabs/NotificationScreen
mv src/screens/notification/* src/screens/tabs/NotificationScreen/
```

#### Step 3.4: Move Profile Screen
```bash
mkdir src/screens/tabs/ProfileScreen
mv src/screens/profile/* src/screens/tabs/ProfileScreen/
```

#### Step 3.5: Update tabs/index.ts
```typescript
// src/screens/tabs/index.ts
export { DashboardScreen } from './DashboardScreen';
export { ApplicationListScreen } from './ApplicationListScreen';
export { ApplicationDetailScreen } from './ApplicationDetailScreen';
export { ApplyScreen } from './ApplyScreen';
export { NotificationScreen } from './NotificationScreen';
export { ProfileScreen } from './ProfileScreen';
```

#### Step 3.6: Test Tab Navigation
Test all tab screens are accessible and working.

```bash
# Run TypeScript check
npx tsc --noEmit
# Test navigation
npm run start
```

**✅ UPDATE PROGRESS:**
```json
// Update MIGRATION_PROGRESS.json immediately after testing:
{
  "phases.phase_3.steps.3_6_test_tabs.completed": true,
  "phases.phase_3.status": "completed",
  "current_phase": 4,
  "rollback_points": [..., {"phase": 3, "timestamp": "<current_timestamp>"}]
}
```

### Phase 4: Move Inspector Screens

#### Step 4.1: Move All Inspector Screens
```bash
# Create individual folders for each screen
mkdir src/screens/inspector_new/InspectorDashboardScreen
mkdir src/screens/inspector_new/InspectionQueueScreen
mkdir src/screens/inspector_new/ReviewApplicationsScreen
mkdir src/screens/inspector_new/InspectorScannerScreen

# Move files
mv src/screens/inspector/InspectorDashboardScreen.tsx src/screens/inspector_new/InspectorDashboardScreen/
mv src/screens/inspector/InspectionQueueScreen.tsx src/screens/inspector_new/InspectionQueueScreen/
mv src/screens/inspector/ReviewApplicationsScreen.tsx src/screens/inspector_new/ReviewApplicationsScreen/
mv src/screens/inspector/InspectorScannerScreen.tsx src/screens/inspector_new/InspectorScannerScreen/
```

#### Step 4.2: Create index.ts for each screen
For each screen folder, create an index.ts:
```typescript
// Example: src/screens/inspector_new/InspectorDashboardScreen/index.ts
export { InspectorDashboardScreen } from './InspectorDashboardScreen';
```

#### Step 4.3: Update inspector_new/index.ts
```typescript
// src/screens/inspector_new/index.ts
export * from './InspectorDashboardScreen';
export * from './InspectionQueueScreen';
export * from './ReviewApplicationsScreen';
export * from './InspectorScannerScreen';
```

#### Step 4.4: Rename Folder
```bash
# Remove old inspector folder and rename new one
rm -rf src/screens/inspector
mv src/screens/inspector_new src/screens/inspector
```

**✅ UPDATE PROGRESS:**
```json
// Update MIGRATION_PROGRESS.json immediately:
{
  "phases.phase_4.steps.4_4_rename_folder.completed": true,
  "phases.phase_4.status": "completed",
  "current_phase": 5,
  "rollback_points": [..., {"phase": 4, "timestamp": "<current_timestamp>"}]
}
```

### Phase 5: Move Shared Screens

#### Step 5.1: Create Folders and Move Files
```bash
# Create all folders first
mkdir src/screens/shared_new/ActivityScreen
mkdir src/screens/shared_new/ChangePasswordScreen
mkdir src/screens/shared_new/DocumentRequirementsScreen
mkdir src/screens/shared_new/HealthCardsScreen
mkdir src/screens/shared_new/PaymentScreen
mkdir src/screens/shared_new/ProfileEditScreen
mkdir src/screens/shared_new/QRCodeScreen
mkdir src/screens/shared_new/QrScannerScreen
mkdir src/screens/shared_new/UploadDocumentsScreen

# Move all files
mv src/screens/shared/ActivityScreen.tsx src/screens/shared_new/ActivityScreen/
mv src/screens/shared/ChangePasswordScreen.tsx src/screens/shared_new/ChangePasswordScreen/
mv src/screens/shared/DocumentRequirementsScreen.tsx src/screens/shared_new/DocumentRequirementsScreen/
mv src/screens/shared/HealthCardsScreen.tsx src/screens/shared_new/HealthCardsScreen/
mv src/screens/shared/PaymentScreen.tsx src/screens/shared_new/PaymentScreen/
mv src/screens/shared/ProfileEditScreen.tsx src/screens/shared_new/ProfileEditScreen/
mv src/screens/shared/QRCodeScreen.tsx src/screens/shared_new/QRCodeScreen/
mv src/screens/shared/QrScannerScreen.tsx src/screens/shared_new/QrScannerScreen/
mv src/screens/shared/UploadDocumentsScreen.tsx src/screens/shared_new/UploadDocumentsScreen/
```

#### Step 5.2: Add Default Exports
Ensure each screen has both named and default exports:
```typescript
// Example: ActivityScreen.tsx
function ActivityScreen() { /* ... */ }
export default ActivityScreen;
export { ActivityScreen };
```

#### Step 5.3: Create index.ts for each
```typescript
// Example: src/screens/shared_new/ActivityScreen/index.ts
export { default as ActivityScreen } from './ActivityScreen';
```

#### Step 5.4: Update shared_new/index.ts
```typescript
// src/screens/shared_new/index.ts
export * from './ActivityScreen';
export * from './ChangePasswordScreen';
export * from './DocumentRequirementsScreen';
export * from './HealthCardsScreen';
export * from './PaymentScreen';
export * from './ProfileEditScreen';
export * from './QRCodeScreen';
export * from './QrScannerScreen';
export * from './UploadDocumentsScreen';
```

#### Step 5.5: Rename Folder
```bash
# Remove old shared folder and rename new one
rm -rf src/screens/shared
mv src/screens/shared_new src/screens/shared
```

**✅ UPDATE PROGRESS:**
```json
// Update MIGRATION_PROGRESS.json immediately:
{
  "phases.phase_5.steps.5_5_rename_folder.completed": true,
  "phases.phase_5.status": "completed",
  "current_phase": 6,
  "rollback_points": [..., {"phase": 5, "timestamp": "<current_timestamp>"}]
}
```

### Phase 6: Update Main Index

#### Step 6.1: Update src/screens/index.ts
```typescript
// src/screens/index.ts
export * from './auth';
export * from './tabs';
export * from './inspector';
export * from './shared';
```

#### Step 6.2: Remove Old Folders
```bash
rm -rf src/screens/application
rm -rf src/screens/notification
rm -rf src/screens/profile
rm -rf src/screens/dashboard
# Note: inspector and shared folders should already be removed in previous phases
```

**✅ UPDATE PROGRESS:**
```json
// Update MIGRATION_PROGRESS.json immediately:
{
  "phases.phase_6.steps.6_2_remove_old_folders.completed": true,
  "phases.phase_6.status": "completed",
  "current_phase": 7
}
```

### Phase 7: Update Route Files

#### Step 7.1: Update Import Paths in app/ folder
Update all screen imports in route files:

**app/(auth)/sign-in.tsx**
```typescript
// No change needed - already using:
import { SignInScreen } from '@/src/screens/auth';
```

**app/(tabs)/index.tsx**
```typescript
// FROM
import { DashboardScreen } from '@/src/screens/dashboard';
// TO
import { DashboardScreen } from '@/src/screens/tabs';
```

**app/(tabs)/application.tsx**
```typescript
// FROM
import { ApplicationListScreen } from '@/src/screens/application';
// TO
import { ApplicationListScreen } from '@/src/screens/tabs';
```

**app/(tabs)/apply.tsx**
```typescript
// FROM
import { ApplyScreen } from '@/src/screens/application';
// TO  
import { ApplyScreen } from '@/src/screens/tabs';
```

### Phase 8: Global Import Updates

#### Step 8.1: Search and Replace Imports
Use IDE's search and replace functionality to update all imports:

| Old Import | New Import |
|------------|------------|
| `@/src/screens/auth` | `@/src/screens/auth` (no change) |
| `@/src/screens/application` | `@/src/screens/tabs` |
| `@/src/screens/dashboard` | `@/src/screens/tabs` |
| `@/src/screens/notification` | `@/src/screens/tabs` |
| `@/src/screens/profile` | `@/src/screens/tabs` |
| `@/src/screens/inspector` | `@/src/screens/inspector` (no change) |
| `@/src/screens/shared` | `@/src/screens/shared` (no change) |
| `from '../screens/application'` | `from '../screens/tabs'` |
| `from '../screens/dashboard'` | `from '../screens/tabs'` |
| `from '../screens/notification'` | `from '../screens/tabs'` |
| `from '../screens/profile'` | `from '../screens/tabs'` |

**✅ UPDATE PROGRESS:**
```json
// Update MIGRATION_PROGRESS.json immediately after completing all replacements:
{
  "phases.phase_8.steps.8_1_global_search_replace.completed": true,
  "phases.phase_8.status": "completed",
  "status": "completed",
  "completed_at": "<current_timestamp>"
}
```

**🎉 MIGRATION COMPLETE!**
Run the validation script to ensure everything is working:
```bash
bash validate_migration.sh
```

## Testing Checklist

### After Each Phase, Test:
- [ ] App compiles without errors
- [ ] No TypeScript errors
- [ ] All screens are accessible
- [ ] Navigation works correctly
- [ ] No console errors

### Specific Test Cases:

#### Authentication Flow
- [ ] Sign in works
- [ ] Sign up works
- [ ] Password reset works
- [ ] Verification works

#### Tab Navigation
- [ ] Dashboard loads
- [ ] Application list loads
- [ ] Application details load
- [ ] Apply form works
- [ ] Notifications load
- [ ] Profile loads

#### Inspector Features
- [ ] Inspector dashboard loads
- [ ] Inspection queue works
- [ ] Review applications works
- [ ] Scanner works

#### Shared Screens
- [ ] Activity screen loads
- [ ] Health cards screen works
- [ ] QR code screen works
- [ ] QR scanner works
- [ ] Payment screen works
- [ ] Document upload works

## Progress Recovery Instructions

### If Migration is Interrupted:

1. **Check Current Progress**:
   ```bash
   # Check which phase and step was last completed
   cat MIGRATION_PROGRESS.json | grep -A2 '"completed": true' | tail -3
   ```

2. **Verify File System State**:
   ```bash
   # List current folders to understand state
   ls -la src/screens/
   ```

3. **Resume from Last Completed Step**:
   - Check `MIGRATION_PROGRESS.json` for last completed step
   - Start from the next uncompleted step
   - Run tests for the last completed phase before continuing

### Automated Resume Script:
```bash
#!/bin/bash
# resume_migration.sh

# Read progress and determine next step
CURRENT_PHASE=$(cat MIGRATION_PROGRESS.json | jq -r '.current_phase')
echo "Resuming from Phase $CURRENT_PHASE"

# Continue based on phase
case $CURRENT_PHASE in
  1) echo "Continuing Phase 1..." ;;
  2) echo "Continuing Phase 2..." ;;
  # ... etc
esac
```

## Rollback Plan

If issues occur at any phase:

1. **Git Rollback**: If using version control
   ```bash
   git stash
   git checkout .
   ```

2. **Manual Rollback**: 
   - Keep backup of original structure
   - Restore from backup if needed
   ```bash
   # Before starting, create backup
   cp -r src/screens src/screens.backup
   
   # If rollback needed
   rm -rf src/screens
   mv src/screens.backup src/screens
   ```

## Validation Script

### Create validation script to check migration success:
```bash
#!/bin/bash
# validate_migration.sh

echo "Validating migration..."

# Check folder structure
if [ -d "src/screens/tabs" ] && [ -d "src/screens/auth" ] && [ -d "src/screens/inspector" ] && [ -d "src/screens/shared" ]; then
  echo "✅ Folder structure correct"
else
  echo "❌ Folder structure incorrect"
  exit 1
fi

# Check old folders are removed
if [ ! -d "src/screens/application" ] && [ ! -d "src/screens/dashboard" ] && [ ! -d "src/screens/notification" ] && [ ! -d "src/screens/profile" ]; then
  echo "✅ Old folders removed"
else
  echo "❌ Old folders still exist"
  exit 1
fi

# Run TypeScript check
npx tsc --noEmit
if [ $? -eq 0 ]; then
  echo "✅ TypeScript compilation successful"
else
  echo "❌ TypeScript errors found"
  exit 1
fi

echo "✅ Migration validated successfully!"
```

## Success Criteria

- ✅ All screens organized in new structure
- ✅ No broken imports
- ✅ All tests pass
- ✅ No runtime errors
- ✅ Code compiles successfully
- ✅ TypeScript has no errors
- ✅ Navigation works as expected
- ✅ All features functional

## Notes for Implementation

1. **Use TypeScript Compiler**: Run `tsc --noEmit` after each phase to catch errors early
2. **Test Incrementally**: Don't move all screens at once
3. **Backup First**: Always keep a backup before major changes
4. **Update Imports Carefully**: Use IDE's refactoring tools when possible
5. **Document Changes**: Keep track of what's been moved

## Estimated Time

- Phase 1: 15 minutes (Create structure)
- Phase 2: 30 minutes (Auth screens)
- Phase 3: 45 minutes (Tab screens)
- Phase 4: 30 minutes (Inspector screens)
- Phase 5: 45 minutes (Shared screens)
- Phase 6-8: 30 minutes (Cleanup and testing)
- **Total: ~3.5 hours**

## Post-Migration Tasks

1. Update documentation
2. Update developer onboarding guides
3. Update import aliases if using path mapping
4. Consider updating ESLint/Prettier configs if needed
5. Update any CI/CD scripts that reference screen paths
