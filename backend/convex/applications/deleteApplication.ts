import { mutation } from "../_generated/server";
import { v } from "convex/values";

/**
 * Deletes a draft application and its associated document records.
 * Used for cleanup during failed submission flows to prevent orphaned applications.
 * 
 * Security: Only allows deletion of Draft applications owned by the authenticated user.
 */
export const deleteApplication = mutation({
  args: {
    applicationId: v.id("applications"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Verify application exists
    const application = await ctx.db.get(args.applicationId);
    if (!application) {
      throw new Error("Application not found");
    }

    // Verify user owns this application
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user || application.userId !== user._id) {
      throw new Error("Not authorized to delete this application");
    }

    // Only allow deletion of Draft applications (safety check)
    if (application.applicationStatus !== "Draft") {
      throw new Error(
        `Cannot delete application with status: ${application.applicationStatus}. Only Draft applications can be deleted.`
      );
    }

    // Delete associated document records (if any were created)
    const documents = await ctx.db
      .query("documentUploads")
      .withIndex("by_application", (q) => q.eq("applicationId", args.applicationId))
      .collect();

    for (const doc of documents) {
      await ctx.db.delete(doc._id);
    }

    // Delete the application
    await ctx.db.delete(args.applicationId);

    return { success: true };
  },
});
