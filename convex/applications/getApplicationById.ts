import { v } from "convex/values";
import { query } from "../_generated/server";

export const getApplicationByIdQuery = query({
  args: { applicationId: v.id("applications") },
  handler: async (ctx, { applicationId }) => {
    return await ctx.db.get(applicationId);
  },
});
