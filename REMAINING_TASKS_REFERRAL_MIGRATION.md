# 📋 REMAINING TASKS: Rejection → Referral Migration

**Project**: eMediCard Health Card System
**Migration**: "Rejection" → "Referral/Medical Management" Terminology
**Date Created**: 2025-01-08
**Status**: ~40% Complete (Backend Core + Mobile Infrastructure Done)

---

## 🎯 OVERVIEW

This document contains ALL remaining tasks to complete the migration from "rejection" terminology to proper medical terminology ("referral for medical management" vs "document issue").

### ✅ COMPLETED:
- **Phase 1**: Database Schema (100%)
- **Phase 2**: Backend Core Functions (75%)
- **Phase 4**: Mobile Entity Models & Hooks (35%)

### ⏳ REMAINING:
- **Phase 2**: Backend Optional Updates (25%)
- **Phase 3**: Web Admin UI (0% - For teammate)
- **Phase 4**: Mobile UI Components (65%)
- **Phase 5**: Data Migration Scripts
- **Phase 6**: Testing & QA
- **Phase 7**: Documentation Updates

---

## 📂 FILE INVENTORY

### ✅ FILES ALREADY CREATED/UPDATED (20 files):

#### Backend:
1. ✅ `backend/convex/schema.ts` - Added documentReferralHistory table
2. ✅ `backend/convex/admin/documents/referDocument.ts` - NEW function
3. ✅ `backend/convex/admin/documents/rejectDocument.ts` - Updated dual-write
4. ✅ `backend/convex/admin/documents/sendReferralNotifications.ts` - NEW
5. ✅ `backend/convex/admin/finalizeApplication.ts` - Updated
6. ✅ `backend/convex/documents.ts` - Updated resubmitDocument
7. ✅ `backend/convex/documents/referralQueries.ts` - NEW queries
8. ✅ `backend/convex/_notifications/getReferralHistoryNotifications.ts` - NEW
9. ✅ `backend/convex/_notifications/markReferralHistoryAsRead.ts` - NEW

#### Mobile:
10. ✅ `apps/mobile/src/entities/document/model/referral-types.ts` - NEW (complete type system)
11. ✅ `apps/mobile/src/entities/document/model/index.ts` - Updated exports
12. ✅ `apps/mobile/src/features/document-rejection/hooks/useReferralHistory.ts` - NEW
13. ✅ `apps/mobile/src/features/document-rejection/hooks/useDocumentReferralDetails.ts` - NEW
14. ✅ `apps/mobile/src/features/document-rejection/hooks/useReferredDocumentsCount.ts` - NEW
15. ✅ `apps/mobile/src/features/document-rejection/hooks/index.ts` - Updated exports
16. ✅ `apps/mobile/src/widgets/document-referral/DocumentReferralWidget.tsx` - NEW
17. ✅ `apps/mobile/src/widgets/document-referral/DocumentReferralWidget.styles.ts` - NEW
18. ✅ `apps/mobile/src/widgets/document-referral/index.ts` - NEW

### ⏳ FILES TO UPDATE/CREATE (~131 remaining):

---

## 🔥 PRIORITY 1: MOBILE APP UPDATES (~88 files)

### A. NOTIFICATION SYSTEM (High Priority - ~12 files)

#### File: `apps/mobile/src/features/notification/constants.ts`
**Line**: 11
**Current**:
```typescript
DOCUMENT_REJECTED: 'DocumentRejection'
```
**Change To**:
```typescript
// DEPRECATED - Use new types
DOCUMENT_REJECTED: 'DocumentRejection',

// NEW - Proper medical terminology
DOCUMENT_REFERRED_MEDICAL: 'DocumentReferredMedical',
DOCUMENT_ISSUE_FLAGGED: 'DocumentIssueFlagged',
MEDICAL_REFERRAL_RESUBMISSION: 'MedicalReferralResubmission',
DOCUMENT_RESUBMISSION: 'DocumentResubmission',
```

