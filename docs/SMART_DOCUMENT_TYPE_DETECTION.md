# Smart Document Type Detection - Implementation Tracker

## ⚠️ IMPORTANT: Instructions for AI Agent

**Before starting implementation:**
1. Read ALL critical files listed in "Critical Files Summary" section
2. Search for EXACT line numbers and code patterns mentioned in each step
3. Use responsive utilities (`scale`, `verticalScale`, `moderateScale`) from `@shared/utils/responsive`
4. Import `getColor` from `@shared/styles/theme` for colors
5. Run `npm run typecheck` after each file modification
6. Follow existing code patterns in each file

**Key Project Patterns:**
- All spacing must use responsive utilities (NO hardcoded px values)
- Use `getColor('colorPath')` for theme colors
- Follow existing import patterns in each file
- Match existing code style (indentation, naming, etc.)

---

## Overview
Implement intelligent document type detection during user registration that automatically determines if the uploaded verification document is a Valid ID. If it is, auto-populate the Valid ID field in the health card application to reduce redundant uploads.

## Problem Statement
Users upload a verification document during registration (could be ID, health card, medical cert, etc.), but the system doesn't know what type it is. When applying for a health card, they may need to upload a Valid ID again even if they already uploaded one during registration.

## Solution
Add document type selection during registration upload, store the type in the user profile, and automatically reuse government-issued IDs in the application flow when "validId" document is required.

---

## Implementation Tracker

### Phase 1: Backend Schema & Mutations

#### ☐ 1.1 Update Users Schema
**File**: `backend/convex/schema.ts`

Add field after `registrationDocumentId`:
```typescript
registrationDocumentType: v.optional(v.union(
  v.literal("government_id"),
  v.literal("previous_health_card"),
  v.literal("medical_certificate"),
  v.literal("other")
)),
```

**Status**: ☐ Not Started | ☐ In Progress | ☐ Completed

---

#### ☐ 1.2 Update User Mutation
**File**: `backend/convex/users/updateUser.ts`

**Step 1**: Add `registrationDocumentType` to mutation args (find the existing args object):
```typescript
args: {
  // ... existing args like registrationStatus, registrationDocumentId, etc.
  registrationDocumentType: v.optional(v.string()),
}
```

**Step 2**: Add to the patch operation (find `ctx.db.patch(args.userId, {` and add the field):
```typescript
await ctx.db.patch(args.userId, {
  // ... existing fields
  ...(args.registrationDocumentType !== undefined && {
    registrationDocumentType: args.registrationDocumentType
  }),
});
```

**Status**: ☐ Not Started | ☐ In Progress | ☐ Completed

---

### Phase 2: Registration Upload - Document Type Selection

#### ☐ 2.1 Update UploadDocumentsScreen Component
**File**: `apps/mobile/src/screens/auth/UploadDocumentsScreen/UploadDocumentsScreen.tsx`

**Step 1**: Add state for document type (after line where `const [file, setFile] = useState...`):
```typescript
const [documentType, setDocumentType] = useState<string>('');
```

**Step 2**: Add document type selector UI AFTER the infoBox (around line 205, BEFORE the file upload area):
```typescript
{/* Document Type Selection */}
<View style={styles.documentTypeSection}>
  <Text style={styles.selectorTitle}>What type of document are you uploading?</Text>

  {/* Government ID Option */}
  <TouchableOpacity
    style={[
      styles.radioOption,
      documentType === 'government_id' && styles.radioOptionSelected,
      file && styles.radioOptionDisabled
    ]}
    onPress={() => !file && setDocumentType('government_id')}
    disabled={!!file}
  >
    <View style={[styles.radioCircle, documentType === 'government_id' && styles.radioCircleSelected]}>
      {documentType === 'government_id' && <View style={styles.radioInner} />}
    </View>
    <View style={{ flex: 1 }}>
      <Text style={styles.radioLabel}>Government-Issued ID</Text>
      <Text style={styles.radioDescription}>Driver's License, Passport, National ID, etc.</Text>
    </View>
  </TouchableOpacity>

  {/* Previous Health Card Option */}
  <TouchableOpacity
    style={[
      styles.radioOption,
      documentType === 'previous_health_card' && styles.radioOptionSelected,
      file && styles.radioOptionDisabled
    ]}
    onPress={() => !file && setDocumentType('previous_health_card')}
    disabled={!!file}
  >
    <View style={[styles.radioCircle, documentType === 'previous_health_card' && styles.radioCircleSelected]}>
      {documentType === 'previous_health_card' && <View style={styles.radioInner} />}
    </View>
    <View style={{ flex: 1 }}>
      <Text style={styles.radioLabel}>Previous Health Card</Text>
      <Text style={styles.radioDescription}>Your existing or expired health card</Text>
    </View>
  </TouchableOpacity>

  {/* Medical Certificate Option */}
  <TouchableOpacity
    style={[
      styles.radioOption,
      documentType === 'medical_certificate' && styles.radioOptionSelected,
      file && styles.radioOptionDisabled
    ]}
    onPress={() => !file && setDocumentType('medical_certificate')}
    disabled={!!file}
  >
    <View style={[styles.radioCircle, documentType === 'medical_certificate' && styles.radioCircleSelected]}>
      {documentType === 'medical_certificate' && <View style={styles.radioInner} />}
    </View>
    <View style={{ flex: 1 }}>
      <Text style={styles.radioLabel}>Medical Certificate</Text>
      <Text style={styles.radioDescription}>Certificate from your doctor</Text>
    </View>
  </TouchableOpacity>

  {/* Other Document Option */}
  <TouchableOpacity
    style={[
      styles.radioOption,
      documentType === 'other' && styles.radioOptionSelected,
      file && styles.radioOptionDisabled
    ]}
    onPress={() => !file && setDocumentType('other')}
    disabled={!!file}
  >
    <View style={[styles.radioCircle, documentType === 'other' && styles.radioCircleSelected]}>
      {documentType === 'other' && <View style={styles.radioInner} />}
    </View>
    <View style={{ flex: 1 }}>
      <Text style={styles.radioLabel}>Other Supporting Document</Text>
      <Text style={styles.radioDescription}>Work permit, company ID, etc.</Text>
    </View>
  </TouchableOpacity>
</View>
```

