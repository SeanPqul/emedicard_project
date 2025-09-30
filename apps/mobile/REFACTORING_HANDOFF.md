# FSD Architecture Refactoring Handoff

## 📋 What We've Done So Far

### 1. **Type System Refactoring** ✅
- Moved business domain types from screen layers to entities layer
- `ApplicationDetails`, `ApplicationWithDetails`, `PaymentMethod` now live in `src/entities/application/model/types.ts`
- Screen type files now only contain screen-specific types (props, state, UI constants)

### 2. **Screens Refactoring - Completed** ✅

#### **DashboardScreen** ✅
- **Before**: In folder with styles file
- **After**: 48 lines, flattened to single file
- **Pattern**: Perfect example - no types file needed!

#### **ApplicationDetailScreen** ✅
- **Before**: 314 lines in folder structure
- **After**: 99 lines, flattened to single file
- **Business logic**: Extracted to `useApplicationDetail` hook
- **UI**: Moved to `ApplicationDetailWidget`

#### **ApplicationListScreen** ✅
- **Before**: 361 lines + 279 lines styles = 640+ total
- **After**: 72 lines, flattened to single file
- **Business logic**: Extracted to `useApplicationList` hook (149 lines)
- **UI**: Moved to `ApplicationListWidget` (282 lines)
- **Constants**: STATUS_COLORS, FILTER_OPTIONS moved to widget

#### Before (314 lines, everything mixed):
```
ApplicationDetailScreen/
├── ApplicationDetailScreen.tsx (had everything - UI, logic, API calls)
├── ApplicationDetailScreen.types.ts (had business types + screen types)
└── ApplicationDetailScreen.styles.ts (all styles)
```

#### After (78 lines, clean separation):
```
ApplicationDetailScreen/
├── ApplicationDetailScreen.tsx (thin orchestrator - only 78 lines!)
├── ApplicationDetailScreen.types.ts (only screen props)
└── index.ts

widgets/application-detail/
├── ApplicationDetailWidget.tsx (UI composition)
├── ApplicationDetailWidget.styles.ts (all UI styles)
└── index.ts

features/application/hooks/
└── useApplicationDetail.ts (all business logic)
```

## 🎯 The Refactoring Pattern (Follow This!)

### Step 1: Create the Hook
Extract ALL business logic into a custom hook in `features/[feature-name]/hooks/`:
```typescript
// useApplicationDetail.ts
export function useApplicationDetail(id: string) {
  // All state management
  // API calls
  // Event handlers
  // Utility functions
  
  return {
    data,
    loading,
    handlers,
    utilities
  };
}
```

### Step 2: Create the Widget
Move ALL UI rendering to a widget in `widgets/[widget-name]/`:
```typescript
// ApplicationDetailWidget.tsx
export function ApplicationDetailWidget({ data, handlers }) {
  // Pure UI composition
  // No business logic
  // Just rendering
}
```

### Step 3: Refactor the Screen
Make it a thin orchestrator in `screens/tabs/[screen-name]/`:
```typescript
// ApplicationDetailScreen.tsx
export function ApplicationDetailScreen() {
  const data = useHook();
  
  if (data.isLoading) return <LoadingView />;
  
  return (
    <BaseScreen>
      <Widget {...data} />
    </BaseScreen>
  );
}
```

### Step 4: Clean Up
- Move styles to widget folder
- Remove unnecessary files from screen folder
- Keep only: `Screen.tsx`, `Screen.types.ts`, `index.ts`

## 📝 Screens Still Needing Refactoring

### Priority 1 - Tab Screens
- [✅] **ApplyScreen** - Multi-step form (COMPLETED - see completion notes below)
- [✅] **ProfileScreen** - Refactored from 129 to 39 lines (COMPLETED)
- [ ] **NotificationScreen** - 300+ lines, heavy logic to extract

