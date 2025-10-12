import { v } from "convex/values";
import { api } from "../_generated/api"; // Import api to run actions
import { action } from "../_generated/server";
// import { classify } from "./classifyDocument"; // We'll use api.documents.classifyDocument.classify

export const triggerClassification = action({
  args: {
    documentUploadId: v.id("documentUploads"),
    storageFileId: v.id("_storage"),
    mimeType: v.string(),
    fileName: v.string(),
  },
  handler: async (ctx, args) => {
    // Authenticate the user to ensure only authorized admins can trigger classification
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.runQuery(api.users.index.getUserByClerkId, { clerkId: identity.subject });

    if (!user || user.role !== "admin") { // Only allow admins to trigger classification
      throw new Error("Not authorized to trigger document classification");
    }

    // Directly call the classify action
    await ctx.runAction(api.documents.classifyDocument.classify, {
      documentUploadId: args.documentUploadId,
      storageFileId: args.storageFileId,
      mimeType: args.mimeType,
      fileName: args.fileName,
    });
  },
});
