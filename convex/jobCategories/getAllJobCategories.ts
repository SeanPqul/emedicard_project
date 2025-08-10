import { query } from "../_generated/server";

export const getAllJobCategoriesQuery = query({
  args: {},
  handler: async (ctx) => {
    const categories = await ctx.db.query("jobCategory").collect();
    return categories;
  },
});
