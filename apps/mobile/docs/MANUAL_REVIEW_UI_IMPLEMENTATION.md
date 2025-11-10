# Manual Review UI/UX Implementation Guide

**Date:** November 10, 2025  
**Status:** Ready for Implementation  
**Context:** After fixing the max attempts logic (3 rejections allowed, 4th blocks), we need UI indicators

---

## 🎯 Goal

Add visual indicators in both webadmin and mobile to show:
1. Current attempt number for each document
2. Warning badges for attempts 2-3
3. "Manual Review Required" state when max attempts reached
4. Disable flagging buttons after max attempts

---

## 📊 Current State

### ✅ Backend (Already Implemented)
- `referDocument` mutation returns:
  - `attemptNumber` - current attempt (1, 2, 3, 4+)
  - `maxAttemptsReached` - boolean
  - `remainingAttempts` - number
  - `isFinalAttempt` - boolean
- Application status changes to "Manual Review Required" after 4th rejection
- Notifications sent to applicant and admins

### ❌ Frontend (Needs Implementation)
- Webadmin doesn't show attempt counters
- Mobile shows attempt number but needs Manual Review state UI
- No visual warnings for final attempts

---

## 🔧 Implementation Steps

### 1. Webadmin: Add Attempt Counter to Document Query

**File:** `C:\\Em\\backend\\convex\\applications\\getDocumentsWithClassification.ts`  
**OR** wherever the document checklist query is

**Add to return data:**
```typescript
// For each document upload, fetch rejection/referral count
const rejectionCount = await ctx.db
  .query("documentRejectionHistory")
  .withIndex("by_document_type", (q) =>
    q.eq("applicationId", application._id)
     .eq("documentTypeId", docType._id)
  )
  .collect();

const referralCount = await ctx.db
  .query("documentReferralHistory")
  .withIndex("by_document_type", (q) =>
    q.eq("applicationId", application._id)
     .eq("documentTypeId", docType._id)
  )
  .collect();

const attemptNumber = rejectionCount.length + referralCount.length;

return {
  ...documentData,
  attemptNumber,
  maxAttemptsReached: attemptNumber >= 4,
  remainingAttempts: Math.max(0, 3 - attemptNumber)
};
```

---

### 2. Webadmin: Display Attempt Counter in UI

**File:** `C:\\Em\\apps\\webadmin\\src\\app\\dashboard\\[id]\\doc_verif\\page.tsx`

**Location:** Around line 848 (after document name)

**Add this code:**
```typescript
<h3 className="font-bold text-gray-800 text-base">
  {item.requirementName}
  {item.isRequired && <span className="text-rose-500 ml-1">*</span>}
  
  {/* ATTEMPT COUNTER BADGE */}
  {item.attemptNumber > 0 && (
    <span className={`ml-2 px-2 py-0.5 text-xs font-semibold rounded-md ${
      item.attemptNumber === 1 ? 'bg-gray-100 text-gray-600' :
      item.attemptNumber === 2 ? 'bg-yellow-100 text-yellow-700 border border-yellow-300' :
      item.attemptNumber === 3 ? 'bg-orange-100 text-orange-700 border border-orange-400' :
      'bg-red-100 text-red-700 border border-red-400'
    }`}>
      {item.attemptNumber === 4 ? '🔒 Manual Review Required' : 
       item.attemptNumber === 3 ? `⚠️ Attempt #${item.attemptNumber} (FINAL)` :
       item.attemptNumber === 2 ? `⚠️ Attempt #${item.attemptNumber}` :
       `Attempt #${item.attemptNumber}`}
    </span>
  )}
</h3>
```

---

### 3. Webadmin: Disable Flagging for Manual Review Documents

**File:** Same as above (`doc_verif/page.tsx`)

**Location:** Where the "Flag for Revision" and "Refer to Doctor" buttons are rendered

**Wrap buttons with condition:**
```typescript
{/* Only show flag/refer buttons if NOT at manual review */}
{!item.maxAttemptsReached ? (
  <>
    {/* Existing button code */}
    <button onClick={() => handleFlagForRevision(item)}>
      Flag for Revision
    </button>
    <button onClick={() => handleReferToDoctor(item)}>
      Refer to Doctor
    </button>
  </>
) : (
  <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg">
    <div className="flex items-center gap-2 text-red-700">
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 0h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
      </svg>
      <div className="text-sm">
        <p className="font-semibold">Manual Review Required</p>
        <p className="text-red-600 text-xs mt-1">
          Max attempts reached. Applicant must visit venue for in-person verification.
        </p>
      </div>
    </div>
  </div>
)}
```

---

### 4. Mobile: Verify Manual Review State Display

**File:** `C:\\Em\\apps\\mobile\\src\\screens\\shared\\ViewDocumentsScreen\\ViewDocumentsScreen.tsx`

**Check lines 96-135** - Manual Review status handling should already be there:
```typescript
case 'ManualReviewRequired':
  return '#DC2626'; // Red
```

**If not present, add:**
```typescript
// In getStatusColor function
case 'ManualReviewRequired':
  return '#DC2626'; // Red

// In getStatusIcon function  
case 'ManualReviewRequired':
  return 'alert-circle';

// In getStatusLabel function
case 'ManualReviewRequired':
  return 'Manual Review Required';
