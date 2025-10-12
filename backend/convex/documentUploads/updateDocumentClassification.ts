import { v } from "convex/values";
import { mutation } from "../_generated/server";

export const updateDocumentClassification = mutation({
  args: {
    documentUploadId: v.id("documentUploads"),
    classifiedDocumentType: v.string(),
    extractousResponse: v.any(), // Store the full response, or a relevant part
  },
  handler: async (ctx, args) => {
    // No authentication check here, as this mutation is called internally by an action
    // The action itself should handle any necessary authentication/authorization.

    await ctx.db.patch(args.documentUploadId, {
      classifiedDocumentType: args.classifiedDocumentType,
      extractousResponse: args.extractousResponse,
      // You might want to add a timestamp for when it was classified
      classifiedAt: Date.now(),
    });
  },
});
