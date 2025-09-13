// convex/jobCategories/getAllJobCategories.ts

import { query } from "../_generated/server";

// The function is now simply named "get".
// The path to it will be `api.jobCategories.getAllJobCategories.get`
export const get = query({
  args: {},
  handler: async (ctx) => {
    const categories = await ctx.db.query("jobCategories").collect();
    return categories;
  },
});
