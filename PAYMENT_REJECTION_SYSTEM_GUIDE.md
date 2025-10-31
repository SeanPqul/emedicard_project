# Payment Rejection System - Implementation Guide

## Overview
This guide documents the payment rejection and resubmission system, similar to the document rejection system. It provides complete backend support for payment validation, rejection tracking, and resubmission flow.

---

## 🗂️ Database Schema

### `paymentRejectionHistory` Table
Located in: `backend/convex/schema.ts` (lines 348-398)

```typescript
paymentRejectionHistory: defineTable({
  // Core References
  applicationId: v.id("applications"),
  paymentId: v.id("payments"),
  
  // Preserved Receipt Data
  rejectedReceiptId: v.optional(v.id("_storage")),
  referenceNumber: v.string(),
  paymentMethod: v.string(),
  amount: v.float64(),
  
  // Rejection Information
  rejectionCategory: v.union(
    v.literal("invalid_receipt"),
    v.literal("wrong_amount"),
    v.literal("unclear_receipt"),
    v.literal("expired_receipt"),
    v.literal("duplicate_payment"),
    v.literal("wrong_account"),
    v.literal("incomplete_info"),
    v.literal("other")
  ),
  rejectionReason: v.string(),
  specificIssues: v.array(v.string()),
  
  // Tracking
  rejectedBy: v.id("users"),
  rejectedAt: v.float64(),
  
  // Resubmission Tracking
  wasReplaced: v.boolean(),
  replacementPaymentId: v.optional(v.id("payments")),
  replacedAt: v.optional(v.float64()),
  attemptNumber: v.float64(),
  
  // Notification Tracking
  notificationSent: v.optional(v.boolean()),
  notificationSentAt: v.optional(v.float64()),
  adminReadBy: v.optional(v.array(v.id("users"))),
  
  // Audit Fields
  ipAddress: v.optional(v.string()),
  userAgent: v.optional(v.string()),
})
```

**Indexes:**
- `by_application` - Query rejections by application
- `by_payment` - Query rejections by payment
- `by_rejected_at` - Sort by rejection date
- `by_admin` - Query rejections by admin
- `by_replacement` - Filter by resubmission status

---

## 🔧 Backend API

### 1. Reject Payment Mutation
**Path:** `backend/convex/admin/payments/rejectPayment.ts`

**Function:** `rejectPayment`

**Arguments:**
```typescript
{
  applicationId: Id<"applications">,
  paymentId: Id<"payments">,
  rejectionCategory: string,  // One of the rejection categories
  rejectionReason: string,     // Detailed explanation
  specificIssues: string[]     // Array of specific issues
}
```

**What it does:**
1. Creates a record in `paymentRejectionHistory`
2. Updates payment status to "Failed"
3. Updates application status to "Payment Rejected"
4. Logs admin activity
5. Sends notification to applicant with rejection details
6. Tracks attempt number automatically

**Returns:**
```typescript
{
  success: boolean,
  message: string,
  attemptNumber: number
}
```

### 2. Resubmit Payment Mutation
**Path:** `backend/convex/payments/resubmitPayment.ts`

**Function:** `resubmitPayment`

**Arguments:**
```typescript
{
  applicationId: Id<"applications">,
  oldPaymentId: Id<"payments">,    // The rejected payment
  newPaymentId: Id<"payments">     // The new payment
}
```

**What it does:**
1. Verifies user owns the application
2. Marks previous rejection as `wasReplaced: true`
3. Links new payment to rejection record
4. Updates application status to "For Payment Validation"
5. Notifies admin of resubmission

**Returns:**
```typescript
{
  success: boolean,
  message: string,
  newPaymentId: Id<"payments">
}
```

### 3. Get Rejection History Query
**Path:** `backend/convex/admin/rejectionHistory.ts`

**Function:** `getAllRejections`

Returns unified rejection history including documents, payments, and orientations.

**Returns:**
```typescript
Array<{
  _id: Id,
  type: "document" | "payment" | "orientation",
  applicationId: Id<"applications">,
  applicantName: string,
  applicantEmail: string,
  jobCategory: string,
  documentType: string,  // "Payment Receipt" for payments
  rejectionCategory: string,
  rejectionReason: string,
  specificIssues: string[],
  rejectedAt: number,
  rejectedBy: string,
  rejectedByEmail: string,
  attemptNumber: number,
  wasReplaced: boolean,
  replacedAt?: number
}>
```

---

## 🎨 Admin UI Implementation

### Payment Rejection Modal
**Path:** `apps/webadmin/src/app/dashboard/[id]/payment_validation/page.tsx`

