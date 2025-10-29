# Application Status Flow Issue - Investigation Handoff

## Date: October 29, 2025
## Reporter: User investigating application submission flow

---

## Problem Statement

After submitting a new application form, the application shows status **"Submitted"** with text "Under initial review" instead of **"Pending Payment"** status. This breaks the intended submit-first-pay-later flow where users should have 7 days to complete payment.

### Expected Behavior
1. User completes application form
2. Application is submitted → Status: **"Pending Payment"**
3. User sees "Pay ₱60" button
4. User has 7 days to complete payment
5. For food handlers: After payment → Schedule orientation

### Actual Behavior
1. User completes application form
2. Application is submitted → Status: **"Submitted"** ❌
3. UI shows "Under initial review" (no payment option)
4. Payment flow is blocked
5. Cannot proceed with the application

---

## Investigation Summary

### Timeline Reference
- **Baseline Commit (Working)**: `bff6405` - "refactor: enhance HelpCenterScreen FAQ answer and remove unused quick links"
- **Inspector Screen Branch**: `inspector-screen-implementation` (merged at `8a0f2a0`)
- **Current HEAD**: `d30aa31` - "feat: implement tamper-proof server time and context-aware QR scanner"

### Key Findings

#### 1. Mobile App is Correctly Configured
**File**: `src/features/application/hooks/useSubmission.ts` (Line 273)
```typescript
const result = await applications.mutations.submitApplicationForm(applicationId, null, null);
```
- Calls with `null` payment parameters ✅
- Alert message says "You have 7 days to complete the payment" ✅
- Expects "Pending Payment" status ✅

#### 2. Frontend Display Logic is Correct
**File**: `src/widgets/application-list/ApplicationListWidget.tsx` (Lines 144-151)
```typescript
case 'Submitted':
  return {
    mainText: 'Application Submitted',
    subText: 'Under initial review',  // This is just display text
    icon: 'checkmark-circle-outline',
    showPaymentBadge: false,
    isUrgent: false
  };
```
- Shows "Pay ₱60" button ONLY for "Pending Payment" status ✅
- "Submitted" status does not show payment options ✅

#### 3. The Root Cause: Backend Status Logic

**Backend Function**: `submitApplicationMutation`
**Location**: Backend Convex functions

The backend is setting status to "Submitted" when it should set "Pending Payment" for applications submitted without payment.

**Current (Broken) Logic**:
```javascript
// When called with null payment parameters
applicationStatus = "Submitted" ❌
```

**Expected (Correct) Logic**:
```javascript
if (!paymentMethod && !paymentReferenceNumber) {
  applicationStatus = "Pending Payment" ✅
  paymentDeadline = Date.now() + (7 * 24 * 60 * 60 * 1000); // 7 days
} else {
  applicationStatus = "Submitted" // After payment
}
```

---

## Technical Details

### Application Status Flow (Intended)

```
┌─────────────────────────┐
│   User Submits Form     │
│   (without payment)     │
└───────────┬─────────────┘
            │
            ▼
    ┌───────────────────┐
    │ Pending Payment   │◄─── Should be HERE
    │ (7 days deadline) │
    └─────────┬─────────┘
              │
              │ User Pays
              ▼
    ┌───────────────────┐
    │ Payment Complete  │
    └─────────┬─────────┘
              │
              ▼ (Food Handlers)
    ┌───────────────────┐
    │ For Orientation   │
    └─────────┬─────────┘
              │
              ▼
    ┌───────────────────┐
    │  Schedule Session │
    └───────────────────┘
```

### Files Involved

#### Mobile App (Frontend)
1. **Submission Logic**: `src/features/application/hooks/useSubmission.ts`
   - Line 273: Calls `submitApplicationForm(applicationId, null, null)`
   - Lines 281-301: Shows "7 days to pay" alert

2. **Display Logic**: `src/widgets/application-list/ApplicationListWidget.tsx`
   - Lines 135-151: Status display mapping
   - Lines 193-211: Primary action buttons (Pay button)

3. **Payment Integration**: `src/widgets/application-detail/ApplicationDetailWidget.tsx`
   - Lines 229-307: Payment section (only shows for "Pending Payment")

4. **API Hook**: `src/features/application/hooks/useApplications.ts`
   - Lines 32-44: `submitApplicationForm` function wrapper

#### Backend (Needs Investigation)
- `backend/convex/applications/submitApplication.ts` (or similar)
- Function: `submitApplicationMutation`
- **ACTION REQUIRED**: Fix status assignment logic

---

## Changes Since Working Version

