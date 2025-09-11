import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
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
    position: v.string(),
    updatedAt: v.optional(v.float64()),
    userId: v.id("users"),
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
    orientationStatus: v.union(
      v.literal("Scheduled"),
      v.literal("Completed"),
      v.literal("Missed")
    ),
    qrCodeUrl: v.string(),
    scheduledAt: v.float64(),
  }).index("by_application", ["applicationId"]),
  payments: defineTable({
    amount: v.float64(),
    applicationId: v.id("applications"),
    netAmount: v.float64(),
    paymentMethod: v.union(
      v.literal("Gcash"),
      v.literal("Maya"),
      v.literal("BaranggayHall"),
      v.literal("CityHall")
    ),
    paymentStatus: v.union(
      v.literal("Pending"),
      v.literal("Complete"),
      v.literal("Failed"),
      v.literal("Refunded"),
      v.literal("Cancelled")
    ),
    receiptStorageId: v.optional(v.id("_storage")),
    referenceNumber: v.string(),
    serviceFee: v.float64(),
    updatedAt: v.optional(v.float64()),
  }).index("by_application", ["applicationId"]),
  users: defineTable({
    birthDate: v.optional(v.string()),
    clerkId: v.string(),
    email: v.string(),
    fullname: v.string(),
    gender: v.optional(v.string()),
    image: v.string(),
    managedCategories: v.optional(
      v.array(v.id("jobCategories"))
    ),
    phoneNumber: v.optional(v.string()),
    role: v.optional(
      v.union(
        v.literal("applicant"),
        v.literal("inspector"),
        v.literal("admin")
      )
    ),
    updatedAt: v.optional(v.float64()),
    username: v.string(),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_role", ["role"]),
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
});
