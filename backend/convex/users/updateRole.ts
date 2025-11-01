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

        if (!currentUser) {
            throw new Error("User not found");
        }

        // Only admins can update roles
        if (currentUser.role !== "admin") {
            throw new Error("Unauthorized: Only admins can update user roles");
        }

        // Prevent self-demotion (admin removing their own admin role)
        if (currentUser._id === args.userId && args.role !== "admin") {
            throw new Error("Cannot remove your own admin privileges");
        }

        // Update user role
        await ctx.db.patch(args.userId, { 
            role: args.role,
            updatedAt: Date.now()
        });

        // Log the role change for audit trail
        await ctx.db.insert("adminActivityLogs", {
            adminId: currentUser._id,
            activityType: "role_update",
            details: `Changed user role to ${args.role}`,
            adminUsername: currentUser.username,
            adminEmail: currentUser.email,
            action: "update_role",
            timestamp: Date.now(),
        });

        return args.userId;
    }
});


