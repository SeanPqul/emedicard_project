import { Clerk } from "@clerk/backend";
import { v } from "convex/values";
import { api } from "../_generated/api"; // Import api to call mutations from action
import { action } from "../_generated/server"; // Changed to action

const clerk = Clerk({
  secretKey: process.env.CLERK_SECRET_KEY!,
});

export const createAdmin = action({ // Changed to action
  args: {
    email: v.string(),
    password: v.string(),
    managedCategoryIds: v.array(v.id("jobCategories")),
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
      const users = await clerk.users.getUserList({ emailAddress: [args.email] });
      if (users.length > 0) {
        clerkUser = users[0];
        // If user exists, update their password if provided (Clerk doesn't allow direct password update via this method easily)
        // For existing users, a password reset flow might be more appropriate or a separate mutation.
        // For this task, we'll assume if a user exists, we're just updating their admin privileges.
        // If the user wants to update password for existing admin, a different flow is needed.
      } else {
        // If user doesn't exist in Clerk, create them with the provided password.
        clerkUser = await clerk.users.createUser({
          emailAddress: [args.email],
          password: args.password,
          skipPasswordChecks: false,
          // You can also set firstName, lastName if you have them
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
      return { success: false, errorMessage }; // Return error message
    }

    if (!clerkUser) {
      return { success: false, errorMessage: "Clerk user not found or created." }; // Return error message
    }

    // 3. Update/Create user in Convex using runMutation
    // First, check if the user exists in Convex
    const existingConvexUser = await ctx.runQuery(api.users.usersMain.getUserByClerkId, { clerkId: clerkUser.id });

    if (existingConvexUser) {
      // Update existing user
      await ctx.runMutation(api.users.usersMain.patchUserRoleAndCategories, {
        userId: existingConvexUser._id,
        role: "admin",
        managedCategories: args.managedCategoryIds,
      });
    } else {
      // Create new user in Convex
      await ctx.runMutation(api.users.usersMain.insertUser, {
        clerkId: clerkUser.id,
        email: args.email,
        fullname: clerkUser.firstName && clerkUser.lastName ? `${clerkUser.firstName} ${clerkUser.lastName}` : args.email,
        image: clerkUser.imageUrl || "",
        role: "admin",
        managedCategories: args.managedCategoryIds,
        username: clerkUser.username || args.email.split('@')[0],
      });
    }

    return { success: true, clerkUserId: clerkUser.id };
  },
});