**Step 3**: Update the upload button to be disabled if no type selected (find the `<TouchableOpacity style={styles.uploadArea}` line):
```typescript
<TouchableOpacity
  style={[styles.uploadArea, !documentType && { opacity: 0.5 }]}
  onPress={handlePickDocument}
  activeOpacity={0.7}
  disabled={!documentType}
>
```

**Step 4**: Update submission (find `await updateUser({` around line 66-70):
```typescript
await updateUser({
  registrationDocumentId: storageId,
  registrationDocumentType: documentType, // ADD THIS LINE
  registrationStatus: 'pending',
  registrationSubmittedAt: new Date().toISOString(),
});
```

**Step 5**: Update remove file handler (find the `onPress={() => { setFile(null); ...` around line 229):
```typescript
onPress={() => {
  setFile(null);
  setDocumentType(''); // ADD THIS LINE to reset type
  setValidationWarning(null);
}}
```

**Step 6**: Update button disabled state (find `disabled={!file || uploading}` around line 144):
```typescript
disabled={!file || !documentType || uploading}
```

**Status**: ☐ Not Started | ☐ In Progress | ☐ Completed

---

#### ☐ 2.2 Update Styles
**File**: `apps/mobile/src/screens/auth/UploadDocumentsScreen/UploadDocumentsScreen.styles.ts`

Add styles for:
- ☐ documentTypeSection
- ☐ selectorTitle
- ☐ radioOption
- ☐ radioOptionSelected
- ☐ radioOptionDisabled
- ☐ radioCircle
- ☐ radioCircleSelected
- ☐ radioInner
- ☐ radioLabel
- ☐ radioDescription

**Status**: ☐ Not Started | ☐ In Progress | ☐ Completed

---

### Phase 3: Application Auto-Fill Logic

#### ☐ 3.1 Update useDocumentSelection Hook
**File**: `apps/mobile/src/features/application/hooks/useDocumentSelection.ts`

**Tasks:**
- ☐ Add useEffect to check for auto-fill when requirements load
- ☐ Implement checkAndAutoFillValidId function
- ☐ Implement autoFillRegistrationDocument function
- ☐ Handle isAutoFilled flag in document object

**Status**: ☐ Not Started | ☐ In Progress | ☐ Completed

---

#### ☐ 3.2 Update UploadDocumentsStep Component
**File**: `apps/mobile/src/features/application/components/steps/UploadDocumentsStep/UploadDocumentsStep.tsx`

**Tasks:**
- ☐ Add visual indicator badge for auto-filled documents
- ☐ Show "Using your registration ID" message
- ☐ Add "Change" button to remove/replace auto-filled document

**Status**: ☐ Not Started | ☐ In Progress | ☐ Completed

---

#### ☐ 3.3 Update UploadDocumentsStep Styles
**File**: `apps/mobile/src/features/application/components/steps/UploadDocumentsStep/UploadDocumentsStep.styles.ts`

Add styles for:
- ☐ autoFilledBadge
- ☐ autoFilledText
- ☐ changeButton
- ☐ changeLink

**Status**: ☐ Not Started | ☐ In Progress | ☐ Completed

---

#### ☐ 3.4 Handle Auto-Filled in Submission
**File**: `apps/mobile/src/features/application/services/applicationService.ts`

**Tasks:**
- ☐ Update document upload logic to detect isAutoFilled flag
- ☐ Link existing registration document instead of uploading new file
- ☐ Create document reference with auto-filled metadata

**Status**: ☐ Not Started | ☐ In Progress | ☐ Completed

---

### Phase 4: Rejection Handling

#### ☐ 4.1 Update PendingApprovalScreen
**File**: `apps/mobile/src/screens/auth/PendingApprovalScreen/PendingApprovalScreen.tsx`

