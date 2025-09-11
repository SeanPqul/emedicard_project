// convex/users/roles.ts

import { query, QueryCtx, MutationCtx } from "../_generated/server";

export const AdminRole = async (ctx: QueryCtx | MutationCtx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
        return { isAdmin: false, managedCategories: [] }; // Return empty array for non-users
    }

    const user = await ctx.db
        .query("users")
        .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
        .unique();

    // If the user isn't in our DB yet, or their role is not admin, they have no privileges.
    if (!user || user.role !== "admin") {
        return { isAdmin: false, managedCategories: [] };
    }

    // THIS IS THE KEY: If the `managedCategories` field is unset (null/undefined),
    // it means they are a Super Admin. We will represent this with the string "all".
    if (!user.managedCategories) {
        return {
            isAdmin: true,
            managedCategories: "all",
        };
    }

    // Otherwise, they are a regular admin. Return the array of categories they manage.
    return {
        isAdmin: true,
        managedCategories: user.managedCategories,
    };
};

// This is the PUBLIC QUERY that your dashboard will call.
export const getAdminPrivileges = query({
    args: {},
    handler: async (ctx) => {
        return await AdminRole(ctx);
    }
});