# Changes Made to Webadmin (2025-11-08)

## Summary
Updated the webadmin document verification page to properly implement the new referral system with correct terminology and backend integration.

---

## Files Modified

### `src/app/dashboard/[id]/doc_verif/page.tsx`

#### 1. **StatusBadge Component** (Lines 100-117)
**Before:**
```typescript
'Rejected': 'bg-blue-50 text-blue-700 border border-blue-200', // "Referred" status (internally still "Rejected")
const displayLabel = status === 'Rejected' ? 'Referred' : status;
```

**After:**
```typescript
'Referred': 'bg-blue-50 text-blue-700 border border-blue-200', // Medical referral
'NeedsRevision': 'bg-orange-50 text-orange-700 border border-orange-200', // Document quality issue
const displayLabel = status === 'NeedsRevision' ? 'Needs Revision' : status;
```

**Why:** Properly supports both new status types instead of masking "Rejected" as "Referred"

---

#### 2. **Mutation Import** (Line 143)
**Before:**
```typescript
const referDocumentMutation = useMutation(api.admin.documents.rejectDocument.rejectDocument);
```

**After:**
```typescript
const referDocumentMutation = useMutation(api.admin.documents.referDocument.referDocument);
```

**Why:** Uses the new `referDocument` mutation instead of deprecated `rejectDocument`

---

#### 3. **Status Counting Logic** (Lines 183-223)
**Before:**
```typescript
const referredDocs = data?.checklist.filter((doc) => doc.status === 'Rejected') || [];
```

**After:**
```typescript
const referredDocs = data?.checklist.filter((doc) => doc.status === 'Referred') || [];
const needsRevisionDocs = data?.checklist.filter((doc) => doc.status === 'NeedsRevision') || [];
const totalIssues = referredDocs.length + needsRevisionDocs.length;
```

**Why:** Correctly counts both types of issues separately

---

#### 4. **Mutation Call for Non-Medical Documents** (Lines 741-774)
**Before:**
```typescript
// Non-medical: save remark only (do not change status)
await reviewDocument({
  documentUploadId: item.uploadId!,
  status: item.status as 'Approved' | 'Rejected',
  remarks: specificIssues || referralReason,
  // ...
});
```

**After:**
```typescript
// Non-medical: flag for revision (document quality issue)
await referDocumentMutation({
  documentUploadId: item.uploadId!,
  issueType: "document_issue",
  documentIssueCategory: issueCategory as any,
  referralReason: referralReason,
  specificIssues: specificIssues.split(',').map(s => s.trim()).filter(s => s),
});
```

**Why:** Properly calls the referral mutation for document quality issues, creating proper tracking records

---

#### 5. **Action Buttons** (Lines 788-834)
**Before:**
```typescript
// Only 1 button for non-medical docs
{isMedicalDocument(item.fieldIdentifier) && (
  <button>Refer to Doctor</button>
)}
```

**After:**
```typescript
// 2 buttons for ALL documents - conditional based on type
{isMedicalDocument(item.fieldIdentifier) ? (
  <button className="bg-blue-50">Refer to Doctor</button>
) : (
  <button className="bg-orange-50">Flag for Revision</button>
)}
```

**Why:** All documents now have 2 action buttons (Approve + contextual action)

---

#### 6. **Warning Banner** (Lines 497-541)
**Before:**
```typescript
const rejectedCount = data?.checklist.filter((doc) => doc.status === 'Rejected').length || 0;
// Only showed "rejected" count
```

**After:**
```typescript
const referredCount = data?.checklist.filter((doc) => doc.status === 'Referred').length || 0;
const needsRevisionCount = data?.checklist.filter((doc) => doc.status === 'NeedsRevision').length || 0;
const totalIssues = referredCount + needsRevisionCount;

// Shows breakdown:
🏥 {referredCount} Medical Referral{referredCount > 1 ? 's' : ''}
📄 {needsRevisionCount} Document Revision{needsRevisionCount > 1 ? 's' : ''}
```

**Why:** Provides clear breakdown of both issue types

---

#### 7. **Confirmation Modal** (Lines 938-992)
**Before:**
```typescript
const referredCount = data?.checklist.filter((doc) => doc.status === 'Rejected').length || 0;
// Only showed referral count
```

**After:**
```typescript
const referredCount = data?.checklist.filter((doc) => doc.status === 'Referred').length || 0;
const needsRevisionCount = data?.checklist.filter((doc) => doc.status === 'NeedsRevision').length || 0;
const totalIssues = referredCount + needsRevisionCount;

// Shows both types:
🏥 Medical Referrals
📄 Document Revisions
```

**Why:** User sees exactly what notifications will be sent

---

#### 8. **Document Status Icons** (Lines 603-623)
**Before:**
```typescript
{item.status === 'Rejected' && (
  <div className="bg-blue-100"><!-- icon --></div>
)}
```

**After:**
```typescript
{item.status === 'Referred' && (
  <div className="bg-blue-100"><!-- blue icon --></div>
)}
{item.status === 'NeedsRevision' && (
  <div className="bg-orange-100"><!-- orange icon --></div>
)}
```

**Why:** Visual distinction between medical referrals (blue) and document issues (orange)

---

#### 9. **Button Labels and Text** (Multiple locations)
**Changed:**
- "Send Referral Notification" → "Send Applicant Notifications"
- "Pending Referral/Management Notifications" → "Pending Applicant Notifications"
- "High Referral Rate" → "High Issue Rate"

**Why:** More accurate terminology covering both medical referrals and document revisions

---

## Key Improvements

### ✅ Proper Backend Integration
- Uses new `referDocument` mutation for both medical and document issues
- Passes correct `issueType` parameter
- Includes proper category fields for each type

### ✅ Clear Status Distinction
- "Referred" (blue) - Medical findings
- "NeedsRevision" (orange) - Document quality issues
- Eliminated confusing "Rejected" terminology

### ✅ Complete UI Coverage
- All document types now have proper action buttons
- Non-medical documents can be flagged for revision
- Status icons, badges, and warnings all show both types

### ✅ Accurate Counting
- All filters check for both "Referred" and "NeedsRevision"
- Warning banners show breakdown
- Validation logic handles both types

---

## Testing Recommendations

1. **Test Medical Documents** (chest X-ray, urinalysis, etc.)
   - Click "Refer to Doctor" → Should create "Referred" status
   - Verify blue badge and icon appear
   - Check backend creates record in `documentReferralHistory` with `issueType: "medical_referral"`

2. **Test Non-Medical Documents** (ID, photos, etc.)
   - Click "Flag for Revision" → Should create "NeedsRevision" status
   - Verify orange badge and icon appear
   - Check backend creates record in `documentReferralHistory` with `issueType: "document_issue"`

3. **Test Mixed Scenarios**
   - Flag 2 medical documents + 1 non-medical document
   - Warning banner should show "3 documents" with "🏥 2 Medical Referrals • 📄 1 Document Revision"
   - Confirmation modal should show the same breakdown

4. **Test Mobile Compatibility**
   - After flagging documents in webadmin, check mobile app
   - Mobile should still see documents in rejection history
   - Verify dual-write is working

---

## Notes for Teammate

Your version may have additional UI enhancements (localStorage queue, pending actions, etc.). Those are **optional features** that can be layered on top of this core implementation.

The essential changes are:
1. ✅ New mutation (`referDocument`)
2. ✅ Two statuses (`Referred` + `NeedsRevision`)
3. ✅ Proper button layout (2 buttons based on doc type)
4. ✅ Correct status counting

Any additional features (like pending action queues or enhanced modals) can be added while maintaining these core requirements.
