import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    username: v.string(),
    fullname: v.string(),
    email: v.string(),
    image: v.string(),
    gender: v.optional(v.string()),
    birthDate: v.optional(v.string()),
    phoneNumber: v.optional(v.string()),
    clerkId: v.string(),
    managedCategories: v.optional(
      v.array(v.id("jobCategories"))
    ),
    role: v.optional(
      v.union(
        v.literal("applicant"),
        v.literal("inspector"),
        v.literal("admin")
      )
    ),
    updatedAt: v.optional(v.float64()),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_role", ["role"])
    .index("by_email", ["email"]),

  applications: defineTable({
    adminRemarks: v.optional(v.string()),
    // applicationStatus values:
    // - "Submitted" - Application submitted, awaiting review
    // - "For Document Verification" - Documents being verified by admin
    // - "For Payment Validation" - Payment being validated
    // - "For Orientation" - Awaiting orientation attendance
    // - "Approved" - Application fully approved, health card issued
    // - "Rejected" - PERMANENT rejection only (fraud, max attempts, etc.)
    // - "Documents Need Revision" - NEW - Documents need resubmission (non-medical issues)
    // - "Referred for Medical Management" - NEW - Medical findings, needs doctor consultation
    applicationStatus: v.string(), // Keep as string for backward compatibility with existing data
    applicationType: v.union(
      v.literal("New"),
      v.literal("Renew")
    ),
    approvedAt: v.optional(v.float64()),
    civilStatus: v.string(),
    firstName: v.optional(v.string()),
    middleName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    age: v.optional(v.float64()),
    nationality: v.optional(v.string()),
    gender: v.optional(v.union(
      v.literal("Male"),
      v.literal("Female"),
      v.literal("Other")
    )),
    jobCategoryId: v.id("jobCategories"),
    organization: v.string(),
    paymentDeadline: v.optional(v.float64()),
    position: v.string(),
    updatedAt: v.optional(v.float64()),
    userId: v.id("users"),
    lastUpdatedBy: v.optional(v.id("users")), // New field to track which admin last updated the application
    orientationCompleted: v.optional(v.boolean()), // Track if user completed check-in/check-out for orientation
    // Health Card fields
    healthCardId: v.optional(v.id("healthCards")),
    healthCardRegistrationNumber: v.optional(v.string()),
    healthCardIssuedAt: v.optional(v.float64()),
  }).index("by_user", ["userId"]),
  
  documentTypes: defineTable({
    description: v.string(),
    fieldIdentifier: v.string(),
    icon: v.string(),
    isRequired: v.boolean(),
    name: v.string(),
  }).index("by_field_identifier", ["fieldIdentifier"]),

  documentUploads: defineTable({
    adminRemarks: v.optional(v.string()),
    applicationId: v.id("applications"),
    documentTypeId: v.id("documentTypes"),
    originalFileName: v.string(),
    // reviewStatus values:
    // - "Pending" - Awaiting admin review
    // - "Approved" - Document approved
    // - "Rejected" - DEPRECATED - use "Referred" for medical or "NeedsRevision" for non-medical
    // - "Referred" - NEW - Medical document with findings, needs doctor consultation
    // - "NeedsRevision" - NEW - Non-medical document issue, needs resubmission
    reviewStatus: v.string(),
    reviewedAt: v.optional(v.float64()),
    reviewedBy: v.optional(v.id("users")),
    storageFileId: v.id("_storage"),
    uploadedAt: v.float64(),
    fileType: v.string(), // Added for classification
    extractedText: v.optional(v.string()), // New field for extracted OCR text
    classification: v.optional(v.string()), // New field for document classification
  })
    .index("by_application", ["applicationId"])
    .index("by_application_document", [
      "applicationId",
      "documentTypeId",
    ])
    .index("by_review_status", ["reviewStatus", "reviewedAt"]),
  healthCards: defineTable({
    applicationId: v.id("applications"),
    registrationNumber: v.string(),
    htmlContent: v.string(), // Full HTML of the health card
    issuedDate: v.float64(),
    expiryDate: v.float64(),
    status: v.union(v.literal("active"), v.literal("revoked"), v.literal("expired")),
    createdAt: v.float64(),
    revokedAt: v.optional(v.float64()),
    revokedReason: v.optional(v.string()),
  })
    .index("by_application", ["applicationId"])
    .index("by_registration", ["registrationNumber"])
    .index("by_status", ["status"]),
  jobCategories: defineTable({
    colorCode: v.string(),
    name: v.string(),
    requireOrientation: v.optional(
      v.union(v.boolean(), v.string())
    ),
  }),
  jobCategoryDocuments: defineTable({
    documentTypeId: v.id("documentTypes"),
    isRequired: v.boolean(),
    jobCategoryId: v.id("jobCategories"),
  })
    .index("by_document_type", ["documentTypeId"])
    .index("by_job_category", ["jobCategoryId"]),
  notifications: defineTable({
    actionUrl: v.optional(v.string()),
    applicationId: v.optional(v.id("applications")),
    isRead: v.boolean(),
    message: v.string(),
    notificationType: v.string(),
    title: v.optional(v.string()),
    userId: v.id("users"),
    jobCategoryId: v.optional(v.id("jobCategories")),
  }).index("by_user", ["userId"])
    .index("by_user_jobCategory", ["userId", "jobCategoryId"])
    .index("by_user_isRead", ["userId", "isRead"]),

  // Available orientation schedules (time slots for booking)
  orientationSchedules: defineTable({
    date: v.float64(), // Timestamp for the date (UTC midnight)
    startMinutes: v.optional(v.float64()), // Minutes since midnight (0-1439) e.g., 540 = 9:00 AM
    endMinutes: v.optional(v.float64()), // Minutes since midnight (0-1439) e.g., 660 = 11:00 AM
    time: v.string(), // Display string e.g., "9:00 AM - 11:00 AM" (auto-generated from start/end)
    durationMinutes: v.optional(v.float64()), // Duration in minutes (auto-calculated: end - start)
    venue: v.object({
      name: v.string(),
      address: v.string(),
      capacity: v.float64(),
    }),
    availableSlots: v.float64(),
    totalSlots: v.float64(),
    isAvailable: v.boolean(),
    instructor: v.optional(v.object({
      name: v.string(),
      designation: v.string(),
    })),
    notes: v.optional(v.string()),
    createdAt: v.float64(),
    updatedAt: v.optional(v.float64()),
  })
    .index("by_date", ["date"])
    .index("by_availability", ["isAvailable", "date"])
    .index("by_date_start", ["date", "startMinutes"]), // For sorting schedules by time

  // Unified orientation bookings table (merges old orientations + orientationSessions tables)
  orientationBookings: defineTable({
    // User & Application
    userId: v.string(), // Clerk user ID
    applicationId: v.id("applications"),

    // Schedule Reference
    scheduleId: v.id("orientationSchedules"),

    // Booking Details (denormalized from schedule for historical accuracy)
    scheduledDate: v.float64(),
    scheduledTime: v.string(), // "9:00 AM - 11:00 AM"
    venue: v.object({
      name: v.string(),
      address: v.string(),
    }),
    instructor: v.optional(v.object({
      name: v.string(),
      designation: v.string(),
    })),

    // Unified Status Flow
    // scheduled → checked-in → completed
    //          ↓  cancelled
    //          ↓  missed / excused / no-show
    status: v.union(
      v.literal("scheduled"),
      v.literal("checked-in"),
      v.literal("completed"),
      v.literal("cancelled"),
      v.literal("missed"),
      v.literal("excused"),
      v.literal("no-show")
    ),

    // Attendance Tracking
    checkInTime: v.optional(v.float64()),
    checkOutTime: v.optional(v.float64()),
    checkedInBy: v.optional(v.id("users")), // Inspector ID
    checkedOutBy: v.optional(v.id("users")), // Inspector ID

    // QR Code
    qrCodeUrl: v.string(),

    // Notes & Metadata
    inspectorNotes: v.optional(v.string()),
    cancellationReason: v.optional(v.string()),
    certificateId: v.optional(v.string()),

    // Timestamps
    createdAt: v.float64(), // Booking timestamp
    updatedAt: v.optional(v.float64()),
    completedAt: v.optional(v.float64()),
  })
    .index("by_user", ["userId"])
    .index("by_application", ["applicationId"])
    .index("by_schedule", ["scheduleId"])
    .index("by_status", ["status"])
    .index("by_date_time", ["scheduledDate", "scheduledTime"])
    .index("by_checked_in_by", ["checkedInBy", "checkInTime"])
    .index("by_checked_out_by", ["checkedOutBy", "checkOutTime"]),

  // Migration tracking for orientation schema migration
  orientationMigrationLog: defineTable({
    migratedAt: v.float64(),
    recordType: v.union(
      v.literal("orientation"),
      v.literal("orientationSession")
    ),
    oldRecordId: v.string(), // String ID from old table
    newRecordId: v.id("orientationBookings"),
    status: v.union(
      v.literal("success"),
      v.literal("failed"),
      v.literal("skipped")
    ),
    errorMessage: v.optional(v.string()),
    migrationBatch: v.string(), // UUID to group migrations
  })
    .index("by_batch", ["migrationBatch"])
    .index("by_status", ["status"])
    .index("by_old_record", ["recordType", "oldRecordId"]),
  paymentLogs: defineTable({
    amount: v.optional(v.float64()),
    currency: v.optional(v.string()),
    errorMessage: v.optional(v.string()),
    eventType: v.union(
      v.literal("checkout_created"),
      v.literal("payment_success"),
      v.literal("payment_failed"),
      v.literal("payment_expired"),
      v.literal("payment_cancelled"),
      v.literal("webhook_received"),
      v.literal("refund_initiated"),
      v.literal("refund_completed"),
      v.literal("status_check")
    ),
    ipAddress: v.optional(v.string()),
    mayaCheckoutId: v.optional(v.string()),
    mayaPaymentId: v.optional(v.string()),
    metadata: v.optional(v.any()),
    paymentId: v.optional(v.id("payments")),
    timestamp: v.float64(),
    userAgent: v.optional(v.string()),
  })
    .index("by_event_type", ["eventType"])
    .index("by_maya_payment", ["mayaPaymentId"])
    .index("by_payment", ["paymentId"])
    .index("by_timestamp", ["timestamp"]),
  payments: defineTable({
    amount: v.float64(),
    applicationId: v.id("applications"),
    checkoutUrl: v.optional(v.string()),
    failureReason: v.optional(v.string()),
    mayaCheckoutId: v.optional(v.string()),
    mayaPaymentId: v.optional(v.string()),
    netAmount: v.float64(),
    paymentMethod: v.union(
      v.literal("Gcash"),
      v.literal("Maya"),
      v.literal("BaranggayHall"),
      v.literal("CityHall")
    ),
    paymentProvider: v.optional(
      v.union(
        v.literal("maya_api"),
        v.literal("manual"),
        v.literal("cash")
      )
    ),
    paymentStatus: v.union(
      v.literal("Pending"),
      v.literal("Processing"),
      v.literal("Complete"),
      v.literal("Failed"),
      v.literal("Refunded"),
      v.literal("Cancelled"),
      v.literal("Expired")
    ),
    receiptStorageId: v.optional(v.id("_storage")),
    referenceNumber: v.string(),
    serviceFee: v.float64(),
    settlementDate: v.optional(v.float64()),
    transactionFee: v.optional(v.float64()),
    updatedAt: v.optional(v.float64()),
    webhookPayload: v.optional(v.any()),
  })
    .index("by_application", ["applicationId"])
    .index("by_maya_payment", ["mayaPaymentId"]),

  verificationLogs: defineTable({
    healthCardId: v.id("healthCards"),
    ipAddress: v.optional(v.string()),
    scannedAt: v.float64(),
    userAgent: v.optional(v.string()),
    verificationStatus: v.union(
      v.literal("Success"),
      v.literal("Failed")
    ),
  }).index("by_health_card", ["healthCardId"]),

  adminActivityLogs: defineTable({
    adminId: v.id("users"),
    activityType: v.optional(v.string()), // e.g., "document_rejection", "payment_validation"
    details: v.optional(v.string()),
    adminUsername: v.optional(v.string()), // Temporarily optional for schema migration
    adminEmail: v.optional(v.string()),   // Temporarily optional for schema migration
    action: v.optional(v.string()),       // Temporarily optional for schema migration
    comment: v.optional(v.string()),
    timestamp: v.float64(),
    applicationId: v.optional(v.id("applications")),
    documentUploadId: v.optional(v.id("documentUploads")),
    jobCategoryId: v.optional(v.id("jobCategories")), // Added for HealthCard type filtering
  })
    .index("by_admin_timestamp", ["adminId", "timestamp"])
    .index("by_jobCategoryId", ["jobCategoryId", "timestamp"])
    .index("by_applicationId", ["applicationId", "timestamp"])
    .index("by_timestamp", ["timestamp"]),

  // Document Referral/Management History (NEW - Replaces "rejection" terminology)
  // This table uses proper medical terminology: "referral" for medical findings, not "rejection"
  documentReferralHistory: defineTable({
    // Core References
    applicationId: v.id("applications"),
    documentTypeId: v.id("documentTypes"),
    documentUploadId: v.id("documentUploads"), // Original upload

    // Preserved File Data
    referredFileId: v.id("_storage"), // Never delete this - preserved for audit
    originalFileName: v.string(),
    fileSize: v.float64(),
    fileType: v.string(),

    // Document Issue Type (Medical vs Non-Medical)
    issueType: v.union(
      v.literal("medical_referral"),    // Medical finding - needs doctor consultation
      v.literal("document_issue")       // Non-medical - needs document resubmission
    ),

    // Medical Referral Category (for medical documents)
    medicalReferralCategory: v.optional(v.union(
      v.literal("abnormal_xray"),           // Abnormal chest X-ray result
      v.literal("elevated_urinalysis"),     // Elevated urinalysis values
      v.literal("positive_stool"),          // Positive stool examination
      v.literal("positive_drug_test"),      // Positive drug test result
      v.literal("neuro_exam_failed"),       // Failed neuropsychiatric evaluation
      v.literal("hepatitis_consultation"),  // Hepatitis B antibody - requires consultation
      v.literal("other_medical_concern")    // Other medical concern
    )),

    // Document Issue Category (for non-medical documents)
    documentIssueCategory: v.optional(v.union(
      v.literal("invalid_id"),          // Invalid Government-issued ID
      v.literal("expired_id"),          // Expired ID
      v.literal("blurry_photo"),        // Blurry or unclear photo
      v.literal("wrong_format"),        // Wrong ID picture format/size
      v.literal("missing_info"),        // Missing required information
      v.literal("quality_issue"),       // Blurry, dark, unreadable
      v.literal("wrong_document"),      // Incorrect document type
      v.literal("expired_document"),    // Document past validity
      v.literal("incomplete_document"), // Missing pages/information
      v.literal("invalid_document"),    // Fake or tampered
      v.literal("format_issue"),        // Wrong format/size
      v.literal("other")                // Other reasons
    )),

    // Referral/Issue Information
    referralReason: v.string(), // Detailed explanation (user-friendly message)
    specificIssues: v.array(v.string()), // Bullet points of specific issues
    doctorName: v.optional(v.string()), // Doctor name for medical referrals (e.g., "Dr. Juan Dela Cruz")
    clinicAddress: v.optional(v.string()), // Clinic/venue address for medical referrals

    // Tracking
    referredBy: v.id("users"), // Admin who created this referral/issue
    referredAt: v.float64(),

    // Resubmission Tracking
    wasReplaced: v.boolean(),
    replacementUploadId: v.optional(v.id("documentUploads")),
    replacedAt: v.optional(v.float64()),
    attemptNumber: v.float64(), // 1st, 2nd, 3rd attempt

    // Status Flow Tracking
    status: v.optional(v.union(
      v.literal("pending"),           // Waiting for user action (treatment or resubmission)
      v.literal("in_progress"),       // User is addressing the issue (e.g., undergoing treatment)
      v.literal("resubmitted"),       // User has resubmitted/returned for re-check
      v.literal("cleared"),           // Issue resolved, user can proceed
      v.literal("flagged_again")      // Issue persists, flagged again
    )),

    // Notification Tracking
    notificationSent: v.optional(v.boolean()), // Whether applicant has been notified
    notificationSentAt: v.optional(v.float64()), // When notification was sent

    // Notification Read Tracking (for admins)
    adminReadBy: v.optional(v.array(v.id("users"))), // List of admin IDs who have read this

    // Migration Tracking (links to old documentRejectionHistory record)
    migratedFromRejectionId: v.optional(v.id("documentRejectionHistory")),

    // Audit Fields
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
  }).index("by_application", ["applicationId"])
    .index("by_document_type", ["applicationId", "documentTypeId"])
    .index("by_referred_at", ["referredAt"])
    .index("by_admin", ["referredBy"])
    .index("by_replacement", ["wasReplaced"])
    .index("by_issue_type", ["issueType", "referredAt"])
    .index("by_status", ["status", "referredAt"]),

  // Document Rejection History (DEPRECATED - kept for backward compatibility during migration)
  // ⚠️ DO NOT USE FOR NEW CODE - Use documentReferralHistory instead
  // This table will be removed after migration is complete
  documentRejectionHistory: defineTable({
    // Core References
    applicationId: v.id("applications"),
    documentTypeId: v.id("documentTypes"),
    documentUploadId: v.id("documentUploads"), // Original upload

    // Preserved File Data
    rejectedFileId: v.id("_storage"), // Never delete this
    originalFileName: v.string(),
    fileSize: v.float64(),
    fileType: v.string(),

    // Rejection Information
    rejectionCategory: v.union(
      v.literal("quality_issue"),      // Blurry, dark, unreadable
      v.literal("wrong_document"),     // Incorrect document type
      v.literal("expired_document"),   // Document past validity
      v.literal("incomplete_document"), // Missing pages/information
      v.literal("invalid_document"),   // Fake or tampered
      v.literal("format_issue"),       // Wrong format/size
      v.literal("other")               // Other reasons
    ),
    rejectionReason: v.string(), // Detailed explanation
    specificIssues: v.array(v.string()), // Bullet points
    doctorName: v.optional(v.string()), // Doctor name for medical referrals

    // Tracking
    rejectedBy: v.id("users"), // Admin who rejected
    rejectedAt: v.float64(),

    // Resubmission Tracking
    wasReplaced: v.boolean(),
    replacementUploadId: v.optional(v.id("documentUploads")),
    replacedAt: v.optional(v.float64()),
    attemptNumber: v.float64(), // 1st, 2nd, 3rd attempt

    // Status Flow Tracking
    status: v.optional(v.union(
      v.literal("pending"),      // Waiting for user resubmission
      v.literal("resubmitted"),  // User has resubmitted
      v.literal("rejected"),     // Admin rejected the resubmission
      v.literal("approved")      // Admin approved the resubmission
    )),

    // Notification Tracking
    notificationSent: v.optional(v.boolean()), // Whether applicant has been notified (default: true for old records)
    notificationSentAt: v.optional(v.float64()), // When notification was sent

    // Notification Read Tracking (for admins)
    adminReadBy: v.optional(v.array(v.id("users"))), // List of admin IDs who have read this

    // Audit Fields
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
  }).index("by_application", ["applicationId"])
    .index("by_document_type", ["applicationId", "documentTypeId"])
    .index("by_rejected_at", ["rejectedAt"])
    .index("by_admin", ["rejectedBy"])
    .index("by_replacement", ["wasReplaced"]),

  // Application Rejection History (for permanent/final rejections)
  applicationRejectionHistory: defineTable({
    // Core References
    applicationId: v.id("applications"),
    
    // Application Info at Time of Rejection
    applicantName: v.string(),
    applicantEmail: v.string(),
    jobCategoryId: v.id("jobCategories"),
    jobCategoryName: v.string(),
    applicationType: v.string(), // "New" or "Renew"
    
    // Rejection Information
    rejectionCategory: v.union(
      v.literal("fraud_suspected"),
      v.literal("incomplete_information"),
      v.literal("does_not_meet_requirements"),
      v.literal("duplicate_application"),
      v.literal("max_attempts_reached"),
      v.literal("other")
    ),
    rejectionReason: v.string(),
    rejectionType: v.union(
      v.literal("manual"),      // Admin manually rejected
      v.literal("automatic")    // System auto-rejected (max attempts)
    ),
    
    // Context: What triggered the rejection
    triggerSource: v.optional(v.union(
      v.literal("document_verification"),
      v.literal("payment_validation"),
      v.literal("max_document_attempts"),
      v.literal("max_payment_attempts")
    )),
    
    // Statistics at Time of Rejection
    totalDocumentsRejected: v.optional(v.float64()),
    totalPaymentsRejected: v.optional(v.float64()),
    
    // Tracking
    rejectedBy: v.id("users"),
    rejectedByName: v.string(),
    rejectedAt: v.float64(),
    
    // Notification Tracking
    notificationSent: v.boolean(),
    notificationSentAt: v.optional(v.float64()),
    
    // Audit Fields
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
  }).index("by_application", ["applicationId"])
    .index("by_rejected_at", ["rejectedAt"])
    .index("by_admin", ["rejectedBy"])
    .index("by_job_category", ["jobCategoryId", "rejectedAt"])
    .index("by_rejection_type", ["rejectionType", "rejectedAt"]),

  // Payment Rejection History
  paymentRejectionHistory: defineTable({
    // Core References
    applicationId: v.id("applications"),
    paymentId: v.id("payments"), // Original payment
    
    // Preserved Receipt Data
    rejectedReceiptId: v.optional(v.id("_storage")), // Receipt storage ID (if exists)
    referenceNumber: v.string(), // Payment reference number
    paymentMethod: v.string(), // Payment method used
    amount: v.float64(), // Payment amount
    
    // Rejection Information
    rejectionCategory: v.union(
      v.literal("invalid_receipt"),     // Receipt is fake, manipulated, or invalid
      v.literal("wrong_amount"),        // Incorrect payment amount
      v.literal("unclear_receipt"),     // Receipt is blurry or unreadable
      v.literal("expired_receipt"),     // Receipt is too old or expired
      v.literal("duplicate_payment"),   // Payment already used/duplicate
      v.literal("wrong_account"),       // Payment made to wrong account
      v.literal("incomplete_info"),     // Missing required information on receipt
      v.literal("other")                // Other reasons
    ),
    rejectionReason: v.string(), // Detailed explanation
    specificIssues: v.array(v.string()), // Bullet points of issues
    
    // Tracking
    rejectedBy: v.id("users"), // Admin who rejected
    rejectedAt: v.float64(),
    
    // Resubmission Tracking
    wasReplaced: v.boolean(),
    replacementPaymentId: v.optional(v.id("payments")),
    replacedAt: v.optional(v.float64()),
    attemptNumber: v.float64(), // 1st, 2nd, 3rd attempt
    
    // Status Flow Tracking
    status: v.optional(v.union(
      v.literal("pending"),      // Waiting for user resubmission
      v.literal("resubmitted"),  // User has resubmitted
      v.literal("rejected"),     // Admin rejected the resubmission
      v.literal("approved")      // Admin approved the resubmission
    )),
    
    // Notification Tracking
    notificationSent: v.optional(v.boolean()), // Whether applicant has been notified
    notificationSentAt: v.optional(v.float64()), // When notification was sent
    
    // Notification Read Tracking (for admins)
    adminReadBy: v.optional(v.array(v.id("users"))), // List of admin IDs who have read this
    
    // Audit Fields
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
  }).index("by_application", ["applicationId"])
    .index("by_payment", ["paymentId"])
    .index("by_rejected_at", ["rejectedAt"])
    .index("by_admin", ["rejectedBy"])
    .index("by_replacement", ["wasReplaced"]),

  // Note: documentAccessTokens table has been removed in favor of HMAC-signed URLs
  // HMAC signatures provide stateless, secure document access without database storage

  // Document Access Audit Logs - tracks all document access attempts
  documentAccessLogs: defineTable({
    // Document and Application References
    documentId: v.string(), // Can be ID or string for invalid requests
    applicationId: v.optional(v.id("applications")),
    
    // User Information
    userId: v.optional(v.id("users")), // null if authentication failed
    userEmail: v.optional(v.string()), // Preserved even if user is deleted
    userRole: v.optional(v.string()),  // Role at time of access
    
    // Access Result
    accessStatus: v.union(
      v.literal("Success"),           // Document served successfully
      v.literal("Unauthorized"),      // User lacks permission
      v.literal("Expired"),           // Signed URL expired
      v.literal("InvalidSignature"),  // HMAC signature invalid
      v.literal("DocumentNotFound"),  // Document doesn't exist
      v.literal("NoSecret"),          // Server misconfiguration
      v.literal("InvalidRequest")     // Malformed request
    ),
    
    // Access Method
    accessMethod: v.union(
      v.literal("signed_url"),   // HMAC-signed URL
      v.literal("direct"),        // Direct API call (shouldn't happen)
      v.literal("unknown")        // Fallback
    ),
    
    // Error Details
    errorMessage: v.optional(v.string()), // Detailed error for failures
    
    // Request Metadata
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    referrer: v.optional(v.string()),
    
    // Timing
    timestamp: v.float64(),
    responseTimeMs: v.optional(v.float64()), // How long the request took
    
    // Document Info at Access Time
    documentType: v.optional(v.string()),
    fileName: v.optional(v.string()),
  })
    .index("by_document", ["documentId", "timestamp"])
    .index("by_user", ["userId", "timestamp"])
    .index("by_application", ["applicationId", "timestamp"])
    .index("by_status", ["accessStatus", "timestamp"])
    .index("by_timestamp", ["timestamp"]),

  ocr_results: defineTable({
    fileName: v.string(),
    fileType: v.string(),
    extractedText: v.string(),
    createdAt: v.string(), // Storing as string for simplicity, can be v.float64() for timestamp
  }).index("by_createdAt", ["createdAt"]),

});