### Priority 2 - Auth Screens
- [ ] **SignInScreen** - 188 lines, auth logic mixed with UI
- [ ] **SignUpScreen** - Similar pattern needed
- [ ] **VerificationScreen** - Can reuse existing VerificationPage component

## 📊 Current Structure Status

### Flattened (Complete) ✅
```
tabs/
├── DashboardScreen.tsx (48 lines)
├── ApplicationDetailScreen.tsx (99 lines)
├── ApplicationListScreen.tsx (72 lines)
├── ApplyScreen.tsx (116 lines)
├── ProfileScreen.tsx (39 lines)
└── index.ts
```

### Still in Folders (Need Work) 🚧
```
tabs/
└── NotificationScreen/
    ├── NotificationScreen.tsx
    └── index.ts
```

## 🏗️ The Target Architecture

```
app/(tabs)/                        # Navigation entry points
    └── application.tsx            # Just exports from screens

src/screens/tabs/                  # Thin orchestrators
    └── ApplicationScreen/         
        ├── ApplicationScreen.tsx  # ~80 lines max
        ├── types.ts              # Screen props only
        └── index.ts

src/widgets/                       # UI composition
    └── application/
        ├── ApplicationWidget.tsx  # Composes features
        └── styles.ts              # All UI styles

src/features/                      # Business logic
    └── application/
        ├── components/            # Reusable feature components
        ├── hooks/                 # Business logic hooks
        └── types.ts               # Feature-specific types

src/entities/                      # Domain models
    └── application/
        └── model/types.ts         # Business entities
```

## ✅ Checklist for Each Screen Refactoring

1. **Analyze Current Screen**
   - [ ] Count lines of code
   - [ ] Identify business logic vs UI
   - [ ] List all API calls and state

2. **Extract Business Logic**
   - [ ] Create custom hook in features
   - [ ] Move all API calls
   - [ ] Move state management
   - [ ] Move event handlers

3. **Create Widget**
   - [ ] Move all JSX to widget
   - [ ] Copy styles to widget folder
   - [ ] Make it accept props from hook

4. **Refactor Screen**
   - [ ] Import hook and widget
   - [ ] Handle loading/error states
   - [ ] Pass data to widget
   - [ ] Should be <100 lines

5. **Clean Up**
   - [ ] Remove unused styles from screen
   - [ ] Update imports
   - [ ] Test everything works

## 🎨 Good Examples to Follow

### Best Examples to Follow ⭐

1. **DashboardScreen** (48 lines)
   - No types file needed
   - Minimal inline styles
   - Perfect thin orchestrator

2. **ApplicationListScreen** (72 lines)
   - Heavy refactoring success story
   - From 361 → 72 lines (80% reduction!)
   - Complex state management extracted

3. **ApplicationDetailScreen** (99 lines)
   - Navigation types inline
   - Business logic in hook
   - UI in widget

## 🚫 Anti-Patterns to Avoid

1. **Don't create new components** - Extract existing code
2. **Don't mix concerns** - Separate UI, logic, and types
3. **Don't keep business logic in screens** - Move to hooks
4. **Don't define business types in screen layers** - Use entities
5. **Don't keep unused files** - Clean up after refactoring

## 💡 Tips

- Start with the biggest screens first (most impact)
- Test after each step to ensure nothing breaks
- Keep the screen under 100 lines
- If a widget gets too big, break it into smaller feature components
- Reuse existing hooks where possible

## 🔄 Next Steps

1. **NotificationScreen** - Most complex (300+ lines) - LAST TAB SCREEN
2. **Auth Screens** - SignInScreen, SignUpScreen, VerificationScreen
3. **Shared Screens** - PaymentScreen, DocumentRequirementsScreen, etc.

## 📝 ApplyScreen Responsive Theme Update - COMPLETED ✅ (2025-09-30)

### Full Responsive Theme Pattern Migration Complete

