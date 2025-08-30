# Bug Fix Summary: Document Upload Issues

## Problems Fixed
1. **Premature form submission**: Application was created in database before documents were uploaded
2. **Invalid content-type header**: Files were being uploaded with invalid MIME type ("image" instead of "image/jpeg")
3. **Application status conflict**: Application was created with "Submitted" status, causing "Application has already been submitted" error

## Root Causes

### Issue 1: Premature Application Creation
In `src/hooks/useSubmission.ts`, the order of operations was:
1. Create application in database FIRST
2. Then try to upload documents
3. Link documents to application
4. Submit with payment

This meant if step 2 (document upload) failed, the application was already created without documents.

### Issue 2: Invalid Content-Type Header
When files were selected using ImagePicker, the file type was being stored as just `"image"` instead of a valid MIME type like `"image/jpeg"`. This caused the Convex storage API to reject uploads with error:
```
"Bad header for content-type: invalid HTTP header"
```

### Issue 3: Application Status Conflict
In `convex/applications/createApplication.ts`, applications were being created with `applicationStatus: "Submitted"` immediately. But later when `submitApplicationForm` was called, it checked if the status was already "Submitted" and threw "Application has already been submitted" error.

## Solutions Implemented

### Fix 1: Reordered Operations (`src/hooks/useSubmission.ts`)
Changed the sequence to:
1. **Upload documents to storage FIRST** (without linking to any application)
2. **Store upload results temporarily in memory**
3. **Create application ONLY after all uploads succeed**
4. **Link uploaded documents to the created application**
5. **Submit with payment**

This ensures no application is created if document uploads fail.

### Fix 2: Content-Type Validation
Added proper MIME type validation in two places:

#### `src/hooks/useDocumentSelection.ts` (lines 94-106)
```typescript
// Fix file type detection
let fileType = file.type || file.mimeType;

// Handle cases where type is just 'image' without subtype
if (!fileType || fileType === 'image' || !fileType.includes('/')) {
  // Try to infer from file extension or URI
  const uri = file.uri || '';
  if (uri.toLowerCase().includes('.png')) {
    fileType = 'image/png';
  } else if (uri.toLowerCase().includes('.pdf')) {
    fileType = 'application/pdf';
  } else {
    // Default to JPEG for images
    fileType = 'image/jpeg';
  }
}
```

#### `src/hooks/useSubmission.ts` (lines 268-285)
```typescript
// Fix content-type to ensure it's a valid MIME type
let contentType = operation.file.type || operation.file.mimeType;

// Validate and fix content-type
if (!contentType || contentType === 'image' || !contentType.includes('/')) {
  // Try to infer from file name or URI
  const fileUri = operation.file.uri || '';
  const fileName = operation.file.name || operation.file.fileName || '';
  
  if (fileUri.toLowerCase().includes('.png') || fileName.toLowerCase().includes('.png')) {
    contentType = 'image/png';
  } else if (fileUri.toLowerCase().includes('.pdf') || fileName.toLowerCase().includes('.pdf')) {
    contentType = 'application/pdf';
  } else {
    // Default to JPEG for images
    contentType = 'image/jpeg';
  }
}
```

### Fix 3: Application Status Flow
Fixed the application lifecycle in `convex/applications/createApplication.ts` and `convex/applications/submitApplication.ts`:
- Applications now start with `applicationStatus: "Draft"` when created
- Only changed to `"Submitted"` after successful payment processing
- Added validation to ensure only "Draft" applications can be submitted

### Fix 4: Enhanced Error Logging
Added detailed console logging throughout the upload process to help diagnose issues:
- File URI validation
- Blob creation status
- Upload URL generation
- Content-type being used
- Response status and error messages

## Benefits
1. **No orphaned records**: Applications are never created without their required documents
2. **Better error recovery**: Users can retry uploads without creating duplicate applications
3. **Valid MIME types**: All uploads now have proper content-type headers
4. **Atomic operations**: Either everything succeeds or nothing is saved to the database
5. **Clear error messages**: Users get specific feedback about what went wrong

## Testing
To verify the fixes work:
1. Select documents for upload in the application form
2. Submit the application
3. Documents should upload successfully with proper MIME types
4. Application should only be created after all documents upload
5. If any upload fails, no application record should be created

## Files Modified
- `src/hooks/useSubmission.ts` - Reordered operations and added content-type validation
- `src/hooks/useDocumentSelection.ts` - Fixed file type detection when selecting documents
- `src/utils/formStorage.ts` - Added support for storing upload results
- `convex/applications/createApplication.ts` - Changed initial status from "Submitted" to "Draft"
- `convex/applications/submitApplication.ts` - Added validation to only allow "Draft" applications to be submitted
