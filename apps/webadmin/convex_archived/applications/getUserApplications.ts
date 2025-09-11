import { query } from "../_generated/server";
import { Doc } from "../_generated/dataModel";

export const getUserApplicationsQuery = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
      
    if (!user) return [];
    
    // Get forms with optimized payload
    const forms = await ctx.db
      .query("applications")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    // Aggregate server-side to minimize round-trips
    return await Promise.all(forms.map(async (form) => {
      // Get job category with minimal fields
      const jobCategory = await ctx.db.get(form.jobCategoryId) as Doc<"jobCategories"> | null;
      
      // Get document count efficiently
      const documents = await ctx.db
        .query("documentUploads")
        .withIndex("by_application", (q) => q.eq("applicationId", form._id))
        .collect();
      
      // Return only the fields the UI needs (minimal payload)
      return {
        _id: form._id,
        _creationTime: form._creationTime,
        status: form.applicationStatus, // Changed from form.status to form.applicationStatus
        form: {
          _id: form._id,
          applicationType: form.applicationType,
          position: form.position,
          organization: form.organization,
          civilStatus: form.civilStatus,
        },
        jobCategory: jobCategory ? {
          _id: jobCategory._id,
          name: jobCategory.name,
          colorCode: jobCategory.colorCode,
          requireOrientation: jobCategory.requireOrientation
        } : undefined,
        documentCount: documents.length,
        submittedAt: form.applicationStatus === "Submitted" ? (form.updatedAt || form._creationTime) : undefined, // Changed from form.status to form.applicationStatus
      };
    }));
  },
});
