# Health Card Application System - Domain Diagram (Capstone Documentation)

> **Note:** This system uses **Convex** as the backend, which is a document-based database. Instead of Primary Keys (PK) and Foreign Keys (FK), Convex uses:
> - **Document ID**: Auto-generated unique identifier `_id` for each document
> - **References**: `v.id("tableName")` to link to other tables
> - **Indexes**: For efficient querying

---

## 📊 CURRENT SCHEMA (Existing System)

### 1. **users** (User Management)
| Field | Type | Description | Index |
|-------|------|-------------|-------|
| `_id` | Document ID | Auto-generated unique ID | - |
| `username` | string | Username | - |
| `fullname` | string | Full name | - |
| `email` | string | Email address | `by_email` |
| `image` | string | Profile image URL | - |
| `gender` | string (optional) | Gender | - |
| `birthDate` | string (optional) | Date of birth | - |
| `phoneNumber` | string (optional) | Contact number | - |
| `clerkId` | string | Clerk authentication ID | `by_clerk_id` |
| `managedCategories` | array\<id("jobCategories")> (optional) | Job categories managed by inspector | - |
| `role` | enum (optional) | "applicant" \| "inspector" \| "admin" \| "system_admin" | `by_role` |
| `updatedAt` | float64 (optional) | Last update timestamp | - |
| `deletedAt` | float64 (optional) | Soft delete timestamp | - |

**References:**
- → `jobCategories` (via `managedCategories`)

---

### 2. **applications** (Application Records)
| Field | Type | Description | Index |
|-------|------|-------------|-------|
| `_id` | Document ID | Auto-generated unique ID | - |
| `adminRemarks` | string (optional) | Admin notes | - |
| `applicationStatus` | string | "Submitted" \| "For Document Verification" \| "For Payment Validation" \| "For Orientation" \| "Approved" \| "Rejected" \| "Documents Need Revision" \| "Referred for Medical Management" | - |
| `applicationType` | enum | "New" \| "Renew" | - |
| `approvedAt` | float64 (optional) | Approval timestamp | - |
| `civilStatus` | string | Civil status | - |
| `firstName` | string (optional) | First name | - |
| `middleName` | string (optional) | Middle name | - |
| `lastName` | string (optional) | Last name | - |
| `suffix` | string (optional) | Name suffix | - |
| `age` | float64 (optional) | Age | - |
| `nationality` | string (optional) | Nationality | - |
| `gender` | enum (optional) | "Male" \| "Female" \| "Other" | - |
| `jobCategoryId` | id("jobCategories") | Reference to job category | - |
| `organization` | string | Organization name | - |
| `paymentDeadline` | float64 (optional) | Payment deadline timestamp | - |
| `position` | string | Job position | - |
| `securityGuard` | boolean (optional) | Is security guard (enables extra docs) | - |
| `updatedAt` | float64 (optional) | Last update timestamp | - |
| `userId` | id("users") | Reference to user | `by_user` |
| `lastUpdatedBy` | id("users") (optional) | Admin who last updated | - |
| `orientationCompleted` | boolean (optional) | Orientation completed | - |
| `healthCardId` | id("healthCards") (optional) | Reference to issued health card | - |
| `healthCardRegistrationNumber` | string (optional) | Health card registration number | - |
| `healthCardIssuedAt` | float64 (optional) | Health card issued timestamp | - |
| `deletedAt` | float64 (optional) | Soft delete timestamp | - |
| **🆕 `previousHealthCardId`** | **id("healthCards") (optional)** | **Reference to previous health card (for renewals)** | **`by_previous_card`** |
| **🆕 `isRenewal`** | **boolean (optional)** | **Indicates if this is a renewal application** | **-** |
| **🆕 `renewalCount`** | **float64 (optional)** | **Number of times this user has renewed** | **-** |

**References:**
- → `users` (via `userId`, `lastUpdatedBy`)
- → `jobCategories` (via `jobCategoryId`)
- → `healthCards` (via `healthCardId`, `previousHealthCardId`)

**Referenced By:**
- ← `documentUploads`
- ← `healthCards`
- ← `orientationBookings`
- ← `payments`
- ← `documentReferralHistory`
- ← `documentRejectionHistory`
- ← `applicationRejectionHistory`

---

