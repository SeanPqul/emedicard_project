# Payment System Guide for Leaders

**Project**: eMediCard Health Card Application System  
**Module**: Payment Processing & Validation  
**Created**: 2025-11-01  
**For**: Leadership Review Before Master Commit

---

## 📋 Table of Contents

1. [System Overview](#system-overview)
2. [Payment Workflow](#payment-workflow)
3. [Payment Status Flow](#payment-status-flow)
4. [Admin Payment Validation](#admin-payment-validation)
5. [Payment Rejection System](#payment-rejection-system)
6. [Payment Resubmission Process](#payment-resubmission-process)
7. [Maya Payment Integration](#maya-payment-integration)
8. [Database Schema](#database-schema)
9. [Key Files & Functions](#key-files--functions)
10. [Testing Checklist](#testing-checklist)
11. [Common Issues & Solutions](#common-issues--solutions)

---

## 🎯 System Overview

The payment system handles all payment processing for health card applications. It supports multiple payment methods and includes a comprehensive validation, rejection, and resubmission workflow.

### Payment Methods Supported

1. **Gcash** - Mobile wallet payment
2. **Maya** - Digital payment platform (with API integration)
3. **BaranggayHall** - Cash payment at barangay hall
4. **CityHall** - Cash payment at city hall

### Key Features

- ✅ Automated Maya payment integration via API
- ✅ Manual payment receipt upload (Gcash, BaranggayHall, CityHall)
- ✅ Admin payment validation workflow
- ✅ Detailed payment rejection with specific issues tracking
- ✅ Payment resubmission with rejection history
- ✅ Admin notifications for payment events
- ✅ Applicant notifications for rejection/approval
- ✅ Audit logging for all payment actions

---

## 🔄 Payment Workflow

### 1. **Application Submission**
```
User submits application → Status: "Submitted"
```

### 2. **Payment Creation**
```
User creates payment → Payment Status: "Pending"
                     → Application Status: "For Payment Validation"
```

**File**: `convex/payments/createPayment.ts`

**Process**:
- User submits payment details (amount, serviceFee, netAmount, method, referenceNumber)
- Receipt can be uploaded (optional for Maya, required for others)
- System validates:
  - Application exists
  - No existing payment for this application (unless resubmission)
  - Valid payment amounts
  - Net amount = amount + service fee

### 3. **Admin Validation**
```
Admin reviews payment → Validates or Rejects
```

**File**: `convex/admin/validatePayment.ts`, `convex/admin/payments/rejectPayment.ts`

### 4. **Next Steps After Approval**
```
Payment Complete → Check if orientation required:
                → YES: Status = "For Orientation"
                → NO:  Status = "For Document Verification"
```

---

## 📊 Payment Status Flow

```mermaid
Pending → Processing → Complete ✅
       ↓           ↓
       ↓           Failed ❌
       ↓           Expired ⏰
       ↓           Cancelled 🚫
       ↓
       Refunded 💰
```

### Status Definitions

| Status | Description | Application Status |
|--------|-------------|-------------------|
| **Pending** | Payment created, awaiting admin validation | For Payment Validation |
| **Processing** | Maya checkout session active | For Payment Validation |
| **Complete** | Payment approved by admin | For Orientation / For Document Verification |
| **Failed** | Payment rejected by admin | Payment Rejected |
| **Expired** | Maya checkout session expired | Payment Rejected |
| **Cancelled** | Payment cancelled by user/system | Payment Rejected |
| **Refunded** | Payment refunded to user | Refunded |

---

## 👨‍💼 Admin Payment Validation

### Function: `validatePayment.validate`

**Location**: `convex/admin/validatePayment.ts`

**What it does**:

1. **Validates Payment**
   - Updates payment status to "Complete" or "Failed"
   - Logs admin activity
   - Records timestamp

2. **Updates Application Status**
   - If Complete + Orientation Required → "For Orientation"
   - If Complete + No Orientation → "For Document Verification"
   - If Failed → "Rejected"

3. **Job Category Check**
   - Yellow Card (Food Handler) → Requires orientation
   - Other cards → Skip to document verification

### Required Parameters

```typescript
{
  paymentId: Id<"payments">,
  applicationId: Id<"applications">,
  newStatus: "Complete" | "Failed"
}
```

### Admin Activity Log

```typescript
{
  adminId: user._id,
  activityType: "payment_rejection" | "payment_approval",
  details: "Payment for application of [Name] was [status]",
  timestamp: Date.now(),
  applicationId: applicationId,
  jobCategoryId: application.jobCategoryId
}
```

---

## ❌ Payment Rejection System

### Function: `rejectPayment.rejectPayment`

**Location**: `convex/admin/payments/rejectPayment.ts`

**What it does**:

1. **Creates Rejection Record**
   - Stores in `paymentRejectionHistory` table
   - Preserves rejected receipt for audit
   - Tracks rejection category & specific issues
   - Records attempt number (1st, 2nd, 3rd rejection)

2. **Updates Payment**
   - Status → "Failed"
   - Adds failure reason

3. **Updates Application**
   - Status → "Payment Rejected"
   - Adds admin remarks

4. **Notifications**
   - Notifies applicant with detailed rejection reason
   - Notifies other admins (not the one who rejected)

### Rejection Categories

```typescript
type RejectionCategory = 
  | "invalid_receipt"      // Receipt is fake, manipulated
  | "wrong_amount"         // Incorrect payment amount
  | "unclear_receipt"      // Receipt is blurry/unreadable
  | "expired_receipt"      // Receipt is too old
  | "duplicate_payment"    // Payment already used
  | "wrong_account"        // Payment to wrong account
  | "incomplete_info"      // Missing required info
  | "other"                // Other reasons
```

### Required Parameters

```typescript
{
  applicationId: Id<"applications">,
  paymentId: Id<"payments">,
  rejectionCategory: string,
  rejectionReason: string,
  specificIssues: string[]  // Array of bullet points
}
```

### Example Rejection Flow

```typescript
// Admin rejects payment
await rejectPayment({
  applicationId: "j123abc",
  paymentId: "k456def",
  rejectionCategory: "unclear_receipt",
  rejectionReason: "Receipt image is too blurry to verify",
  specificIssues: [
    "Reference number is not readable",
    "Payment amount is unclear",
    "Date is cut off in the image"
  ]
});

// Results in:
// 1. Payment status → "Failed"
// 2. Application status → "Payment Rejected"
// 3. Applicant notification sent
// 4. Admin activity logged
// 5. Rejection record created (attempt #1)
```

---

## 🔄 Payment Resubmission Process

### Function: `createPaymentMutation` (with resubmission detection)

**Location**: `convex/payments/createPayment.ts`

**How it works**:

1. **Detects Resubmission**
   - Checks for existing payment with status "Failed"
   - If found → Resubmission mode activated

2. **Replaces Old Payment**
   - Deletes old rejected payment
   - Creates new payment with "Pending" status
   - Updates rejection record:
     - `wasReplaced: true`
     - `replacementPaymentId: newPaymentId`
     - `replacedAt: timestamp`

3. **Notifies Admins**
   - Filters admins by job category (managed categories)
   - Creates notification for each relevant admin
   - Notification type: "payment_resubmitted"
   - Includes action URL for quick review

4. **Updates Application**
   - Status → "For Payment Validation"

### Resubmission Workflow

```
User Payment Rejected
       ↓
User uploads new receipt
       ↓
createPaymentMutation detects old payment
       ↓
System marks rejection as replaced
       ↓
Admins notified about resubmission
       ↓
Admin reviews new payment
```

### Code Example (from createPayment.ts)

```typescript
// Check if payment already exists
const existingPayment = await ctx.db
  .query("payments")
  .withIndex("by_application", (q) => q.eq("applicationId", applicationId))
  .unique();

if (existingPayment) {
  if (existingPayment.paymentStatus === "Failed") {
    // RESUBMISSION DETECTED
    isResubmission = true;
    oldPaymentId = existingPayment._id;
    await ctx.db.delete(existingPayment._id); // Delete old payment
  } else {
    throw new Error("Payment already exists");
  }
}

// ... create new payment ...

if (isResubmission && oldPaymentId) {
  // Mark rejection as replaced
  const rejectionRecord = await ctx.db
    .query("paymentRejectionHistory")
    .withIndex("by_payment", (q) => q.eq("paymentId", oldPaymentId))
    .order("desc")
    .first();
  
  if (rejectionRecord) {
    await ctx.db.patch(rejectionRecord._id, {
      wasReplaced: true,
      replacementPaymentId: paymentId,
      replacedAt: Date.now()
    });
  }
  
  // Notify relevant admins
  const relevantAdmins = allAdmins.filter(admin => 
    !admin.managedCategories || 
    admin.managedCategories.length === 0 || 
    admin.managedCategories.includes(application.jobCategoryId)
  );
  
  for (const admin of relevantAdmins) {
    await ctx.db.insert("notifications", {
      userId: admin._id,
      title: "Payment Resubmitted",
      message: `${userName} has resubmitted payment after rejection...`,
      notificationType: "payment_resubmitted",
      actionUrl: `/dashboard/${applicationId}/payment_validation`
    });
  }
}
```

---

## 💳 Maya Payment Integration

### Overview

Maya payments are processed via API integration with automatic status updates through webhooks.

### Key Files

- `convex/payments/maya/checkout.ts` - Create Maya checkout sessions
- `convex/payments/maya/webhook.ts` - Handle Maya webhook callbacks
- `convex/payments/maya/statusUpdates.ts` - Update payment status
- `convex/payments/maya/client.ts` - Maya API client
- `convex/payments/maya/constants.ts` - Maya configuration
- `convex/payments/maya/types.ts` - TypeScript types

### Maya Payment Flow

```
1. User selects Maya payment
   ↓
2. createMayaCheckout action creates checkout session
   ↓
3. User redirected to Maya checkout URL
   ↓
4. User completes payment on Maya
   ↓
5. Maya sends webhook to our system
   ↓
6. Webhook handler updates payment status
   ↓
7. Application status updated automatically
```

### Webhook Events Handled

```typescript
PAYMENT_SUCCESS  → Payment Complete
PAYMENT_FAILED   → Payment Failed
PAYMENT_EXPIRED  → Payment Expired
PAYMENT_CANCELLED → Payment Cancelled
```

### Payment Logging

All Maya payment events are logged in `paymentLogs` table:

```typescript
{
  paymentId: Id<"payments">,
  eventType: "checkout_created" | "payment_success" | "payment_failed" | ...,
  mayaPaymentId: string,
  mayaCheckoutId: string,
  amount: number,
  timestamp: number,
  metadata: any
}
```

---

## 💾 Database Schema

### Payments Table

```typescript
{
  _id: Id<"payments">,
  applicationId: Id<"applications">,
  amount: number,              // Base amount
  serviceFee: number,          // Service fee
  netAmount: number,           // Total (amount + serviceFee)
  paymentMethod: "Gcash" | "Maya" | "BaranggayHall" | "CityHall",
  paymentProvider?: "maya_api" | "manual" | "cash",
  referenceNumber: string,     // Transaction reference
  receiptStorageId?: Id<"_storage">, // Uploaded receipt
  paymentStatus: "Pending" | "Processing" | "Complete" | "Failed" | "Refunded" | "Cancelled" | "Expired",
  
  // Maya specific
  mayaCheckoutId?: string,
  mayaPaymentId?: string,
  checkoutUrl?: string,
  
  // Failure tracking
  failureReason?: string,
  
  // Timestamps
  settlementDate?: number,
  updatedAt?: number,
  
  // Audit
  webhookPayload?: any,
  transactionFee?: number
}
```

### Payment Rejection History Table

```typescript
{
  _id: Id<"paymentRejectionHistory">,
  applicationId: Id<"applications">,
  paymentId: Id<"payments">,
  
  // Preserved Receipt Data
  rejectedReceiptId?: Id<"_storage">,
  referenceNumber: string,
  paymentMethod: string,
  amount: number,
  
  // Rejection Information
  rejectionCategory: "invalid_receipt" | "wrong_amount" | "unclear_receipt" | ...,
  rejectionReason: string,         // Detailed explanation
  specificIssues: string[],        // Bullet points
  
  // Tracking
  rejectedBy: Id<"users">,         // Admin who rejected
  rejectedAt: number,
  
  // Resubmission Tracking
  wasReplaced: boolean,
  replacementPaymentId?: Id<"payments">,
  replacedAt?: number,
  attemptNumber: number,           // 1st, 2nd, 3rd attempt
  
  // Notification
  notificationSent?: boolean,
  notificationSentAt?: number,
  adminReadBy?: Id<"users">[],     // Admins who have read this
  
  // Audit
  ipAddress?: string,
  userAgent?: string
}
```

### Payment Logs Table

```typescript
{
  _id: Id<"paymentLogs">,
  paymentId?: Id<"payments">,
  eventType: "checkout_created" | "payment_success" | "payment_failed" | "webhook_received" | ...,
  mayaPaymentId?: string,
  mayaCheckoutId?: string,
  amount?: number,
  currency?: string,
  errorMessage?: string,
  metadata?: any,
  timestamp: number,
  ipAddress?: string,
  userAgent?: string
}
```

---

## 📂 Key Files & Functions

### Payment Creation

| File | Function | Purpose |
|------|----------|---------|
| `payments/createPayment.ts` | `createPaymentMutation` | Create payment record, handle resubmissions |
| `payments/updatePaymentStatus.ts` | `updateStatus` | Update payment status |
| `payments/getUserPayments.ts` | `getUserPayments` | Get user's payment history |
| `payments/getPaymentByFormId.ts` | `getByFormId` | Get payment by application ID |
| `payments/getForApplication.ts` | `get` | Get payment details for application |

### Admin Payment Management

| File | Function | Purpose |
|------|----------|---------|
| `admin/validatePayment.ts` | `validate` | Approve/reject payment (simple) |
| `admin/payments/rejectPayment.ts` | `rejectPayment` | Reject with detailed tracking |
| `admin/payments/testResubmission.ts` | `testResubmission` | Test resubmission workflow |

### Maya Integration

| File | Function | Purpose |
|------|----------|---------|
| `payments/maya/checkout.ts` | `createMayaCheckout` | Create Maya checkout session |
| `payments/maya/webhook.ts` | `handleMayaWebhook` | Process Maya webhooks |
| `payments/maya/statusUpdates.ts` | `updatePaymentSuccess`, etc. | Update payment status from Maya |
| `payments/maya/handleReturn.ts` | `handleMayaReturn` | Handle user return from Maya |
| `payments/maya/abandonedPayments.ts` | `checkAbandonedPayments` | Handle abandoned checkouts |

---

## ✅ Testing Checklist

### Payment Creation

- [ ] Create payment with Gcash method
- [ ] Create payment with Maya method
- [ ] Create payment with BaranggayHall method
- [ ] Create payment with CityHall method
- [ ] Upload receipt successfully
- [ ] Validate amount calculations (netAmount = amount + serviceFee)
- [ ] Check duplicate payment prevention

### Admin Validation

- [ ] Approve payment → Status becomes "Complete"
- [ ] Approve payment for Yellow Card → Status becomes "For Orientation"
- [ ] Approve payment for other cards → Status becomes "For Document Verification"
- [ ] Reject payment → Status becomes "Failed"
- [ ] Admin activity logged correctly
- [ ] Applicant receives notification

### Payment Rejection

- [ ] Reject payment with "invalid_receipt" category
- [ ] Reject payment with specific issues
- [ ] Rejection record created in history table
- [ ] Applicant notified with rejection details
- [ ] Other admins notified
- [ ] Attempt number increments correctly
- [ ] Application status changes to "Payment Rejected"

### Payment Resubmission

- [ ] Resubmit after rejection
- [ ] Old payment deleted
- [ ] New payment created with "Pending" status
- [ ] Rejection record marked as replaced
- [ ] Admins notified about resubmission
- [ ] Application status changes to "For Payment Validation"
- [ ] Multiple resubmissions work correctly (2nd, 3rd attempts)

### Maya Integration

- [ ] Create Maya checkout session
- [ ] Checkout URL generated correctly
- [ ] User can complete payment on Maya
- [ ] Webhook received and processed
- [ ] Payment status updated to "Complete" on success
- [ ] Payment status updated to "Failed" on failure
- [ ] Payment logs created for all events
- [ ] Abandoned checkout detection works
- [ ] Webhook signature validation works

### Edge Cases

- [ ] Prevent duplicate payments for same application
- [ ] Handle invalid application ID
- [ ] Handle invalid payment amounts (negative, zero)
- [ ] Handle incorrect netAmount calculation
- [ ] Handle non-admin trying to validate payment
- [ ] Handle resubmission when no rejection exists
- [ ] Handle Maya webhook timeout
- [ ] Handle Maya checkout expiry

---

## 🔧 Common Issues & Solutions

### Issue 1: Payment Already Exists Error

**Problem**: User tries to create payment when one already exists

**Solution**:
```typescript
// Check existing payment status
// If Failed → Allow resubmission
// If Pending/Complete → Block creation
```

**Location**: `payments/createPayment.ts` (lines 27-53)

---

### Issue 2: Admin Can't See Payment

**Problem**: Admin notification not sent to category-specific admin

**Solution**: Check managed categories filter
```typescript
// Filter admins who manage this category OR super admins
const relevantAdmins = allAdmins.filter(admin => 
  !admin.managedCategories || 
  admin.managedCategories.length === 0 || 
  admin.managedCategories.includes(application.jobCategoryId)
);
```

**Location**: `payments/createPayment.ts` (lines 105-109)

---

### Issue 3: Resubmission Not Detected

**Problem**: System doesn't recognize payment resubmission

**Solution**: Check for existing payment with "Failed" status
```typescript
if (existingPayment.paymentStatus === "Failed") {
  isResubmission = true;
  // Delete old payment and create new one
}
```

**Location**: `payments/createPayment.ts` (lines 44-47)

---

### Issue 4: Maya Webhook Not Working

**Problem**: Maya payments don't update automatically

**Checklist**:
1. Verify webhook URL is registered with Maya
2. Check webhook signature validation
3. Verify Maya API keys are correct
4. Check payment logs for webhook events
5. Ensure `mayaPaymentId` is stored correctly

**Location**: 
- `payments/maya/webhook.ts` - Webhook handler
- `http.ts` - HTTP endpoint registration

---

### Issue 5: Wrong Application Status After Payment

**Problem**: Application status doesn't update correctly after payment approval

**Root Cause**: Job category orientation requirement not checked

**Solution**: Verify job category `requireOrientation` field
```typescript
const jobCategory = await ctx.db.get(application.jobCategoryId);
const requiresOrientation = jobCategory?.requireOrientation === true;

nextApplicationStatus = requiresOrientation 
  ? "For Orientation" 
  : "For Document Verification";
```

**Location**: `admin/validatePayment.ts` (lines 34-42)

---

## 📊 Admin Dashboard Views

### Payments to Validate

Admins should see:
- Application ID & Applicant name
- Payment method
- Amount & Reference number
- Receipt (if uploaded)
- Date submitted
- Action buttons: Approve, Reject

### Rejection History

Admins should see:
- All rejection attempts for an application
- Rejection category & reason
- Specific issues
- Which admin rejected
- Whether replaced by new payment
- Attempt number

### Payment Logs

For debugging, admins can view:
- All payment events (checkout_created, payment_success, etc.)
- Maya payment IDs
- Timestamps
- Error messages

---

## 🚀 Deployment Checklist

Before committing to master:

- [ ] All payment creation tests pass
- [ ] All admin validation tests pass
- [ ] All rejection tests pass
- [ ] All resubmission tests pass
- [ ] Maya integration tested in staging
- [ ] Webhook endpoint accessible from Maya
- [ ] Admin notifications working
- [ ] Applicant notifications working
- [ ] Database indexes created for payment queries
- [ ] Payment logs retention policy defined
- [ ] Error handling tested
- [ ] Security review completed (admin role checks)
- [ ] Documentation updated

---

## 📝 Notes for Leader

### Key Business Rules

1. **One Payment Per Application**: Only one active payment allowed per application (unless resubmission)
2. **Resubmission Allowed**: Users can resubmit payment after rejection
3. **Admin Category Filtering**: Admins only see payments for their managed categories (or all if super admin)
4. **Orientation Check**: Yellow Card requires orientation before document verification
5. **Receipt Preservation**: Rejected receipts are NEVER deleted (audit trail)

### Security Considerations

1. **Admin Role Check**: All admin functions verify `AdminRole(ctx)`
2. **User Ownership**: Users can only resubmit their own applications
3. **Webhook Signature**: Maya webhooks verified with HMAC signature
4. **Activity Logging**: All admin actions logged in `adminActivityLogs`

### Performance Considerations

1. **Database Indexes**: 
   - `payments.by_application`
   - `payments.by_maya_payment`
   - `paymentRejectionHistory.by_application`
   - `paymentRejectionHistory.by_payment`
   - `paymentLogs.by_payment`

2. **Query Optimization**: Filter admins by managed categories before notifying

### Future Enhancements

1. **Bulk Payment Validation**: Allow admins to approve/reject multiple payments
2. **Payment Reports**: Generate payment summary reports
3. **Refund Workflow**: Implement refund request and processing
4. **Payment Reminders**: Remind users to complete pending payments
5. **Fraud Detection**: Flag suspicious payment patterns

---

## 🆘 Support Contacts

For questions about this system:

- **Backend Developer**: [Your Name]
- **Payment Integration**: [Maya Integration Team]
- **System Admin**: [Admin Team]

---

**Document Version**: 1.0  
**Last Updated**: 2025-11-01  
**Status**: Ready for Leadership Review
