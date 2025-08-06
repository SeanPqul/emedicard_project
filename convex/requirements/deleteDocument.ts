import { mutation } from "../_generated/server";
import { v } from "convex/values";

// Delete a document using formDocuments schema (uses the client interface)
export const deleteDocument = mutation({
  args: {
    formId: v.id("forms"),
    fieldName: v.string(),
    storageId: v.id("_storage"),
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
      throw new Error("Not authorized to delete this document");
    }

    // Find the document requirement by fieldName
    const docRequirement = await ctx.db
      .query("documentRequirements")
      .withIndex("by_field_name", (q) => q.eq("fieldName", args.fieldName))
      .unique();
    
    if (!docRequirement) {
      throw new Error(`Document requirement not found for field: ${args.fieldName}`);
    }

    // Find the document to delete
    const document = await ctx.db
      .query("formDocuments")
      .withIndex("by_form_type", (q) => q.eq("formId", args.formId).eq("documentRequirementId", docRequirement._id))
      .unique();

    if (!document) {
      throw new Error("Document not found");
    }

    // Verify the storage ID matches (security check)
    if (document.fileId !== args.storageId) {
      throw new Error("Storage ID mismatch - unauthorized deletion attempt");
    }

    // Check if document can be deleted (business logic)
    if (document.status === "Approved") {
      throw new Error("Cannot delete approved documents. Please contact administrator.");
    }

    // Delete the file from storage
    await ctx.storage.delete(document.fileId);

    // Delete the document record
    await ctx.db.delete(document._id);

    return { success: true };
  },
});
