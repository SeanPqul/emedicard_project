import { v } from "convex/values";
import { mutation } from "../_generated/server";

export const updateUser = mutation({
    args: {
        fullname: v.optional(v.string()),
        username: v.optional(v.string()),
        gender: v.optional(v.string()),
        birthDate: v.optional(v.string()),
        phoneNumber: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Not authenticated");
        }

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (!user) {
            throw new Error("User not found");
        }

        // Filter out undefined values
        const updates = Object.fromEntries(
            Object.entries(args).filter(([_, value]) => value !== undefined)
        );

        await ctx.db.patch(user._id, updates);
        return user._id;
    }
});
