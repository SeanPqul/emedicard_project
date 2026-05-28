import { query } from "../_generated/server";

export const getPendingUsers = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");
    
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
      
    if (!user || (user.role !== "admin" && user.role !== "system_admin")) {
        throw new Error("Permission denied");
    }

    const users = await ctx.db.query("users").collect();
    return users.filter(u => u.registrationStatus === 'pending');
  }
});
