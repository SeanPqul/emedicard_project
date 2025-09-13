import { mutation } from "../_generated/server";
import { v } from "convex/values";

// Update a document field (replacement document)
export const updateDocumentFieldMutation = mutation({
  args: {
    applicationId: v.id("applications"),
    fieldName: v.string(),
    storageId: v.id("_storage"),
    fileName: v.string(),
    fileType: v.string(),
    fileSize: v.number(),
    reviewStatus: v.optional(v.union(v.literal("Pending"), v.literal("Approved"), v.literal("Rejected"))),
    reviewedBy: v.optional(v.id("users")),
    reviewedAt: v.optional(v.number()),
    remarks: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Verify application exists and user owns it
    const application = await ctx.db.get(args.applicationId);
    if (!application) {
      throw new Error("Application not found");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user || application.userId !== user._id) {
      throw new Error("Not authorized to update documents for this application");
    }

    // Find the document requirement by fieldName
    const docRequirement = await ctx.db
      .query("documentTypes")
      .withIndex("by_field_identifier", (q) => q.eq("fieldIdentifier", args.fieldName))
      .unique();
    
    if (!docRequirement) {
      throw new Error(`Document requirement not found for field: ${args.fieldName}`);
    }

    // Find existing document for this application and documentRequirementId
    const existingDoc = await ctx.db
      .query("documentUploads")
      .withIndex("by_application_document", (q) => q.eq("applicationId", args.applicationId).eq("documentTypeId", docRequirement._id))
      .unique();

    if (!existingDoc) {
      throw new Error("Document not found to update");
    }

    // Delete old file from storage
    await ctx.storage.delete(existingDoc.storageFileId);

    // Update document record
    await ctx.db.patch(existingDoc._id, {
      originalFileName: args.fileName,
      storageFileId: args.storageId,
      uploadedAt: Date.now(),
      reviewStatus: args.reviewStatus || "Pending",
      adminRemarks: args.remarks,
      reviewedBy: args.reviewedBy,
      reviewedAt: args.reviewedAt,
    });

    return {
      requirementId: docRequirement._id,
      fieldName: args.fieldName,
      storageId: args.storageId,
      fileName: args.fileName,
      fileType: args.fileType,
      fileSize: args.fileSize,
      reviewStatus: args.reviewStatus || "Pending",
      reviewedBy: args.reviewedBy,
      reviewedAt: args.reviewedAt,
      remarks: args.remarks,
    };
  },
});