#### File: `apps/mobile/src/features/notification/types.ts`
**Add**:
```typescript
export type NotificationType =
  | 'DocumentRejection'  // DEPRECATED
  | 'DocumentReferredMedical'  // NEW - Medical finding
  | 'DocumentIssueFlagged'     // NEW - Document issue
  | 'MedicalReferralResubmission'  // NEW
  | 'DocumentResubmission'
  | ... // other types
```

#### File: `apps/mobile/src/features/notification/hooks/useNotificationList.ts`
**Update**: Add handling for new notification types in filtering/sorting logic

#### Files to Update (Notification Rendering):
- `apps/mobile/src/features/notification/components/NotificationItem.tsx` - Add icons and colors for new types
- `apps/mobile/src/features/notification/components/NotificationBadge.tsx` - Different colors for medical vs document
- `apps/mobile/src/screens/notification/NotificationDetailScreen.tsx` - Show doctor info for medical referrals

---

### B. APPLICATION STATUS SYSTEM (~8 files)

#### File: `apps/mobile/src/entities/application/model/types.ts`
**Add/Update**:
```typescript
export enum ApplicationStatus {
  SUBMITTED = "Submitted",
  FOR_DOCUMENT_VERIFICATION = "For Document Verification",
  FOR_PAYMENT_VALIDATION = "For Payment Validation",
  FOR_ORIENTATION = "For Orientation",
  APPROVED = "Approved",
  REJECTED = "Rejected",  // DEPRECATED - permanent rejection only

  // NEW statuses
  DOCUMENTS_NEED_REVISION = "Documents Need Revision",
  REFERRED_FOR_MEDICAL_MANAGEMENT = "Referred for Medical Management",
}
```

#### File: `apps/mobile/src/entities/application/model/constants.ts`
**Update**: Add labels, colors, and descriptions for new statuses

```typescript
export const ApplicationStatusLabels = {
  // ... existing
  [ApplicationStatus.DOCUMENTS_NEED_REVISION]: "Documents Need Revision",
  [ApplicationStatus.REFERRED_FOR_MEDICAL_MANAGEMENT]: "Medical Referral Required",
};

export const ApplicationStatusColors = {
  // ... existing
  [ApplicationStatus.DOCUMENTS_NEED_REVISION]: "#F59E0B", // Orange
  [ApplicationStatus.REFERRED_FOR_MEDICAL_MANAGEMENT]: "#3B82F6", // Blue
};

export const ApplicationStatusIcons = {
  // ... existing
  [ApplicationStatus.DOCUMENTS_NEED_REVISION]: "document-text-outline",
  [ApplicationStatus.REFERRED_FOR_MEDICAL_MANAGEMENT]: "medkit-outline",
};
```

#### Files to Update:
- `apps/mobile/src/shared/ui/StatusBadge/StatusBadge.tsx` - Add new status styles
- `apps/mobile/src/shared/ui/ApplicationStatusChip.tsx` - Handle new statuses
- `apps/mobile/src/entities/application/lib/status-utils.ts` - Helper functions

---

### C. DASHBOARD COMPONENTS (~15 files)

#### File: `apps/mobile/src/features/dashboard/hooks/useDashboardData.ts`
**Update**: Use new `useReferredDocumentsCount` hook

```typescript
import { useReferredDocumentsCount } from '@features/document-rejection/hooks';

export function useDashboardData(userId: Id<"users"> | undefined) {
  const {
    totalIssues,
    medicalReferrals,
    documentIssues,
    pendingResubmission
  } = useReferredDocumentsCount(userId);

  // ... use the separated counts
}
```

#### File: `apps/mobile/src/features/dashboard/components/ApplicationStatusChecklist/ApplicationStatusChecklist.tsx`
**Update**:
- Change "Document Rejected" → "Document Issue" or "Medical Referral"
- Add different icons for medical vs non-medical
- Update colors (blue for medical, orange for document issues)

