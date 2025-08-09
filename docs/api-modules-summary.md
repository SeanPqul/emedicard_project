# Feature-scoped API Modules with Type-safe Calls

This document provides an overview of the standardized API modules created for the E-MediCard project. Each module contains small functions per feature that call Convex directly and use Id types.

## Module Structure

All API modules follow a consistent pattern:
- Import `convex`, `api`, and `Id` from the appropriate Convex generated files
- Use standardized API calls with format: `api.namespace.function`
- Functions are small, focused, and use proper Id types
- No duplicate function names across modules

## API Modules

### 1. Payments API (`src/api/payments.api.ts`)

**Functions:**
- `getPaymentByFormId(formId: Id<'forms'>)` - Get payment by form ID
- `createPayment(input)` - Create a new payment with form ID, amounts, method, etc.
- `updatePaymentStatus(paymentId, status)` - Update payment status (Pending/Complete/Failed)  
- `getUserPayments()` - Get all payments for current user

**Payment Methods:** 'Gcash' | 'Maya' | 'BaranggayHall' | 'CityHall'

### 2. Health Cards API (`src/api/healthCards.api.ts`)

**Functions:**
- `getByVerificationToken(token: string)` - Get health card by verification token (for QR scanning)
- `getUserCards()` - Get all health cards for current user
- `getHealthCardByFormId(formId)` - Get health card by form ID
- `issueHealthCard(input)` - Issue a new health card
- `updateHealthCardStatus(cardId, status)` - Update health card status

### 3. Forms API (`src/api/forms.api.ts`)

**Functions:**
- `createForm(input)` - Create new form/application with applicationType, jobCategory, position, etc.
- `getFormById(formId)` - Get form by ID
- `getUserApplications()` - Get all applications for current user
- `updateForm(formId, updates)` - Update form data
- `submitApplicationForm(formId)` - Submit application form

### 4. Storage API (`src/api/storage.api.ts`)

**Functions:**
- `generateUploadUrl()` - Generate upload URL for file storage

### 5. Notifications API (`src/api/notifications.api.ts`)

**Functions:**
- `getUserNotifications()` - Get all notifications for current user
- `getUnreadNotificationCount()` - Get unread notification count
- `createNotification(input)` - Create new notification
- `markNotificationAsRead(notificationId)` - Mark single notification as read
- `markAllNotificationsAsRead()` - Mark all notifications as read

### 6. Users API (`src/api/users.api.ts`)

**Functions:**
- `getCurrentUser()` - Get current user profile
- `createUser(input)` - Create new user with clerkId, email, names, role, etc.
- `updateUser(updates)` - Update user profile
- `updateUserRole(userId, role)` - Update user role (admin only)
- `getUsersByRole(role)` - Get users by role

### 7. Job Categories API (`src/api/jobCategories.api.ts`)

**Functions:**
- `getAllJobCategories()` - Get all job categories
- `getJobCategoryById(jobCategoryId)` - Get job category by ID
- `createJobCategory(input)` - Create new job category
- `updateJobCategory(jobCategoryId, updates)` - Update job category
- `deleteJobCategory(jobCategoryId)` - Delete job category

### 8. Requirements API (`src/api/requirements.api.ts`)

**Functions:**
- `getRequirementsByJobCategory(jobCategoryId)` - Get requirements by job category
- `getCategoryRequirements(categoryId)` - Get category requirements
- `getFormDocuments(formId)` - Get form documents
- `getFormDocumentsById(formId)` - Get form documents by ID
- `uploadDocument(input)` - Upload document
- `updateDocument(documentId, updates)` - Update document
- `deleteDocument(documentId)` - Delete document
- `getDocumentUrl(storageId)` - Get document URL
- **Admin functions:** `adminReviewDocument()`, `adminGetPendingDocuments()`, `adminGetDocumentsByStatus()`, `adminBatchReviewDocuments()`

### 9. Orientations API (`src/api/orientations.api.ts`)

**Functions:**
- `getUserOrientations()` - Get user orientations

### 10. Verification API (`src/api/verification.api.ts`)

**Functions:**
- `createVerificationLog(input)` - Create verification log
- `logQRScan(input)` - Log QR scan
- `logVerificationAttempt(input)` - Log verification attempt  
- `getVerificationLogsByHealthCard(healthCardId)` - Get verification logs by health card
- `getVerificationLogsByUser()` - Get verification logs by user
- `getVerificationStats()` - Get verification stats

## Usage Examples

```typescript
// Import specific functions from API modules
import { createPayment, getPaymentByFormId } from '../api/payments.api';
import { getUserCards } from '../api/healthCards.api';
import { createForm } from '../api/forms.api';

// Create a payment
const paymentId = await createPayment({
  formId: "form_id_here" as Id<'forms'>,
  amount: 500,
  serviceFee: 50,
  netAmount: 550,
  method: "Gcash",
  referenceNumber: "GC123456789"
});

// Get user's health cards
const healthCards = await getUserCards();

// Create a new form
const formId = await createForm({
  applicationType: "New",
  jobCategory: "job_category_id" as Id<'jobCategories'>,
  position: "Software Developer",
  organization: "Tech Company",
  civilStatus: "Single"
});
```

## Benefits

1. **Type Safety**: All functions use proper Id types from Convex
2. **Consistency**: Standardized naming and structure across all modules
3. **Small Functions**: Each function has a single, focused responsibility
4. **No Duplication**: Unique function names across all modules
5. **Direct Convex Calls**: Direct usage of `convex.query()` and `convex.mutation()`
6. **Easy to Use**: Simple import and call pattern for all API operations