### 3. **healthCards** (Issued Health Cards)
| Field | Type | Description | Index |
|-------|------|-------------|-------|
| `_id` | Document ID | Auto-generated unique ID | - |
| `applicationId` | id("applications") | Reference to application | `by_application` |
| `registrationNumber` | string | Unique registration number | `by_registration` |
| `htmlContent` | string | Full HTML of the health card | - |
| `issuedDate` | float64 | Issue date timestamp | - |
| `expiryDate` | float64 | Expiry date timestamp | - |
| `status` | enum | "active" \| "revoked" \| "expired" | `by_status` |
| `createdAt` | float64 | Creation timestamp | - |
| `revokedAt` | float64 (optional) | Revocation timestamp | - |
| `revokedReason` | string (optional) | Reason for revocation | - |

**References:**
- → `applications` (via `applicationId`)

**Referenced By:**
- ← `applications` (via `healthCardId`, `previousHealthCardId`)
- ← `verificationLogs`

---

### 4. **jobCategories** (Job Categories)
| Field | Type | Description | Index |
|-------|------|-------------|-------|
| `_id` | Document ID | Auto-generated unique ID | - |
| `colorCode` | string | Color code for UI | - |
| `name` | string | Category name | - |
| `requireOrientation` | boolean \| string (optional) | Whether orientation is required | - |
| `deletedAt` | float64 (optional) | Soft delete timestamp | - |

**Referenced By:**
- ← `applications` (via `jobCategoryId`)
- ← `jobCategoryDocuments`
- ← `users` (via `managedCategories`)
- ← `notifications`
- ← `adminActivityLogs`
- ← `applicationRejectionHistory`

---

### 5. **documentTypes** (Document Type Definitions)
| Field | Type | Description | Index |
|-------|------|-------------|-------|
| `_id` | Document ID | Auto-generated unique ID | - |
| `description` | string | Document description | - |
| `fieldIdentifier` | string | Unique field identifier | `by_field_identifier` |
| `icon` | string | Icon for UI | - |
| `isRequired` | boolean | Whether document is required | - |
| `name` | string | Document type name | - |

**Referenced By:**
- ← `documentUploads` (via `documentTypeId`)
- ← `jobCategoryDocuments`
- ← `documentReferralHistory`
- ← `documentRejectionHistory`

---

### 6. **documentUploads** (Uploaded Documents)
| Field | Type | Description | Index |
|-------|------|-------------|-------|
| `_id` | Document ID | Auto-generated unique ID | - |
| `adminRemarks` | string (optional) | Admin comments | - |
| `applicationId` | id("applications") | Reference to application | `by_application` |
| `documentTypeId` | id("documentTypes") | Reference to document type | `by_application_document` |
| `originalFileName` | string | Original file name | - |
| `reviewStatus` | string | "Pending" \| "Approved" \| "Rejected" \| "Referred" \| "NeedsRevision" | `by_review_status` |
| `reviewedAt` | float64 (optional) | Review timestamp | - |
| `reviewedBy` | id("users") (optional) | Admin who reviewed | - |
| `storageFileId` | id("_storage") | Reference to Convex storage | - |
| `uploadedAt` | float64 | Upload timestamp | - |
| `fileType` | string | File MIME type | - |
| `extractedText` | string (optional) | OCR extracted text | - |
| `classification` | string (optional) | Document classification | - |

**References:**
- → `applications` (via `applicationId`)
- → `documentTypes` (via `documentTypeId`)
- → `users` (via `reviewedBy`)
- → `_storage` (via `storageFileId`)

**Referenced By:**
- ← `documentReferralHistory`
- ← `documentRejectionHistory`
- ← `adminActivityLogs`

---

### 7. **jobCategoryDocuments** (Link Table: Job Categories ↔ Document Types)
| Field | Type | Description | Index |
|-------|------|-------------|-------|
| `_id` | Document ID | Auto-generated unique ID | - |
| `documentTypeId` | id("documentTypes") | Reference to document type | `by_document_type` |
| `isRequired` | boolean | Whether document is required for this category | - |
| `jobCategoryId` | id("jobCategories") | Reference to job category | `by_job_category` |

**References:**
- → `documentTypes` (via `documentTypeId`)
- → `jobCategories` (via `jobCategoryId`)

---