**Tasks:**
- ☐ Update handleRetry to clear registrationDocumentId
- ☐ Update handleRetry to clear registrationDocumentType
- ☐ Test rejection → retry flow

**Status**: ☐ Not Started | ☐ In Progress | ☐ Completed

---

## Critical Files Summary

### Backend (2 files):
- [ ] `backend/convex/schema.ts` - Add registrationDocumentType field
- [ ] `backend/convex/users/updateUser.ts` - Update mutation to accept type

### Frontend - Registration (2 files):
- [ ] `apps/mobile/src/screens/auth/UploadDocumentsScreen/UploadDocumentsScreen.tsx` - Add type selector
- [ ] `apps/mobile/src/screens/auth/UploadDocumentsScreen/UploadDocumentsScreen.styles.ts` - Add styles

### Frontend - Application (3 files):
- [ ] `apps/mobile/src/features/application/hooks/useDocumentSelection.ts` - Auto-fill logic
- [ ] `apps/mobile/src/features/application/components/steps/UploadDocumentsStep/UploadDocumentsStep.tsx` - Visual indicator
- [ ] `apps/mobile/src/features/application/components/steps/UploadDocumentsStep/UploadDocumentsStep.styles.ts` - Badge styles

### Frontend - Rejection (1 file):
- [ ] `apps/mobile/src/screens/auth/PendingApprovalScreen/PendingApprovalScreen.tsx` - Reset on retry

---

## User Flow

### Registration:
1. User signs up → Verifies email → Upload Documents Screen
2. **Step 1**: User selects document type (required)
3. **Step 2**: Upload area becomes enabled
4. **Step 3**: User picks/uploads file
5. **Step 4**: Document type is LOCKED (cannot change without removing file)
6. **Step 5**: Validation runs
7. **Step 6**: Submit for approval
8. Admin reviews → Approves/Rejects
9. If **Rejected**: User retries, both file AND type are reset

### Application:
1. User starts health card application
2. Upload Documents Step loads requirements
3. **Auto-fill check**: If user uploaded `government_id` during registration:
   - ✅ Auto-populate Valid ID field
   - Show green badge: "Using your registration ID [Change]"
4. User can click "Change" to remove and upload different ID
5. Submit application

---

## Design Decisions (User Confirmed)

1. **Document type editing**: ❌ **LOCKED** after upload (must remove file to change type)
2. **Rejection handling**: ✅ **Reset everything** (both file and type cleared)
3. **Auto-filled editing**: ✅ **Can change** (show "Change" button for flexibility)

---

## Edge Cases Handled

✅ **User uploaded non-ID**: Not auto-filled, must upload Valid ID manually
✅ **ID expired since registration**: User can "Change" to upload new one
✅ **Want different ID for application**: User can "Change" to override
✅ **Admin rejects registration doc**: Both file AND type reset on retry
✅ **Multiple applications**: Each application can use or override auto-filled ID
✅ **Document type locked after upload**: Prevents accidental type changes
✅ **Remove file = reset type**: Clean state for re-upload

---

## Testing Checklist

### Registration Flow
- [ ] User can see 4 document type options
- [ ] User must select type before uploading
- [ ] Upload area is disabled until type selected
- [ ] Document type becomes locked after file upload
- [ ] User cannot change type without removing file
- [ ] Document type is saved to backend
- [ ] File removal resets document type
- [ ] Submission works with document type

### Application Auto-Fill Flow
- [ ] Valid ID auto-fills if user uploaded government_id
- [ ] Badge shows "Using your registration ID"
- [ ] "Change" button appears and works
- [ ] User can remove and upload different ID
- [ ] Non-government_id users see normal upload field
- [ ] Auto-filled documents submit correctly

### Rejection Flow
- [ ] Rejection clears both file and document type
- [ ] User can re-select type on retry
- [ ] Re-upload works correctly

### Edge Cases
- [ ] Multiple applications use/override correctly
- [ ] Type stays locked during upload
- [ ] Validation works with all document types

---

## Success Criteria

✅ User must select document type before uploading during registration
✅ Document type is locked once file is uploaded
✅ Document type is saved to user profile in backend
✅ Valid ID auto-fills in application if user uploaded government_id
✅ Visual badge shows "Using your registration ID" with Change option
✅ User can remove/change auto-filled documents
✅ Rejection resets both file and document type
✅ All responsive utilities used properly
✅ Type checking passes
✅ No breaking changes to existing functionality

---

## Progress Tracking

**Overall Progress**: 0/8 files completed (0%)

**Phase Progress**:
- Phase 1 (Backend): 0/2 tasks ☐
- Phase 2 (Registration): 0/2 tasks ☐
- Phase 3 (Application): 0/4 tasks ☐
- Phase 4 (Rejection): 0/1 task ☐

**Last Updated**: [Date when you start implementation]

---

## Notes & Issues

_Add any implementation notes, blockers, or issues encountered here_

---

## References

- Original discussion: Smart Type Detection feature request
- Related files: Document upload system architecture
- Design patterns: Responsive utilities, locked state after selection
