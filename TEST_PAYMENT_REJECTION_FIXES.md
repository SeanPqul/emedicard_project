# Payment Rejection Max Attempts - Test Plan

## Issues Fixed

### 1. Professional Status Terminology
- **Previous Issue**: After 3 rejections, status showed "Locked - Max Attempts"
- **Fix Applied**: Changed to "Under Administrative Review"
- **File Modified**: `backend/convex/admin/payments/rejectPayment.ts`

### 2. Hide Payment Correction Button After Max Attempts
- **Previous Issue**: "Request Payment Correction" button still visible after 3 rejections
- **Fix Applied**: Button is now hidden and shows warning message when max attempts reached
- **File Modified**: `apps/webadmin/src/app/dashboard/[id]/payment_validation/page.tsx`

### 3. Block Document Verification Access
- **Previous Issue**: Document verification page was accessible even when application was locked
- **Fix Applied**: Document verification page now shows blocking message when application is under review
- **File Modified**: `apps/webadmin/src/app/dashboard/[id]/doc_verif/page.tsx`

## Test Steps

### Test Case 1: Payment Rejection Flow
1. Submit a payment for an application
2. Admin rejects payment (1st attempt)
3. Applicant corrects and resubmits
4. Admin rejects payment (2nd attempt)
5. Applicant corrects and resubmits
6. Admin rejects payment (3rd attempt)
7. **Verify**: Application status changes to "Under Administrative Review"
8. **Verify**: "Request Payment Correction" button is NOT visible
9. **Verify**: Warning message shows "Maximum Attempts Reached"

### Test Case 2: Document Verification Blocking
1. Complete Test Case 1 to lock application
2. Navigate to document verification page (`/dashboard/[id]/doc_verif`)
3. **Verify**: Page shows "Application Under Administrative Review" message
4. **Verify**: Two buttons are shown:
   - "View Payment Details" - redirects to payment validation page
   - "Return to Dashboard" - goes back to main dashboard
5. **Verify**: Document verification UI is NOT accessible

### Test Case 3: Payment Validation Page Display
1. Complete Test Case 1 to lock application
2. Navigate to payment validation page
3. **Verify**: Status shows "Under Administrative Review" (not "Locked - Max Attempts")
4. **Verify**: "Request Payment Correction" button is NOT visible
5. **Verify**: Warning shows: "⚠️ Maximum Attempts Reached - This application has reached the maximum number of payment correction attempts (3) and requires manual review."

### Test Case 4: Payment History View
1. Navigate to payment history page
2. Find an application with rejected payment
3. **Verify**: Payment location is displayed (for manual payments)
4. **Verify**: Amount shows ₱60 (not ₱50)
5. Click to view application details
6. **Verify**: Routes to payment_validation page for pending payments

### Test Case 5: Mobile App Display (After Locking)
1. Complete Test Case 1 to lock application (3 rejections)
2. Open mobile app and view dashboard
3. **Verify**: Application card shows "Under Administrative Review" (not "Locked - Max Attempts")
4. **Verify**: Application checklist shows:
   - Payment: "Payment under review" with "Admin review required" (current/yellow)
   - Orientation: Remains "upcoming" (if required)
   - Document verification: "Document verification pending" with "Awaiting payment resolution" (upcoming)
5. **Verify**: CTA button says "Contact support"
6. **Verify**: No steps show as "current" except payment

### Test Case 6: Admin Action Options (At Max Attempts)
1. Complete Test Case 1 to lock application
2. As admin, view payment validation page
3. **Verify**: Warning message explains available actions clearly
4. **Verify**: "Approve Payment & Continue to Documents" button is still visible (for valid payments)
5. **Verify**: "Reject Application (Final)" button is visible
6. **Verify**: Admin can choose either action based on payment validity

## Expected Behavior Summary

### Web Admin (After 3 payment rejections):
- ✅ Application status: "Under Administrative Review" 
- ✅ Payment correction button: Hidden
- ✅ Warning message: Displayed with clear action guidance
- ✅ Document verification: Blocked with appropriate message
- ✅ Professional terminology throughout
- ✅ Admin can approve payment if valid or permanently reject

### Mobile App (When application is locked):
- ✅ Status displays: "Under Administrative Review" (not "Locked - Max Attempts")
- ✅ Payment step: Shows "Payment under review" with "Admin review required" subtitle
- ✅ Orientation step: Remains as "upcoming" (blocked until payment resolved)
- ✅ Document verification: Shows "Document verification pending" with "Awaiting payment resolution" subtitle
- ✅ CTA button: Changes to "Contact support"
- ✅ All future steps blocked until admin resolves payment issue

## Database Fields Involved

- `applications.applicationStatus`: Set to "Under Administrative Review"
- `paymentRejectionHistory.attemptNumber`: Tracks rejection count
- `payments.paymentLocation`: Stores location for manual payments
- `payments.status`: Set to "Locked"