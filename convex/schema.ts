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
    clerkId: v.string(),  //
    updatedAt: v.optional(v.number()), // For tracking profile updates
  }).index("by_clerk_id", ["clerkId"])
    .index("by_role", ["role"]),

  // Job categories (e.g., food handler, security guard, etc.)
  jobCategory: defineTable({
    name: v.string(),
    colorCode: v.string(),
    requireOrientation: v.optional(v.union(v.boolean(), v.string()))
  }),

  jobCategoryRequirements: defineTable({
    jobCategoryId: v.id("jobCategory"),
    documentRequirementId: v.id("documentRequirements"),
    required: v.boolean(),
  }).index("by_category", ["jobCategoryId"])
    .index("by_requirement", ["documentRequirementId"]),

  // Document requirements for each job category (e.g., valid ID, x-ray)
  documentRequirements: defineTable({
    name: v.string(),
    description: v.string(),
    icon: v.string(),
    required: v.boolean(),
    fieldName: v.string()
  }).index("by_field_name", ["fieldName"]),

  // Application form (base record for each user's application)
  forms: defineTable({
    userId: v.id("users"),
    applicationType: v.union(
      v.literal("New"), 
      v.literal("Renew")
    ),
    jobCategory: v.id("jobCategory"),
    position: v.string(),
    organization: v.string(),
    civilStatus: v.string(),
    status: v.string(), // e.g., "Pending", "Approved", "Rejected"
    approvedAt: v.optional(v.number()), // Only when approved
    remarks: v.optional(v.string()),    // Admin notes
    updatedAt: v.optional(v.number()),
  }).index("by_user", ["userId"]),

  // Document uploads for forms - centralized document storage
  formDocuments: defineTable({
    formId: v.id("forms"),
    documentRequirementId: v.id("documentRequirements"), // Links to specific requirement
    fileName: v.string(), // Original filename
    fileId: v.id("_storage"), // Convex storage reference
    uploadedAt: v.number(),
    status: v.string(), // e.g., "Pending", "Approved", "Rejected"
    remarks: v.optional(v.string()), // Admin feedback on document
    reviewBy: v.optional(v.id("users")), // Who reviewed the document
    reviewAt: v.optional(v.number()), // When the document was reviewed
  }).index("by_form", ["formId"])
    .index("by_form_type", ["formId", "documentRequirementId"]),

  // Payments
  payments: defineTable({
    formId: v.id("forms"),
    amount: v.number(),
    serviceFee: v.number(),
    netAmount: v.number(),
    method: v.union(
      v.literal("Gcash"),
      v.literal("Maya"),
      v.literal("BaranggayHall"),
      v.literal("CityHall")
    ),
    referenceNumber: v.string(),
    receiptId: v.optional(v.id("_storage")),
    status: v.union(
      v.literal("Pending"),
      v.literal("Complete"),
      v.literal("Failed"),
      v.literal("Refunded"),
      v.literal("Cancelled")
    ),
    updatedAt: v.optional(v.number()),
  }).index("by_form", ["formId"]),

  // Orientation for food handler
  orientations: defineTable({
    formId: v.id("forms"),
    scheduleAt: v.number(),
    qrCodeUrl: v.string(),
    checkInTime: v.optional(v.number()),
    checkOutTime: v.optional(v.number()),
    status: v.union(
      v.literal("Scheduled"),
      v.literal("Completed"),
      v.literal("Missed")
    ),
  }).index("by_form", ["formId"]),

  // Healthcard issuance
  healthCards: defineTable({
    formId: v.id("forms"),
    cardUrl: v.string(),
    issuedAt: v.number(),
    expiresAt: v.number(),
    verificationToken: v.string(),
  }).index("by_form", ["formId"])
    .index("by_verificationToken", ["verificationToken"]),

  // Notifications
  notifications: defineTable({
    userId: v.id("users"),
    formsId: v.optional(v.id("forms")),
    title: v.optional(v.string()),
    message: v.string(),
    type: v.string(),  // e.g., "MissingDoc", "Payment", "Approval"
    read: v.boolean(),
    actionUrl: v.optional(v.string()),  // If clicking the notif opens a screen
  }).index("by_user", ["userId"]), // Sort recent first with _creationTime automatically added

  // QR Scan Logs (for verification history)
  verificationLogs: defineTable({
    healthCardId: v.id("healthCards"),
    scannedAt: v.number(),
    userAgent: v.optional(v.string()),
    ipAddress: v.optional(v.string()),
    status: v.union(
      v.literal("Success"),
      v.literal("Failed")
    ),
  }).index("by_healthcard", ["healthCardId"]),

});
