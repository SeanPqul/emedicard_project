import { v } from "convex/values";
import { query } from "../_generated/server";

export const getSuperAdminDetails = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) {
      return null;
    }

    // Check if the user is a Super Admin based on the criteria:
    // role is 'admin' AND managedCategories is '[unset]' (which means null or empty array in Convex)
    const isSuperAdmin =
      user.role === "admin" &&
      (!user.managedCategories || user.managedCategories.length === 0);

    return {
      ...user,
      isSuperAdmin,
    };
  },
});

export const getApplicationStats = query({
  args: {
    startDate: v.optional(v.float64()),
    endDate: v.optional(v.float64()),
  },
  handler: async (ctx, args) => {
    let applications = await ctx.db.query("applications").collect();

    if (args.startDate && args.endDate) {
      applications = applications.filter(app =>
        app._creationTime >= args.startDate! && app._creationTime <= args.endDate!
      );
    }

    const totalApplications = applications.length;

    const applicationsByStatus = applications.reduce((acc, app) => {
      acc[app.applicationStatus] = (acc[app.applicationStatus] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalApplications,
      applicationsByStatus,
    };
  },
});