### 8. **orientationSchedules** (Available Orientation Slots)
| Field | Type | Description | Index |
|-------|------|-------------|-------|
| `_id` | Document ID | Auto-generated unique ID | - |
| `date` | float64 | Date timestamp (UTC midnight) | `by_date`, `by_date_start` |
| `startMinutes` | float64 (optional) | Minutes since midnight (0-1439) | - |
| `endMinutes` | float64 (optional) | Minutes since midnight (0-1439) | - |
| `time` | string | Display string (e.g., "9:00 AM - 11:00 AM") | - |
| `durationMinutes` | float64 (optional) | Duration in minutes | - |
| `venue` | object | { name, address, capacity } | - |
| `availableSlots` | float64 | Available slots | - |
| `totalSlots` | float64 | Total capacity | - |
| `isAvailable` | boolean | Is available for booking | `by_availability` |
| `isFinalized` | boolean (optional) | Admin has finalized attendance | - |
| `finalizedAt` | float64 (optional) | Finalization timestamp | - |
| `finalizedBy` | id("users") (optional) | Admin who finalized | - |
| `instructor` | object (optional) | { name, designation } | - |
| `notes` | string (optional) | Additional notes | - |
| `createdAt` | float64 | Creation timestamp | - |
| `updatedAt` | float64 (optional) | Last update timestamp | - |

**References:**
- → `users` (via `finalizedBy`)

**Referenced By:**
- ← `orientationBookings`

---

### 9. **orientationBookings** (User Orientation Bookings)
| Field | Type | Description | Index |
|-------|------|-------------|-------|
| `_id` | Document ID | Auto-generated unique ID | - |
| `userId` | string | Clerk user ID | `by_user` |
| `applicationId` | id("applications") | Reference to application | `by_application` |
| `scheduleId` | id("orientationSchedules") | Reference to schedule | `by_schedule` |
| `scheduledDate` | float64 | Scheduled date (denormalized) | `by_date_time` |
| `scheduledTime` | string | Scheduled time (denormalized) | - |
| `venue` | object | { name, address } (denormalized) | - |
| `instructor` | object (optional) | { name, designation } (denormalized) | - |
| `status` | enum | "scheduled" \| "checked-in" \| "completed" \| "cancelled" \| "missed" \| "excused" \| "no-show" | `by_status` |
| `checkInTime` | float64 (optional) | Check-in timestamp | - |
| `checkOutTime` | float64 (optional) | Check-out timestamp | - |
| `checkedInBy` | id("users") (optional) | Inspector ID who checked in | `by_checked_in_by` |
| `checkedOutBy` | id("users") (optional) | Inspector ID who checked out | `by_checked_out_by` |
| `qrCodeUrl` | string | QR code URL | - |
| `inspectorNotes` | string (optional) | Inspector notes | - |
| `cancellationReason` | string (optional) | Cancellation reason | - |
| `certificateId` | string (optional) | Certificate ID | - |
| `createdAt` | float64 | Booking timestamp | - |
| `updatedAt` | float64 (optional) | Last update timestamp | - |
| `completedAt` | float64 (optional) | Completion timestamp | - |

**References:**
- → `applications` (via `applicationId`)
- → `orientationSchedules` (via `scheduleId`)
- → `users` (via `checkedInBy`, `checkedOutBy`)

---

### 10. **payments** (Payment Records)
| Field | Type | Description | Index |
|-------|------|-------------|-------|
| `_id` | Document ID | Auto-generated unique ID | - |
| `amount` | float64 | Total amount | - |
| `applicationId` | id("applications") | Reference to application | `by_application` |
| `checkoutUrl` | string (optional) | Maya checkout URL | - |
| `failureReason` | string (optional) | Failure reason | - |
| `mayaCheckoutId` | string (optional) | Maya checkout ID | - |
| `mayaPaymentId` | string (optional) | Maya payment ID | `by_maya_payment` |
| `netAmount` | float64 | Net amount after fees | - |
| `paymentMethod` | enum | "Maya" \| "BaranggayHall" \| "CityHall" | - |
| `paymentLocation` | string (optional) | Location for manual payments | - |
| `paymentProvider` | enum (optional) | "maya_api" \| "manual" \| "cash" | - |
| `paymentStatus` | enum | "Pending" \| "Processing" \| "Complete" \| "Failed" \| "Refunded" \| "Cancelled" \| "Expired" | - |
| `receiptStorageId` | id("_storage") (optional) | Receipt storage reference | - |
| `referenceNumber` | string | Payment reference number | - |
| `serviceFee` | float64 | Service fee | - |
| `settlementDate` | float64 (optional) | Settlement date | - |
| `transactionFee` | float64 (optional) | Transaction fee | - |
| `updatedAt` | float64 (optional) | Last update timestamp | - |
| `webhookPayload` | any (optional) | Webhook payload | - |

**References:**
- → `applications` (via `applicationId`)
- → `_storage` (via `receiptStorageId`)

