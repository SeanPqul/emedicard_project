import { v } from "convex/values";
import { mutation } from "../_generated/server";

export const updateUserStatus = mutation({
  args: {
    userId: v.id("users"),
    status: v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user || (user.role !== "admin" && user.role !== "system_admin")) {
        throw new Error("Permission denied");
    }

    await ctx.db.patch(args.userId, {
      registrationStatus: args.status,
    });
  },
});