The rejection modal includes:
1. **Rejection Category Dropdown** - 8 predefined categories
2. **Detailed Reason TextArea** - Required explanation
3. **Specific Issues List** - Optional bullet points
4. **Validation** - Prevents submission without category and reason

**Rejection Categories:**
- `invalid_receipt` - Fake, manipulated, or not authentic
- `wrong_amount` - Payment amount doesn't match requirements
- `unclear_receipt` - Blurry, dark, or unreadable
- `expired_receipt` - Receipt is too old or past validity
- `duplicate_payment` - Already used or duplicate transaction
- `wrong_account` - Payment made to incorrect account
- `incomplete_info` - Missing required information
- `other` - Specify in reason below

---

## 📱 Mobile Integration Guide (For Your Leader)

### Step 1: Create Payment Rejection Display Screen

Create a screen to show payment rejection details to the user (similar to DocumentRejectionHistoryScreen).

**Suggested File:** `apps/mobile/src/screens/shared/PaymentRejectionScreen.tsx`

**What to display:**
- Rejection category (user-friendly format)
- Detailed rejection reason
- List of specific issues (if any)
- Attempt number
- Date rejected
- Option to resubmit payment

**Example Query:**
```typescript
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

const paymentRejections = useQuery(
  api.admin.rejectionHistory.getAllRejections, 
  {}
);

// Filter for payment rejections for current application
const myPaymentRejections = paymentRejections?.filter(
  r => r.type === "payment" && r.applicationId === currentApplicationId
);
```

### Step 2: Implement Payment Resubmission Flow

When user taps "Resubmit Payment":

```typescript
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

const resubmitPayment = useMutation(api.payments.resubmitPayment.resubmitPayment);

const handleResubmit = async (oldPaymentId, newPaymentId) => {
  try {
    const result = await resubmitPayment({
      applicationId: currentApplicationId,
      oldPaymentId: oldPaymentId,
      newPaymentId: newPaymentId
    });
    
    if (result.success) {
      // Navigate to success screen or payment validation screen
      console.log("Payment resubmitted successfully!");
    }
  } catch (error) {
    console.error("Failed to resubmit payment:", error);
  }
};
```

### Step 3: Show Rejection in Application Status

Update your application status screen to show "Payment Rejected" status.

When status is "Payment Rejected":
- Show rejection reason
- Display "Resubmit Payment" button
- Optionally show rejection history

### Step 4: Notification Handling

Handle the `payment_rejected` notification type:

```typescript
// When user receives notification with type "payment_rejected"
if (notification.notificationType === "payment_rejected") {
  // Navigate to payment rejection screen
  // Or show inline rejection details
}
```

---

## 🧪 Testing Guide

### Test Case 1: Payment Rejection Flow
1. Navigate to payment validation page as admin
2. Click "Reject Payment"
3. Select rejection category (e.g., "Unclear Receipt")
4. Enter detailed reason
5. Add specific issues (optional)
6. Click "Confirm Rejection"
7. Verify:
   - Payment status changed to "Failed"
   - Application status changed to "Payment Rejected"
   - Notification sent to applicant
   - Record appears in rejection history

### Test Case 2: View Rejection History
1. Navigate to Dashboard → Rejection History
2. Filter by Type: "Payment"
3. Verify payment rejections appear with:
   - Type badge showing "Payment"
   - Document type as "Payment Receipt"
   - Rejection category and reason
   - Attempt number
   - Status (Pending/Resubmitted)

### Test Case 3: Payment Resubmission (Mobile)
1. User receives "Payment Rejected" notification
2. User views rejection details
3. User uploads new payment receipt
4. Call `resubmitPayment` mutation with old and new payment IDs
5. Verify:
   - Previous rejection marked as `wasReplaced: true`
   - Application status changed to "For Payment Validation"
   - Admin notified of resubmission
   - Rejection history shows "Resubmitted" status

### Test Case 4: Multiple Rejection Attempts
1. Reject payment (Attempt 1)
2. User resubmits
3. Reject again (Attempt 2)
4. Verify attempt numbers increment correctly
5. Check notification shows correct attempt number

---

## 🔗 Integration with Existing Systems

### Similarities with Document Rejection
The payment rejection system mirrors the document rejection system:

| Feature | Document Rejection | Payment Rejection |
|---------|-------------------|-------------------|
| History Table | `documentRejectionHistory` | `paymentRejectionHistory` |
| Rejection Categories | ✅ Quality, Wrong doc, etc. | ✅ Invalid, Wrong amount, etc. |
| Specific Issues | ✅ Array of issues | ✅ Array of issues |
| Attempt Tracking | ✅ Incremental | ✅ Incremental |
| Resubmission | ✅ `resubmitDocument` | ✅ `resubmitPayment` |
| Unified History | ✅ Combined view | ✅ Combined view |
| Admin Dashboard | ✅ Rejection History page | ✅ Same page |

