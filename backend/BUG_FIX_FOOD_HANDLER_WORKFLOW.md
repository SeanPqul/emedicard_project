# Food Handler Workflow Bug Fix

## Problem Summary

Food Handler (Yellow Card) applicants were showing "For Document Verification" status instead of "For Orientation" after payment approval, breaking the correct workflow.

## Root Causes

### 1. **Orientation Completion Bug** (FIXED ✅)
**File:** `convex/orientations/attendance.ts` (Line 682)

**Issue:** After completing orientation, applications were marked as "Approved" instead of "For Document Verification", skipping the document verification step entirely.

**Fix:** Changed status from "Approved" to "For Document Verification" after orientation completion.

```typescript
// BEFORE (WRONG)
applicationStatus: "Approved"

// AFTER (CORRECT)
applicationStatus: "For Document Verification"
```

### 2. **Document Upload Override Bug** (FIXED ✅)
**File:** `convex/requirements/uploadDocuments.ts` (Line 128)

**Issue:** When documents were resubmitted, the mutation blindly changed the application status to "Under Review" without checking the current workflow state (e.g., payment pending, orientation, etc.).

**Fix:** Added condition to only change status if application is actually in "For Document Verification" phase.

```typescript
// BEFORE (WRONG)
if (allDocumentsReviewable) {
  await ctx.db.patch(args.applicationId, {
    applicationStatus: "Under Review",
    updatedAt: Date.now(),
  });
}

// AFTER (CORRECT)
if (allDocumentsReviewable && application.applicationStatus === "For Document Verification") {
  await ctx.db.patch(args.applicationId, {
    applicationStatus: "Under Review",
    updatedAt: Date.now(),
  });
}
```

### 3. **Job Category Configuration Issue** (NEEDS MANUAL FIX ⚠️)
**Table:** `jobCategories`

**Issue:** The Food Handler job category might have `requireOrientation` set to `false`, `null`, or `undefined` in the database, causing the payment approval logic to skip orientation and go straight to document verification.

**Expected:** `requireOrientation: true`

## Correct Workflow for Food Handler

```
1. Draft
2. Submitted / Pending Payment
3. For Orientation ← After payment approved
4. Attendance Validation ← After check-in/check-out
5. For Document Verification ← After orientation finalized
6. Under Review ← After all documents uploaded
7. Approved ← After documents verified
```

## How to Fix

### Step 1: Check Food Handler Configuration

Run this query in Convex Dashboard (Functions tab):

```typescript
// In a query function
const foodHandler = await ctx.db
  .query("jobCategories")
  .filter(q => q.eq(q.field("name"), "Food Handler"))
  .first();

console.log("requireOrientation:", foodHandler?.requireOrientation);
```

### Step 2: Fix Food Handler Configuration (if needed)

**Option A - Using Convex Dashboard:**
1. Go to Convex Dashboard → Data tab
2. Select `jobCategories` table
3. Find "Food Handler" record
4. Edit `requireOrientation` field to `true`
5. Save

**Option B - Using the Fix Function:**
```typescript
// Call this mutation from your admin panel or Convex dashboard
await ctx.runMutation(api.admin.fixFoodHandlerWorkflow.fixFoodHandlerOrientation);
```

### Step 3: Fix Broken Applications

**Check for broken applications:**
```typescript
await ctx.runQuery(api.admin.fixFoodHandlerWorkflow.findBrokenFoodHandlerApplications);
```

**Fix a specific application:**
```typescript
await ctx.runMutation(api.admin.fixFoodHandlerWorkflow.fixBrokenApplication, {
  applicationId: "ms7a979snh149qc7e5m2hcwkpn7tky0d"
});
```

**Fix all broken applications at once:**
```typescript
await ctx.runMutation(api.admin.fixFoodHandlerWorkflow.fixAllBrokenApplications);
```

## For Your Specific Case

To fix application `ms7a979snh149qc7e5m2hcwkpn7tky0d`:

1. First, ensure Food Handler has `requireOrientation: true`
2. Then run:
```typescript
await ctx.runMutation(api.admin.fixFoodHandlerWorkflow.fixBrokenApplication, {
  applicationId: "ms7a979snh149qc7e5m2hcwkpn7tky0d"
});
```

This will:
- Change status to "For Orientation"
- Reset `orientationCompleted` to false
- Send notification to the applicant
- Log the admin activity

## Files Modified

1. ✅ `convex/orientations/attendance.ts` - Fixed orientation completion status
2. ✅ `convex/requirements/uploadDocuments.ts` - Fixed document upload override
3. ✨ `convex/admin/fixFoodHandlerWorkflow.ts` - NEW utility functions to fix broken data

## Testing Checklist

After applying fixes:

- [ ] Verify Food Handler `requireOrientation` is `true`
- [ ] Test new application: Payment approval → Should go to "For Orientation"
- [ ] Test orientation completion → Should go to "For Document Verification"
- [ ] Test document verification → Should go to "Approved"
- [ ] Verify existing broken applications are fixed
- [ ] Check that document resubmission doesn't override workflow status

## Prevention

The code fixes prevent this from happening in the future by:
1. Ensuring orientation completion leads to the correct next step
2. Preventing document uploads from overriding workflow states
3. Providing utility functions to detect and fix configuration issues

---

**Created:** November 1, 2025
**Issue ID:** Food Handler Workflow Bug
**Status:** Fixed (Code) + Manual Fix Required (Database Configuration)
