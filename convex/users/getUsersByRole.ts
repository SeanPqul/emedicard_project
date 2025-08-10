import { v } from "convex/values";
import { query } from "../_generated/server";

// Query to get users by role (inspector only - admins should use web platform)
export const getUsersByRoleQuery = query({
    args: {
        role: v.optional(v.union(
            v.literal("applicant"),
            v.literal("inspector"),
            v.literal("admin")
        ))
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Not authenticated");
        }

        // Check if current user exists and get their role
        const currentUser = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (!currentUser) {
            throw new Error("User not found");
        }

        // Only inspectors can access this function from the mobile app
        if (currentUser.role === "admin") {
            throw new Error("Admins should access the web administration panel instead of the mobile app");
        }

        if (currentUser.role !== "inspector") {
            throw new Error("Unauthorized: Only inspectors can access user management");
        }

        // Return users based on requested role
        if (args.role) {
            return await ctx.db
                .query("users")
                .withIndex("by_role", (q) => q.eq("role", args.role!))
                .collect();
        } else {
            // Return all users if no specific role requested
            return await ctx.db.query("users").collect();
        }
    }
});
