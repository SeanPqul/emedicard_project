// convex/jobCategories/getAllJobCategories.ts

import { query } from "../_generated/server";

// Export with the name expected by mobile app
export const getAllJobCategoriesQuery = query({
  args: {},
  handler: async (ctx) => {
    const categories = await ctx.db.query("jobCategories").collect();
    return categories;
  },
});
