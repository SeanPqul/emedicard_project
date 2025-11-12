# Payment Rejection Max Attempts - Fix Summary

## Issues Identified

Based on user testing, three critical issues were found after an application reached 3 payment rejection attempts:

1. **Unprofessional status terminology**: "Locked - Max Attempts" was displayed
2. **Payment correction button still visible**: After 3 attempts, the button to request another correction was still shown
3. **Document verification accessible**: Admin could still access document verification page even when application was locked
4. **Mobile app issues**: Status showed unprofessional text and verification steps showed as "current" when they should be blocked

## Solutions Implemented

### Backend Changes

**File**: `backend/convex/admin/payments/rejectPayment.ts`

- Changed application status from "Locked - Max Attempts" to **"Under Administrative Review"**
- This provides professional terminology suitable for production use

### Web Admin Changes

**File**: `apps/webadmin/src/app/dashboard/[id]/payment_validation/page.tsx`

#### 1. Hidden Payment Correction Button
- Added conditional logic: Button only shows if `rejectionHistory.length < 3`
- After 3 attempts, button is completely hidden

#### 2. Clear Warning Message
- Added warning box that appears when max attempts reached
- Explains the situation professionally
- Clarifies available actions: Approve if valid, or permanently reject

**File**: `apps/webadmin/src/app/dashboard/[id]/doc_verif/page.tsx`

#### 3. Blocked Document Verification Access
- Added check for "Under Administrative Review" status
- Shows blocking screen with:
  - Clear explanation of why access is blocked
  - Two action buttons:
    - "View Payment Details" - Routes to payment validation
    - "Return to Dashboard" - Goes back to main dashboard
- Prevents any document verification work until payment is resolved

### Mobile App Changes

**File**: `apps/mobile/src/features/dashboard/components/HealthCardPreview/HealthCardPreview.tsx`

#### 1. Professional Status Display
- Added `getDisplayStatus()` function to map status text
- "Under Administrative Review" displays as-is (professional)
- Updated CTA button text to "Contact support" for locked applications

**File**: `apps/mobile/src/features/dashboard/components/ApplicationStatusChecklist/ApplicationStatusChecklist.tsx`

#### 2. Correct Checklist Step States
- **Payment step**: Shows "Payment under review" with "Admin review required" subtitle (current status)
- **Orientation step**: Remains as "upcoming" - blocked until payment resolved
- **Document verification**: Shows "Document verification pending" with "Awaiting payment resolution" subtitle (upcoming)
- All future steps remain blocked until admin resolves the payment issue

## User Experience Flow

### For Applicant (Mobile App)

When application reaches max attempts:
1. Sees professional status: "Under Administrative Review"
2. Understands payment is being reviewed by admin
3. Payment step stays "current" but with admin review message
4. All future steps (orientation, documents) show as pending with clear explanation
5. CTA prompts them to contact support for assistance

### For Admin (Web Admin)

When application reaches max attempts:
1. Sees clear warning about max attempts reached
2. "Request Payment Correction" button is hidden (no more attempts allowed)
3. Two clear options:
   - **Approve Payment**: If upon review the payment is actually valid
   - **Reject Application (Final)**: To permanently close the application
4. Cannot access document verification until payment is resolved
5. Professional status terminology throughout: "Under Administrative Review"

## Business Logic

### Max Attempts Threshold
- **Limit**: 3 payment rejection attempts
- **After 3 rejections**: Application locks and requires manual admin intervention
- **No automatic progression**: System requires explicit admin decision

### Admin Decision Points

At max attempts, admin must choose ONE of:

1. **Approve the payment** ✅
   - Use if payment is actually valid but was rejected by mistake
   - Application proceeds to document verification
   
2. **Permanently reject** ❌
   - Use if payment issues cannot be resolved
   - Application is permanently closed

### Why This Design?

- **Prevents indefinite rejection loops**: Applicant can't keep submitting invalid payments
- **Forces manual review**: Admin must carefully evaluate at 3 attempts
- **Maintains professionalism**: No harsh or technical terminology shown to users
- **Clear guidance**: Both admin and applicant know what's happening and why

## Files Modified

### Backend
- `backend/convex/admin/payments/rejectPayment.ts`

### Web Admin
- `apps/webadmin/src/app/dashboard/[id]/payment_validation/page.tsx`
- `apps/webadmin/src/app/dashboard/[id]/doc_verif/page.tsx`

### Mobile App
- `apps/mobile/src/features/dashboard/components/HealthCardPreview/HealthCardPreview.tsx`
- `apps/mobile/src/features/dashboard/components/ApplicationStatusChecklist/ApplicationStatusChecklist.tsx`

## Testing Checklist

- [ ] Reject payment 3 times and verify status changes to "Under Administrative Review"
- [ ] Verify "Request Payment Correction" button disappears after 3rd rejection
- [ ] Verify document verification page is blocked with appropriate message
- [ ] Test mobile app shows professional status text
- [ ] Test mobile app checklist shows correct step states (payment = current, others = upcoming)
- [ ] Test admin can approve payment even after max attempts (for valid payments)
- [ ] Test admin can permanently reject application
- [ ] Verify payment history shows payment location and correct amount
- [ ] Test mobile CTA changes to "Contact support"

## Next Steps

1. Test the complete flow end-to-end with real data
2. Verify all terminology is professional and user-friendly
3. Ensure applicants understand what "Under Administrative Review" means
4. Consider adding help text or FAQ about the review process
5. Monitor if 3 attempts is the right threshold (may need adjustment based on real-world usage)