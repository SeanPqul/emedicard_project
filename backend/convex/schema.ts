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
    applicationStatus: v.string(), // "Draft", "Submitted", "Pending", "Approved", "Rejected"
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
      v.literal("Complete"),
      v.literal("Failed"),
      v.literal("Refunded"),
      v.literal("Cancelled")
    ),
    updatedAt: v.optional(v.float64()),
  }).index("by_application", ["applicationId"]),

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

});