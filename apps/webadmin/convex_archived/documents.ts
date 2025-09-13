import { query } from "./_generated/server";
import { v } from "convex/values";

export const getByApplication = query({
  args: { applicationId: v.id("applications") },
  handler: async (ctx, { applicationId }) => {
    const documents = await ctx.db
      .query("documentUploads")
      .withIndex("by_application", (q) => q.eq("applicationId", applicationId))
      .collect();

    return Promise.all(
      documents.map(async (doc) => {
        const documentType = await ctx.db.get(doc.documentTypeId);
        return {
          ...doc,
          documentName: documentType?.name ?? "Unknown Document",
        };
      })
    );
  },
});