ApplyScreen and all 10 related components have been fully updated to use the responsive theme pattern, replacing all old utility functions.

**📄 Full Documentation:** See `docs/APPLYSCREEN_RESPONSIVE_UPDATE.md` for complete details.

### Summary of Changes
- **17 files** updated across 10 components
- **35+ icon instances** made responsive with `moderateScale()`
- **All old utility functions removed** (`getColor`, `getSpacing`, `getBorderRadius`, `getTypography`, `getShadow`)
- **All old responsive utils removed** (`hp`, `wp`, `scaleFont`)
- **100% adoption** of new responsive theme pattern

### Components Updated
1. ✅ ApplyScreen.tsx - Loading state styles
2. ✅ StepIndicator - Icons and typography responsive
3. ✅ DocumentSourceModal - All dimensions responsive
4. ✅ ApplicationTypeStep - Complete refactor to theme pattern
5. ✅ JobCategoryStep - Icons, colors, and styles updated
6. ✅ PersonalDetailsStep - Inputs and icons responsive
7. ✅ UploadDocumentsStep - Largest update (241 lines)
8. ✅ PaymentMethodStep - Payment colors use semantic theme
9. ✅ ReviewStep - Complete refactor (244 lines)

### TypeScript Errors Fixed
- ✅ `theme.colors.shadow` → Used `'#000'` for shadowColor
- ✅ `theme.spacing.xxs` → Used hardcoded `2` with responsive wrappers
- ✅ All ApplyScreen-related typecheck errors resolved

### Pattern Applied
```typescript
// Before (Old Pattern ❌)
import { getColor, getSpacing } from '@shared/styles/theme';
import { hp, wp, scaleFont as sp } from '@shared/utils/responsive';

// After (New Pattern ✅)
import { theme } from '@shared/styles/theme';
import { scale, verticalScale, moderateScale } from '@shared/utils/responsive';
```

**Status:** Production Ready ✅  
**Typecheck:** Passed ✅

---

## 📝 ApplyScreen Detailed Analysis (Original Notes)

### Current Implementation Discovery

#### Master Components Location
```
screens/apply/
├── components/
│   ├── DocumentSourceModal.tsx
│   └── StepIndicator.tsx
└── steps/
    ├── ApplicationTypeStep.tsx    # Uses full formData interface
    ├── JobCategoryStep.tsx         # Uses full formData interface  
    ├── PaymentMethodStep.tsx       # Uses full formData interface
    ├── PersonalDetailsStep.tsx     # Uses full formData interface
    ├── ReviewStep.tsx              # Uses full formData interface
    ├── UploadDocumentsStep.tsx     # Uses full formData interface
    └── index.ts
```

#### Key Finding: Step Component Interface Pattern
**IMPORTANT**: The master step components use FULL formData objects, not individual values:

```typescript
// Master pattern (CORRECT - what's working)
interface StepProps {
  formData: ApplicationFormData;           // Full object
  setFormData: (data: ApplicationFormData) => void;  // Full setter
  errors: Record<string, string>;
  jobCategoriesData?: JobCategory[];       // For some steps
}

// NOT the simplified pattern (which caused type errors)
interface StepProps {
  value: string;                          // ❌ Individual values
  onChange: (value: string) => void;     // ❌ Individual setters
}
```

#### ApplicationFormData Type
```typescript
interface ApplicationFormData {
  applicationType: 'New' | 'Renew';
  jobCategory: string;
  position: string;
  organization: string;
  civilStatus: 'Single' | 'Married' | 'Divorced' | 'Widowed' | 'Separated';
  paymentMethod?: 'Gcash' | 'Maya' | 'BaranggayHall' | 'CityHall' | '';
  paymentReference?: string;
}
```

#### Existing Hook: useApplicationForm
- **Location**: `src/hooks/useApplicationForm.ts` (291 lines)
- **Features**:
  - Complete form state management
  - Step navigation (next/previous)
  - Validation per step
  - Document handling with MMKV queue
  - Form persistence/restoration
  - Error handling
  - Upload state tracking

