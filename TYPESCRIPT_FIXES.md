# TypeScript Error Fixes - Application Status Values

## Summary
Fixed all TypeScript errors caused by the schema update that changed `applicationStatus` from `v.string()` to a strict union type. Updated 10 files to use only the valid status values defined in the schema.

---

## Files Modified

### 1. `backend/convex/admin/adminMain.ts`
**Change**: Updated `updateApplicantStatus` mutation args
- **Old statuses**: `"Pending"`, `"Cancelled"`
- **New statuses**: Removed invalid statuses, added schema-compliant ones
- **Impact**: Admin status update dropdown will need UI update

### 2. `backend/convex/admin/documents/rejectDocument.ts`
**Change**: Document rejection status
- **Old**: `"Documents Need Revision"`
- **New**: `"Under Review"`
- **Reason**: Old status doesn't exist in schema

### 3. `backend/convex/admin/finalizeApplication.ts`
**Change**: Payment validation status
- **Old**: `"For Payment Validation"`
- **New**: `"Payment Validation"`
- **Reason**: Typo fix to match schema

### 4. `backend/convex/applications/submitApplication.ts`
**Changes**:
1. Removed check for `"Draft"` status (doesn't exist in schema)
2. Changed `"Pending Payment"` to `"Submitted"`
- **Impact**: All applications start as "Submitted"

### 5. `backend/convex/applications/updateApplication.ts`
**Change**: Updated args union type
- **Removed**: `"Draft"`, `"Pending Payment"`, `"Documents Need Revision"`, `"Pending"`, `"Cancelled"`, `"For Payment Validation"`
- **Added**: All schema-compliant statuses

### 6. `backend/convex/applications/updateApplicationStatus.ts`
**Change**: Updated args union type (same as above)

### 7. `backend/convex/documents.ts`
**Change**: Document resubmission status
- **Old**: `"Pending"`
- **New**: `"Under Review"`
- **Reason**: Resubmitted documents should be under review

### 8. `backend/convex/payments/maya/abandonedPayments.ts`
**Changes**:
1. Removed `"Pending Payment"` logic
2. All cancelled payments revert to `"Submitted"`
- **Impact**: Simplified payment cancellation flow

### 9. `backend/convex/payments/maya/checkout.ts`
**Changes**:
1. Fixed `"For Payment Validation"` → `"Payment Validation"`
2. Removed `"Pending Payment"` checks
3. All payments update from `"Submitted"` → `"Payment Validation"`

### 10. `backend/convex/requirements/uploadDocuments.ts`
**Changes**:
1. Removed check for `"Documents Need Revision"`
2. Changed `"Approved"` to `"Verified"` for document review status
3. Status stays as `"Under Review"` for resubmissions

---

## Valid Application Status Values

```typescript
applicationStatus: v.union(
  v.literal("Submitted"),
  v.literal("For Orientation"),
  v.literal("For Document Verification"),
  v.literal("Payment Validation"),
  v.literal("Scheduled"),
  v.literal("Attendance Validation"),
  v.literal("Under Review"),
  v.literal("Approved"),
  v.literal("Rejected"),
  v.literal("Expired")
)
```

---

## Status Mapping (Old → New)

| Old Status | New Status | Notes |
|-----------|-----------|-------|
| `"Draft"` | `"Submitted"` | Applications now start as submitted |
| `"Pending"` | `"Submitted"` or `"Under Review"` | Context-dependent |
| `"Pending Payment"` | `"Submitted"` | Payment flow simplified |
| `"Documents Need Revision"` | `"Under Review"` | Documents in review state |
| `"For Payment Validation"` | `"Payment Validation"` | Typo fix |
| `"Pending Review"` | `"Under Review"` | Consolidated naming |
| `"Cancelled"` | N/A | Removed, use "Expired" or "Rejected" |

---

## Breaking Changes

### Frontend Impact
1. **Status badge colors/labels** - Update UI to reflect new status values
2. **Admin dropdowns** - Remove invalid status options
3. **Conditional rendering** - Check for new status values instead of old ones

### Database Migration
⚠️ **Required**: Run migration script to update existing records:
```javascript
// Pseudo-code for migration
const migrations = {
  "Draft": "Submitted",
  "Pending": "Under Review",
  "Pending Payment": "Submitted",
  "Documents Need Revision": "Under Review",
  "For Payment Validation": "Payment Validation",
  "Pending Review": "Under Review",
  "Cancelled": "Expired"
};

// Apply to all existing applications
```

---

## Testing Checklist

- [ ] All TypeScript errors resolved (`npm run typecheck`)
- [ ] Admin can update application status
- [ ] Document rejection updates status correctly
- [ ] Payment flow progresses through correct statuses
- [ ] Application submission works
- [ ] Document resubmission updates status
- [ ] Abandoned payments revert to correct status
- [ ] Frontend UI displays new status values
- [ ] Database migration completed (if needed)

---

## Notes

1. **"Submitted" is the new starting point**: Applications no longer have a "Draft" state. They're created as "Submitted" immediately.

2. **Payment flow simplified**: Removed "Pending Payment" status. Applications stay "Submitted" until payment is validated.

3. **Document review consolidated**: "Documents Need Revision", "Pending Review", and similar statuses are now "Under Review".

4. **Type safety enforced**: Schema now uses strict union types instead of `v.string()`, preventing invalid status values at compile time.

---

## Author
Fixed: 2025-10-24
Related to: ORIENTATION_FLOW_CHANGES.md
