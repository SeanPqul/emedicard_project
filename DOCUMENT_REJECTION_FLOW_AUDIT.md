# Document Rejection Flow - Complete Audit Trail

## 📊 Database Tables & Flow Documentation

### Overview
This document explains the complete flow of document rejection, including all database tables affected and admin activity logging.

---

## 🔄 Flow 1: Admin Rejects Document on Card (Queued Rejection)

### Action
Admin clicks "Reject" button on a document card and adds remarks/category/issues.

### Tables Affected

#### 1. `documentUploads`
```
Updated Fields:
- reviewStatus: "Rejected"
- adminRemarks: "[rejection reason]"
- reviewedBy: [admin ID]
- reviewedAt: [timestamp]
```

#### 2. `documentRejectionHistory` (NEW RECORD CREATED)
```
Created Record:
- applicationId: [app ID]
- documentTypeId: [doc type ID]
- documentUploadId: [upload ID]
- rejectedFileId: [storage ID]
- originalFileName: "[filename]"
- fileSize: [bytes]
- fileType: "[mime type]"
- rejectionCategory: "[category]"
- rejectionReason: "[reason]"
- specificIssues: [array of issues]
- rejectedBy: [admin ID]
- rejectedAt: [timestamp]
- wasReplaced: false
- attemptNumber: [1, 2, or 3]
- status: "pending"
- notificationSent: FALSE  ⚠️ KEY: Not sent yet!
- notificationSentAt: undefined
```

#### 3. `applications`
```
Updated Fields:
- applicationStatus: "Under Review"
- updatedAt: [timestamp]
```

#### 4. `adminActivityLogs` ✅
```
Created Record:
- adminId: [admin ID]
- activityType: "document_rejection"
- details: "Rejected [doc name] for application [id]. Reason: [reason]"
- applicationId: [app ID]
- jobCategoryId: [job category ID]
- timestamp: [timestamp]
```

#### 5. `notifications` (To Other Admins)
```
Created Records (for each relevant admin):
- userId: [other admin ID]
- notificationType: "document_rejection"
- title: "Document Rejected"
- message: "[Admin] has rejected [doc] for [applicant]. Reason: [reason]"
- actionUrl: "/dashboard/[appId]/doc_verif"
- applicationId: [app ID]
- jobCategoryId: [job category ID]
- isRead: false
```

### 🚨 Special Case: 3rd Attempt (Max Attempts Reached)
If this is the 3rd rejection attempt, the application is **permanently rejected**:

#### Additional Tables Affected:
- `applications`: applicationStatus = "Rejected" (permanent)
- `notifications`: Immediate notification to applicant about permanent rejection
- `documentRejectionHistory`: notificationSent = true (sent immediately)

---

## 📤 Flow 2: Admin Clicks "Request Document Resubmission"

### Action
Admin clicks the "Request Document Resubmission" button to send all queued rejection notifications.

### Tables Affected

#### 1. `documentRejectionHistory` (UPDATES PENDING RECORDS)
```
Updated Fields (for all records where notificationSent = false):
- notificationSent: TRUE
- notificationSentAt: [timestamp]
```

#### 2. `notifications` (To Applicant - ONE PER REJECTED DOCUMENT)
```
Created Records:
For Attempt 1:
- title: "Document Rejected"
- message: "Your [doc] has been rejected. Reason: [reason]. This is attempt 1 of 3."
- notificationType: "document_rejected"

For Attempt 2:
- title: "⚠️ Document Rejected - Warning"
- message: "⚠️ Your [doc] has been rejected. Reason: [reason]. This is attempt 2 of 3. ⚠️ Warning: You have 1 more attempt remaining."
- notificationType: "document_rejected"

For Attempt 3 (if somehow not handled earlier):
- title: "🚨 Final Attempt - Document Rejected"
- message: "🚨 FINAL ATTEMPT: Your [doc] has been rejected. This is your LAST chance (attempt 3 of 3). ⚠️ If rejected again, application will be permanently closed."
- notificationType: "document_rejected"

Common Fields:
- userId: [applicant ID]
- applicationId: [app ID]
- jobCategoryId: [job category ID]
- isRead: false
- actionUrl: "/applications/[appId]/resubmit/[docTypeId]"
```

#### 3. `adminActivityLogs` ✅
```
Created Record:
- adminId: [admin ID]
- activityType: "rejection_notification_sent"
- details: "Sent batch rejection notification for [X] document(s) for application [id]"
- applicationId: [app ID]
- jobCategoryId: [job category ID]
- timestamp: [timestamp]
```

#### 4. `applications`
```
Updated Fields:
- applicationStatus: "Rejected" (allows resubmission)
- updatedAt: [timestamp]
```

---

## ❌ Flow 3: Admin Clicks "Reject Application (Final)"

### Action
Admin permanently rejects the application (no resubmission allowed).

### Tables Affected

#### 1. `applications`
```
Updated Fields:
- applicationStatus: "Rejected" (permanent)
- adminRemarks: "Application permanently rejected by [admin]. Category: [category]. Reason: [reason]"
- updatedAt: [timestamp]
- lastUpdatedBy: [admin ID]
```

