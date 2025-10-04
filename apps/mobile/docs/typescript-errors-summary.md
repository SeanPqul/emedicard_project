# TypeScript Errors Summary

## Current Status
- **Total Errors**: 94 errors across 45 files
- **Previous**: 106 errors
- **Improvement**: Reduced by 12 errors

## Error Categories

### 1. Critical Frontend Errors (High Priority)

#### useDocumentSelection.ts
- **Error**: `size` property type mismatch - `number | undefined` vs `number`
- **Location**: Line 146
- **Impact**: Document upload queue functionality

#### useOptimizedDashboard.ts (4 errors)
- Missing `requirements` and `isActive` properties in JobCategory type
- Missing `userId` property in notifications
- Type mismatch in jobCategories state

#### ApplicationStatus.tsx
- `nextStep` can be `undefined` but type expects `string | null`

#### JobCategoryStep & ReviewStep
- `requireOrientation` type comparison issues (boolean vs string)

### 2. Backend Errors (High Priority)

#### Backend Convex Files (8 errors)
- `../../backend/convex/admin/adminMain.ts`: Missing return statements
- `../../backend/convex/admin/seed.ts`: `Id<>` type potentially undefined (3 errors)
- `../../backend/convex/users/usersMain.ts`: Username split can be undefined (2 errors)

### 3. Payment Flow Errors

#### mayaPaymentFlow/model/hooks.ts
- `paymentId` type mismatch: `string` vs `Id<"payments">`
- Return type mismatch in PaymentResult

#### Payment Widget & Screens
- Missing `PaymentMethod` export (should be `PaymentMethodId`)
- Theme property access issues (main, light, info, white, xxs)

### 4. Backup Files Errors (Low Priority - 31 errors)
Most errors in `src/screens.backup/` folder:
- Missing exports: `useUsers`, `useJobCategories`, `JobCategory`
- Navigation type mismatches
- EmptyState prop mismatches
- Type inference issues

### 5. Style & Design System Errors (11 errors)

#### Theme/Style Issues
- Missing theme properties: `main`, `light`, `info`, `white`, `xxs`
- Invalid spacing/border radius values: `'xs'`, `'xxxxl'`
- Typography issues: `bodyMedium` not in type, missing `DesignSystemTextProps`

#### Component Style Issues
- Input.tsx: InputState/InputVariant type mismatches
- ResponsiveLayout: flexBasis and alignSelf type issues
- Text component: Missing type exports

### 6. Utility & Helper Errors

#### lazyLoad.tsx (3 errors)
- Generic type constraint issues
- displayName property access
- undefined array element

#### storageService.ts
- Readonly array type mismatch

### 7. Type Export/Import Errors
- `UseAbandonedPaymentOptions` doesn't exist (should be `useAbandonedPayment`)
- `PaymentMethod` doesn't exist (should be `PaymentMethodId`)
- Various missing exports in entity modules

## Recommended Next Steps

### Immediate Fixes (Top 5)
1. Fix `useDocumentSelection.ts` size property handling
2. Fix `useOptimizedDashboard.ts` JobCategory type issues
3. Fix backend convex undefined handling (seed.ts, usersMain.ts)
4. Fix mayaPaymentFlow payment ID type
5. Fix ApplicationStatus nextStep undefined handling

### Medium Priority
6. Fix requireOrientation boolean/string comparison
7. Update PaymentMethod imports to PaymentMethodId
8. Fix theme property access in PaymentWidget

### Low Priority (Can defer)
9. Clean up or fix backup files
10. Update design system type definitions
11. Fix style helper function type definitions

## Files to Focus On

### Frontend Core (Must Fix)
- `src/features/application/hooks/useDocumentSelection.ts`
- `src/features/dashboard/hooks/useOptimizedDashboard.ts`
- `src/features/dashboard/components/ApplicationStatus/ApplicationStatus.tsx`
- `src/processes/mayaPaymentFlow/model/hooks.ts`

### Backend (Must Fix)
- `../../backend/convex/admin/adminMain.ts`
- `../../backend/convex/admin/seed.ts`
- `../../backend/convex/users/usersMain.ts`

### Can Defer
- All files in `src/screens.backup/`
- Style/theme files (unless actively causing runtime issues)
- Utility type constraint improvements

## Progress Notes
- Successfully fixed verification hooks query parameters
- Eliminated errors in useDocumentUpload, useRequirements, useJobCategories, useNotifications
- Reduced total errors from initial 122 to current 94 (23% improvement)
