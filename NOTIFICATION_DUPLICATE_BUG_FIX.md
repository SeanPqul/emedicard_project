# Notification Duplicate Bug Fix

## Problem Overview

When applicants resubmitted rejected documents or payments, the admin dashboard showed **duplicate notifications** and threw a Convex validation error:

```
ArgumentValidationError: Found ID "js7b78nydn0d60c1zqbvfratrx7tq03q" from table 'notifications', 
which does not match the table name in validator 'v.id("documentRejectionHistory")'
```

### Root Cause

The system was creating notifications in **TWO places** for resubmissions:

1. **Regular `notifications` table** - Created directly in `resubmitDocument.ts` and `resubmitPayment.ts`
2. **Virtual notifications from rejection history** - Created by `getRejectionHistoryNotifications` query from rejection tables

This caused:
- ✗ Duplicate notifications in the admin panel
- ✗ Type mismatch errors when marking rejection history as read (passing `notifications` ID instead of `documentRejectionHistory` ID)
- ✗ Confusion about which notification to mark as read

## Solution Implemented

### 1. Single Source of Truth Pattern

Instead of creating duplicate notifications, we now use **rejection history tables** as the single source for resubmission notifications:

- Document resubmissions → `documentRejectionHistory` table (where `wasReplaced = true`)
- Payment resubmissions → `paymentRejectionHistory` table (where `wasReplaced = true`)
- Regular notifications → `notifications` table (for other events)

### 2. Changes Made

#### Backend Changes

**File: `backend/convex/requirements/resubmitDocument.ts`**
- ❌ Removed: Direct notification creation loop (lines 132-159)
- ✅ Added: Comment explaining notifications are handled via rejection history

**File: `backend/convex/payments/resubmitPayment.ts`**
- ❌ Removed: Direct notification creation loop (lines 69-94)
- ✅ Added: Comment explaining notifications are handled via rejection history

**File: `backend/convex/notifications/getPaymentRejectionNotifications.ts`**
- ✅ Created: New query to fetch payment resubmission notifications from `paymentRejectionHistory`
- Similar pattern to `getRejectionHistoryNotifications` for documents

**File: `backend/convex/notifications/markRejectionHistoryAsRead.ts`**
- ✅ Updated: Now accepts both document and payment rejection IDs
- ✅ Added: `rejectionType` parameter (`"document"` | `"payment"`)
- Fixes the type validation error

**File: `backend/convex/notifications.ts`**
- ✅ Added: Export for `getPaymentRejectionNotifications`

#### Frontend Changes (Webadmin)

**File: `apps/webadmin/src/components/AdminNotificationBell.tsx`**
- ✅ Added: `paymentRejectionNotifications` query
- ✅ Updated: Combined notifications array includes payment rejections
- ✅ Updated: `handleNotificationClick` now handles `PaymentResubmission` type
- ✅ Fixed: Passes `rejectionType` parameter to `markRejectionHistoryAsRead`

**File: `apps/webadmin/src/app/dashboard/notifications/page.tsx`**
- ✅ Added: `paymentRejectionNotifications` query
- ✅ Updated: Type definition includes `Id<"paymentRejectionHistory">`
- ✅ Updated: Combined notifications array includes payment rejections
- ✅ Updated: `handleNotificationClick` handles both rejection types
- ✅ Added: Icon for `PaymentResubmission` notification type

## How It Works Now

### Document/Payment Resubmission Flow

```
1. User resubmits document/payment
   ↓
2. Rejection history updated: 
   - wasReplaced = true
   - replacementUploadId/replacementPaymentId set
   - status = "resubmitted"
   - replacedAt = timestamp
   ↓
3. Admin queries fetch rejection history with wasReplaced=true
   ↓
4. Rejection history converted to virtual notifications
   ↓
5. Admin sees single notification
   ↓
6. Admin clicks notification
   ↓
7. Correct rejection record marked as read (adminReadBy array)
```

### Notification Types

| Type | Source | Table | Query |
|------|--------|-------|-------|
| DocumentResubmission | Rejection History | `documentRejectionHistory` | `getRejectionHistoryNotifications` |
| PaymentResubmission | Rejection History | `paymentRejectionHistory` | `getPaymentRejectionNotifications` |
| Other types | Direct notifications | `notifications` | `getAdminNotifications` |

## Benefits

✅ **No Duplicates** - Single notification per resubmission
✅ **Type Safety** - Correct ID types passed to mutations
✅ **Clean Architecture** - Rejection history is the source of truth
✅ **Better Tracking** - `adminReadBy` array tracks which admins saw the notification
✅ **Automatic Filtering** - Only shows unread notifications per admin
✅ **Works Correctly** - Notifications route to correct application pages

## Testing Checklist

- [ ] Document resubmission creates single notification
- [ ] Payment resubmission creates single notification
- [ ] Notification bell shows correct unread count
- [ ] Clicking notification marks it as read
- [ ] Clicking notification routes to correct page
- [ ] No Convex validation errors
- [ ] Multiple admins see same notification independently
- [ ] Regular notifications (non-resubmission) still work

## Database Schema Notes

The schema already had the necessary fields:
- `documentRejectionHistory.adminReadBy` - Array of admin IDs who read the notification
- `paymentRejectionHistory.adminReadBy` - Array of admin IDs who read the notification
- `documentRejectionHistory.wasReplaced` - Boolean flag for filtering
- `paymentRejectionHistory.wasReplaced` - Boolean flag for filtering

**No schema changes required!** ✅

## Migration Notes

- No data migration needed
- Existing notifications remain in place
- New resubmissions will use the fixed flow
- Old duplicate notifications can be manually cleared if needed

---

**Fixed:** November 4, 2025
**Status:** ✅ Ready for Testing
