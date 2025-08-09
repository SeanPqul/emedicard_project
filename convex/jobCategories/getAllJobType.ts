import { query } from "../_generated/server";

export const getAllJobCategories = query({
  args: {},
  handler: async (ctx) => {
    const categories = await ctx.db.query("jobCategory").collect();
    return categories;
  },
});
