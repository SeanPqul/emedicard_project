import { mutation } from "../_generated/server";
import { v } from "convex/values";

// Upload a single document using the new documentUploads schema
export const uploadDocumentsMutation = mutation({
  args: {
    applicationId: v.id("applications"),
    fieldIdentifier: v.string(),
    storageId: v.id("_storage"),
    fileName: v.string(),
    fileType: v.string(),
    fileSize: v.number(),
    reviewStatus: v.optional(v.union(v.literal("Pending"), v.literal("Approved"), v.literal("Rejected"))),
    reviewedBy: v.optional(v.id("users")),
    reviewedAt: v.optional(v.number()),
    adminRemarks: v.optional(v.string()),
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
      throw new Error("Not authorized to upload documents for this application");
    }

    // Find the document type by fieldIdentifier
    const documentType = await ctx.db
      .query("documentTypes")
      .withIndex("by_field_identifier", (q) => q.eq("fieldIdentifier", args.fieldIdentifier))
      .unique();
    
    if (!documentType) {
      throw new Error(`Document type not found for field: ${args.fieldIdentifier}`);
    }

    // Check if document already exists for this application and documentTypeId
    const existingDoc = await ctx.db
      .query("documentUploads")
      .withIndex("by_application_document", (q) => q.eq("applicationId", args.applicationId).eq("documentTypeId", documentType._id))
      .unique();

    if (existingDoc) {
      // Check if document was rejected - if so, user must use resubmit flow
      if (existingDoc.reviewStatus === "Rejected") {
        // Check if there's a rejection history (proper rejection)
        const rejectionHistory = await ctx.db
          .query("documentRejectionHistory")
          .withIndex("by_document_type", (q) => 
            q.eq("applicationId", args.applicationId)
             .eq("documentTypeId", documentType._id)
          )
          .filter(q => q.eq(q.field("wasReplaced"), false))
          .first();
          
        if (rejectionHistory) {
          throw new Error("This document was rejected. Please use the resubmit option to upload a new version.");
        }
        // If no rejection history (manual rejection), still prevent upload
        throw new Error("This document was rejected. Please contact support if you need to resubmit.");
      }
      
      // Update existing document
      await ctx.db.patch(existingDoc._id, {
        documentTypeId: documentType._id,
        originalFileName: args.fileName,
        storageFileId: args.storageId,
        uploadedAt: Date.now(),
        reviewStatus: args.reviewStatus || "Pending",
        adminRemarks: args.adminRemarks,
        reviewedBy: args.reviewedBy,
        reviewedAt: args.reviewedAt,
      });
      
      return {
        requirementId: documentType._id,
        fieldIdentifier: args.fieldIdentifier,
        storageId: args.storageId,
        fileName: args.fileName,
        fileType: args.fileType,
        fileSize: args.fileSize,
        reviewStatus: args.reviewStatus || "Pending",
        reviewedBy: args.reviewedBy,
        reviewedAt: args.reviewedAt,
        adminRemarks: args.adminRemarks,
      };
    } else {
      // Create new document record
      await ctx.db.insert("documentUploads", {
        applicationId: args.applicationId,
        documentTypeId: documentType._id,
        originalFileName: args.fileName,
        storageFileId: args.storageId,
        uploadedAt: Date.now(),
        reviewStatus: args.reviewStatus || "Pending",
        adminRemarks: args.adminRemarks,
        reviewedBy: args.reviewedBy,
        reviewedAt: args.reviewedAt,
      });
      
      return {
        requirementId: documentType._id,
        fieldIdentifier: args.fieldIdentifier,
        storageId: args.storageId,
        fileName: args.fileName,
        fileType: args.fileType,
        fileSize: args.fileSize,
        reviewStatus: args.reviewStatus || "Pending",
        reviewedBy: args.reviewedBy,
        reviewedAt: args.reviewedAt,
        adminRemarks: args.adminRemarks,
      };
    }
  },
});