```

**Check lines 296-303** - Application status message should show venue visit info

---

### 5. Mobile: Document Card for Manual Review

**File:** Same as above

**Location:** After document status badges (around line 389)

**Add this section:**
```typescript
{/* Manual Review Required - Cannot resubmit */}
{doc.reviewStatus === 'ManualReviewRequired' && (
  <div className="mt-3 p-4 bg-red-50 border border-red-200 rounded-lg">
    <div className="flex items-start gap-3">
      <Ionicons 
        name="alert-circle" 
        size={moderateScale(24)} 
        color="#DC2626" 
      />
      <View style={{ flex: 1 }}>
        <Text style={styles.manualReviewTitle}>
          🏠 Visit Office for Verification
        </Text>
        <Text style={styles.manualReviewText}>
          Max attempts reached. Please visit our office with your original {doc.requirement?.name || 'documents'}. 
          Check Help Center for venue location.
        </Text>
      </View>
    </div>
  </div>
)}
```

**Add corresponding styles:**
```typescript
manualReviewTitle: {
  fontSize: moderateScale(14),
  fontWeight: '600',
  color: '#991B1B',
  marginBottom: moderateScale(4),
},
manualReviewText: {
  fontSize: moderateScale(12),
  color: '#DC2626',
  lineHeight: moderateScale(16),
},
```

---

## 🎨 Visual Design Reference

### Attempt Badges (Webadmin)

```
Attempt #1:  [1] (Gray - Normal)
Attempt #2:  [⚠️ 2] (Yellow - Warning)
Attempt #3:  [⚠️ 3 FINAL] (Orange - Final Warning)
Attempt #4+: [🔒 Manual Review Required] (Red - Blocked)
```

### Status Colors

| Status | Color | When |
|--------|-------|------|
| Attempt 1 | Gray `#6B7280` | First rejection |
| Attempt 2 | Yellow `#F59E0B` | Warning threshold |
| Attempt 3 | Orange `#EA580C` | Final attempt |
| Manual Review | Red `#DC2626` | Max attempts reached |

---

## 🧪 Testing Checklist

### Test Scenario: Progressive Attempts
1. [ ] Admin flags document (Attempt #1)
   - [ ] Webadmin shows gray "Attempt #1" badge
   - [ ] Mobile shows "Document Rejected - Attempt #1"
   - [ ] User can resubmit

2. [ ] User resubmits, admin rejects again (Attempt #2)
   - [ ] Webadmin shows yellow "⚠️ Attempt #2" badge
   - [ ] Mobile shows "Document Rejected - Attempt #2"
   - [ ] User can still resubmit

3. [ ] User resubmits, admin rejects again (Attempt #3)
   - [ ] Webadmin shows orange "⚠️ Attempt #3 (FINAL)" badge
   - [ ] Mobile shows "Document Rejected - Attempt #3"
   - [ ] User can still resubmit (last chance!)

4. [ ] User resubmits, admin tries to reject again (Would be Attempt #4)
   - [ ] Webadmin shows red "🔒 Manual Review Required" badge
   - [ ] Flag/Refer buttons are disabled or hidden
   - [ ] Shows message: "Applicant must visit venue"
   - [ ] Mobile blocks resubmission with error
   - [ ] Application status = "Manual Review Required"

### Test Scenario: Medical Referral (Different Path)
1. [ ] Admin refers document to doctor (issueType: "medical_referral")
   - [ ] Goes to `documentReferralHistory` table
   - [ ] Mobile shows "Medical Referral" (Blue badge)
   - [ ] No resubmit button shown
   - [ ] Same attempt counting applies if admin keeps referring

---

## 📝 Type Definitions

**Add to ChecklistItem type in webadmin:**
```typescript
type ChecklistItem = {
  // ... existing fields
  attemptNumber?: number;
  maxAttemptsReached?: boolean;
  remainingAttempts?: number;
};
```

---

## ⚠️ Important Notes

1. **Attempt counting is per document TYPE, not per upload**
   - If user uploads 3 bad photos for "Valid ID", they've used 3 attempts for ALL ID photos

2. **Medical referrals vs Document issues**
   - Medical referrals → `documentReferralHistory`
   - Document issues → `documentRejectionHistory`
   - BOTH count towards max attempts for that document type

3. **Manual review is NOT permanent rejection**
   - Admin at venue can still manually approve
   - System just blocks online resubmissions

4. **Help Center dependency**
   - Ensure Help Center has correct venue information:
     - City Health Office, Magsaysay Park Complex, Door 7
     - Monday-Friday, 8AM-5PM
     - Contact: 0926-686-1531

---

## 🚀 Deployment Order

1. **Backend first** - Add attempt counts to document query
2. **Webadmin** - Add UI indicators and disable buttons
3. **Mobile** - Verify Manual Review state displays
4. **Test end-to-end** - Flag document 4 times and verify flow

---

## 📞 Questions to Resolve

1. Should admin see a warning before flagging the 3rd time?
2. Should there be an override button for super admin to manually approve without venue visit?
3. Should the system send an SMS notification when manual review is required?

---

**Status:** Ready for implementation  
**Estimated Time:** 2-3 hours  
**Priority:** High (UX improvement for both admin and applicants)
