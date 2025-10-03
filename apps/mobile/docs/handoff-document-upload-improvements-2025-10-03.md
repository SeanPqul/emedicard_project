# Document Upload Flow Improvements - Handoff Document
**Date**: October 3, 2025  
**Developer**: Assistant  
**Project**: eMedicard Mobile Application

## Summary
This document outlines the improvements made to the document upload and viewing flow, focusing on rejected document handling and UI fixes.

## Key Changes Made

### 1. Fixed Navigation Route Mismatch
**Issue**: "View Uploaded Documents" button was navigating to `/view` but the route file was named `view-document.tsx`

**Solution**: Updated navigation in `ApplicationDetailWidget.tsx`
```typescript
// Before:
onPress={() => router.push(`/(screens)/(shared)/documents/view?formId=${application._id}`)}

// After:
onPress={() => router.push(`/(screens)/(shared)/documents/view-document?formId=${application._id}`)}
```

### 2. Enhanced Rejected Document Handling in ViewDocumentsScreen

#### Added Rejected Document Filtering
- Added logic to identify rejected documents
- Show "Re-upload Rejected Documents" button only when documents are rejected
- Display rejection count and individual "Replace" buttons

**Key Code Changes in `ViewDocumentsScreen.tsx`:**
```typescript
// Added rejected documents filter
const rejectedDocuments = uploadedDocuments.filter((d: DocumentWithRequirement) => 
  d.reviewStatus === 'Rejected'
);

// Navigation handler for re-uploading rejected documents
const handleReuploadRejected = () => {
  const rejectedFieldIds = rejectedDocuments
    .map((doc: DocumentWithRequirement) => doc.requirement?.fieldIdentifier)
    .filter(Boolean)
    .join(',');
  
  router.push(`/(screens)/(shared)/documents/upload-document?formId=${formId}&rejectedOnly=true&rejectedFields=${rejectedFieldIds}`);
};
```

#### UI Improvements
- Added red-themed "Re-upload Rejected Documents" button with rejection notice
- Individual "Replace" buttons for each rejected document
- Conditional display based on rejection status

### 3. Implemented Filtered Upload Flow in UploadDocumentsScreen

**Added Query Parameter Handling:**
```typescript
// Parse route parameters
const rejectedOnly = params.rejectedOnly === 'true';
const rejectedFields = params.rejectedFields as string | undefined;

// Filter document requirements
const documentRequirements = React.useMemo(() => {
  if (!rejectedOnly || !rejectedFields) {
    return allDocumentRequirements;
  }
  
  const rejectedFieldList = rejectedFields.split(',');
  return allDocumentRequirements.filter((doc: DocumentRequirement) => 
    rejectedFieldList.includes(doc.fieldName)
  );
}, [allDocumentRequirements, rejectedOnly, rejectedFields]);
```

This ensures that when navigating from the "Re-upload Rejected Documents" button, only the rejected documents appear in the upload screen.

### 4. Fixed Bottom Padding Issue in ViewDocumentsScreen

**Issue**: Cedula document was being cut off at the bottom of the screen

**Solution**: Added extra bottom padding to containers
```typescript
// In ViewDocumentsScreen.styles.ts
documentsContainer: {
  paddingHorizontal: scale(theme.spacing.md),
  paddingBottom: verticalScale(theme.spacing.xl * 3), // Added extra padding
},

addMoreContainer: {
  paddingHorizontal: scale(theme.spacing.md),
  paddingBottom: verticalScale(theme.spacing.xl * 3), // Increased padding
},
```

## User Flow Improvements

### Previous Flow:
1. All documents shown on upload screen regardless of status
2. "Upload Additional Documents" button always visible
3. No clear indication of which documents were rejected
4. Navigation to view documents was broken

### New Flow:
1. View Documents screen clearly shows document status with icons and colors
2. Rejected documents have:
   - Red status badge
   - Admin remarks displayed
   - Individual "Replace" buttons
3. "Re-upload Rejected Documents" button only appears when needed
4. Clicking re-upload navigates to filtered upload screen showing only rejected documents
5. Users can replace individual documents or all rejected documents at once

## Technical Details

### Files Modified:
1. `src/features/application/components/ApplicationDetailWidget.tsx` - Fixed navigation route
2. `src/screens/shared/ViewDocumentsScreen/ViewDocumentsScreen.tsx` - Added rejection handling
3. `src/screens/shared/ViewDocumentsScreen/ViewDocumentsScreen.styles.ts` - Fixed bottom padding
4. `src/screens/shared/UploadDocumentsScreen/UploadDocumentsScreen.tsx` - Added filtering logic

### Query Parameters:
- `rejectedOnly`: Boolean flag indicating if only rejected documents should be shown
- `rejectedFields`: Comma-separated list of field identifiers for rejected documents

## Testing Recommendations

1. **Navigation Test**: Verify "View Uploaded Documents" button navigates correctly
2. **Rejection Flow Test**: 
   - Upload documents and have admin reject some
   - Verify rejected document UI appears correctly
   - Test re-upload flow for individual and batch replacement
3. **Filtering Test**: Ensure upload screen shows only rejected documents when navigating from re-upload button
4. **UI Test**: Verify Cedula and other documents are not cut off at bottom of screen

## Next Steps

1. Consider adding animations for status changes
2. Implement push notifications for document review status updates
3. Add confirmation dialogs before replacing documents
4. Consider implementing document preview improvements

## Notes
- The route fix from `/view` to `/view-document` is critical for navigation to work
- The filtering logic preserves the original upload screen behavior when accessed normally
- Bottom padding was specifically adjusted in ViewDocumentsScreen only, not in the upload screen
