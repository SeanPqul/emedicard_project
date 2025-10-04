import { query } from "../_generated/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    // Get all document types
    const documentTypes = await ctx.db
      .query("documentTypes")
      .collect();
    
    return documentTypes;
  },
});
