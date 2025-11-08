# Document Referral System Migration Guide

## Overview
This document outlines the **correct implementation** of the new Document Referral System in the webadmin application. This migration eliminates "rejection" terminology and introduces a proper dual-path system for medical referrals and document quality issues.

---

## 🎯 Key Terminology Changes

### ❌ OLD (Deprecated)
- ~~"Rejected"~~ status
- ~~"rejectDocument"~~ mutation
- ~~All documents treated as "rejected"~~

### ✅ NEW (Current Standard)
- **"Referred"** status - For medical findings requiring doctor consultation
- **"NeedsRevision"** status - For document quality issues requiring resubmission
- **"referDocument"** mutation - Handles both medical referrals AND document issues
- Clear separation between medical concerns and document quality problems

---

## 🏗️ Backend Architecture

### Mutation: `api.admin.documents.referDocument.referDocument`

**Purpose**: Single mutation that handles BOTH medical referrals and document quality issues

#### Parameters:
```typescript
{
  documentUploadId: Id<"documentUploads">,
  
  // Issue Type (REQUIRED)
  issueType: "medical_referral" | "document_issue",
  
  // For Medical Referrals (required if issueType = "medical_referral")
  medicalReferralCategory?: "abnormal_xray" | "elevated_urinalysis" | "positive_stool" 
                           | "positive_drug_test" | "neuro_exam_failed" 
                           | "hepatitis_consultation" | "other_medical_concern",
  doctorName?: string,                    // Required for medical referrals
  clinicAddress?: string,                 // Required for medical referrals
  
  // For Document Issues (required if issueType = "document_issue")
  documentIssueCategory?: "quality_issue" | "wrong_document" | "expired_document" 
                         | "incomplete_document" | "invalid_document" 
                         | "format_issue" | "other",
  
  // Common fields
  referralReason: string,                 // User-friendly explanation
  specificIssues: string[],               // Array of specific issue descriptions
}
```

#### Backend Behavior:
1. **DUAL-WRITE Pattern**: Writes to BOTH tables for backward compatibility
   - `documentReferralHistory` (NEW table)
   - `documentRejectionHistory` (OLD table - for mobile app)
   
2. **Status Assignment**:
   - Medical referral → Sets document status to `"Referred"`
   - Document issue → Sets document status to `"NeedsRevision"`

3. **Mobile Compatibility**: Mobile app continues to use `documentRejectionHistory` (old table) without breaking

---

## 🎨 Frontend Implementation

### Document Status Badge

```typescript
const StatusBadge = ({ status }: { status: string }) => {
  const statusStyles: Record<string, string> = {
    'Approved': 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    'Referred': 'bg-blue-50 text-blue-700 border border-blue-200',        // Medical
    'NeedsRevision': 'bg-orange-50 text-orange-700 border border-orange-200', // Document quality
    'Pending': 'bg-amber-50 text-amber-700 border border-amber-200',
    'Missing': 'bg-gray-50 text-gray-600 border border-gray-200',
  };
  
  const displayLabel = status === 'NeedsRevision' ? 'Needs Revision' : status;
  
  return (
    <span className={`px-3 py-1.5 inline-flex text-xs leading-5 font-medium rounded-lg ${statusStyles[status]}`}>
      {displayLabel}
    </span>
  );
};
```

### Document Type Classification

```typescript
// Medical documents require doctor referral
const MEDICAL_FIELD_IDENTIFIERS = [
  'chestXrayId',
  'urinalysisId',
  'stoolId',
  'drugTestId',
  'neuroExamId',
  'hepatitisBId'
];

const isMedicalDocument = (fieldIdentifier?: string): boolean => {
  if (!fieldIdentifier) return false;
  return MEDICAL_FIELD_IDENTIFIERS.includes(fieldIdentifier);
};
```

### Action Buttons Per Document

**IMPORTANT**: Each document should have **2 buttons** (not 3):

#### Medical Documents:
1. **"Approve"** (Green) - Document is acceptable
2. **"Refer to Doctor"** (Blue) - Medical finding detected, needs doctor consultation

#### Non-Medical Documents:
1. **"Approve"** (Green) - Document is acceptable
2. **"Flag for Revision"** (Orange) - Document quality issue, needs resubmission

**Code Example**:
```typescript
<div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
  {/* Approve Button - Always present */}
  <button 
    onClick={() => handleStatusChange(idx, uploadId, 'Approved')} 
    disabled={!uploadId || status === 'Approved'}
    className="bg-emerald-50 text-emerald-700 ..."
  >
    Approve
  </button>
  
  {/* Conditional Second Button */}
  {isMedicalDocument(fieldIdentifier) ? (
    // Medical: Refer to Doctor
    <button
      onClick={() => openMedicalReferralPanel(idx)}
      disabled={!uploadId || status === 'Approved' || status === 'Referred' || status === 'NeedsRevision'}
      className="bg-blue-50 text-blue-700 ..."
    >
      Refer to Doctor
    </button>
  ) : (
    // Non-medical: Flag for Revision
    <button
      onClick={() => openDocumentIssuePanel(idx)}
      disabled={!uploadId || status === 'Approved' || status === 'Referred' || status === 'NeedsRevision'}
      className="bg-orange-50 text-orange-700 ..."
    >
      Flag for Revision
    </button>
  )}
</div>
```

---

## 🔄 Mutation Call Examples

