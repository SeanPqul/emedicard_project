import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { Id } from "../_generated/dataModel";

export const markRejectionHistoryAsRead = mutation({
  args: {
    rejectionId: v.union(
      v.id("documentRejectionHistory"),
      v.id("paymentRejectionHistory")
    ),
    rejectionType: v.union(
      v.literal("document"),
      v.literal("payment")
    ),
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

    // Get the rejection record from the appropriate table based on type
    let currentReadBy: Id<"users">[] = [];
    
    if (args.rejectionType === "document") {
      const rejection = await ctx.db.get(args.rejectionId as Id<"documentRejectionHistory">);
      if (!rejection) {
        throw new Error("Document rejection history not found");
      }
      currentReadBy = rejection.adminReadBy || [];
      
      // Add admin to the list if not already present
      if (!currentReadBy.includes(admin._id)) {
        await ctx.db.patch(args.rejectionId as Id<"documentRejectionHistory">, {
          adminReadBy: [...currentReadBy, admin._id],
        });
      }
    } else {
      const rejection = await ctx.db.get(args.rejectionId as Id<"paymentRejectionHistory">);
      if (!rejection) {
        throw new Error("Payment rejection history not found");
      }
      currentReadBy = rejection.adminReadBy || [];
      
      // Add admin to the list if not already present
      if (!currentReadBy.includes(admin._id)) {
        await ctx.db.patch(args.rejectionId as Id<"paymentRejectionHistory">, {
          adminReadBy: [...currentReadBy, admin._id],
        });
      }
    }

    return { success: true };
  },
});
