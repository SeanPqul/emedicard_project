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
    applicationStatus: v.string(),
    applicationType: v.union(
      v.literal("New"),
      v.literal("Renew")
    ),
    approvedAt: v.optional(v.float64()),
    civilStatus: v.string(),
    jobCategoryId: v.id("jobCategories"),
    organization: v.string(),
    paymentDeadline: v.optional(v.float64()),
    position: v.string(),
    updatedAt: v.optional(v.float64()),
    userId: v.id("users"),
    lastUpdatedBy: v.optional(v.id("users")), // New field to track which admin last updated the application
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
    reviewStatus: v.string(),
    reviewedAt: v.optional(v.float64()),
    reviewedBy: v.optional(v.id("users")),
    storageFileId: v.id("_storage"),
    uploadedAt: v.float64(),
  })
    .index("by_application", ["applicationId"])
    .index("by_application_document", [
      "applicationId",
      "documentTypeId",
    ]),
  healthCards: defineTable({
    applicationId: v.id("applications"),
    cardUrl: v.string(),
    expiresAt: v.float64(),
    issuedAt: v.float64(),
    verificationToken: v.string(),
  })
    .index("by_application", ["applicationId"])
    .index("by_verification_token", ["verificationToken"]),
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
  }).index("by_user", ["userId"]),
  orientations: defineTable({
    applicationId: v.id("applications"),
    checkInTime: v.optional(v.float64()),
    checkOutTime: v.optional(v.float64()),
    orientationDate: v.optional(v.float64()), // Timestamp for the orientation date
    timeSlot: v.optional(v.string()), // e.g., "9:00 AM - 11:00 AM"
    assignedInspectorId: v.optional(v.id("users")), // Reference to the assigned inspector
    orientationVenue: v.optional(v.string()), // e.g., "Gaisano Ilustre"
    orientationStatus: v.union(
      v.literal("Scheduled"),
      v.literal("Completed"),
      v.literal("Missed")
    ),
    qrCodeUrl: v.string(),
    scheduledAt: v.float64(),
  }).index("by_application", ["applicationId"])
    .index("by_date_timeslot_venue", ["orientationDate", "timeSlot", "orientationVenue"]),
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
    adminUsername: v.string(),
    adminEmail: v.string(),
    action: v.string(), // e.g., "approved document", "rejected document", "approved application"
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

  // Document Rejection History
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
    
    // Tracking
    rejectedBy: v.id("users"), // Admin who rejected
    rejectedAt: v.float64(),
    
    // Resubmission Tracking
    wasReplaced: v.boolean(),
    replacementUploadId: v.optional(v.id("documentUploads")),
    replacedAt: v.optional(v.float64()),
    attemptNumber: v.float64(), // 1st, 2nd, 3rd attempt
    
    // Audit Fields
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
  }).index("by_application", ["applicationId"])
    .index("by_document_type", ["applicationId", "documentTypeId"])
    .index("by_rejected_at", ["rejectedAt"])
    .index("by_admin", ["rejectedBy"])
    .index("by_replacement", ["wasReplaced"]),

});
