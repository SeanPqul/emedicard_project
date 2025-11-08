# Referral Functionality - Migration Guide

## 📦 Package Contents

This folder contains all the code and documentation needed to migrate the referral functionality improvements to another repository/branch.

**Created**: November 8, 2025  
**Purpose**: Safe migration in case of repository conflicts

---

## 📁 Folder Contents

```
FOR_REFERRAL_MIGRATION/
├── page.tsx                                    # Modified doc_verif page
├── LEADER_SUMMARY_DOC_VERIF_IMPROVEMENTS.md   # Summary for leader
├── DEMO_SCRIPT_FOR_LEADER.md                  # Presentation script
└── MIGRATION_GUIDE.md                         # This file
```

---

## 🎯 What This Code Does

**Improvements to Document Verification:**
1. Separates medical requirements from non-medical requirements
2. Adds doctor referral functionality with auto-generated messages
3. Implements pending notification counter
4. Controls notification flow (batch sending)

---

## 🔧 Migration Steps

### Step 1: Backup Current Code
```bash
# In the target repository, backup the current doc_verif page
cp apps/webadmin/src/app/dashboard/[id]/doc_verif/page.tsx apps/webadmin/src/app/dashboard/[id]/doc_verif/page.tsx.backup
```

### Step 2: Copy Modified File
```bash
# Copy the new page.tsx from this folder
cp FOR_REFERRAL_MIGRATION/page.tsx apps/webadmin/src/app/dashboard/[id]/doc_verif/page.tsx
```

### Step 3: Verify Backend Support
The backend already supports this! No changes needed. Just verify these files exist:
- `backend/convex/admin/documents/rejectDocument.ts` (should have `doctorName` field)
- `backend/convex/admin/finalizeApplication.ts` (should have notification scheduling)
- `backend/convex/schema.ts` (should have `doctorName` in documentRejectionHistory)

### Step 4: Test
Run the application and test the workflow:
```bash
npm run dev
```

---

## 📝 Code Changes Summary

### Changed Constants (Lines 67-86)

**OLD:**
```typescript
const remarkOptions = [ 'Invalid Government-issued ID', 'Missing Documents Request', 'Unclear Drug Test Results', 'Medical Follow-up Required', 'Others' ];
```

**NEW:**
```typescript
// Medical requirement referral reasons (checkbox options)
const medicalReferralReasons = [
  'Abnormal chest X-ray result',
  'Elevated urinalysis values',
  'Positive stool examination',
  'Positive drug test result',
  'Failed neuropsychiatric evaluation',
  'Hepatitis B antibody - requires consultation',
  'Other medical concern',
];

// Non-medical requirement remark options
const nonMedicalRemarkOptions = [
  'Invalid Government-issued ID',
  'Expired ID',
  'Blurry or unclear photo',
  'Wrong ID picture format/size',
  'Missing required information',
  'Others'
];
```

---

### Changed Remarks UI (Lines 715-743)

**OLD:**
```typescript
<label htmlFor={`remark-${idx}`} className="block text-sm font-medium text-gray-700">Referral Reason</label>
<div className="mt-1 space-y-2">
  {remarkOptions.map(option => (
    // ... radio buttons
  ))}
</div>
```

**NEW:**
```typescript
<label htmlFor={`remark-${idx}`} className="block text-sm font-medium text-gray-700">
  {isMedicalDocument(item.fieldIdentifier) ? 'Medical Referral Reason' : 'Remark Reason'} <span className="text-red-500">*</span>
</label>
<div className="mt-1 space-y-2">
  {(isMedicalDocument(item.fieldIdentifier) ? medicalReferralReasons : nonMedicalRemarkOptions).map(option => (
    // ... radio buttons
  ))}
</div>
```

---

### Changed Auto-Referral Message (Lines 684-694)

**OLD:**
```typescript
const base = `Failed medical requirement (${item.requirementName}). Please refer to Dr. ${name || '__________'}, at Door 7, Magsaysay Complex, Magsaysay Park, Davao City.`;
```

**NEW:**
```typescript
const base = `Failed Medical Result (${item.requirementName}) - Please refer to Dr. ${name || '__________'} at Door 7, Magsaysay Complex, Magsaysay Park, Davao City.`;
```

---

### Changed Notification Indicator (Lines 506-514)

**OLD:**
```typescript
<p className="font-semibold mb-1">
  {warningLevel === 'severe' ? '⚠️ High Referral Rate' : 'Referral Notifications Queued'} ({rejectedCount} of {totalDocs})
</p>
<p>
  {rejectedCount === 1
    ? 'The referral notification will be sent when you click "Send Referral Notification" below.'
    : `${rejectedCount} referral notifications will be sent (one per medical document) when you click "Send Referral Notification" below.`
  }
</p>
```

**NEW:**
```typescript
<p className="font-semibold mb-1">
  {warningLevel === 'severe' ? '⚠️ High Referral Rate' : 'Pending Referral/Management Notifications'} ({rejectedCount} of {totalDocs})
</p>
<p>
  {rejectedCount === 1
    ? '1 pending referral/management notification to be sent to applicant. Click "Send Referral Notification" below to proceed.'
    : `${rejectedCount} pending referral/management notification(s) to be sent to applicant. Click "Send Referral Notification" below to proceed.`
  }
</p>
```

---

### Changed Prefill Logic (Lines 816-819)

