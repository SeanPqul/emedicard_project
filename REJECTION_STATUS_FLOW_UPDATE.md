# Rejection History Status Flow Update

## Overview
Updated the rejection history system to properly track the complete status flow lifecycle instead of just using a boolean `wasReplaced` field.

## Problem
Previously, the rejection history only showed two statuses:
- **Pending** - When `wasReplaced` = false
- **Resubmitted** - When `wasReplaced` = true

This was confusing because it didn't show what happened after resubmission (was it approved or rejected again?).

## Solution
Added a new `status` field to track the complete lifecycle:

### Status Flow
1. **pending** → Initial state when document/payment is rejected by admin
2. **resubmitted** → User has resubmitted the document/payment
3. **rejected** → Admin rejected the resubmission
4. **approved** → Admin approved the resubmission

### Visual Status Badges
- **Pending** - Yellow badge (🟡)
- **Resubmitted** - Blue badge (🔵) 
- **Rejected** - Red badge (🔴)
- **Approved** - Green badge (🟢)

## Changes Made

### 1. Backend Schema (schema.ts)
Added optional `status` field to both rejection history tables:
- `documentRejectionHistory.status`
- `paymentRejectionHistory.status`

```typescript
status: v.optional(v.union(
  v.literal("pending"),
  v.literal("resubmitted"),
  v.literal("rejected"),
  v.literal("approved")
))
```

### 2. Backend Mutations

#### When Rejection Occurs
**Files**: `admin/documents/rejectDocument.ts`, `admin/payments/rejectPayment.ts`
- Set initial status to `"pending"` when creating rejection record

#### When User Resubmits
**Files**: `requirements/resubmitDocument.ts`, `payments/resubmitPayment.ts`
- Update status to `"resubmitted"` when user resubmits

#### When Admin Reviews Resubmission
**Files**: `admin/reviewDocument.ts`, `admin/validatePayment.ts`
- Update status to `"approved"` when admin approves the resubmitted document/payment
- Update status to `"rejected"` when admin rejects the resubmission again

### 3. Backend Query
**File**: `admin/rejectionHistory.ts`
- Added `status` field to the returned rejection data for both documents and payments

### 4. Frontend Pages
**Files**: 
- `apps/webadmin/src/app/dashboard/rejection-history/page.tsx`
- `apps/webadmin/src/app/super-admin/rejection-history/page.tsx`

Updated both pages with:
- Added `RejectionStatus` type definition
- Updated `Rejection` type to include optional `status` field
- Enhanced `getStatusBadge()` function to handle all 4 status states
- Falls back to `wasReplaced` boolean for backward compatibility with existing data

## Status Logic

The status flow works as follows:

```
[Admin Rejects] 
    ↓
[Status: pending] (Yellow - Waiting for user)
    ↓
[User Resubmits]
    ↓
[Status: resubmitted] (Blue - Admin needs to review)
    ↓
[Admin Reviews]
    ↓
[Status: approved] (Green) OR [Status: rejected] (Red)
```

## Backward Compatibility
The system maintains backward compatibility:
- Old rejection records without `status` field will display based on `wasReplaced`:
  - `wasReplaced = false` → Shows as "Pending"
  - `wasReplaced = true` → Shows as "Resubmitted"
- New rejection records will use the `status` field for accurate tracking

## Testing Recommendations

1. **Create a new rejection**
   - Verify status shows as "Pending" (yellow)

2. **Resubmit the rejected item**
   - Verify status changes to "Resubmitted" (blue)

3. **Admin approves the resubmission**
   - Verify status changes to "Approved" (green)

4. **Admin rejects the resubmission**
   - Verify status changes to "Rejected" (red)
   - A new pending record should be created if user resubmits again

5. **Check old records**
   - Verify old rejection records still display correctly using fallback logic

## Benefits

1. **Clarity**: Admins can now see exactly what happened with each rejection
2. **Transparency**: Complete audit trail of the rejection → resubmission → resolution process
3. **Better UX**: Color-coded badges make it easy to understand status at a glance
4. **Debugging**: Easier to track down issues in the resubmission workflow
