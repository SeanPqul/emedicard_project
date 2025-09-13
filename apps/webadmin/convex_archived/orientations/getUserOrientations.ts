import { query } from "../_generated/server";

export const getUserOrientationsQuery = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      return [];
    }

    // For now, return empty array - implement actual orientation logic later
    // const orientations = await ctx.db
    //   .query("orientations")
    //   .withIndex("by_application", (q) => q.eq("applicationId", user._id)) // Assuming a user can have multiple applications, and orientations are linked to applications
    //   .collect();

    return [];
  },
});


// @deprecated - Use getUserOrientationsQuery instead. This alias will be removed in a future release.
export const getUserOrientations = getUserOrientationsQuery;