#### File: `apps/mobile/src/features/dashboard/components/ActionCenter/ActionCenter.tsx`
**Update**:
- "Resubmit Rejected Documents" → "Address Document Issues" + "Complete Medical Consultations"
- Show two separate action items if both exist
- Different CTAs: "Resubmit" vs "View Doctor Info"

#### File: `apps/mobile/src/widgets/dashboard/DashboardWidget.enhanced.tsx`
**Update**:
- Show medical referral count separately
- Show document issue count separately
- Use new terminology throughout

#### Files to Update:
- `apps/mobile/src/features/dashboard/services/dashboardService.ts`
- `apps/mobile/src/features/dashboard/hooks/useOptimizedDashboard.ts`
- `apps/mobile/src/screens/dashboard/DashboardScreen.tsx`

---

### D. WIDGETS (~10 files)

#### File: `apps/mobile/src/widgets/document-rejection-history/DocumentRejectionHistoryWidget.tsx`
**Create New**: `apps/mobile/src/widgets/document-referral-history/DocumentReferralHistoryWidget.tsx`

**Features**:
- Use `useReferralHistory` hook
- Group by medical vs non-medical
- Show tabs: "All" | "Medical Referrals" | "Document Issues"
- Different list item styles for each type
- Export from `apps/mobile/src/widgets/document-referral-history/index.ts`

#### File: `apps/mobile/src/widgets/application-detail/ApplicationDetailWidget.tsx`
**Line**: ~320 (where it shows "documents need revision")
**Update**:
- Detect if medical referral or document issue
- Show different messaging
- "📋 Medical Referral Required" vs "📄 Documents Need Correction"

#### File: `apps/mobile/src/widgets/application-list/ApplicationListWidget.tsx`
**Line**: ~173
**Update**:
- Change "Documents Rejected" badge
- Use "Medical Referral" or "Document Issue" based on status
- Different colors

#### Files to Update:
- `apps/mobile/src/widgets/application-status/ApplicationStatusWidget.tsx`
- `apps/mobile/src/widgets/health-card/HealthCardStatusWidget.tsx`

---

### E. SCREENS (~18 files)

#### File: `apps/mobile/app/(screens)/(shared)/documents/rejection-history.tsx`
**Create New**: `apps/mobile/app/(screens)/(shared)/documents/referral-history.tsx`
**Update**: Use new `DocumentReferralHistoryWidget` and types

#### File: `apps/mobile/src/screens/shared/DocumentRejectionHistoryScreen/`
**Rename To**: `apps/mobile/src/screens/shared/DocumentReferralHistoryScreen/`
**Files to Rename**:
- `DocumentRejectionHistoryScreen.tsx` → `DocumentReferralHistoryScreen.tsx`
- `DocumentRejectionHistoryScreen.styles.ts` → `DocumentReferralHistoryScreen.styles.ts`
- `index.ts`

**Update Content**:
- Use `useReferralHistory` hook
- Show tabs for medical vs non-medical
- Update all text ("Rejection History" → "Referral & Issue History")

#### File: `apps/mobile/src/screens/shared/ViewDocumentsScreen/ViewDocumentsScreen.tsx`
**Update**:
- Status badges (line ~150-200)
- Change "Rejected" badge to "Referred" (blue) or "Needs Revision" (orange)
- Update badge colors and icons

#### File: `apps/mobile/src/screens/shared/ViewDocumentsScreen/DocumentViewHeader.tsx`
**Update**:
- Header text when document has issue
- "Document Rejected" → "Medical Finding" or "Document Issue"

#### File: `apps/mobile/src/screens/inspector/ReviewApplicationsScreen/ReviewApplicationsScreen.tsx`
**Update**: Any references to "rejection" terminology

#### Files to Update:
- `apps/mobile/src/screens/application/ApplicationDetailScreen.tsx`
- `apps/mobile/src/screens/application/ApplicationListScreen.tsx`
- `apps/mobile/src/screens/documents/DocumentDetailScreen.tsx`

---

### F. FEATURES (~12 files)

