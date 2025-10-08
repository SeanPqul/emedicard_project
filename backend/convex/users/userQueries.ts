import { query } from "../_generated/server";
import { v } from "convex/values";

// Internal query to get user by ID (for HTTP endpoint)
export const getUserById = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      return null;
    }
    
    return {
      email: user.email,
      role: user.role,
      fullname: user.fullname,
      username: user.username,
    };
  },
});
