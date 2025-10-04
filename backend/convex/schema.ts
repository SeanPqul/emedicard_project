import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  
  // Users
  users: defineTable({
    username: v.string(),
    fullname: v.string(),
    email: v.string(),
    image: v.string(),
    gender: v.optional(v.string()),
    birthDate: v.optional(v.string()),
    phoneNumber: v.optional(v.string()),
    role: v.optional(v.union(
      v.literal("applicant"),
      v.literal("inspector"),
      v.literal("admin"),
    )),
    managedCategories: v.optional(
      v.array(v.id("jobCategories"))
    ),
    clerkId: v.string(),
    updatedAt: v.optional(v.float64()), // For tracking profile updates
  }).index("by_clerk_id", ["clerkId"])
    .index("by_role", ["role"]),

  // Job categories (e.g., food handler, security guard, etc.)
  jobCategories: defineTable({
    name: v.string(),
    colorCode: v.string(),
    requireOrientation: v.optional(v.union(v.boolean(), v.string()))
  }),

  // Document types that can be uploaded (e.g., valid ID, x-ray)
  documentTypes: defineTable({
    name: v.string(),
    description: v.string(),
    icon: v.string(),
    isRequired: v.boolean(),
    fieldIdentifier: v.string() // "validId", "chestXrayId", etc.
  }).index("by_field_identifier", ["fieldIdentifier"]),

  // Links job categories to required document types
  jobCategoryDocuments: defineTable({
    jobCategoryId: v.id("jobCategories"),
    documentTypeId: v.id("documentTypes"),
    isRequired: v.boolean(),
  }).index("by_job_category", ["jobCategoryId"])
    .index("by_document_type", ["documentTypeId"]),

  // Health card applications (renamed from 'forms' for clarity)
  applications: defineTable({
    userId: v.id("users"),
    applicationType: v.union(
      v.literal("New"), 
      v.literal("Renew")
    ),
    jobCategoryId: v.id("jobCategories"),
    position: v.string(),
    organization: v.string(),
    civilStatus: v.string(),
    applicationStatus: v.union(
      v.literal("Draft"),
      v.literal("Pending Payment"),
      v.literal("Submitted"),
      v.literal("Documents Need Revision"),
      v.literal("Under Review"),
      v.literal("For Payment Validation"),
      v.literal("For Document Verification"),
      v.literal("For Orientation"),
      v.literal("Pending"),
      v.literal("Cancelled"),
      v.literal("Approved"),
      v.literal("Rejected")
    ),
    paymentDeadline: v.optional(v.float64()), // Timestamp for payment deadline
    approvedAt: v.optional(v.float64()),
    adminRemarks: v.optional(v.string()), // Admin notes
    updatedAt: v.optional(v.float64()),
  }).index("by_user", ["userId"]),

  // Document uploads for applications
  documentUploads: defineTable({
    applicationId: v.id("applications"),
    documentTypeId: v.id("documentTypes"),
    originalFileName: v.string(),
    storageFileId: v.id("_storage"), // Convex storage reference
    uploadedAt: v.float64(),
    reviewStatus: v.string(), // "Pending", "Approved", "Rejected"
    adminRemarks: v.optional(v.string()), // Admin feedback on document
    reviewedBy: v.optional(v.id("users")), // Who reviewed the document
    reviewedAt: v.optional(v.float64()), // When document was reviewed
  }).index("by_application", ["applicationId"])
    .index("by_application_document", ["applicationId", "documentTypeId"]),

  // Payments for applications
  payments: defineTable({
    applicationId: v.id("applications"),
    amount: v.float64(),
    serviceFee: v.float64(),
    netAmount: v.float64(),
    paymentMethod: v.union(
      v.literal("Gcash"),
      v.literal("Maya"),
      v.literal("BaranggayHall"),
      v.literal("CityHall")
    ),
    referenceNumber: v.string(),
    receiptStorageId: v.optional(v.id("_storage")),
    paymentStatus: v.union(
      v.literal("Pending"),
      v.literal("Processing"), // New status for Maya checkout
      v.literal("Complete"),
      v.literal("Failed"),
      v.literal("Refunded"),
      v.literal("Cancelled"),
      v.literal("Expired") // New status for expired checkouts
    ),
    // Maya-specific fields
    mayaPaymentId: v.optional(v.string()), // Maya's payment ID
    mayaCheckoutId: v.optional(v.string()), // Maya checkout session ID
    checkoutUrl: v.optional(v.string()), // Maya checkout URL
    webhookPayload: v.optional(v.any()), // Store webhook data for debugging
    paymentProvider: v.optional(v.union(
      v.literal("maya_api"),
      v.literal("manual"),
      v.literal("cash")
    )),
    transactionFee: v.optional(v.float64()), // Maya transaction fees
    settlementDate: v.optional(v.float64()), // When funds will be settled
    failureReason: v.optional(v.string()), // Reason for failed payments
    updatedAt: v.optional(v.float64()),
  }).index("by_application", ["applicationId"])
    .index("by_maya_payment", ["mayaPaymentId"]), // New index for Maya lookups

  // Orientation scheduling for food handlers
  orientations: defineTable({
    applicationId: v.id("applications"),
    scheduledAt: v.float64(),
    qrCodeUrl: v.string(),
    checkInTime: v.optional(v.float64()),
    checkOutTime: v.optional(v.float64()),
    orientationStatus: v.union(
      v.literal("Scheduled"),
      v.literal("Completed"),
      v.literal("Missed")
    ),
  }).index("by_application", ["applicationId"]),

  // Health card issuance
  healthCards: defineTable({
    applicationId: v.id("applications"),
    cardUrl: v.string(),
    issuedAt: v.float64(),
    expiresAt: v.float64(),
    verificationToken: v.string(),
  }).index("by_application", ["applicationId"])
    .index("by_verification_token", ["verificationToken"]),

  // Notifications for users
  notifications: defineTable({
    userId: v.id("users"),
    applicationId: v.optional(v.id("applications")),
    title: v.optional(v.string()),
    message: v.string(),
    notificationType: v.string(), // "MissingDoc", "Payment", "Approval"
    isRead: v.boolean(),
    actionUrl: v.optional(v.string()),
  }).index("by_user", ["userId"]),

  // QR verification logs
  verificationLogs: defineTable({
    healthCardId: v.id("healthCards"),
    scannedAt: v.float64(),
    userAgent: v.optional(v.string()),
    ipAddress: v.optional(v.string()),
    verificationStatus: v.union(
      v.literal("Success"),
      v.literal("Failed")
    ),
  }).index("by_health_card", ["healthCardId"]),

  // Payment logs for audit trail
  paymentLogs: defineTable({
    paymentId: v.optional(v.id("payments")), // Reference to payment record
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
    mayaPaymentId: v.optional(v.string()),
    mayaCheckoutId: v.optional(v.string()),
    amount: v.optional(v.float64()),
    currency: v.optional(v.string()),
    errorMessage: v.optional(v.string()),
    metadata: v.optional(v.any()), // Additional event-specific data
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    timestamp: v.float64(),
  }).index("by_payment", ["paymentId"])
    .index("by_maya_payment", ["mayaPaymentId"])
    .index("by_event_type", ["eventType"])
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
