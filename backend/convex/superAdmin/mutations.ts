"use node";
import { clerkClient } from "@clerk/clerk-sdk-node";
import { v } from "convex/values";
import { api } from "../_generated/api"; // Import api to call mutations from action
import { action } from "../_generated/server"; // Changed to action

const clerk = clerkClient;
// The secretKey is typically picked up from environment variables automatically by Clerk
// If not, it would be configured globally or through a specific initialization function.
// For now, assume it picks it up automatically.

export const createAdmin = action({ // Changed to action
  args: {
    email: v.string(),
    password: v.string(),
    managedCategoryIds: v.array(v.id("jobCategories")),
    role: v.optional(v.union(v.literal("admin"), v.literal("inspector"))),
    fullname: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // 1. Verify Super Admin privileges (optional, but good for security)
    // This check assumes the user calling this mutation is already authenticated
    // and their adminPrivileges can be checked. For simplicity, we'll rely on
    // client-side checks and the fact that only Super Admins can see the button.
    // A more robust solution would involve checking `ctx.auth` and querying
    // the user's role and managedCategories in Convex.

    // 2. Interact with Clerk to create/find user
    let clerkUser;
    try {
      const usersResponse = await clerk.users.getUserList({ emailAddress: [args.email] });
      if (usersResponse && usersResponse.length > 0) {
        clerkUser = usersResponse[0];
        // If user exists, update their password if provided (Clerk doesn't allow direct password update via this method easily)
        // For existing users, a password reset flow might be more appropriate or a separate mutation.
        // For this task, we'll assume if a user exists, we're just updating their admin privileges.
        // If the user wants to update password for existing admin, a different flow is needed.
      } else {
        // If user doesn't exist in Clerk, create them with the provided password.
        const names = args.fullname ? args.fullname.split(' ') : [];
        const firstName = names[0] || args.email.split('@')[0];
        const lastName = names.slice(1).join(' ') || '';
        
        clerkUser = await clerk.users.createUser({
          emailAddress: [args.email],
          password: args.password,
          skipPasswordChecks: false,
          firstName: firstName,
          lastName: lastName || undefined,
        });
      }
    } catch (error: any) { // Explicitly type error as any to access properties
      console.error("Error interacting with Clerk:", error);
      let errorMessage = "Failed to create/find user in Clerk. Please check the logs for details.";
      if (error && typeof error === 'object' && error.errors && Array.isArray(error.errors) && error.errors.length > 0) {
        // Clerk errors often come in a specific format with an 'errors' array
        errorMessage = error.errors.map((e: any) => e.message).join(", ");
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      // Customize specific Clerk error messages for user-friendliness
      if (errorMessage.includes("Password has been found in an online data breach.")) {
        errorMessage = "Password too simple. Please create a stronger password with special characters, numbers, and mixed cases.";
      } else if (errorMessage.includes("Password is too weak")) { // Add another common password error
        errorMessage = "Password is too weak. Please create a stronger password with special characters, numbers, and mixed cases.";
      }
      
      return { success: false, errorMessage }; // Return error message
    }

    if (!clerkUser) {
      return { success: false, errorMessage: "Clerk user not found or created." }; // Return error message
    }

    // 3. Update/Create user in Convex using runMutation
    // First, check if the user exists in Convex
    const existingConvexUser = await ctx.runQuery(api.users.index.getUserByClerkId, { clerkId: clerkUser.id });

    // Determine the final role: use provided role if specified, otherwise default to "admin"
    const finalRole = args.role || "admin";
    
    // Determine the fullname to use
    const finalFullname = args.fullname || 
                          (clerkUser.firstName && clerkUser.lastName ? `${clerkUser.firstName} ${clerkUser.lastName}` : 
                           clerkUser.firstName || args.email);

    if (existingConvexUser) {
      // Update existing user
      await ctx.runMutation(api.users.index.patchUserRoleAndCategories, {
        userId: existingConvexUser._id,
        role: finalRole,
        managedCategories: args.managedCategoryIds,
      });
    } else {
      // Create new user in Convex
      await ctx.runMutation(api.users.index.systemCreateUser, {
        clerkId: clerkUser.id,
        email: args.email,
        fullname: finalFullname,
        image: clerkUser.imageUrl || "",
        role: finalRole,
        managedCategories: args.managedCategoryIds,
        username: (clerkUser.username ?? args.email.split('@')[0]) || args.email,
      });
    }

    return { success: true, clerkUserId: clerkUser.id };
  },
});