**OLD:**
```typescript
setReferralReason('Medical Follow-up Required');
setSpecificIssues(`Failed medical requirement (${item.requirementName}). Please refer to Dr. __________, at Door 7, Magsaysay Complex, Magsaysay Park, Davao City.`);
```

**NEW:**
```typescript
setReferralReason('Other medical concern');
setDoctorName('');
setSpecificIssues(`Failed Medical Result (${item.requirementName}) - Please refer to Dr. __________ at Door 7, Magsaysay Complex, Magsaysay Park, Davao City.`);
```

---

## 🔍 Manual Merge Guide (If Conflicts Occur)

If your leader's repository has conflicts with this code, follow this manual merge process:

### Conflict Area 1: Constants Section (Top of file)
**Search for**: `const remarkOptions`  
**Replace with**: The new `medicalReferralReasons` and `nonMedicalRemarkOptions` arrays

### Conflict Area 2: Remarks Rendering (Inside referral form)
**Search for**: `<label htmlFor={\`remark-\${idx}\`}`  
**Update**: Add conditional logic for medical vs non-medical  
**Use**: `isMedicalDocument(item.fieldIdentifier) ? medicalReferralReasons : nonMedicalRemarkOptions`

### Conflict Area 3: Doctor Name onChange (Doctor name input field)
**Search for**: `onChange={(e) => { const name = e.target.value;`  
**Update**: The auto-fill message format to use "Failed Medical Result" instead of "Failed medical requirement"

### Conflict Area 4: Notification Indicator (Final Actions section)
**Search for**: `Referral Notifications Queued`  
**Replace with**: `Pending Referral/Management Notifications`

### Conflict Area 5: Refer to Doctor Button Prefill
**Search for**: Button onClick that sets `setReferralReason('Medical Follow-up Required')`  
**Replace with**: `setReferralReason('Other medical concern')`

---

## ⚠️ Common Migration Issues & Solutions

### Issue 1: "remarkOptions is not defined"
**Cause**: Old constant name still referenced somewhere  
**Solution**: Search for all instances of `remarkOptions` and replace with conditional:
```typescript
(isMedicalDocument(item.fieldIdentifier) ? medicalReferralReasons : nonMedicalRemarkOptions)
```

### Issue 2: Doctor name field not showing
**Cause**: Conditional check might be broken  
**Solution**: Verify `MEDICAL_FIELD_IDENTIFIERS` array matches your document types:
```typescript
const MEDICAL_FIELD_IDENTIFIERS = [
  'chestXrayId',
  'urinalysisId',
  'stoolId',
  'drugTestId',
  'neuroExamId',
  'hepatitisBId'
];
```

### Issue 3: Auto-message not updating
**Cause**: onChange handler for doctor name might be overridden  
**Solution**: Check line ~684-694, ensure the `setSpecificIssues` logic is intact

### Issue 4: Notification still sent on save
**Cause**: Backend might be different  
**Solution**: Check `backend/convex/admin/documents/rejectDocument.ts` line 110:
```typescript
notificationSent: false,  // This should be false!
```

---

## 🧪 Testing Checklist After Migration

- [ ] Medical documents show "Approve" + "Refer to Doctor" buttons
- [ ] Non-medical documents show only "Approve" button
- [ ] Medical referral form shows medical-specific reasons
- [ ] Non-medical remark form shows document-specific reasons
- [ ] Doctor name field is required and visible for medical docs
- [ ] Auto-message updates when typing doctor name
- [ ] Message format is: "Failed Medical Result (name) - Please refer to Dr. X at..."
- [ ] Pending notification indicator shows correct count
- [ ] Saving referral does NOT send notification
- [ ] Clicking "Send Referral Notification" sends all notifications
- [ ] Applicant receives notifications with proper formatting

---

## 📞 Troubleshooting Contact

If you encounter issues during migration:

1. **Check the backup**: `page.tsx.backup` has your original code
2. **Compare line by line**: Use a diff tool to see exact changes
3. **Test incrementally**: Apply changes one section at a time
4. **Verify backend**: Ensure backend schema supports `doctorName` field

---

## 🎯 Quick Migration Command (If No Conflicts)

```bash
# One-liner to migrate (use with caution!)
cp FOR_REFERRAL_MIGRATION/page.tsx apps/webadmin/src/app/dashboard/[id]/doc_verif/page.tsx && echo "Migration complete! Test the application."
```

---

## 📊 Diff Summary

**Total Lines Changed**: ~10 sections  
**New Code Added**: ~40 lines  
**Code Removed**: ~15 lines  
**Net Change**: +25 lines  

**Risk Level**: 🟢 Low (Frontend only, no database changes)

---

## 🔄 Rollback Procedure

If something goes wrong:

```bash
# Restore from backup
cp apps/webadmin/src/app/dashboard/[id]/doc_verif/page.tsx.backup apps/webadmin/src/app/dashboard/[id]/doc_verif/page.tsx

# Or use git
git checkout apps/webadmin/src/app/dashboard/[id]/doc_verif/page.tsx
```

---

## ✅ Success Criteria

Migration is successful when:
1. Application compiles without errors
2. Doc_verif page loads without issues
3. Medical documents show referral workflow
4. Non-medical documents show approval-only workflow
5. Notifications are sent only via "Send Referral Notification" button
6. All tests pass

---

**Good luck with the migration, bro! 🚀**

If you need any clarification, refer to the other documents in this folder.
