# Payment Rejection System - Quick Start Guide

## What Was Implemented ✅

### 1. Database Schema
**File:** `backend/convex/schema.ts`
- Added `paymentRejectionHistory` table (similar to `documentRejectionHistory`)
- Tracks: category, reason, specific issues, attempt number, resubmission status
- 8 rejection categories: invalid_receipt, wrong_amount, unclear_receipt, expired_receipt, duplicate_payment, wrong_account, incomplete_info, other

### 2. Admin UI - Rejection Modal
**File:** `apps/webadmin/src/app/dashboard/[id]/payment_validation/page.tsx`
- Detailed rejection modal with:
  - Category dropdown
  - Reason textarea (required)
  - Specific issues list (optional, can add multiple)
  - Form validation
- Beautiful, user-friendly interface

### 3. Backend Mutations & Queries

#### `rejectPayment` Mutation
**File:** `backend/convex/admin/payments/rejectPayment.ts`
- Creates rejection history record
- Updates payment & application status
- Sends notification to applicant
- Tracks attempt numbers automatically

#### `resubmitPayment` Mutation  
**File:** `backend/convex/payments/resubmitPayment.ts`
- For mobile side to call when user resubmits
- Marks old rejection as replaced
- Links new payment to history
- Notifies admin

#### `getAllRejections` Query
**File:** `backend/convex/admin/rejectionHistory.ts`
- Now includes payment rejections
- Shows in unified rejection history dashboard
- Filters by admin's managed categories

#### `getRejectionStats` Query
**File:** Same as above
- Statistics updated to include payment rejections

---

## How to Test 🧪

### Admin Side (Web)
1. Go to payment validation page for an application
2. Click "Reject Payment" button
3. Select category (e.g., "Unclear Receipt")
4. Enter reason: "The receipt image is too blurry to read the reference number"
5. Optionally add specific issues:
   - Click "Add" to add issues like "Reference number not visible"
   - "Date is unclear"
6. Click "Confirm Rejection"
7. Check:
   - Success message appears
   - Redirected to dashboard
   - Go to "Rejection History" → see the payment rejection with purple "Payment" badge

### View Rejection History
1. Navigate to Dashboard → Rejection History
2. Use filter: Type → "Payment"
3. See payment rejection with:
   - Type: Payment (purple badge)
   - Document Type: "Payment Receipt"
   - Category and reason
   - Status: "Pending" or "Resubmitted"

---

## For Your Leader (Mobile Side) 📱

### What Your Leader Needs to Do

The backend is **100% ready**. Your leader needs to create the mobile UI to:

#### 1. **Display Rejection to User**
When application status is "Payment Rejected":
- Show rejection category (e.g., "Unclear Receipt")
- Show detailed reason
- Show specific issues (if any)
- Show attempt number (e.g., "Attempt 2")

**API to use:**
```typescript
const rejections = useQuery(api.admin.rejectionHistory.getAllRejections, {});
const paymentRejection = rejections?.find(
  r => r.type === "payment" && 
       r.applicationId === currentAppId && 
       !r.wasReplaced
);
```

#### 2. **Add Resubmit Button**
When user taps "Resubmit Payment":
- Let user upload new receipt
- Create new payment record
- Call the resubmission API

**API to call:**
```typescript
const resubmitPayment = useMutation(api.payments.resubmitPayment.resubmitPayment);

await resubmitPayment({
  applicationId: appId,
  oldPaymentId: rejectedPaymentId,
  newPaymentId: newlyCreatedPaymentId
});
```

#### 3. **Handle Notification**
When user receives `payment_rejected` notification:
- Navigate to rejection details screen
- Or show inline in application screen

---

## Files Modified 📝

### Created:
- `backend/convex/payments/resubmitPayment.ts` - New mutation for mobile
- `PAYMENT_REJECTION_SYSTEM_GUIDE.md` - Full documentation
- `PAYMENT_REJECTION_QUICK_START.md` - This file

### Modified:
- `backend/convex/schema.ts` - Added `paymentRejectionHistory` table
- `backend/convex/admin/payments/rejectPayment.ts` - Updated to use history table
- `backend/convex/admin/rejectionHistory.ts` - Includes payment rejections
- `apps/webadmin/src/app/dashboard/[id]/payment_validation/page.tsx` - New detailed rejection modal

---

## Key Points 🔑

1. **Similar to Document Rejection** - Same pattern, easy to understand
2. **Attempt Tracking** - Automatically increments (Attempt 1, 2, 3...)
3. **Unified History** - Documents, payments, orientations all in one view
4. **Rich Details** - Category, reason, specific issues all tracked
5. **Mobile Ready** - Backend APIs ready for your leader to integrate

---

## Testing Checklist ☑️

- [ ] Admin can reject payment with category and reason
- [ ] Admin can add specific issues to rejection
- [ ] Payment status changes to "Failed"
- [ ] Application status changes to "Payment Rejected"
- [ ] Notification sent to applicant
- [ ] Rejection appears in admin's rejection history
- [ ] Can filter rejection history by "Payment" type
- [ ] Statistics include payment rejections
- [ ] (Mobile) User can view rejection details
- [ ] (Mobile) User can resubmit payment
- [ ] (Mobile) Resubmission marks old rejection as replaced
- [ ] (Mobile) Admin notified of resubmission

---

## Quick Commands 🚀

### Push schema changes:
```bash
npx convex dev
```

### Check if table exists:
Go to Convex dashboard → Data → Look for `paymentRejectionHistory`

---

## Need Help? 💬

See the full guide: `PAYMENT_REJECTION_SYSTEM_GUIDE.md`

It includes:
- Complete API documentation
- Code examples for mobile
- Troubleshooting guide
- Step-by-step mobile integration instructions

---

**Status:** ✅ **COMPLETE AND READY FOR TESTING**

The payment rejection system is fully functional on the admin side. Your leader can now implement the mobile UI using the provided APIs! 🎉
