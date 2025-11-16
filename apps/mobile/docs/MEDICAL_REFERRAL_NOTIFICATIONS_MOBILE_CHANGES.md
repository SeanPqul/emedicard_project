# Medical Referral Notifications – Mobile Changes & Follow-ups

## Background

Recent backend and webadmin changes introduced a clearer medical terminology for document-related flows:

- Medical findings → **medical referral** ("Referred for Medical Management")
- Non-medical document problems → **document issue** ("Needs Correction / Needs Revision")
- Attempt-based warnings and final permanent rejection flows

The backend now creates notifications with types like:

- `document_referred_medical`
- `document_needs_correction`
- `application_rejected_max_attempts`
- `application_permanently_rejected`

while webadmin also uses:

- `document_referral_medical`
- `document_issue_flagged`

On mobile, the existing notification system was built around **PascalCase** types, e.g.:

- `DocumentReferredMedical`
- `DocumentIssueFlagged`
- `MedicalReferralResubmission`
- `DocumentResubmission`

This mismatch could cause:

- Generic icons and titles instead of specific ones
- Filter categories ("Applications") not always catching the new notification types

## Implemented Mobile Changes (This Branch)

### 1. Type Normalization for Medical & Document Flows

**File:** `apps/mobile/src/features/notification/hooks/useNotificationList.ts`

- Added a normalization layer that converts backend/webadmin notification type strings into **canonical mobile types** before they hit the UI.

Key helper:

```ts
const normalizeNotificationType = (backendType: string): string => {
  switch (backendType) {
    // Medical referral flows (new terminology)
    case 'document_referred_medical':
    case 'document_referral_medical':
      return 'DocumentReferredMedical';

    // Document issue / needs correction flows
    case 'document_needs_correction':
    case 'document_issue_flagged':
    case 'DocumentIssue':
    case 'document_rejected':
    case 'document_rejection':
      return 'DocumentIssueFlagged';

    // Application rejection (max attempts / permanent)
    case 'application_rejected_max_attempts':
    case 'application_permanently_rejected':
      return 'application_rejected_final';

    default:
      return backendType;
  }
};
```

Then we map backend notifications to `NotificationItem` using this helper:

```ts
const mapNotification = (backendNotif: BackendNotification): NotificationItem => {
  const normalizedType = normalizeNotificationType(backendNotif.notificationType);

  return {
    ...backendNotif,
    type: normalizedType,
    read: backendNotif.isRead ?? false,
  };
};
```

**Effect:**

- Mobile becomes resilient to differences between backend (`document_referred_medical`), webadmin (`document_referral_medical`), and mobile constants (`DocumentReferredMedical`).
- All medical/document referral-related notifications can share the same canonical type on mobile and plug cleanly into existing filters and widgets.

### 2. Icons, Colors, and Titles for New Canonical Types

**File:** `apps/mobile/src/widgets/notification/NotificationWidget.tsx`

Extended the notification UI mappings so the new canonical types render with appropriate visual treatment.

Added entries:

- **Icons**
  - `DocumentReferredMedical` → `medkit`
  - `DocumentIssueFlagged` → `alert-circle`
  - `MedicalReferralResubmission` → `medkit`
  - `DocumentResubmission` → `document-text`

- **Colors**
  - `DocumentReferredMedical` → `#DC2626` (red, medical finding)
  - `DocumentIssueFlagged` → `#F18F01` (orange, document issue)
  - `MedicalReferralResubmission` → `#2563EB` (blue)
  - `DocumentResubmission` → `#2563EB` (blue)

- **Titles**
  - `DocumentReferredMedical` → `"Medical Finding Detected"`
  - `DocumentIssueFlagged` → `"Document Needs Correction"`
  - `MedicalReferralResubmission` → `"Medical Results Resubmitted"`
  - `DocumentResubmission` → `"Document Resubmitted"`

**Effect:**

- Medical referral and document issue notifications now present clearly in the list:
  - Correct semantic wording
  - Color + icon that matches the severity
