# Rejected Documents UI Update Summary

**Date:** January 3, 2025  
**Feature:** Upload Additional Documents - Only for Rejected Documents

## Overview
Updated the ViewDocumentsScreen to only show the "Upload Additional Documents" button when there are rejected documents that need to be re-uploaded, as per user requirement.

## Changes Made

### 1. Added Rejected Documents Tracking
```typescript
// Find rejected documents
const rejectedDocuments = uploadedDocuments.filter(
  (doc: DocumentWithRequirement) => doc.reviewStatus === 'Rejected'
);
```

### 2. Updated "Upload Additional Documents" Section
**Before:** Always showed for any uploaded documents
**After:** Only shows when there are rejected documents

**New UI Elements:**
- Rejected notice with error icon and count
- Red-themed "Re-upload Rejected Documents" button
- Clear messaging about number of rejected documents

### 3. Added Individual Replace Button
Each rejected document now has:
- View Document button (blue)
- Replace button (red) - only shown for rejected documents

### 4. Updated Styles
New styles added:
- `rejectedNotice` - Red-themed notice box
- `rejectedNoticeText` - Notice message styling
- `documentActions` - Container for view/replace buttons
- `replaceButton` - Individual replace button styling
- Updated `addMoreButton` to use error/red theme

## UI Behavior

### When No Documents Are Rejected
- No "Upload Additional Documents" section shown
- Each document only has a "View Document" button

### When Documents Are Rejected
- Shows rejected notice: "X document(s) were rejected. Please upload clear replacements."
- "Re-upload Rejected Documents" button appears at bottom
- Each rejected document shows both:
  - "View Document" button
  - "Replace" button with refresh icon

## Benefits

1. **Clearer User Guidance**: Users only see upload options when action is needed
2. **Reduced Confusion**: No unnecessary upload button when all documents are approved/pending
3. **Better UX**: Individual replace buttons for specific rejected documents
4. **Visual Clarity**: Red theme for rejection-related actions

## Example Scenarios

### Scenario 1: All Documents Approved
- Summary shows all approved
- No upload additional documents section
- Only "View Document" buttons shown

### Scenario 2: Some Documents Rejected
- Summary shows rejected count
- Rejected notice appears at bottom
- Rejected documents have "Replace" button
- "Re-upload Rejected Documents" button at bottom

### Scenario 3: Missing Required Documents
- Shows warning card for missing documents
- "Upload Missing Documents" button (unchanged)

## Technical Details

- Filtered rejected documents using `reviewStatus === 'Rejected'`
- Conditional rendering based on `rejectedDocuments.length > 0`
- Proper pluralization for document count
- Maintained existing navigation to upload screen
- All buttons use consistent routing: `/(screens)/(shared)/documents/upload-document`

## Testing Recommendations

1. Test with no rejected documents - should not show upload section
2. Test with 1 rejected document - check singular form
3. Test with multiple rejected documents - check plural form
4. Test clicking "Replace" on individual document
5. Test clicking "Re-upload Rejected Documents" button
6. Verify rejected documents show admin remarks
7. Test mixed statuses (approved, pending, rejected)
