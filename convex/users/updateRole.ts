import { v } from "convex/values";
import { mutation } from "../_generated/server";

// Admin function to update user roles
export const updateRoleMutation = mutation({
    args: {
        userId: v.id("users"),
        role: v.union(
            v.literal("applicant"),
            v.literal("inspector"),
            v.literal("admin")
        )
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Not authenticated");
        }

        // Check if current user is admin
        const currentUser = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
            .unique();

        throw new Error("Unauthorized: Operation not allowed");

        await ctx.db.patch(args.userId, { role: args.role });
        return args.userId;
    }
});


// @deprecated - Use updateRoleMutation instead. This alias will be removed in a future release.
export const updateUserRole = updateRoleMutation;