- Category filter "Applications" continues to rely on canonical types and already includes these new ones (`DocumentReferredMedical`, `DocumentIssueFlagged`, `MedicalReferralResubmission`, `DocumentResubmission`).

## Current State (After This Change)

- Backend & webadmin can send any of the following representations:
  - `document_referred_medical`, `document_referral_medical` → **normalized to `DocumentReferredMedical`** on mobile.
  - `document_needs_correction`, `document_issue_flagged`, `DocumentIssue`, `document_rejection`, `document_rejected` → **normalized to `DocumentIssueFlagged`**.
  - `application_rejected_max_attempts`, `application_permanently_rejected` → **normalized to `application_rejected_final`** (which mobile already knows how to render).
- Mobile list & widget now:
  - Use consistent, human-friendly titles.
  - Show appropriate icons/colors for medical vs non-medical issues.
  - Continue to group these under the "Applications" category filter.

## Recommended Follow-ups for Mobile (For Future Revisions)

These are **not** implemented yet, but are suggested to fully align mobile with the new medical referral system:

1. **Centralize Notification Type Aliases**
   - Create a shared `notificationTypeAliases` module on mobile (e.g. `src/features/notification/model/typeAliases.ts`).
   - Use it in both:
     - `useNotificationList.ts` (list view)
     - `NotificationDetailScreen.tsx` (detail navigation & content logic)
   - Goal: a single source of truth for mapping backend/webadmin strings → mobile canonical types.

2. **Detail Screen Handling for Medical Referral Types**
   - **File:** `src/screens/shared/NotificationDetailScreen/NotificationDetailScreen.tsx`
   - Ensure the `switch` or conditional logic that branches by `notification.type` treats:
     - `DocumentReferredMedical`
     - `DocumentIssueFlagged`
     - `MedicalReferralResubmission`
     - `DocumentResubmission`
   - Align messaging in the detail screen with backend copy (e.g. show key parts of the long message but preserve clarity and brevity).

3. **Deep-linking for Medical Referrals and Document Issues**
   - Ensure the detail screen and tap handlers use `actionUrl` consistently for navigation.
   - For medical referrals:
     - `actionUrl` typically points to something like `/applications/{id}/medical-referral`.
   - For document issues:
     - `actionUrl` usually points to `/applications/{id}/resubmit/{documentTypeId}`.
   - Confirm the router paths in mobile match the backend patterns.

4. **End-to-End Test Scenarios**

   - Trigger each scenario from admin side (web):
     - Medical referral created (new `referDocument` + `sendReferralNotifications` flow).
     - Document issue flagged (needs correction, not medical).
     - Medical/document resubmission.
     - Max attempts / permanent rejection.
   - Verify on mobile:
     - Notification icon, color, title are correct.
     - Category filters behave as expected.
     - Tapping notification opens correct detail and destination screen.
     - Mark-as-read and mark-all-as-read still function correctly.

5. **Long-Term: Shared Typings Between Webadmin & Mobile**

   - Consider extracting a minimal, shared `NotificationType` vocabulary (e.g. via a shared package or at least a documented contract) so webadmin, backend, and mobile all agree on the canonical names.
   - Mobile’s normalization layer can stay as a safety net, but we should aim to minimize drift.

## Notes for Reviewers

- The changes here are **non-breaking** from a data perspective:
  - We do not alter backend payloads.
  - We only normalize strings inside mobile before rendering.
- All existing types still pass through untouched if they are not in the `switch` statement.
- The intent is to make mobile more robust to the new medical referral nomenclature and to keep UI behavior consistent with your latest backend/webadmin changes.

If you want to extend this further, the logical next place to look is:

- `apps/mobile/src/screens/shared/NotificationDetailScreen/NotificationDetailScreen.tsx`
- `apps/webadmin/src/lib/notificationTypes.ts` (as a reference for naming and grouping)

These will help ensure the full end-to-end experience for medical referral flows is completely aligned across web and mobile.