### Medical Referral Example:
```typescript
await referDocumentMutation({
  documentUploadId: item.uploadId!,
  issueType: "medical_referral",
  medicalReferralCategory: "other_medical_concern",
  referralReason: "Abnormal chest X-ray result",
  specificIssues: ["Opacity detected in upper right lobe"],
  doctorName: "Dr. TBD",
  clinicAddress: "Door 7, Magsaysay Complex, Magsaysay Park, Davao City",
});
```

### Document Quality Issue Example:
```typescript
await referDocumentMutation({
  documentUploadId: item.uploadId!,
  issueType: "document_issue",
  documentIssueCategory: "quality_issue",
  referralReason: "Blurry or unclear photo",
  specificIssues: ["ID photo is too dark to verify", "Text is not legible"],
});
```

---

## 📊 Status Counting Logic

### Correct Status Filtering:

```typescript
// Count documents by status
const referredCount = checklist.filter(doc => doc.status === 'Referred').length;
const needsRevisionCount = checklist.filter(doc => doc.status === 'NeedsRevision').length;
const totalIssues = referredCount + needsRevisionCount;

// Validation before approval
if (newStatus === 'Approved' && totalIssues > 0) {
  throw new Error(`Cannot approve. ${totalIssues} document(s) require applicant action.`);
}

// Validation before sending notifications
if (newStatus === 'Rejected' && totalIssues === 0) {
  throw new Error("At least one document must be flagged or referred.");
}
```

---

## 🎯 UI Warning Banner Example

```typescript
{(() => {
  const referredCount = checklist.filter(doc => doc.status === 'Referred').length;
  const needsRevisionCount = checklist.filter(doc => doc.status === 'NeedsRevision').length;
  const totalIssues = referredCount + needsRevisionCount;
  
  if (totalIssues > 0) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="font-semibold">
          ⚠️ Pending Applicant Notifications ({totalIssues} documents)
        </p>
        {referredCount > 0 && (
          <p className="text-xs">
            🏥 {referredCount} Medical Referral{referredCount > 1 ? 's' : ''}
          </p>
        )}
        {needsRevisionCount > 0 && (
          <p className="text-xs">
            📄 {needsRevisionCount} Document Revision{needsRevisionCount > 1 ? 's' : ''}
          </p>
        )}
      </div>
    );
  }
})()}
```

---

## 🚫 Common Mistakes to Avoid

### ❌ DON'T:
1. Use "Rejected" status in UI or logic
2. Call the old `rejectDocument` mutation
3. Show 3 buttons per document (Approve, Flag, Refer)
4. Use `doc.status === 'Rejected'` in filter logic
5. Mix medical and non-medical handling in the same code path

### ✅ DO:
1. Use "Referred" and "NeedsRevision" statuses
2. Call the new `referDocument` mutation
3. Show 2 buttons per document (Approve + context-specific action)
4. Use `doc.status === 'Referred' || doc.status === 'NeedsRevision'` for counting issues
5. Separate medical referral logic from document issue logic

---

## 🔍 Migration Checklist

When updating the webadmin code, verify:

- [ ] `StatusBadge` component supports `"Referred"` and `"NeedsRevision"` statuses
- [ ] No references to `"Rejected"` status in UI labels
- [ ] Using `api.admin.documents.referDocument.referDocument` mutation
- [ ] Not using `api.admin.documents.rejectDocument.rejectDocument` mutation
- [ ] Each document shows exactly 2 buttons (not 3)
- [ ] Medical documents show "Approve" + "Refer to Doctor"
- [ ] Non-medical documents show "Approve" + "Flag for Revision"
- [ ] Status counting includes both `"Referred"` and `"NeedsRevision"`
- [ ] Warning banners show breakdown of both issue types
- [ ] Confirmation modals display both medical referrals and document revisions
- [ ] Button disabled states check for both `"Referred"` and `"NeedsRevision"`
- [ ] Mutation calls include correct `issueType` parameter
- [ ] Medical referrals include `doctorName` and `clinicAddress`
- [ ] Document issues include `documentIssueCategory`

---

## 📝 Final Notes

### Why This Matters:
1. **Clarity**: Clear distinction between medical concerns and document quality issues
2. **User Experience**: Applicants understand exactly what action is required
3. **Compliance**: Medical terminology is appropriate for health-related findings
4. **Backward Compatibility**: Mobile app continues to work during migration
5. **Data Integrity**: Dual-write ensures no data loss during transition

### Mobile App Compatibility:
The backend's dual-write pattern ensures that:
- New webadmin uses `documentReferralHistory` table
- Old mobile app continues using `documentRejectionHistory` table
- Both systems work simultaneously without conflicts
- Migration can happen gradually without downtime

---

## 🆘 Questions or Issues?

If the current webadmin implementation has:
- **3 buttons per document** → Should be reduced to 2 (based on document type)
- **"Rejected" status** → Should use "Referred" or "NeedsRevision"
- **Old rejectDocument mutation** → Should use new referDocument mutation
- **Pending actions/localStorage queue** → Optional enhancement, not required for basic functionality

The core requirement is:
1. Use new `referDocument` mutation
2. Support both `"Referred"` and `"NeedsRevision"` statuses
3. Show appropriate buttons based on document type (medical vs non-medical)

Everything else is UI/UX enhancement that can be added incrementally.