#### 2. `adminActivityLogs` ✅
```
Created Record:
- adminId: [admin ID]
- activityType: "application_final_rejection"
- details: "Permanently rejected application for [applicant]. Category: [category]. Reason: [reason]"
- timestamp: [timestamp]
- applicationId: [app ID]
- jobCategoryId: [job category ID]
```

#### 3. `notifications` (To Applicant)
```
Created Record:
- userId: [applicant ID]
- applicationId: [app ID]
- title: "❌ Application Rejected"
- message: "Your application has been permanently rejected. Reason: [reason]. ❌ This application can no longer be continued. ✅ If you wish to obtain a Health Card, please create a new application."
- notificationType: "application_rejected_final"
- isRead: false
- jobCategoryId: [job category ID]
```

#### 4. `notifications` (To Other Admins)
```
Created Records (for each relevant admin):
- userId: [other admin ID]
- applicationId: [app ID]
- title: "Application Permanently Rejected"
- message: "[Admin] permanently rejected [applicant]'s application. Reason: [reason]"
- notificationType: "application_rejection_info"
- isRead: false
- jobCategoryId: [job category ID]
- actionUrl: "/dashboard/[appId]/doc_verif"
```

---

## ✅ Flow 4: Admin Clicks "Approve & Continue to Payment"

### Action
Admin approves all documents and moves application to payment validation.

### Tables Affected

#### 1. `applications`
```
Updated Fields:
- applicationStatus: "Payment Validation"
- updatedAt: [timestamp]
```

#### 2. `adminActivityLogs` ✅
```
Created Record:
- adminId: [admin ID]
- activityType: "application_finalization"
- details: "Finalized document verification for [applicant] with status: Payment Validation"
- timestamp: [timestamp]
- applicationId: [app ID]
- jobCategoryId: [job category ID]
```

---

## 💰 Payment Rejection Flows

### Flow 5: Request Payment Correction (Similar to Documents)

#### Tables Affected:
1. `payments`: paymentStatus = "Failed"
2. `paymentRejectionHistory`: NEW record created
3. `applications`: applicationStatus = "Payment Rejected"
4. `adminActivityLogs`: activityType = "payment_rejection"
5. `notifications`: To applicant with attempt warnings (1-3)

### Flow 6: Permanent Payment Rejection
Same as "Reject Application (Final)" flow above.

---

## 📋 Admin Activity Log Types

### All Activity Types Created:
1. **`document_rejection`** - When admin rejects a document card
2. **`rejection_notification_sent`** - When "Request Document Resubmission" is clicked
3. **`application_finalization`** - When documents are approved or rejected
4. **`application_final_rejection`** - When application is permanently rejected
5. **`payment_rejection`** - When payment is rejected
6. **`payment_approval`** - When payment is approved

### Log Structure:
```typescript
{
  adminId: Id<"users">,
  activityType: string,
  details: string,
  timestamp: number,
  applicationId: Id<"applications">,
  jobCategoryId: Id<"jobCategories">,
  action?: string // Optional additional field
}
```

---

## 🔍 Querying Admin Activity Logs

### For Specific Application:
```typescript
const logs = await ctx.db
  .query("adminActivityLogs")
  .filter((q) => q.eq(q.field("applicationId"), applicationId))
  .order("desc")
  .collect();
```

### For Specific Admin:
```typescript
const logs = await ctx.db
  .query("adminActivityLogs")
  .filter((q) => q.eq(q.field("adminId"), adminId))
  .order("desc")
  .collect();
```

### For Job Category:
```typescript
const logs = await ctx.db
  .query("adminActivityLogs")
  .filter((q) => q.eq(q.field("jobCategoryId"), jobCategoryId))
  .order("desc")
  .collect();
```

---

## 🎯 Key Differences from Old Flow

### OLD (Immediate Notification):
1. Admin clicks "Reject" → Immediate notification sent
2. Multiple rejections → Multiple immediate notifications (spam)

### NEW (Queued/Batched):
1. Admin clicks "Reject" → No notification (just marked)
2. Admin can reject multiple documents
3. Admin clicks "Request Document Resubmission" → ALL notifications sent at once
4. **Exception:** 3rd attempt still sends immediate notification + permanent rejection

### Benefits:
- ✅ No spam notifications
- ✅ Better admin workflow
- ✅ Clearer applicant communication
- ✅ Complete audit trail
- ✅ All actions properly logged

---

## 📊 Summary Table

| Action | Tables Affected | Admin Log Type | Notifications Sent |
|--------|----------------|----------------|-------------------|
| Reject Document Card | documentUploads, documentRejectionHistory, applications, adminActivityLogs | `document_rejection` | To other admins only |
| Request Resubmission | documentRejectionHistory, notifications, adminActivityLogs, applications | `rejection_notification_sent` | To applicant (batched) |
| Reject Application (Final) | applications, adminActivityLogs, notifications | `application_final_rejection` | To applicant + admins |
| Approve Documents | applications, adminActivityLogs | `application_finalization` | None |
| 3rd Attempt Rejection | ALL + permanent rejection | `document_rejection` | Immediate to applicant |

---

## 🔒 Security & Permissions

All mutations require:
- ✅ Admin or Inspector role
- ✅ Valid authentication
- ✅ Application must exist
- ✅ Documents must exist

---

Last Updated: 2025-11-04
Author: System Documentation
