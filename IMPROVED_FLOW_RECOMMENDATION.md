# Improved Application Flow Recommendation

## Current Flow Issues

The current flow (Documents → Application → Payment) can lead to orphaned files in storage if the application creation fails after successful uploads.

## Recommended Production-Ready Flow

### 1. **Draft-First Approach**

```typescript
// Step 1: Create draft application immediately
const applicationId = await createApplication({
  ...formData,
  status: "Draft",
  expiresAt: Date.now() + 24 * 60 * 60 * 1000 // 24 hour expiry
});

// Step 2: Upload documents with application reference
for (const document of documents) {
  await uploadDocument({
    applicationId,
    document,
    // If upload fails, application still exists as draft
  });
}

// Step 3: Validate completeness
const validation = await validateApplication(applicationId);
if (!validation.isComplete) {
  // Allow user to fix missing items
  return { status: "Incomplete", missing: validation.missing };
}

// Step 4: Submit with payment
await submitApplication({
  applicationId,
  paymentInfo,
  status: "Submitted"
});
```

### 2. **Benefits of This Approach**

#### Save Progress
- Users can save draft and return later
- No need to re-upload documents if session expires
- Better UX for complex forms

#### Better Error Recovery
```typescript
// If document upload fails
if (uploadError) {
  // Application still exists as draft
  // User can retry just the failed document
  await retryDocumentUpload(applicationId, failedDocumentId);
}
```

#### Cleanup Strategy
```typescript
// Scheduled job to clean up abandoned drafts
async function cleanupAbandonedDrafts() {
  const expiredDrafts = await getDraftsOlderThan(24 * 60 * 60 * 1000);
  
  for (const draft of expiredDrafts) {
    // Delete associated documents from storage
    await deleteDocuments(draft.documents);
    // Delete draft application
    await deleteApplication(draft.id);
  }
}
```

### 3. **Implementation Example**

```typescript
// Modified useSubmission.ts
const submitApplicationWithPayment = async (paymentMethod, referenceNumber) => {
  let applicationId = formData.applicationId;
  
  // Step 1: Create or get draft application
  if (!applicationId) {
    applicationId = await applications.mutations.createApplication({
      ...formData,
      applicationStatus: "Draft",
    });
    
    // Save to local state for resume capability
    formStorage.saveApplicationId(applicationId);
  }
  
  // Step 2: Upload documents (with retry capability)
  const uploadResults = await uploadDocumentsWithRetry(applicationId, documents);
  
  if (uploadResults.failed.length > 0) {
    // Save progress - user can retry failed uploads
    await applications.mutations.updateApplication({
      applicationId,
      uploadProgress: uploadResults,
    });
    
    throw new Error(`${uploadResults.failed.length} documents failed to upload`);
  }
  
  // Step 3: Validate application completeness
  const validation = await applications.queries.validateApplication(applicationId);
  if (!validation.isValid) {
    throw new Error(validation.message);
  }
  
  // Step 4: Submit with payment
  const result = await applications.mutations.submitApplicationForm(
    applicationId,
    paymentMethod,
    referenceNumber
  );
  
  // Step 5: Clear local storage only after success
  if (result.success) {
    formStorage.clearTempApplication();
  }
  
  return result;
};
```

### 4. **Database Schema Improvements**

```typescript
// applications table
{
  _id: Id<"applications">,
  userId: Id<"users">,
  applicationStatus: "Draft" | "Submitted" | "Under Review" | "Approved" | "Rejected",
  createdAt: number,
  updatedAt: number,
  expiresAt?: number, // For draft cleanup
  lastSavedStep?: number, // Track progress
  validationErrors?: string[], // Track what's missing
}

// documentUploads table with soft delete
{
  _id: Id<"documentUploads">,
  applicationId: Id<"applications">,
  storageId: Id<"_storage">,
  uploadedAt: number,
  deletedAt?: number, // Soft delete for cleanup
  retryCount?: number, // Track retry attempts
}
```

### 5. **Error Handling Improvements**

```typescript
class ApplicationService {
  async createWithRetry(formData: ApplicationFormData) {
    // Check for existing draft
    const existingDraft = await this.findDraftByUser(userId);
    
    if (existingDraft && !this.isExpired(existingDraft)) {
      // Resume existing draft
      return { 
        applicationId: existingDraft._id, 
        resumed: true,
        progress: existingDraft.lastSavedStep 
      };
    }
    
    // Create new draft
    return { 
      applicationId: await this.createDraft(formData), 
      resumed: false 
    };
  }
  
  async uploadWithCleanup(applicationId: string, documents: Document[]) {
    const uploaded = [];
    
    try {
      for (const doc of documents) {
        const result = await this.uploadDocument(applicationId, doc);
        uploaded.push(result);
      }
      return { success: true, uploaded };
    } catch (error) {
      // Cleanup successfully uploaded files if needed
      if (this.shouldCleanup(error)) {
        await this.rollbackUploads(uploaded);
      }
      throw error;
    }
  }
}
```

### 6. **State Management**

```typescript
// Better state tracking
interface ApplicationState {
  applicationId?: string;
  status: "new" | "draft" | "uploading" | "validating" | "submitting" | "complete";
  currentStep: number;
  completedSteps: number[];
  uploadProgress: {
    total: number;
    completed: number;
    failed: string[];
  };
  validationErrors: string[];
  canResume: boolean;
}
```

## Summary

### Current Approach (Documents → Application → Payment)
- ✅ Simple and atomic-like
- ✅ No orphaned applications
- ❌ Orphaned storage files possible
- ❌ No save/resume capability

### Recommended Approach (Draft Application → Documents → Submit)
- ✅ Save and resume capability
- ✅ Better error recovery
- ✅ Progressive enhancement
- ✅ Better UX for complex forms
- ✅ Cleaner separation of concerns
- ❌ More complex implementation
- ❌ Needs cleanup strategy

### When to Use Each

**Use Current Approach When:**
- Simple forms with few documents
- Fast, reliable upload expected
- No need for save/resume
- Simplicity is priority

**Use Recommended Approach When:**
- Complex forms with many documents
- Users might need multiple sessions
- Network reliability is a concern
- Enterprise/production environment
- Better UX is priority

## Migration Path

If you want to migrate to the recommended approach:

1. **Phase 1**: Add draft status support (✅ already done)
2. **Phase 2**: Add application ID persistence
3. **Phase 3**: Add resume capability
4. **Phase 4**: Add cleanup jobs
5. **Phase 5**: Add progress tracking UI

This can be done incrementally without breaking existing functionality.