### Target FSD Structure for ApplyScreen

```
src/
├── features/
│   └── application/
│       ├── components/
│       │   └── steps/
│       │       ├── ApplicationTypeStep.tsx    # Copy from master
│       │       ├── JobCategoryStep.tsx        # Copy from master
│       │       ├── PaymentMethodStep.tsx      # Copy from master
│       │       ├── PersonalDetailsStep.tsx    # Copy from master
│       │       ├── ReviewStep.tsx             # Copy from master
│       │       ├── UploadDocumentsStep.tsx    # Copy from master
│       │       └── index.ts
│       ├── hooks/
│       │   └── index.ts  # Re-export useApplicationForm from global hooks
│       └── index.ts
├── widgets/
│   └── apply/
│       ├── ui/
│       │   ├── ApplyWidget.tsx              # Main widget
│       │   ├── StepIndicator.tsx            # Copy from master
│       │   └── DocumentSourceModal.tsx      # Copy from master
│       ├── styles/
│       │   └── apply-widget.styles.ts       # Move styles here
│       └── index.ts
└── screens/
    └── tabs/
        └── ApplyScreen.tsx                   # Thin wrapper (<50 lines)
```

### Migration Steps for ApplyScreen

1. **Create folder structure**
   ```powershell
   # Create widgets structure
   New-Item -ItemType Directory -Path "src/widgets/apply/ui" -Force
   New-Item -ItemType Directory -Path "src/widgets/apply/styles" -Force
   
   # Create features structure  
   New-Item -ItemType Directory -Path "src/features/application/components/steps" -Force
   New-Item -ItemType Directory -Path "src/features/application/hooks" -Force
   ```

2. **Copy step components** from `screens/apply/steps/` to `features/application/components/steps/`
   - Keep the full formData interface pattern
   - Update import paths for styles and components

3. **Create ApplyWidget** that:
   - Uses useApplicationForm hook
   - Renders step components with full formData
   - Handles step navigation UI

4. **Create thin ApplyScreen wrapper**:
   ```typescript
   // screens/tabs/ApplyScreen.tsx (~30 lines)
   import React from 'react';
   import { ApplyWidget } from '../../widgets/apply';
   
   export const ApplyScreen: React.FC = () => {
     return <ApplyWidget />;
   };
   ```

### Critical Implementation Notes

1. **Don't change the step component interface** - They need full formData
2. **Styles are in** `src/styles/screens/tabs-apply-forms.ts` - need to be moved/referenced
3. **Dependencies to preserve**:
   - `@clerk/clerk-expo` for user profile
   - `@expo/vector-icons` for icons
   - `expo-router` for navigation
4. **Document handling is complex** - UploadDocumentsStep has intricate logic
5. **The hook is ready** - useApplicationForm is comprehensive

### Files to Reference
- Master steps: `src/screens/apply/steps/*.tsx`
- Main hook: `src/hooks/useApplicationForm.ts`
- Styles: `src/styles/screens/tabs-apply-forms.ts`
- Components: `src/screens/apply/components/*.tsx`

## 🎯 Key Patterns Learned

### 1. **Flattened Structure**
- Single .tsx file in tabs root
- No separate folders unless absolutely necessary
- Types inline if minimal (navigation props)
- Styles inline if minimal (<10 styles)

### 2. **Line Count Targets**
- Screen: < 100 lines (ideally 50-75)
- Hook: As needed for logic
- Widget: As needed for UI

### 3. **What Goes Where**
- **Screen**: Loading states, error boundaries, orchestration
- **Hook**: All business logic, API calls, state management
- **Widget**: All UI rendering, styles, UI constants
- **Entities**: Business types and models

Remember: The goal is to make screens thin orchestrators that only handle loading states and delegate to widgets!