#### File: `apps/mobile/src/features/document-resubmit/hooks/useResubmitDocument.ts`
**Update**:
- Use `useDocumentReferralDetails` instead of `useDocumentRejectionDetails`
- Update success messages

#### File: `apps/mobile/src/features/payment/hooks/usePaymentRejectionHistory.ts`
**Note**: Payment rejections are different - they're still "rejections" not "referrals"
**Action**: Consider renaming for consistency but keeping rejection terminology (payments are truly rejected, not referred)

#### File: `apps/mobile/src/features/application/hooks/useApplicationDetail.ts`
**Update**: Handle new application statuses

#### File: `apps/mobile/src/features/application/hooks/useApplicationList.ts`
**Update**: Filter by new statuses

#### Files to Update:
- `apps/mobile/src/features/dashboard/` - All components showing rejection data
- `apps/mobile/src/features/activity/` - Activity logs showing "rejection" events
- `apps/mobile/src/features/document-upload/` - Error messages

---

### G. SHARED UI COMPONENTS (~8 files)

#### File: `apps/mobile/src/shared/ui/StatusBadge/StatusBadge.tsx`
**Update**:
```typescript
const statusConfig = {
  // ... existing
  Referred: {
    color: '#3B82F6',  // Blue
    backgroundColor: '#DBEAFE',
    icon: 'medkit',
    label: 'Medical Referral'
  },
  NeedsRevision: {
    color: '#F59E0B',  // Orange
    backgroundColor: '#FEF3C7',
    icon: 'alert-circle',
    label: 'Needs Correction'
  },
  Rejected: {  // DEPRECATED
    color: '#EF4444',
    backgroundColor: '#FEE2E2',
    icon: 'close-circle',
    label: 'Rejected'
  }
};
```

#### Files to Update:
- `apps/mobile/src/shared/ui/ErrorMessage/ErrorMessage.tsx` - Update error text
- `apps/mobile/src/shared/ui/InfoCard/InfoCard.tsx` - Update info messages
- `apps/mobile/src/shared/validation/form-validation.ts` - Update validation messages

---

### H. TESTING FILES (~5 files)

**Create Test Files**:
1. `apps/mobile/src/entities/document/model/__tests__/referral-types.test.ts`
2. `apps/mobile/src/features/document-rejection/hooks/__tests__/useReferralHistory.test.ts`
3. `apps/mobile/src/widgets/document-referral/__tests__/DocumentReferralWidget.test.tsx`

---

## 🌐 PRIORITY 2: WEB ADMIN UPDATES (~13 files)

**Note**: Your teammate can handle this independently!

### File: `apps/webadmin/src/app/dashboard/[id]/doc_verif/page.tsx`
**Action**: Apply changes from `FOR_REFERRAL_MIGRATION/doc_verif_page.tsx`

**Key Changes**:
- Medical vs non-medical document separation (lines 54-68)
- "Refer to Doctor" button (already implemented)
- "Flag for Resubmission" button (for non-medical)
- Update notification text

### File: `apps/webadmin/src/app/dashboard/rejection-history/page.tsx`
**Rename To**: `apps/webadmin/src/app/dashboard/referral-history/page.tsx`
**Update**:
- Page title: "Rejection History" → "Referral & Issue History"
- Tabs: "All" | "Medical Referrals" | "Document Issues"
- Use new backend queries

### File: `apps/webadmin/src/app/super-admin/rejection-history/page.tsx`
**Rename To**: `apps/webadmin/src/app/super-admin/referral-history/page.tsx`
**Update**: Same as above

### Files to Update:
- `apps/webadmin/src/app/dashboard/page.tsx` - Dashboard metrics
- `apps/webadmin/src/app/dashboard/notifications/page.tsx` - Notification types
- `apps/webadmin/src/components/DashboardActivityLog.tsx` - Activity types
- `apps/webadmin/src/components/AdminNotificationBell.tsx` - Notification text

---

## ⚙️ PRIORITY 3: BACKEND OPTIONAL UPDATES (~30 files)

