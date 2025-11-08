import { v } from "convex/values";
import { mutation } from "../_generated/server";

// Internal mutation for database updates only (called by action)
export const updateUserDatabase = mutation({
    args: {
        userId: v.id("users"),
        updates: v.any(),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.userId, args.updates);
        return args.userId;
    }
});
