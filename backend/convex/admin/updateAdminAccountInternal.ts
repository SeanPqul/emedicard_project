import { v } from "convex/values";
import { internalMutation, mutation } from "../_generated/server";
import { AdminRole } from "../users/roles";

// Internal mutation to check username availability
export const checkUsernameAvailable = internalMutation({
  args: {
    username: v.string(),
    currentUserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const existingUser = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("username"), args.username))
      .first();

    // Return true if username is available (no existing user or it's the current user)
    return !existingUser || existingUser._id === args.currentUserId;
  },
});

// Internal mutation to update the database
export const updateAccountInternal = internalMutation({
  args: {
    userId: v.id("users"),
    fullname: v.optional(v.string()),
    username: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Build update object
    const updates: { fullname?: string; username?: string; updatedAt: number } = {
      updatedAt: Date.now(),
    };

    if (args.fullname) updates.fullname = args.fullname;
    if (args.username) updates.username = args.username;

    // Update the admin user
    await ctx.db.patch(args.userId, updates);

    // Get updated user for activity log
    const adminUser = await ctx.db.get(args.userId);
    if (!adminUser) return;

    // Log the account update activity
    await ctx.db.insert("adminActivityLogs", {
      adminId: args.userId,
      activityType: "account_update",
      details: `Updated account details. ${args.fullname ? `New name: ${args.fullname}. ` : ""}${args.username ? `New username: ${args.username}.` : ""}`,
      timestamp: Date.now(),
      jobCategoryId: adminUser.managedCategories?.[0], // Use first managed category if available
    });
  },
});

// Legacy mutation (kept for backwards compatibility, but deprecated - use updateAccountWithClerk instead)
export const updateAccount = mutation({
  args: {
    fullname: v.optional(v.string()),
    username: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Ensure user is authenticated
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Authentication failed.");

    // Ensure user is an admin
    const adminCheck = await AdminRole(ctx);
    if (!adminCheck.isAdmin) {
      throw new Error("You do not have permission to update admin account.");
    }

    // Get the current admin user
    const adminUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!adminUser) throw new Error("Admin user not found.");

    // Validate that at least one field is provided
    if (!args.fullname && !args.username) {
      throw new Error("Please provide at least one field to update.");
    }

    // Check if username is already taken (if username is being updated)
    if (args.username && args.username !== adminUser.username) {
      const existingUser = await ctx.db
        .query("users")
        .filter((q) => q.eq(q.field("username"), args.username))
        .first();

      if (existingUser && existingUser._id !== adminUser._id) {
        throw new Error("Username is already taken.");
      }
    }

    // Build update object
    const updates: { fullname?: string; username?: string; updatedAt: number } = {
      updatedAt: Date.now(),
    };

    if (args.fullname) updates.fullname = args.fullname;
    if (args.username) updates.username = args.username;

    // Update the admin user
    await ctx.db.patch(adminUser._id, updates);

    // Log the account update activity
    await ctx.db.insert("adminActivityLogs", {
      adminId: adminUser._id,
      activityType: "account_update",
      details: `Updated account details. ${args.fullname ? `New name: ${args.fullname}. ` : ""}${args.username ? `New username: ${args.username}.` : ""}`,
      timestamp: Date.now(),
      jobCategoryId: adminUser.managedCategories?.[0], // Use first managed category if available
    });

    return { success: true, message: "Account updated successfully." };
  },
});