**Referenced By:**
- ← `paymentLogs`
- ← `paymentRejectionHistory`

---

### 11. **paymentLogs** (Payment Activity Logs)
| Field | Type | Description | Index |
|-------|------|-------------|-------|
| `_id` | Document ID | Auto-generated unique ID | - |
| `amount` | float64 (optional) | Amount | - |
| `currency` | string (optional) | Currency | - |
| `errorMessage` | string (optional) | Error message | - |
| `eventType` | enum | "checkout_created" \| "payment_success" \| "payment_failed" \| "payment_expired" \| "payment_cancelled" \| "webhook_received" \| "refund_initiated" \| "refund_completed" \| "status_check" | `by_event_type` |
| `ipAddress` | string (optional) | IP address | - |
| `mayaCheckoutId` | string (optional) | Maya checkout ID | - |
| `mayaPaymentId` | string (optional) | Maya payment ID | `by_maya_payment` |
| `metadata` | any (optional) | Additional metadata | - |
| `paymentId` | id("payments") (optional) | Reference to payment | `by_payment` |
| `timestamp` | float64 | Log timestamp | `by_timestamp` |
| `userAgent` | string (optional) | User agent | - |

**References:**
- → `payments` (via `paymentId`)

---

### 12. **notifications** (User Notifications)
| Field | Type | Description | Index |
|-------|------|-------------|-------|
| `_id` | Document ID | Auto-generated unique ID | - |
| `actionUrl` | string (optional) | Action URL | - |
| `applicationId` | id("applications") (optional) | Reference to application | - |
| `isRead` | boolean | Is read | `by_user_isRead` |
| `message` | string | Notification message | - |
| `notificationType` | string | Notification type | - |
| `title` | string (optional) | Notification title | - |
| `userId` | id("users") | Reference to user | `by_user`, `by_user_jobCategory` |
| `jobCategoryId` | id("jobCategories") (optional) | Reference to job category | - |

**References:**
- → `users` (via `userId`)
- → `applications` (via `applicationId`)
- → `jobCategories` (via `jobCategoryId`)

---

### 13. **adminActivityLogs** (Admin Activity Tracking)
| Field | Type | Description | Index |
|-------|------|-------------|-------|
| `_id` | Document ID | Auto-generated unique ID | - |
| `adminId` | id("users") | Admin user ID | `by_admin_timestamp` |
| `activityType` | string (optional) | Activity type | - |
| `details` | string (optional) | Activity details | - |
| `adminUsername` | string (optional) | Admin username | - |
| `adminEmail` | string (optional) | Admin email | - |
| `action` | string (optional) | Action performed | - |
| `comment` | string (optional) | Admin comment | - |
| `timestamp` | float64 | Activity timestamp | `by_timestamp` |
| `applicationId` | id("applications") (optional) | Reference to application | `by_applicationId` |
| `documentUploadId` | id("documentUploads") (optional) | Reference to document | - |
| `jobCategoryId` | id("jobCategories") (optional) | Reference to job category | `by_jobCategoryId` |

**References:**
- → `users` (via `adminId`)
- → `applications` (via `applicationId`)
- → `documentUploads` (via `documentUploadId`)
- → `jobCategories` (via `jobCategoryId`)

---

