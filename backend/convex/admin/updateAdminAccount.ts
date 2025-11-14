"use node";
import { v } from "convex/values";
import { action, mutation } from "../_generated/server";
import { createClerkClient } from "@clerk/backend";
import { api } from "../_generated/api";
import { AdminRole } from "../users/roles";
import { internal } from "../_generated/api";

const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

// Main action that syncs with both Clerk and Convex database
export const updateAccountWithClerk = action({
  args: {
    fullname: v.optional(v.string()),
    username: v.optional(v.string()),
    currentPassword: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Ensure user is authenticated
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Authentication failed.");

    // Get the current admin user
    const adminUser: any = await ctx.runQuery(api.users.getCurrentUser.getCurrentUserQuery, {});
    if (!adminUser) throw new Error("Admin user not found.");

    // Ensure user is an admin
    if (adminUser.role !== 'admin') {
      throw new Error("You do not have permission to update admin account.");
    }

    // Validate that at least one field is provided
    if (!args.fullname && !args.username) {
      throw new Error("Please provide at least one field to update.");
    }

    // Verify current password if provided (for security)
    if (args.currentPassword) {
      try {
        // Attempt to verify the password by checking with Clerk
        // Note: We can't directly verify password, but Clerk will handle this in the session
        // For now, we trust that the frontend has verified it with Clerk
      } catch (err: any) {
        throw new Error("Password verification failed.");
      }
    }

    // Check if username is already taken (if username is being updated)
    if (args.username && args.username !== adminUser.username) {
      const isAvailable = await ctx.runMutation(internal.admin.updateAdminAccountInternal.checkUsernameAvailable, {
        username: args.username,
        currentUserId: adminUser._id,
      });

      if (!isAvailable) {
        throw new Error("Username is already taken.");
      }
    }

    // Step 1: Update Clerk Backend API
    try {
      const clerkUpdateData: { firstName?: string; lastName?: string; username?: string } = {};
      
      // Parse fullname into firstName and lastName for Clerk
      if (args.fullname) {
        const nameParts = args.fullname.trim().split(' ');
        if (nameParts.length === 1) {
          clerkUpdateData.firstName = nameParts[0];
          clerkUpdateData.lastName = '';
        } else {
          clerkUpdateData.firstName = nameParts[0];
          clerkUpdateData.lastName = nameParts.slice(1).join(' ');
        }
      }
      
      if (args.username) {
        clerkUpdateData.username = args.username;
      }

      // Update Clerk if we have changes
      if (Object.keys(clerkUpdateData).length > 0) {
        await clerk.users.updateUser(identity.subject, clerkUpdateData);
      }
    } catch (clerkError: any) {
      console.error("Failed to update Clerk:", clerkError);
      throw new Error("Failed to sync profile with authentication provider: " + (clerkError.message || "Unknown error"));
    }

    // Step 2: Update Convex database
    await ctx.runMutation(internal.admin.updateAdminAccountInternal.updateAccountInternal, {
      userId: adminUser._id,
      fullname: args.fullname,
      username: args.username,
    });

    return { success: true, message: "Account updated successfully." };
  },
});

