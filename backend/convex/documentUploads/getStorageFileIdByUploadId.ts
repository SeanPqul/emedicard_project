import { v } from "convex/values";
import { Id } from "../_generated/dataModel";
import { query } from "../_generated/server";

export const getStorageFileIdByUploadId = query({
  args: {
    documentUploadId: v.id("documentUploads"),
  },
  handler: async (ctx, args): Promise<Id<"_storage"> | null> => {
    const documentUpload = await ctx.db.get(args.documentUploadId);
    if (!documentUpload) {
      return null;
    }
    return documentUpload.storageFileId;
  },
});
