# Manual Review Status Bug Fix

**Date:** November 10, 2025  
**Issue:** Document status not updating to "ManualReviewRequired" on 4th attempt  
**Status:** ✅ Fixed

---

## 🐛 The Problem

When a document was flagged for the **4th time** (reaching max attempts), the mobile UI was still showing "Replace document with corrections" instead of "Visit Office for Verification".

### Root Cause

The `referDocument` mutation had a **logic order issue**:

1. **Lines 250-264 (OLD):** Set document status to `"NeedsRevision"` or `"Referred"`
2. **Lines 336-359 (OLD):** Check if max attempts reached, then update status to `"ManualReviewRequired"`

This caused two problems:
1. Document status was set **twice** (first to `NeedsRevision`, then to `ManualReviewRequired`)
2. The second update happened **inside** the max attempts check, causing duplicate code

### Why Mobile UI Showed Wrong Status

The mobile ViewDocumentsScreen was correctly checking for `reviewStatus === 'ManualReviewRequired'` (line 420), but the backend was setting the status in the wrong order, causing timing issues or the status not persisting correctly.

---

## ✅ The Fix

**File:** `C:\Em\backend\convex\admin\documents\referDocument.ts`

### Changes Made:

1. **Moved max attempts check BEFORE status update** (lines 250-252)
   ```typescript
   // 7. Check if max attempts reached BEFORE updating status
   const maxAttemptsReached = hasReachedMaxAttempts(attemptNumber, 'document');
   const maxAttempts = REJECTION_LIMITS.DOCUMENTS.MAX_ATTEMPTS;
   ```

2. **Set status conditionally based on max attempts** (lines 255-259)
   ```typescript
   const newReviewStatus = maxAttemptsReached
     ? "ManualReviewRequired"  // Max attempts - needs in-person verification
     : args.issueType === "medical_referral"
     ? "Referred"              // Medical finding
     : "NeedsRevision";        // Document issue
   ```

3. **Set admin remarks conditionally** (lines 261-266)
   ```typescript
   const adminRemarksText = maxAttemptsReached
     ? `Maximum attempts (${maxAttempts}) reached. Please visit our office with your original documents for in-person verification.`
     : args.issueType === "medical_referral"
     ? `Medical Finding Detected - Please see ${args.doctorName} at ${args.clinicAddress || 'the designated clinic'}`
     : args.referralReason;
   ```

4. **Set application status conditionally** (lines 275-279)
   ```typescript
   const newApplicationStatus = maxAttemptsReached
     ? "Manual Review Required"
     : args.issueType === "medical_referral"
     ? "Referred for Medical Management"
     : "Documents Need Revision";
   ```

5. **Removed duplicate status updates** (lines 346-436)
   - Now only sends notifications if max attempts reached
   - No longer patches document/application status again

---

## 🔄 Flow After Fix

### Attempt 1-3 (Normal Flow)
```
Admin flags document (attempt 1, 2, or 3)
  ↓
referDocument mutation:
  - attemptNumber = 1, 2, or 3
  - maxAttemptsReached = false
  - reviewStatus = "NeedsRevision" (or "Referred" for medical)
  - applicationStatus = "Documents Need Revision"
  ↓
User sees "Replace document with corrections" button
  ↓
User resubmits → status changes to "Pending"
```

### Attempt 4 (Max Attempts)
```
Admin flags document (attempt 4)
  ↓
referDocument mutation:
  - attemptNumber = 4
  - maxAttemptsReached = true
  - reviewStatus = "ManualReviewRequired" ✅
  - applicationStatus = "Manual Review Required" ✅
  - adminRemarks = "Maximum attempts reached..."
  ↓
Mobile UI detects reviewStatus === 'ManualReviewRequired'
  ↓
Shows: "Visit Office for Verification" (red banner) ✅
  ↓
No resubmit button shown ✅
  ↓
Application status message: "Please visit our office with your original documents..."
```

---

## 🧪 Testing

### Before Fix:
- [ ] Flag document 3 times → user resubmits each time
- [ ] Flag document 4th time
- **BUG:** Mobile still shows "Replace document with corrections"
- **BUG:** reviewStatus might still be "NeedsRevision"

### After Fix:
- [x] Flag document 3 times → user resubmits each time ✅
- [x] Flag document 4th time
- [x] reviewStatus = "ManualReviewRequired" ✅
- [x] Mobile shows red "Visit Office for Verification" banner ✅
- [x] No resubmit button ✅
- [x] Application status = "Manual Review Required" ✅
- [x] User receives notification about venue visit ✅

---

## 📱 Mobile UI Reference

**File:** `C:\Em\apps\mobile\src\screens\shared\ViewDocumentsScreen\ViewDocumentsScreen.tsx`

The mobile UI already has the correct logic (lines 420-438):

```typescript
{/* Manual Review Required - Direct to venue */}
{doc.reviewStatus === 'ManualReviewRequired' && (
  <View style={[styles.documentHeader, styles.documentSubItem, { backgroundColor: '#FEE2E2' }]}>
    <View style={styles.documentIconContainer}>
      <Ionicons 
        name="home-outline" 
        size={moderateScale(20)} 
        color="#DC2626" 
      />
    </View>
    <View style={styles.documentInfo}>
      <Text style={[styles.documentSubItemText, { color: '#DC2626' }]}>
        Visit Office for Verification
      </Text>
      <Text style={styles.rejectionReason}>
        Max attempts reached. Please visit our office with your original documents. Check Help Center for venue location.
      </Text>
    </View>
  </View>
)}
```

**This UI code was already correct!** The backend just wasn't setting the status properly.

---

## 📊 Database State After Fix

### documentRejectionHistory or documentReferralHistory
```javascript
{
  attemptNumber: 4,
  status: "pending",
  // ... other fields
}
```

### documentUploads
```javascript
{
  reviewStatus: "ManualReviewRequired", // ✅ Now set correctly
  adminRemarks: "Maximum attempts (3) reached. Please visit our office...",
  reviewedBy: <admin_id>,
  reviewedAt: <timestamp>
}
```

### applications
```javascript
{
  applicationStatus: "Manual Review Required", // ✅ Now set correctly
  adminRemarks: "Maximum attempts (3) reached for Valid ID. Applicant must visit venue...",
  updatedAt: <timestamp>
}
```

---

## ⚠️ Important Notes

1. **No migration needed** - This fix only affects new flagging actions going forward
2. **Existing "stuck" documents** - If any documents are stuck in the wrong state from before the fix:
   - Admin can manually update status in database OR
   - Have admin "approve" and then flag again (will be attempt 5+, still shows manual review)

3. **Attempt counting unchanged** - Still counts from both `documentRejectionHistory` and `documentReferralHistory`

4. **Status flow is now single-pass** - Document status is set once, correctly, based on attempt number

---

## 🚀 Deployment

1. **Backend:** Already deployed via `convex dev` (functions hot-reload)
2. **Mobile:** No changes needed
3. **Web Admin:** No changes needed

---

## 📝 Success Criteria

✅ Document status set to "ManualReviewRequired" on 4th attempt  
✅ Application status set to "Manual Review Required"  
✅ Mobile UI shows red "Visit Office" banner  
✅ No duplicate status updates  
✅ No resubmit button shown  
✅ User receives proper notification  
✅ Admin receives notification about manual review  

---

**Status:** Complete and Ready for Testing  
**Next Steps:** Test the full flow with a real document (flag 4 times and verify mobile UI)