## 📝 ApplyScreen Completion Notes (Added 2025-09-30)

### What Was Done

1. **Refactored ApplyScreen to FSD Pattern** (116 lines)
   - Created `useApplyForm` hook orchestrating all business logic
   - Created `ApplyWidget` for UI rendering
   - Thin screen wrapper handling only loading state

2. **Fixed Type Alignment Issues**
   - Removed "compat" wrapper components that weren't in master
   - Updated all step components to accept full `ApplicationFormData` object
   - Aligned `ApplicationFormData` type with master (5 core fields)

3. **Data Transformation Strategy**
   - Added transformation in `useJobCategories` hook for `requireOrientation`
   - Converts string values ("yes"/"no") to boolean at data boundary
   - Keeps types strict throughout the application

4. **Key Architecture Decisions**
   - `useApplyForm` remains as comprehensive orchestrator hook
   - Single usage pattern is intentional (not a smell)
   - Follows FSD principles perfectly

### Lessons Learned

1. **Always check master patterns first** - Don't assume simplified interfaces
2. **Transform data at boundaries** - Keep internal types clean
3. **Comprehensive hooks are OK** - When they orchestrate complex features
4. **VS Code is your friend** - Yellow warnings are fine, red errors need fixing

## 📝 ProfileScreen Completion Notes (Added 2025-09-30)

### What Was Done

1. **Minimal Refactoring Needed** (129 → 39 lines)
   - ProfileScreen was already clean with minimal business logic
   - Created `useProfile` hook for data preparation
   - Created `ProfileWidget` for UI rendering
   - Flattened to single file in tabs directory

2. **Hook Pattern**
   - `useProfile` consolidates user data from Clerk and backend
   - Prepares display values (name, email, member since)
   - Returns simple loading state and user object

3. **Widget Structure**
   - Moved all UI to ProfileWidget
   - Copied styles to widget folder
   - Reused existing ProfileLink and SignOutButton components

4. **Clean Architecture**
   - Screen: 39 lines (70% reduction!)
   - Hook: Minimal data transformation
   - Widget: Pure UI rendering

### Key Takeaways

1. **Not all screens need heavy refactoring** - ProfileScreen was already well-structured
2. **Minimal hooks are fine** - Don't over-engineer when logic is simple
3. **Reuse existing components** - ProfileLink and SignOutButton were already extracted
4. **Focus on the pattern** - Even simple screens benefit from consistent structure

## 🎨 Widget Styling Standardization Task (Completed - 2025-09-30)

### Context
The codebase has two approaches to responsive styling:
1. **Static theme values**: `getSpacing('lg')` returns fixed values like `24`
2. **Responsive theme values**: `responsiveSpacing.lg` returns scaled values using `scale(24)`

### Current Pattern Analysis

#### ApplyWidget Pattern (Established Standard)
```typescript
// Uses theme object directly with responsive wrapping
import { theme } from '@shared/styles/theme';
import { scale, verticalScale } from '@shared/utils/responsive';

styles = {
  paddingHorizontal: scale(theme.spacing.lg),      // Horizontal scaling
  paddingVertical: verticalScale(theme.spacing.md), // Vertical scaling
  borderRadius: theme.borderRadius.lg,              // Static value OK
}
```

#### ProfileWidget Pattern (Needs Update)
```typescript
// Currently uses utility functions with static values
import { getSpacing, getColor } from '@shared/styles/theme';
import { moderateScale } from '@shared/utils/responsive';

styles = {
  paddingHorizontal: getSpacing('lg'),  // Returns 24 (not scaled)
  borderWidth: moderateScale(1),         // Only borders are scaled
}
```

### Theme Architecture Discovery

1. **Static tokens** (`src/shared/styles/theme/spacing.ts`):
   - Fixed values: `xs: 4`, `sm: 8`, `md: 16`, `lg: 24`, etc.
   - Used by utility functions like `getSpacing()`

