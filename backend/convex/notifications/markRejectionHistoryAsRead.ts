import { v } from "convex/values";
import { mutation } from "../_generated/server";

export const markRejectionHistoryAsRead = mutation({
  args: {
    rejectionId: v.id("documentRejectionHistory"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const admin = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!admin) {
      throw new Error("User not found");
    }

    const rejection = await ctx.db.get(args.rejectionId);
    if (!rejection) {
      throw new Error("Rejection history not found");
    }

    // Get current adminReadBy array or initialize empty array
    const currentReadBy = rejection.adminReadBy || [];
    
    // Add admin to the list if not already present
    if (!currentReadBy.includes(admin._id)) {
      await ctx.db.patch(args.rejectionId, {
        adminReadBy: [...currentReadBy, admin._id],
      });
    }

    return { success: true };
  },
});
