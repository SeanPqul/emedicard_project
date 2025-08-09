import { mutation } from "../_generated/server";
import { v } from "convex/values";

// Upload a single document using the new formDocuments schema
export const uploadDocument = mutation({
  args: {
    formId: v.id("forms"),
    fieldName: v.string(),
    storageId: v.id("_storage"),
    fileName: v.string(),
    fileType: v.string(),
    fileSize: v.number(),
    status: v.optional(v.union(v.literal("Pending"), v.literal("Approved"), v.literal("Rejected"))),
    reviewBy: v.optional(v.id("users")),
    reviewAt: v.optional(v.number()),
    remarks: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Verify form exists and user owns it
    const form = await ctx.db.get(args.formId);
    if (!form) {
      throw new Error("Form not found");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user || form.userId !== user._id) {
      throw new Error("Not authorized to upload documents for this form");
    }

    // Find the document requirement by fieldName
    const docRequirement = await ctx.db
      .query("documentRequirements")
      .withIndex("by_field_name", (q) => q.eq("fieldName", args.fieldName))
      .unique();
    
    if (!docRequirement) {
      throw new Error(`Document requirement not found for field: ${args.fieldName}`);
    }

    // Check if document already exists for this form and documentRequirementId
    const existingDoc = await ctx.db
      .query("formDocuments")
      .withIndex("by_form_type", (q) => q.eq("formId", args.formId).eq("documentRequirementId", docRequirement._id))
      .unique();

    if (existingDoc) {
      // Update existing document
      await ctx.db.patch(existingDoc._id, {
        documentRequirementId: docRequirement._id,
        fileName: args.fileName,
        fileId: args.storageId,
        uploadedAt: Date.now(),
        status: args.status || "Pending",
        remarks: args.remarks,
        reviewBy: args.reviewBy,
        reviewAt: args.reviewAt,
      });
      
      return {
        requirementId: docRequirement._id,
        fieldName: args.fieldName,
        storageId: args.storageId,
        fileName: args.fileName,
        fileType: args.fileType,
        fileSize: args.fileSize,
        status: args.status || "Pending",
        reviewBy: args.reviewBy,
        reviewAt: args.reviewAt,
        remarks: args.remarks,
      };
    } else {
      // Create new document record
      await ctx.db.insert("formDocuments", {
        formId: args.formId,
        documentRequirementId: docRequirement._id,
        fileName: args.fileName,
        fileId: args.storageId,
        uploadedAt: Date.now(),
        status: args.status || "Pending",
        remarks: args.remarks,
        reviewBy: args.reviewBy,
        reviewAt: args.reviewAt,
      });
      
      return {
        requirementId: docRequirement._id,
        fieldName: args.fieldName,
        storageId: args.storageId,
        fileName: args.fileName,
        fileType: args.fileType,
        fileSize: args.fileSize,
        status: args.status || "Pending",
        reviewBy: args.reviewBy,
        reviewAt: args.reviewAt,
        remarks: args.remarks,
      };
    }
  },
});
