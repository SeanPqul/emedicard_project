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
    
    // Get applications with optimized payload
    const applications = await ctx.db
      .query("applications")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    // Aggregate server-side to minimize round-trips
    return await Promise.all(applications.map(async (application) => {
      // Get job category with minimal fields
      const jobCategory = await ctx.db.get(application.jobCategoryId) as Doc<"jobCategories"> | null;
      
      // Get document count efficiently
      const documents = await ctx.db
        .query("documentUploads")
        .withIndex("by_application", (q) => q.eq("applicationId", application._id))
        .collect();
      
      // Return only the fields the UI needs (minimal payload)
      return {
        _id: application._id,
        _creationTime: application._creationTime,
        applicationStatus: application.applicationStatus,
        // Alternative property name for webadmin compatibility
        status: application.applicationStatus,
        application: {
          _id: application._id,
          applicationType: application.applicationType,
          position: application.position,
          organization: application.organization,
          civilStatus: application.civilStatus,
        },
        // Alternative property name for webadmin compatibility  
        form: {
          _id: application._id,
          applicationType: application.applicationType,
          position: application.position,
          organization: application.organization,
          civilStatus: application.civilStatus,
        },
        jobCategory: jobCategory ? {
          _id: jobCategory._id,
          name: jobCategory.name,
          colorCode: jobCategory.colorCode,
          requireOrientation: jobCategory.requireOrientation
        } : undefined,
        documentCount: documents.length,
        submittedAt: application.applicationStatus === "Submitted" ? (application.updatedAt || application._creationTime) : undefined,
      };
    }));
  },
});
