import { query } from "../_generated/server";
import { v } from "convex/values";

export const get = query({
  args: {
    storageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    if (!args.storageId) {
      return null;
    }
    return await ctx.storage.getUrl(args.storageId);
  },
});
