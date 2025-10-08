import { query } from "../_generated/server";
import { v } from "convex/values";

// Internal query to get document type information (for HTTP endpoint)
export const getDocumentType = query({
  args: {
    documentId: v.id("documentUploads"),
  },
  handler: async (ctx, args) => {
    const document = await ctx.db.get(args.documentId);
    if (!document) {
      return null;
    }
    
    const documentType = await ctx.db.get(document.documentTypeId);
    if (!documentType) {
      return null;
    }
    
    return {
      name: documentType.name,
      description: documentType.description,
      isRequired: documentType.isRequired,
    };
  },
});