### 14. **documentReferralHistory** (Document Referrals/Issues)
| Field | Type | Description | Index |
|-------|------|-------------|-------|
| `_id` | Document ID | Auto-generated unique ID | - |
| `applicationId` | id("applications") | Reference to application | `by_application` |
| `documentTypeId` | id("documentTypes") | Reference to document type | `by_document_type` |
| `documentUploadId` | id("documentUploads") | Original upload | - |
| `referredFileId` | id("_storage") | Preserved file (audit) | - |
| `originalFileName` | string | Original file name | - |
| `fileSize` | float64 | File size | - |
| `fileType` | string | File MIME type | - |
| `issueType` | enum | "medical_referral" \| "document_issue" | `by_issue_type` |
| `medicalReferralCategory` | enum (optional) | "abnormal_xray" \| "elevated_urinalysis" \| "positive_stool" \| "positive_drug_test" \| "neuro_exam_failed" \| "hepatitis_consultation" \| "other_medical_concern" | - |
| `documentIssueCategory` | enum (optional) | "invalid_id" \| "expired_id" \| "blurry_photo" \| "wrong_format" \| "missing_info" \| "quality_issue" \| "wrong_document" \| "expired_document" \| "incomplete_document" \| "invalid_document" \| "format_issue" \| "other" | - |
| `referralReason` | string | Detailed explanation | - |
| `specificIssues` | array\<string> | Bullet points of issues | - |
| `doctorName` | string (optional) | Doctor name (medical referrals) | - |
| `clinicAddress` | string (optional) | Clinic address (medical referrals) | - |
| `referredBy` | id("users") | Admin who created referral | `by_admin` |
| `referredAt` | float64 | Referral timestamp | `by_referred_at` |
| `wasReplaced` | boolean | Was replaced by user | `by_replacement` |
| `replacementUploadId` | id("documentUploads") (optional) | Replacement upload | - |
| `replacedAt` | float64 (optional) | Replacement timestamp | - |
| `attemptNumber` | float64 | Attempt number | - |
| `status` | enum (optional) | "pending" \| "in_progress" \| "resubmitted" \| "cleared" \| "flagged_again" | `by_status` |
| `notificationSent` | boolean (optional) | Notification sent | - |
| `notificationSentAt` | float64 (optional) | Notification timestamp | - |
| `adminReadBy` | array\<id("users")> (optional) | Admin IDs who read | - |
| `migratedFromRejectionId` | id("documentRejectionHistory") (optional) | Migration link | - |
| `ipAddress` | string (optional) | IP address | - |
| `userAgent` | string (optional) | User agent | - |

**References:**
- → `applications` (via `applicationId`)
- → `documentTypes` (via `documentTypeId`)
- → `documentUploads` (via `documentUploadId`, `replacementUploadId`)
- → `users` (via `referredBy`, `adminReadBy`)
- → `_storage` (via `referredFileId`)
- → `documentRejectionHistory` (via `migratedFromRejectionId`)

---

### 15. **documentRejectionHistory** (DEPRECATED - Legacy Document Rejections)
> ⚠️ DO NOT USE FOR NEW CODE - Use `documentReferralHistory` instead

| Field | Type | Description | Index |
|-------|------|-------------|-------|
| `_id` | Document ID | Auto-generated unique ID | - |
| `applicationId` | id("applications") | Reference to application | `by_application` |
| `documentTypeId` | id("documentTypes") | Reference to document type | `by_document_type` |
| `documentUploadId` | id("documentUploads") | Original upload | - |
| `rejectedFileId` | id("_storage") | Preserved file | - |
| `originalFileName` | string | Original file name | - |
| `fileSize` | float64 | File size | - |
| `fileType` | string | File MIME type | - |
| `rejectionCategory` | enum | "quality_issue" \| "wrong_document" \| "expired_document" \| "incomplete_document" \| "invalid_document" \| "format_issue" \| "other" | - |
| `rejectionReason` | string | Detailed explanation | - |
| `specificIssues` | array\<string> | Bullet points | - |
| `doctorName` | string (optional) | Doctor name | - |
| `rejectedBy` | id("users") | Admin who rejected | `by_admin` |
| `rejectedAt` | float64 | Rejection timestamp | `by_rejected_at` |
| `wasReplaced` | boolean | Was replaced | `by_replacement` |
| `replacementUploadId` | id("documentUploads") (optional) | Replacement upload | - |
| `replacedAt` | float64 (optional) | Replacement timestamp | - |
| `attemptNumber` | float64 | Attempt number | - |
| `status` | enum (optional) | "pending" \| "resubmitted" \| "rejected" \| "approved" | - |
| `notificationSent` | boolean (optional) | Notification sent | - |
| `notificationSentAt` | float64 (optional) | Notification timestamp | - |
| `adminReadBy` | array\<id("users")> (optional) | Admin IDs who read | - |
| `ipAddress` | string (optional) | IP address | - |
| `userAgent` | string (optional) | User agent | - |

---

