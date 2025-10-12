import { v } from "convex/values";
import { api } from "../_generated/api"; // Import api to run queries
import { Id } from "../_generated/dataModel";
import { action } from "../_generated/server";

export const getStorageFileIdAction = action({
  args: {
    documentUploadId: v.id("documentUploads"),
  },
  handler: async (ctx, args): Promise<Id<"_storage"> | null> => {
    // Authenticate the user to ensure only authorized admins can access storageFileId
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.runQuery(api.users.index.getUserByClerkId, { clerkId: identity.subject });

    if (!user || user.role !== "admin") { // Only allow admins to access this
      throw new Error("Not authorized to access document storage ID");
    }

    // Run the query to get the storageFileId
    const storageFileId = await ctx.runQuery(api.documentUploads.getStorageFileIdByUploadId.getStorageFileIdByUploadId, {
      documentUploadId: args.documentUploadId,
    });

    return storageFileId;
  },
});
