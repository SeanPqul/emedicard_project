import { mutation } from "./_generated/server";

// Migration to add role field to existing users
export const migrateUsersAddRole = mutation({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    
    let migratedCount = 0;
    
    for (const user of users) {
      // If user doesn't have a role field, add it with default 'applicant'
      if (!user.role) {
        await ctx.db.patch(user._id, { role: "applicant" });
        migratedCount++;
      }
    }
    
    return {
      success: true,
      message: `Migrated ${migratedCount} users to have role field`,
      totalUsers: users.length,
      migratedCount
    };
  }
});

// Note: Admin functionality is handled via separate web interface

// Helper function to set user role (for admin use)
export const setUserRole = mutation({
  args: {
    clerkId: String,
    role: String
  },
  handler: async (ctx, args) => {
    // Validate role
    if (!["applicant", "inspector"].includes(args.role)) {
      throw new Error("Invalid role. Must be 'applicant' or 'inspector'");
    }
    
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();
    
    if (!user) {
      throw new Error("User not found");
    }
    
    await ctx.db.patch(user._id, { role: args.role as "applicant" | "inspector" });
    
    return {
      success: true,
      message: `User ${user.fullname} role updated to ${args.role}`,
      userId: user._id,
      newRole: args.role
    };
  }
});