### 16. **applicationRejectionHistory** (Permanent Application Rejections)
| Field | Type | Description | Index |
|-------|------|-------------|-------|
| `_id` | Document ID | Auto-generated unique ID | - |
| `applicationId` | id("applications") | Reference to application | `by_application` |
| `applicantName` | string | Applicant name (denormalized) | - |
| `applicantEmail` | string | Applicant email (denormalized) | - |
| `jobCategoryId` | id("jobCategories") | Reference to job category | `by_job_category` |
| `jobCategoryName` | string | Job category name (denormalized) | - |
| `applicationType` | string | "New" \| "Renew" | - |
| `rejectionCategory` | enum | "fraud_suspected" \| "incomplete_information" \| "does_not_meet_requirements" \| "duplicate_application" \| "max_attempts_reached" \| "other" | - |
| `rejectionReason` | string | Rejection reason | - |
| `rejectionType` | enum | "manual" \| "automatic" | `by_rejection_type` |
| `triggerSource` | enum (optional) | "document_verification" \| "payment_validation" \| "max_document_attempts" \| "max_payment_attempts" | - |
| `totalDocumentsRejected` | float64 (optional) | Total documents rejected | - |
| `totalPaymentsRejected` | float64 (optional) | Total payments rejected | - |
| `rejectedBy` | id("users") | Admin who rejected | `by_admin` |
| `rejectedByName` | string | Admin name | - |
| `rejectedAt` | float64 | Rejection timestamp | `by_rejected_at` |
| `notificationSent` | boolean | Notification sent | - |
| `notificationSentAt` | float64 (optional) | Notification timestamp | - |
| `ipAddress` | string (optional) | IP address | - |
| `userAgent` | string (optional) | User agent | - |

**References:**
- → `applications` (via `applicationId`)
- → `jobCategories` (via `jobCategoryId`)
- → `users` (via `rejectedBy`)

---

### 17. **paymentRejectionHistory** (Payment Rejection Records)
| Field | Type | Description | Index |
|-------|------|-------------|-------|
| `_id` | Document ID | Auto-generated unique ID | - |
| `applicationId` | id("applications") | Reference to application | `by_application` |
| `paymentId` | id("payments") | Original payment | `by_payment` |
| `rejectedReceiptId` | id("_storage") (optional) | Receipt storage ID | - |
| `referenceNumber` | string | Payment reference | - |
| `paymentMethod` | string | Payment method | - |
| `paymentLocation` | string (optional) | Payment location | - |
| `amount` | float64 | Payment amount | - |
| `rejectionCategory` | enum | "invalid_receipt" \| "wrong_amount" \| "unclear_receipt" \| "expired_receipt" \| "duplicate_payment" \| "wrong_account" \| "incomplete_info" \| "other" | - |
| `rejectionReason` | string | Detailed explanation | - |
| `specificIssues` | array\<string> | Bullet points | - |
| `rejectedBy` | id("users") | Admin who rejected | `by_admin` |
| `rejectedAt` | float64 | Rejection timestamp | `by_rejected_at` |
| `wasReplaced` | boolean | Was replaced | `by_replacement` |
| `replacementPaymentId` | id("payments") (optional) | Replacement payment | - |
| `replacedAt` | float64 (optional) | Replacement timestamp | - |
| `attemptNumber` | float64 | Attempt number | - |
| `status` | enum (optional) | "pending" \| "resubmitted" \| "rejected" \| "approved" | - |
| `notificationSent` | boolean (optional) | Notification sent | - |
| `notificationSentAt` | float64 (optional) | Notification timestamp | - |
| `adminReadBy` | array\<id("users")> (optional) | Admin IDs who read | - |
| `ipAddress` | string (optional) | IP address | - |
| `userAgent` | string (optional) | User agent | - |

**References:**
- → `applications` (via `applicationId`)
- → `payments` (via `paymentId`, `replacementPaymentId`)
- → `users` (via `rejectedBy`, `adminReadBy`)
- → `_storage` (via `rejectedReceiptId`)

---

### 18. **verificationLogs** (Health Card Verification Logs)
| Field | Type | Description | Index |
|-------|------|-------------|-------|
| `_id` | Document ID | Auto-generated unique ID | - |
| `healthCardId` | id("healthCards") | Reference to health card | `by_health_card` |
| `ipAddress` | string (optional) | IP address | - |
| `scannedAt` | float64 | Scan timestamp | - |
| `userAgent` | string (optional) | User agent | - |
| `verificationStatus` | enum | "Success" \| "Failed" | - |

**References:**
- → `healthCards` (via `healthCardId`)

---