### A. Admin Query Files

#### File: `backend/convex/admin/rejectionHistory.ts`
**Create New**: `backend/convex/admin/referralHistory.ts`
**Update**: Use dual-read pattern from both tables, same as referralQueries.ts

#### File: `backend/convex/dashboard/getDashboardData.ts`
**Update**:
- Query from both old and new tables
- Return medical vs non-medical counts separately

### B. Config Files

#### File: `backend/convex/config/rejectionLimits.ts`
**Rename To**: `backend/convex/config/referralLimits.ts`
**Update**: Documentation and comments (logic stays same - still 3 attempts)

### C. Notification Handlers

#### File: `backend/convex/_notifications/markAllNotificationsAsRead.ts`
**Update**: Handle new notification types

#### File: `backend/convex/notifications.ts`
**Update**: Export new notification functions

---

## 🔄 PRIORITY 4: DATA MIGRATION (~3 files)

### Create: `backend/convex/migrations/migrateRejectionToReferral.ts`

```typescript
import { internalMutation } from "../_generated/server";

/**
 * Migrate existing documentRejectionHistory records to documentReferralHistory
 * Run this once to backfill historical data
 */
export const migrateHistoricalData = internalMutation({
  handler: async (ctx) => {
    const oldRecords = await ctx.db
      .query("documentRejectionHistory")
      .collect();

    let migrated = 0;
    let skipped = 0;

    for (const record of oldRecords) {
      // Check if already migrated
      const existing = await ctx.db
        .query("documentReferralHistory")
        .withIndex("by_document_type", q =>
          q.eq("applicationId", record.applicationId)
           .eq("documentTypeId", record.documentTypeId)
        )
        .filter(q => q.eq(q.field("attemptNumber"), record.attemptNumber))
        .first();

      if (existing) {
        skipped++;
        continue;
      }

      // Infer issue type from doctor name
      const issueType = record.doctorName ? "medical_referral" : "document_issue";

      // Map old category to new
      const medicalReferralCategory = record.doctorName ? "other_medical_concern" : undefined;
      const documentIssueCategory = !record.doctorName ? record.rejectionCategory : undefined;

      // Insert into new table
      await ctx.db.insert("documentReferralHistory", {
        applicationId: record.applicationId,
        documentTypeId: record.documentTypeId,
        documentUploadId: record.documentUploadId,

        referredFileId: record.rejectedFileId,
        originalFileName: record.originalFileName,
        fileSize: record.fileSize,
        fileType: record.fileType,

        issueType: issueType,
        medicalReferralCategory: medicalReferralCategory,
        documentIssueCategory: documentIssueCategory,

        referralReason: record.rejectionReason,
        specificIssues: record.specificIssues,
        doctorName: record.doctorName,
        clinicAddress: record.doctorName ? "Door 7, Magsaysay Complex, Magsaysay Park, Davao City" : undefined,

        referredBy: record.rejectedBy,
        referredAt: record.rejectedAt,

        wasReplaced: record.wasReplaced,
        replacementUploadId: record.replacementUploadId,
        replacedAt: record.replacedAt,
        attemptNumber: record.attemptNumber,

        status: record.status,
        notificationSent: record.notificationSent,
        notificationSentAt: record.notificationSentAt,
        adminReadBy: record.adminReadBy,

        migratedFromRejectionId: record._id,

        ipAddress: record.ipAddress,
        userAgent: record.userAgent,
      });

      migrated++;
    }

    return {
      success: true,
      migrated,
      skipped,
      total: oldRecords.length,
    };
  },
});
```

### Create: `backend/convex/migrations/verifyMigration.ts`
**Purpose**: Verify data consistency between old and new tables

### Create: `backend/convex/migrations/switchToNewTable.ts`
**Purpose**: Update all queries to read from new table only (after migration verified)

---

## 📝 PRIORITY 5: DOCUMENTATION (~10 files)

