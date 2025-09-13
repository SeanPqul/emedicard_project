// convex/documentUploads/getReviewedDocumentsWithDetails.ts

import { query } from "../_generated/server";
import { v } from "convex/values";

// The function is now simply named "get".
// The full path to call it will be `api.documentUploads.getReviewedDocumentsWithDetails.get`
export const get = query({
  args: {
    applicationId: v.id("applications"),
  },
  handler: async (ctx, args) => {
    const documentUploads = await ctx.db
      .query("documentUploads")
      .withIndex("by_application", (q) =>
        q.eq("applicationId", args.applicationId)
      )
      .filter(q => q.neq(q.field("reviewStatus"), "Pending")) // Only get reviewed documents
      .collect();

    const documentsWithDetails = await Promise.all(
      documentUploads.map(async (doc) => {
        const documentType = await ctx.db.get(doc.documentTypeId);
        const reviewer = doc.reviewedBy ? await ctx.db.get(doc.reviewedBy) : null;

        const application = await ctx.db.get(doc.applicationId);
        const jobCategory = application ? await ctx.db.get(application.jobCategoryId) : null;
        const healthCardColor = jobCategory?.colorCode || null;

        return {
          ...doc,
          documentType,
          reviewerEmail: reviewer?.email || null,
          healthCardColor,
        };
      })
    );

    return documentsWithDetails.sort((a, b) => (b.reviewedAt ?? 0) - (a.reviewedAt ?? 0));
  },
});