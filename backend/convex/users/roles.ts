// convex/users/roles.ts

import { query, QueryCtx, MutationCtx } from "../_generated/server";

export const AdminRole = async (ctx: QueryCtx | MutationCtx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
        return { isAdmin: false, isSuperAdmin: false, managedCategories: [], isReadOnlyOversight: false };
    }

    const user = await ctx.db
        .query("users")
        .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
        .unique();

    // If the user isn't in our DB yet, they have no privileges
    if (!user) {
        return { isAdmin: false, isSuperAdmin: false, managedCategories: [], isReadOnlyOversight: false };
    }

    // System Administrator - highest privilege level
    // Read-only when viewing admin dashboard (oversight mode)
    if (user.role === "system_admin") {
        return {
            isAdmin: true,
            isSuperAdmin: true,
            managedCategories: "all",
            isReadOnlyOversight: true, // System admins can view but not modify application data
        };
    }

    // Regular Admin - check managed categories
    if (user.role === "admin") {
        // If managedCategories is not set, treat as super admin (backward compatibility)
        if (!user.managedCategories) {
            return {
                isAdmin: true,
                isSuperAdmin: true,
                managedCategories: "all",
                isReadOnlyOversight: false,
            };
        }
        // Regular admin with specific categories
        return {
            isAdmin: true,
            isSuperAdmin: false,
            managedCategories: user.managedCategories,
            isReadOnlyOversight: false,
        };
    }

    // Not an admin
    return { isAdmin: false, isSuperAdmin: false, managedCategories: [], isReadOnlyOversight: false };
};

// This is the PUBLIC QUERY that your dashboard will call.
export const getAdminPrivileges = query({
    args: {},
    handler: async (ctx) => {
        return await AdminRole(ctx);
    }
});