# Stacked Rejection Notifications Feature

## Overview
This feature modifies the document rejection workflow to stack rejection notifications instead of sending them immediately. Applicants will receive individual notifications for each rejected document only when the admin clicks the "Reject Application" button.

## Changes Made

### 1. Database Schema Updates
**File:** `backend/convex/schema.ts`

Added notification tracking fields to `documentRejectionHistory` table:
- `notificationSent` (boolean): Tracks whether the applicant has been notified
- `notificationSentAt` (optional float64): Timestamp when notification was sent

### 2. Backend Changes

#### Modified: `backend/convex/admin/documents/rejectDocument.ts`
- **Changed:** Removed immediate notification sending when a document is rejected
- **Added:** Sets `notificationSent: false` and `notificationSentAt: undefined` in rejection history
- **Result:** Document rejections are now queued without notifying the applicant

#### New File: `backend/convex/admin/documents/sendRejectionNotifications.ts`
- **Purpose:** Sends individual notifications for each pending rejection
- **Features:**
  - Collects all rejection history records where `notificationSent === false`
  - Sends separate notification for each rejected document (maintains mobile app compatibility)
  - Marks all rejections as notified after sending
  - Logs admin activity
- **Type:** Internal mutation (can only be called from backend)

#### Modified: `backend/convex/admin/finalizeApplication.ts`
- **Added:** Calls `sendRejectionNotifications` when "Reject Application" is clicked
- **Logic:** Only sends notifications when `newStatus === "Rejected"`
- **Integration:** Uses `ctx.runMutation` to call the internal mutation

### 3. Frontend Changes

#### Modified: `apps/webadmin/src/app/dashboard/[id]/doc_verif/page.tsx`
- **Added:** Blue info banner that appears when documents are rejected
  - Shows count of queued rejection notifications
  - Explains that individual notifications will be sent for each rejected document
  - Clarifies notifications are sent when "Reject Application" is clicked
- **Updated:** "Reject Application" button text changes to "Reject Application & Notify Applicant" when rejections exist
- **UX Improvement:** Provides clear feedback to admin about how many notifications will be sent

## Workflow

### Before This Feature
1. Admin rejects a document → ❌ Immediate notification sent to applicant
2. Admin rejects another document → ❌ Another immediate notification sent
3. Admin clicks "Reject Application" → Application status updated

**Problem:** Applicant receives notifications immediately as admin reviews documents

### After This Feature
1. Admin rejects a document → ✅ Rejection logged, NO notification sent
2. Admin rejects another document → ✅ Another rejection logged, NO notification sent
3. Admin clicks "Reject Application" → ✅ Individual notifications sent for each rejected document

**Benefits:** 
- Admin can review all documents before sending notifications
- Applicant receives all rejection notifications at once (not scattered during review process)
- Maintains existing mobile app notification format (one notification per document)
- No changes needed to mobile app notification handling

## Notification Message Format

### Each Rejected Document Gets Its Own Notification
```
Title: "Document Rejected"
Message: "Your [Document Name] has been rejected. Reason: [Rejection Reason]. Please upload a new document."
Action URL: "/applications/{applicationId}/resubmit/{documentTypeId}"
```

### Example: If 3 Documents Are Rejected
Applicant receives **3 separate notifications**:

**Notification 1:**
```
Title: "Document Rejected"
Message: "Your Valid ID has been rejected. Reason: ID is blurry. Please upload a new document."
```

**Notification 2:**
```
Title: "Document Rejected"
Message: "Your Medical Certificate has been rejected. Reason: Document expired. Please upload a new document."
```

**Notification 3:**
```
Title: "Document Rejected"
Message: "Your Proof of Residence has been rejected. Reason: Wrong document type. Please upload a new document."
```

**Why Individual Notifications?**
- Maintains compatibility with existing mobile app notification handling
- Each notification has a specific action URL for that document
- No changes required to mobile app code
- Users can act on each rejection independently

## Database Fields Reference

### documentRejectionHistory Table
```typescript
{
  // ... existing fields ...
  
  // NEW: Notification Tracking
  notificationSent?: boolean,        // Whether applicant has been notified
                                     // undefined = old records (already notified)
                                     // false = pending notification
                                     // true = notification sent
  notificationSentAt?: number,       // When notification was sent
}
```

## API Reference

### Internal Mutation: `sendRejectionNotifications`
```typescript
internal.admin.documents.sendRejectionNotifications.sendRejectionNotifications({
  applicationId: Id<"applications">
})
```

**Returns:**
```typescript
{
  success: boolean,
  message: string,
  notificationsSent: number
}
```

## Testing Checklist

- [ ] Reject a single document - verify NO immediate notification
- [ ] Reject multiple documents - verify NO immediate notifications
- [ ] Click "Reject Application" - verify individual notifications sent for each rejected document
- [ ] Verify each notification has correct document name and rejection reason
- [ ] Verify each notification has document-specific action URL
- [ ] Verify `notificationSent` field is set to `true` after sending
- [ ] Verify `notificationSentAt` timestamp is recorded
- [ ] Verify UI shows blue info banner when documents are rejected
- [ ] Verify button text changes to "Reject Application & Notify Applicant"
- [ ] Verify admin activity log records the batch notification

## Benefits

1. **Admin Control:** Admins can review all rejections before notifying the applicant
2. **Batch Sending:** All notifications are sent together when "Reject Application" is clicked
3. **Mobile App Compatibility:** Maintains existing notification format - no mobile app changes needed
4. **Independent Actions:** Each notification links to specific document resubmission page
5. **Audit Trail:** Complete tracking of when notifications are sent
6. **Better Workflow:** Admin completes entire review before applicant is notified

## Migration Notes

### Existing Rejection History Records
- **No migration needed!** The `notificationSent` field is optional for backward compatibility
- Existing records: `notificationSent` is `undefined` (treated as already notified)
- New rejections: `notificationSent` starts as `false` (pending notification)
- After notification sent: `notificationSent` becomes `true`

### Convex Schema Migration
The schema changes are backward compatible. Existing records without `notificationSent` are treated as already notified (old behavior where notifications were sent immediately).

## Future Enhancements

1. **Preview Notification:** Allow admin to preview the notification before sending
2. **Edit Notification:** Let admin customize the notification message
3. **Scheduled Sending:** Option to schedule when notification should be sent
4. **Notification Templates:** Different message templates based on rejection severity
5. **Re-notification:** Option to re-send notification if applicant hasn't responded