### File: `CLAUDE.md` (Root)
**Update**: All references to "rejection" → "referral"
- Lines mentioning documentRejectionHistory
- Examples showing rejection flow
- API documentation

### File: `apps/mobile/CLAUDE.md`
**Update**:
- Document rejection system section
- Update examples
- Add migration guide

### Create: `docs/MIGRATION_GUIDE_REFERRAL.md`
**Content**:
```markdown
# Migration Guide: Rejection → Referral Terminology

## For Mobile Developers

### Old Code:
```typescript
import { useRejectionHistory } from '@features/document-rejection/hooks';

const { rejections } = useRejectionHistory(appId);
```

### New Code:
```typescript
import { useReferralHistory } from '@features/document-rejection/hooks';

const { referrals, medicalReferrals, documentIssues } = useReferralHistory(appId);
```

[Continue with comprehensive examples...]
```

### Files to Update:
- `docs/DOCUMENT_REJECTION_SYSTEM_PLAN.md` → Rename to `DOCUMENT_REFERRAL_SYSTEM_PLAN.md`
- `docs/REJECTION_SYSTEM_INTEGRATION_GUIDE.md` → Rename to `REFERRAL_SYSTEM_INTEGRATION_GUIDE.md`
- `docs/RejectedDocumentsUpdate.md` → Rename
- `backend/PAYMENT_SYSTEM_GUIDE.md` - Update rejection references

---

## ✅ TESTING CHECKLIST

### Mobile App Testing:
- [ ] Test medical referral flow end-to-end
  - [ ] Admin refers document with doctor name
  - [ ] Applicant receives "Medical Finding" notification
  - [ ] Applicant sees doctor info in widget
  - [ ] Widget shows blue theme and medical icons
  - [ ] "View Doctor Info" button works
  - [ ] Application status shows "Referred for Medical Management"

- [ ] Test document issue flow end-to-end
  - [ ] Admin flags document without doctor name
  - [ ] Applicant receives "Document Issue" notification
  - [ ] Applicant sees issues list in widget
  - [ ] Widget shows orange/red theme
  - [ ] "Resubmit Document" button works
  - [ ] Application status shows "Documents Need Revision"

- [ ] Test dashboard
  - [ ] Shows medical referral count
  - [ ] Shows document issue count
  - [ ] Shows total count
  - [ ] Action items work

- [ ] Test notifications
  - [ ] Medical referral notification displays correctly
  - [ ] Document issue notification displays correctly
  - [ ] Notification icons and colors correct
  - [ ] Tapping notification navigates correctly

- [ ] Test backward compatibility
  - [ ] Old components still work
  - [ ] Old hooks still function
  - [ ] No breaking changes

### Web Admin Testing:
- [ ] Medical document referral works
- [ ] Non-medical document flagging works
- [ ] Dashboard shows correct metrics
- [ ] History page shows both types
- [ ] Notifications send correctly

### Backend Testing:
- [ ] Dual-write working (data in both tables)
- [ ] Dual-read working (queries check both tables)
- [ ] Data migration script works
- [ ] No data loss
- [ ] Performance acceptable

---

## 🚀 DEPLOYMENT CHECKLIST

### Pre-Deployment:
- [ ] All tests passing
- [ ] Code review complete
- [ ] Documentation updated
- [ ] Migration script tested in staging

### Deployment Order:
1. **Backend** (Deploy first)
   - [ ] Deploy schema changes
   - [ ] Deploy new functions
   - [ ] Verify dual-write working

2. **Data Migration** (Run in production)
   - [ ] Run migration script
   - [ ] Verify data in new tables
   - [ ] Check no data loss

3. **Web Admin** (Deploy second)
   - [ ] Deploy UI updates
   - [ ] Verify admin workflows
   - [ ] Test with live data

4. **Mobile App** (Deploy last)
   - [ ] Build new version
   - [ ] Submit to App Store/Play Store
   - [ ] Gradual rollout (10% → 50% → 100%)
   - [ ] Monitor for issues