### Notification Types
- `payment_rejected` - Sent when payment is rejected
- `payment_resubmitted` - Sent to admin when user resubmits

---

## 📊 Dashboard Features

### Rejection History Page
Shows all rejections (documents, payments, orientations) in one view.

**Filter Options:**
- Search by applicant name/email
- Filter by type (Document/Payment/Orientation)

**Payment Rejection Display:**
- Purple badge for "Payment" type
- Shows "Payment Receipt" as document type
- Displays rejection category and reason
- Shows status (Pending/Resubmitted)

### Statistics
Updated to include payment rejections:
- Total rejections (includes payments)
- Pending resubmission
- Resubmitted count
- Categories breakdown

---

## 🚀 Next Steps for Mobile Implementation

### Priority 1: Display Rejection to User
- Create screen to show payment rejection details
- Parse and display rejection category, reason, and issues
- Show attempt number

### Priority 2: Resubmission Button
- Add "Resubmit Payment" button
- Guide user through payment upload process
- Call `resubmitPayment` mutation after new payment is created

### Priority 3: Notification Integration
- Handle `payment_rejected` notification type
- Navigate to rejection details screen
- Show badge/indicator for rejected payment

### Priority 4: Testing
- Test full rejection and resubmission flow
- Verify notifications work correctly
- Test with multiple rejection attempts

---

## 💡 Code Examples for Mobile

### Example: Get Payment Rejection Details
```typescript
const getPaymentRejectionDetails = (applicationId: Id<"applications">) => {
  const rejections = useQuery(api.admin.rejectionHistory.getAllRejections, {});
  
  return rejections?.filter(
    r => r.type === "payment" && 
         r.applicationId === applicationId &&
         !r.wasReplaced  // Only show current rejection
  )[0];
};
```

### Example: Format Rejection for Display
```typescript
const formatRejectionCategory = (category: string) => {
  const labels = {
    invalid_receipt: "Invalid Receipt",
    wrong_amount: "Wrong Amount",
    unclear_receipt: "Unclear Receipt",
    expired_receipt: "Expired Receipt",
    duplicate_payment: "Duplicate Payment",
    wrong_account: "Wrong Account",
    incomplete_info: "Incomplete Information",
    other: "Other"
  };
  return labels[category] || category;
};
```

### Example: Resubmission Handler
```typescript
const handlePaymentResubmission = async (
  applicationId: Id<"applications">,
  oldPaymentId: Id<"payments">,
  receiptFile: File
) => {
  try {
    // 1. Upload new receipt
    const receiptStorageId = await uploadReceipt(receiptFile);
    
    // 2. Create new payment record
    const newPayment = await createPayment({
      applicationId,
      receiptStorageId,
      // ... other payment details
    });
    
    // 3. Call resubmission mutation
    const result = await resubmitPayment({
      applicationId,
      oldPaymentId,
      newPaymentId: newPayment.paymentId
    });
    
    if (result.success) {
      showSuccessMessage("Payment resubmitted successfully!");
      navigateToApplicationDetails();
    }
  } catch (error) {
    showErrorMessage(error.message);
  }
};
```

---

## 🐛 Troubleshooting

### Issue: Rejection not appearing in history
**Solution:** Check that:
- Schema has been pushed to Convex (`npx convex dev`)
- `paymentRejectionHistory` table exists
- Admin has permission to view the application's job category

### Issue: Resubmission not working
**Solution:** Verify:
- Both `oldPaymentId` and `newPaymentId` are valid
- User owns the application
- New payment record exists before calling resubmission

### Issue: Notifications not sent
**Solution:** Check:
- Notification type is set correctly
- `jobCategoryId` is included
- User ID matches application owner

---

## 📝 Summary

The payment rejection system is now fully implemented with:

✅ Database schema (`paymentRejectionHistory`)  
✅ Rejection mutation with categories and tracking  
✅ Resubmission mutation for mobile  
✅ Admin UI with detailed rejection modal  
✅ Unified rejection history display  
✅ Statistics updated to include payments  
✅ Notification system integration  

**For Mobile Development:**
Your leader needs to create:
1. Payment rejection display screen
2. Resubmission button and flow
3. Notification handling for `payment_rejected`

The backend is ready and provides all necessary APIs for complete mobile integration! 🎉
