import { mutation } from "../_generated/server";
import { v } from "convex/values";

// Update a single document using formDocuments schema
export const updateDocument = mutation({
  args: {
    documentId: v.id("formDocuments"),
    fileName: v.string(),
    fileId: v.id("_storage"),
    status: v.optional(v.union(
      v.literal("Pending"),
      v.literal("Approved"),
      v.literal("Rejected")
    )),
    remarks: v.optional(v.string()),
    reviewBy: v.optional(v.id("users")),
    reviewAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const document = await ctx.db.get(args.documentId);
    if (!document) {
      throw new Error("Document not found");
    }

    // Verify form exists and user owns it
    const form = await ctx.db.get(document.formId);
    if (!form) {
      throw new Error("Form not found");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user || form.userId !== user._id) {
      throw new Error("Not authorized to update this document");
    }

    await ctx.db.patch(args.documentId, {
      fileName: args.fileName,
      fileId: args.fileId,
      uploadedAt: Date.now(),
      status: args.status || "Pending",
      remarks: args.remarks,
    });

    return args.documentId;
  },
});