### Post-Deployment:
- [ ] Monitor error rates
- [ ] Check user feedback
- [ ] Verify metrics
- [ ] Update team documentation

### After 30 Days (Phase 8 - Cleanup):
- [ ] Stop writing to old table
- [ ] Export old data for archive
- [ ] Remove old table from schema
- [ ] Remove deprecated code
- [ ] Update all documentation

---

## 📊 PROGRESS TRACKING

### Current Progress:
- **Phase 1**: Database Schema - ✅ 100%
- **Phase 2**: Backend Core - ✅ 75%
- **Phase 3**: Web Admin - ⏳ 0%
- **Phase 4**: Mobile App - ✅ 35%
- **Phase 5**: Data Migration - ⏳ 0%
- **Phase 6**: Testing - ⏳ 0%
- **Phase 7**: Documentation - ⏳ 0%
- **Phase 8**: Cleanup - ⏳ 0%

**Overall Progress**: ~40% Complete

---

## 🎯 QUICK START FOR NEXT AGENT

### Immediate Next Steps:
1. **Mobile Notifications** (Highest Priority)
   - Update `apps/mobile/src/features/notification/constants.ts`
   - Add new notification types
   - Test notification display

2. **Mobile Application Status**
   - Update `apps/mobile/src/entities/application/model/types.ts`
   - Add new status enums
   - Update status badge component

3. **Mobile Dashboard**
   - Update `apps/mobile/src/features/dashboard/hooks/useDashboardData.ts`
   - Use new `useReferredDocumentsCount` hook
   - Show medical vs non-medical counts

### Recommended Order:
1. Notifications (2-3 hours)
2. Application Status (1-2 hours)
3. Dashboard Components (2-3 hours)
4. Widgets (2-3 hours)
5. Screens (2-3 hours)
6. Testing (2-3 hours)

**Total Estimated Time**: 12-18 hours for mobile completion

---

## 💡 TIPS FOR SUCCESS

### General Guidelines:
1. **Always maintain backward compatibility** - Don't break existing code
2. **Use TypeScript strictly** - Leverage the type system
3. **Follow the established patterns** - Match existing code style
4. **Test incrementally** - Don't wait until the end
5. **Document as you go** - Update comments and docs

### Common Patterns:
```typescript
// Pattern 1: Check issue type
const isMedical = referral.issueType === IssueType.MEDICAL_REFERRAL;
const icon = isMedical ? "medical" : "alert-circle";
const color = isMedical ? "#3B82F6" : "#F59E0B";

// Pattern 2: Get category label
import { getCategoryLabel } from '@entities/document/model/referral-types';
const label = getCategoryLabel(referral.issueType, referral.category);

// Pattern 3: Status badge
import { DocumentStatus } from '@entities/document/model/referral-types';
const status = document.reviewStatus === DocumentStatus.REFERRED ? 'medical' : 'issue';
```

### Avoid These Mistakes:
- ❌ Don't remove old code immediately (keep for backward compatibility)
- ❌ Don't use "rejected" in new UI text
- ❌ Don't forget to update both mobile AND web admin
- ❌ Don't skip testing the dual-read/write logic
- ❌ Don't forget to update documentation

---

## 📞 QUESTIONS & SUPPORT

### If You Get Stuck:
1. **Check existing implementations** - Look at completed files for patterns
2. **Review the comprehensive plan** - Check `FOR_REFERRAL_MIGRATION/` folder
3. **Test incrementally** - Run small changes to verify
4. **Ask for help** - Don't spend too long stuck on one issue

### Key Reference Files:
- `backend/convex/schema.ts` - Database structure
- `backend/convex/documents/referralQueries.ts` - Query patterns
- `apps/mobile/src/entities/document/model/referral-types.ts` - Type definitions
- `apps/mobile/src/widgets/document-referral/DocumentReferralWidget.tsx` - UI patterns
- `FOR_REFERRAL_MIGRATION/MIGRATION_GUIDE.md` - Original plan

---

**Good luck! This is a well-architected migration with strong foundations already in place.** 🚀
