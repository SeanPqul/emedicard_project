# Migration Plan for Remaining Components

## Date: September 21, 2025

This document outlines the plan for migrating or archiving the remaining components in `src/components/` after completing phases 1-5 of the main migration.

## Summary of Completed Actions
- ✅ Removed `src/components/application/` (duplicates of migrated application components)
- ✅ Archived `src/components/auth/` (migrated to features/auth)
- ✅ Archived `src/components/dashboard/` (migrated to features/dashboard)

## Remaining Components Analysis

### 1. **Common Components** (`src/components/common/`)
**Files:**
- `ErrorText.tsx` - Simple error text display component
- `ResponsiveLayout.tsx` - Layout utility component

**Recommendation:** Move to `src/shared/components/`
- ErrorText → `src/shared/components/feedback/ErrorText/`
- ResponsiveLayout → `src/shared/components/layout/ResponsiveLayout/`

### 2. **UI Components** (`src/components/ui/`)
**Files:**
- `LinkText.tsx` - Styled link component
- `ScreenHeader.tsx` - Screen header component
- `UIHeader.tsx` - UI header component

**Recommendation:** Move to `src/shared/components/`
- LinkText → `src/shared/components/typography/LinkText/`
- ScreenHeader → `src/shared/components/navigation/ScreenHeader/`
- UIHeader → `src/shared/components/navigation/UIHeader/`

### 3. **Feature Components Not Yet Migrated**

These components are tied to features that haven't been migrated yet according to the migration plan:

#### **Payment** (`src/components/payment/`)
**Files:**
- `EnhancedPaymentScreen.tsx`
- `ImprovedPaymentScreen.tsx`
- `PaymentMethodCard.tsx`
- `PaymentSubmissionScreen.tsx`

**Recommendation:** Keep until Payment feature migration (Future phase)

#### **Scanner** (`src/components/scanner/`)
**Files:**
- `QRCodeScanner.tsx`

**Recommendation:** Keep until Scanner feature migration (Future phase)

#### **Upload** (`src/components/upload/`)
**Files:**
- `DragDropUpload.tsx`

**Recommendation:** Keep until Upload feature migration (Future phase)

#### **Feedback** (`src/components/feedback/`)
**Files:**
- `FeedbackSystem.tsx`
- `Toast.tsx`

**Recommendation:** Keep until Feedback feature migration OR move to shared
- Could be moved to `src/shared/components/feedback/` if widely used

#### **Navigation** (`src/components/navigation/`)
**Files:**
- `NavigationWrapper.tsx`
- `RoleBasedTabLayout.tsx`
- `StepNavigation.tsx`

**Recommendation:** Evaluate usage
- If core navigation: Move to `src/core/navigation/components/`
- If feature-specific: Keep until related feature migration

#### **Activity** (`src/components/activity/`)
**Files:**
- `ActivityItem.tsx`

**Recommendation:** Keep until Activity feature migration (Future phase)

#### **Profile** (`src/components/profile/`)
**Files:**
- `ProfileLink.tsx`

**Recommendation:** Keep until Profile feature migration (Future phase)

#### **Stats** (`src/components/stats/`)
**Files:**
- `StatCard.tsx`

**Recommendation:** Keep until Stats feature migration OR move to shared if widely used

## Proposed Immediate Actions

### Phase 1: Move Shared Components (Immediate)
1. Move ErrorText.tsx → shared/components/feedback/
2. Move ResponsiveLayout.tsx → shared/components/layout/
3. Move LinkText.tsx → shared/components/typography/
4. Move ScreenHeader.tsx → shared/components/navigation/
5. Move UIHeader.tsx → shared/components/navigation/

### Phase 2: Evaluate and Move Core Components
1. Evaluate navigation components usage
2. If used across features, move to core/navigation/components/
3. Evaluate feedback components (Toast, FeedbackSystem)
4. If used across features, move to shared/components/feedback/

### Phase 3: Archive Plan
After moving shared components, create an archive snapshot of:
- Remaining feature-specific components
- Document which features they belong to
- Keep them in place for future migration phases

## Component Dependencies to Check
Before moving any component:
1. Check imports and exports
2. Update all references in the codebase
3. Ensure no circular dependencies
4. Test functionality after move

## Future Migration Phases
The following features and their components will be migrated in future phases:
- Payment Feature
- Scanner Feature  
- Upload Feature
- Profile Feature
- Activity Feature
- Stats/Analytics Feature

## Notes
- The main `src/components/index.tsx` file will need to be updated after each move
- Consider creating barrel exports in each new location
- Maintain backward compatibility during transition if needed