### 19. **documentAccessLogs** (Document Access Audit)
| Field | Type | Description | Index |
|-------|------|-------------|-------|
| `_id` | Document ID | Auto-generated unique ID | - |
| `documentId` | string | Document ID or string | `by_document` |
| `applicationId` | id("applications") (optional) | Reference to application | `by_application` |
| `userId` | id("users") (optional) | User ID (null if auth failed) | `by_user` |
| `userEmail` | string (optional) | User email | - |
| `userRole` | string (optional) | User role at access time | - |
| `accessStatus` | enum | "Success" \| "Unauthorized" \| "Expired" \| "InvalidSignature" \| "DocumentNotFound" \| "NoSecret" \| "InvalidRequest" | `by_status` |
| `accessMethod` | enum | "signed_url" \| "direct" \| "unknown" | - |
| `errorMessage` | string (optional) | Error details | - |
| `ipAddress` | string (optional) | IP address | - |
| `userAgent` | string (optional) | User agent | - |
| `referrer` | string (optional) | Referrer URL | - |
| `timestamp` | float64 | Access timestamp | `by_timestamp` |
| `responseTimeMs` | float64 (optional) | Response time | - |
| `documentType` | string (optional) | Document type | - |
| `fileName` | string (optional) | File name | - |

**References:**
- → `applications` (via `applicationId`)
- → `users` (via `userId`)

---

### 20. **orientationMigrationLog** (Orientation Schema Migration Tracking)
| Field | Type | Description | Index |
|-------|------|-------------|-------|
| `_id` | Document ID | Auto-generated unique ID | - |
| `migratedAt` | float64 | Migration timestamp | - |
| `recordType` | enum | "orientation" \| "orientationSession" | `by_old_record` |
| `oldRecordId` | string | Old record ID | - |
| `newRecordId` | id("orientationBookings") | New record reference | - |
| `status` | enum | "success" \| "failed" \| "skipped" | `by_status` |
| `errorMessage` | string (optional) | Error message | - |
| `migrationBatch` | string | Migration batch UUID | `by_batch` |

**References:**
- → `orientationBookings` (via `newRecordId`)

---

### 21. **ocr_results** (OCR Processing Results)
| Field | Type | Description | Index |
|-------|------|-------------|-------|
| `_id` | Document ID | Auto-generated unique ID | - |
| `fileName` | string | File name | - |
| `fileType` | string | File MIME type | - |
| `extractedText` | string | Extracted text | - |
| `createdAt` | string | Creation timestamp | `by_createdAt` |

---

## 🆕 NEW SCHEMA ADDITIONS (For Renewal Feature)

### **applications** Table - NEW FIELDS

Three new fields are added to support the renewal functionality:

| Field | Type | Description | Index | Purpose |
|-------|------|-------------|-------|---------|
| **`previousHealthCardId`** | **id("healthCards") (optional)** | Reference to the previous health card being renewed | **`by_previous_card`** | Links the renewal application to the original health card, enabling tracking of renewal history and pre-population of data |
| **`isRenewal`** | **boolean (optional)** | Flag indicating if this is a renewal application | **-** | Quick identifier to distinguish renewal applications from new applications without checking applicationType |
| **`renewalCount`** | **float64 (optional)** | Tracks how many times the user has renewed (1st renewal, 2nd renewal, etc.) | **-** | Useful for analytics, user history tracking, and potential business rules (e.g., discounts for long-term users) |

---

## 📊 ENTITY RELATIONSHIPS DIAGRAM

### Core Workflow (New Application)
```
User → Application → Document Uploads → Document Review → Payment → Orientation → Health Card
```

### Renewal Workflow (NEW)
```
User → Health Card (existing) → Renewal Application → 
  ↓
  └─→ Links to previousHealthCardId
  └─→ Pre-fills data from previous application
  └─→ New document uploads required
  └─→ New payment required
  └─→ Orientation (if category changed)
  └─→ New Health Card issued (old card expires)
```

---

## 🔗 KEY RELATIONSHIPS

### 1. User → Applications
- **Type:** One-to-Many
- **Reference:** `applications.userId` → `users._id`
- **Index:** `by_user`
- **Note:** A user can have multiple applications (new + renewals)

### 2. Application → Health Card
- **Type:** One-to-One
- **Reference:** `applications.healthCardId` → `healthCards._id`
- **Index:** `by_application` (on healthCards)
- **Note:** Each approved application results in one health card

### 3. **🆕 Renewal Application → Previous Health Card**
- **Type:** Many-to-One
- **Reference:** `applications.previousHealthCardId` → `healthCards._id`
- **Index:** `by_previous_card`
- **Note:** A renewal application links to the previous health card being renewed

### 4. Application → Documents
- **Type:** One-to-Many
- **Reference:** `documentUploads.applicationId` → `applications._id`
- **Index:** `by_application`
- **Note:** Each application has multiple document uploads

### 5. Application → Payments
- **Type:** One-to-Many
- **Reference:** `payments.applicationId` → `applications._id`
- **Index:** `by_application`
- **Note:** An application may have multiple payment attempts

