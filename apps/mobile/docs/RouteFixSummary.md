# Route Fix Summary

**Date:** January 3, 2025  
**Issue:** Unmatched route when clicking "View Uploaded Documents"

## Problem
The routes in the application were not matching the actual file names in the `app/(screens)/(shared)/documents/` directory.

## Root Cause
Mismatch between route navigation paths and actual file names:
- Navigation was trying to go to `/view` but file was named `view-document.tsx`
- Navigation was trying to go to `/upload` but file was named `upload-document.tsx`

## Files in documents directory:
```
app/(screens)/(shared)/documents/
├── requirements.tsx
├── upload-document.tsx
└── view-document.tsx
```

## Fixed Routes

### 1. ApplicationDetailWidget.tsx
**Changed:**
```typescript
// FROM:
router.push(`/(screens)/(shared)/documents/view?formId=${application._id}`)

// TO:
router.push(`/(screens)/(shared)/documents/view-document?formId=${application._id}`)
```

### 2. ViewDocumentsScreen.tsx
**Changed:**
```typescript
// FROM:
router.push(`/(screens)/(shared)/documents/upload?formId=${formId}`)

// TO:
router.push(`/(screens)/(shared)/documents/upload-document?formId=${formId}`)
```

## Correct Route Mapping

| Action | Route Path | File Name |
|--------|------------|-----------|
| View Documents | `/(screens)/(shared)/documents/view-document` | `view-document.tsx` |
| Upload Documents | `/(screens)/(shared)/documents/upload-document` | `upload-document.tsx` |
| Requirements | `/(screens)/(shared)/documents/requirements` | `requirements.tsx` |

## Testing
After these changes:
1. ✅ Clicking "View Uploaded Documents" from Application Details navigates to the correct route
2. ✅ Clicking "Upload Documents" or "Upload Additional Documents" navigates to the correct route
3. ✅ No more "Unmatched route" errors

## Note
When working with Expo Router, the route path must exactly match the file name (without the .tsx extension). Always ensure:
- Route in `router.push()` matches the actual file name
- File names follow consistent naming conventions
- No mismatch between what you're navigating to and what files exist
