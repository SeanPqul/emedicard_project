import { query } from "../_generated/server";
import { v } from "convex/values";
import { AdminRole } from "../users/roles";

export const get = query({
  args: { id: v.id("applications") },
  handler: async (ctx, { id }) => {
    const application = await ctx.db.get(id);
    if (!application) {
      return null;
    }
    const user = await ctx.db.get(application.userId);
    const jobCategory = await ctx.db.get(application.jobCategoryId);
    return {
      ...application,
      userName: user?.fullname ?? "Unknown User",
      jobCategoryName: jobCategory?.name ?? "Unknown Category",
    };
  },
});