2. **Responsive tokens** (`src/shared/styles/theme/responsive-tokens.ts`):
   - Pre-scaled values: `xs: scale(4)`, `sm: scale(8)`, etc.
   - Separate responsive spacing, font sizes, border radius, icon sizes
   - Helper functions: `getResponsiveSpacing()`, `getResponsiveFontSize()`

### Recommended Approach

Follow the **ApplyWidget pattern** as the standard:
1. Import `theme` object directly
2. Wrap with appropriate responsive functions:
   - `scale()` for horizontal dimensions
   - `verticalScale()` for vertical dimensions
   - `moderateScale()` for borders, small details
   - Static values OK for colors, borderRadius (9999 for full)

### Next Steps for ProfileWidget

1. **Update imports**:
   ```typescript
   import { theme, getColor, getTypography } from '@/src/shared/styles/theme';
   ```

2. **Update spacing to be responsive**:
   ```typescript
   paddingVertical: verticalScale(theme.spacing.lg),
   paddingHorizontal: scale(theme.spacing.lg),
   ```

3. **Keep existing responsive patterns**:
   - Border widths with `moderateScale()`
   - Profile picture dimensions with `moderateScale()`

4. **Keep static where appropriate**:
   - Colors via `getColor()` 
   - Typography via `getTypography()`
   - Border radius can use `theme.borderRadius` directly

### Files Updated ✅

- [✅] `src/widgets/profile/ProfileWidget.styles.ts`
- [✅] `src/widgets/profile/ProfileWidget.tsx` (icon sizing)
- [✅] `src/features/profile/components/ProfileLink/ProfileLink.tsx` (responsive styling)
- [ ] Check other widgets for consistency:
  - [ ] `ApplicationDetailWidget.styles.ts`
  - [ ] `ApplicationListWidget.styles.ts`
  - [ ] `DashboardWidget.styles.ts`
  - [ ] `PaymentWidget.styles.ts`

### Why This Matters

1. **Consistency**: All widgets should follow the same responsive pattern
2. **Performance**: Pre-scaled responsive tokens vs runtime scaling debate
3. **Maintainability**: Single pattern easier to understand and update
4. **Responsiveness**: Ensures UI scales properly on all devices

### ProfileWidget Completion Summary

**Changes Made:**

1. **ProfileWidget.styles.ts** - Full responsive update:
   - ✅ Replaced `getSpacing()` → `scale(theme.spacing.*)` for horizontal
   - ✅ Replaced `getSpacing()` → `verticalScale(theme.spacing.*)` for vertical
   - ✅ Replaced `getColor()` → `theme.colors.*` direct access
   - ✅ Replaced `getTypography()` → `theme.typography.*` direct access
   - ✅ Replaced `getBorderRadius()` → `theme.borderRadius.*` direct access
   - ✅ Kept `moderateScale()` for borders (1px)

2. **ProfileWidget.tsx** - Icon responsiveness:
   - ✅ Added `moderateScale()` import
   - ✅ Updated pencil icon: `size={16}` → `size={moderateScale(16)}`

3. **ProfileLink.tsx** - Component responsive update:
   - ✅ All paddings now use `scale()` or `verticalScale()`
   - ✅ All dimensions (icon container, margins) use `moderateScale()`
   - ✅ Font sizes use `moderateScale()`
   - ✅ Icon sizes use `moderateScale(24)` and `moderateScale(20)`
   - ✅ Border widths use `moderateScale(1)`

**Pattern Applied:**
- Horizontal dimensions → `scale()`
- Vertical dimensions → `verticalScale()`
- Borders, icons, small UI elements → `moderateScale()`
- Colors, borderRadius → Direct theme access (static OK)

**Result:**
ProfileWidget and all its child components now follow the ApplyWidget responsive pattern consistently. All spacing, typography, and UI elements will scale properly across different device sizes.