### 6. Application → Orientation Booking
- **Type:** One-to-One
- **Reference:** `orientationBookings.applicationId` → `applications._id`
- **Index:** `by_application`
- **Note:** Food handlers require orientation booking

### 7. Job Category → Required Documents
- **Type:** Many-to-Many (via `jobCategoryDocuments`)
- **References:** 
  - `jobCategoryDocuments.jobCategoryId` → `jobCategories._id`
  - `jobCategoryDocuments.documentTypeId` → `documentTypes._id`
- **Indexes:** `by_job_category`, `by_document_type`

---

## 🎯 RENEWAL FEATURE DATA FLOW

### Step 1: Check Eligibility
```
User selects "Renew" 
  ↓
Query: checkRenewalEligibilityQuery
  ↓
Checks:
  - User has approved application with health card
  - No pending applications in progress
  - No existing renewal application
  ↓
Returns: previousCard + previousApplication data
```

### Step 2: Card Selection
```
User views all their health cards
  ↓
Query: getUserCardsQuery
  ↓
Displays:
  - Registration number
  - Issue/expiry dates
  - Days until expiry
  - Urgency badges (EXPIRED, URGENT, RENEW SOON)
  ↓
User selects card to renew
```

### Step 3: Create Renewal Application
```
User selects card
  ↓
Query: getPreviousApplicationDataQuery (with healthCardId)
  ↓
Pre-fills form with:
  - Personal details (firstName, lastName, etc.)
  - Job category
  - Position, organization
  - Civil status
  ↓
Mutation: createRenewalApplicationMutation
  ↓
Creates new application with:
  - applicationType: "Renew"
  - previousHealthCardId: <selected card>
  - isRenewal: true
  - renewalCount: <calculated>
  - Pre-filled personal data
```

### Step 4: Complete Renewal Process
```
User updates information (if needed)
  ↓
User uploads new documents (required)
  ↓
Admin reviews documents
  ↓
User completes payment
  ↓
Admin validates payment
  ↓
User attends orientation (if required)
  ↓
Admin approves application
  ↓
New health card issued
  ↓
Old health card status → "expired"
```

---

## 📝 CONVEX SPECIFICS (Instead of PK/FK)

### Document IDs
- Every document has an auto-generated `_id` field
- Format: `Id<"tableName">` (e.g., `Id<"applications">`)
- Used for references instead of traditional Foreign Keys

### References
- Defined using `v.id("tableName")`
- Example: `userId: v.id("users")` means this field references a user document
- Convex validates these references automatically

### Indexes
- Used for efficient querying
- Format: `.index("indexName", ["field1", "field2"])`
- Examples:
  - `.index("by_user", ["userId"])` - Query all applications for a user
  - `.index("by_previous_card", ["previousHealthCardId"])` - Query all renewals for a card

### No Cascading Deletes
- Convex doesn't have cascading deletes like SQL
- Use `deletedAt` timestamp for soft deletes
- Preserve related data for audit trail

---

## 🎨 DIAGRAM KEY

| Symbol | Meaning |
|--------|---------|
| `_id` | Document ID (auto-generated unique identifier) |
| `id("table")` | Reference to another table's document |
| `→` | References (points to) |
| `←` | Referenced by |
| **Bold** | New field for renewal feature |
| 🆕 | New addition |

---

## 📅 SCHEMA VERSION

- **Version:** 2.0 (Renewal Feature)
- **Last Updated:** 2025-11-15
- **Previous Version:** 1.0 (Base System)
- **Changes:** Added `previousHealthCardId`, `isRenewal`, `renewalCount` to applications table

---

## 📚 REFERENCES

- **Convex Schema File:** `C:\Em\backend\convex\schema.ts`
- **Renewal Implementation Guide:** `C:\Em\apps\mobile\docs\RENEWAL_MASTER_IMPLEMENTATION_GUIDE.md`
- **Convex Documentation:** https://docs.convex.dev/database/schemas

---

## ✅ VALIDATION RULES

### Renewal Application Rules
1. **previousHealthCardId** must exist and belong to the user
2. **isRenewal** must be `true` when **applicationType** is "Renew"
3. **renewalCount** is auto-calculated based on previous renewals
4. User cannot have multiple pending renewals simultaneously
5. User must have at least one approved application before renewing
6. New documents must be uploaded (not copied from previous application)
7. New payment is required for each renewal
8. Old health card expires only when new card is issued

---

**End of Domain Diagram**