### Commits Between `bff6405` and Current
1. `d2c6cbf` - feat: add Session Attendees Screen and Scan History Screen
2. `646d9bc` - Date error on Track Attendance and Dashboard Status update refactor
3. `f4cc213` - feat: Refactor Inspector screens and add Toast feedback system
4. `77d0f09` - feat: Refactor Inspector Dashboard and add Help Center screen
5. `b00a73b` - feat: Implement structured time management for orientation schedules
6. `8a0f2a0` - Merge branch 'inspector-screen-implementation'
7. `41d9700` - feat: Implement document resubmission and bundle analysis
8. `99da9e9` - feat(inspector): enhance InspectorScannerScreen
9. `d30aa31` - feat: implement tamper-proof server time (current HEAD)

### Relevant Historical Commit
- `7477910` (September 21, 2025) - "Implement submit-first-pay-later flow"
  - This commit originally implemented the Pending Payment flow correctly
  - Modified `backend/convex/applications/submitApplication.ts`
  - Added 7-day payment deadline feature

---

## Testing & Verification

### Manual Test Case
1. **Setup**: Create a new application for food handler category
2. **Action**: Fill all required fields and documents
3. **Submit**: Complete the submission
4. **Verify**: 
   - ✅ Status should be "Pending Payment"
   - ✅ Should see countdown "X days left to pay"
   - ✅ Should see "Pay ₱60" button
   - ✅ Alert should mention "7 days to complete payment"

### Database Query to Check Status
```javascript
// Check recent applications and their status
const recentApps = await ctx.db
  .query("applications")
  .order("desc")
  .take(5);

for (const app of recentApps) {
  console.log({
    id: app._id,
    status: app.applicationStatus,
    hasPaymentDeadline: !!app.paymentDeadline,
    createdAt: new Date(app._creationTime)
  });
}
```

---

## Recommended Actions

### Immediate Fix (Backend)
1. **Locate** the `submitApplicationMutation` in Convex backend
2. **Update** status assignment logic:
   ```javascript
   // Check if payment parameters are provided
   const hasPaymentInfo = paymentMethod && paymentReferenceNumber;
   
   const applicationStatus = hasPaymentInfo 
     ? "Submitted"  // Has payment
     : "Pending Payment";  // No payment yet
   
   const paymentDeadline = hasPaymentInfo
     ? undefined
     : Date.now() + (7 * 24 * 60 * 60 * 1000); // 7 days
   ```
3. **Deploy** backend changes
4. **Test** with new application submission

### Temporary Workaround
For existing "Submitted" applications that should be "Pending Payment":
```javascript
// Use Convex dashboard or run mutation
await ctx.db.patch(applicationId, {
  applicationStatus: "Pending Payment",
  paymentDeadline: Date.now() + (7 * 24 * 60 * 60 * 1000)
});
```

### Long-term Improvements
1. Add backend validation tests for status transitions
2. Add E2E tests for submit-first-pay-later flow
3. Document status transition rules in backend code
4. Add monitoring/alerts for applications stuck in wrong status

---

## Related Documentation

- `docs/submit-first-pay-later-implementation.md` - Original implementation guide
- `docs/MAYA_INTEGRATION_PLAN.md` - Payment integration details
- `docs/ORIENTATION_SCHEDULING_HANDOFF.md` - Orientation flow after payment

---

## Branch Information

### Working Branch (Reference)
User mentioned finding a branch with correct flow - investigate this branch to compare backend implementation.

### Current Branch
- Branch: `master`
- HEAD: `d30aa31`
- Status: Broken application submission flow

---

## Notes for Next Developer

1. **Focus Area**: Backend Convex mutation `submitApplicationMutation`
2. **Don't Change**: Mobile app submission logic (it's correct)
3. **Verify**: Check if webadmin made changes to submission API
4. **Compare**: Look at commit `7477910` for original working implementation
5. **Test**: After fixing, test full flow: Apply → Submit → Pay → Schedule (for food handlers)

---

## Contact Information

- **Issue Reported**: October 29, 2025
- **Environment**: Development (Convex deployment)
- **Impact**: High - Blocks all new application submissions from proceeding to payment

---

## Appendix: UI Screenshots Context

Based on user's screenshots:
- **Screenshot 1 (Dashboard)**: Shows "Yellow Card" application with "Submitted" status
  - Status chip shows "• Submitted"
  - Timeline shows: Payment confirmed ✓, Orientation attended ✓, Verifying documents (current), Under review (current)
  - Alert at top: "Required - Schedule your mandatory orientation"

- **Screenshot 2 (Applications List)**: Shows same application
  - "FOOD HANDLER - Service Crew"
  - Status: "Application Submitted - Under initial review"
  - Reference: #757TC109
  - Date: Oct 20, 2025

**Issue**: The timeline shows steps that shouldn't be possible without payment (orientation attended) while status is still "Submitted" - indicating data inconsistency and workflow confusion.

---

## End of Handoff Document
