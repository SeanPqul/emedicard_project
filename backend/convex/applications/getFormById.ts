import { v } from "convex/values";
import { query } from "../_generated/server";

export const getFormByIdQuery = query({
  args: { formId: v.id("applications") },
  handler: async (ctx, { formId }) => {
    return await ctx.db.get(formId);
  },
});
