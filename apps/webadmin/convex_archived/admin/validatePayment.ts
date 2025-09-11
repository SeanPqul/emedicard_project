// convex/admin/validatePayment.ts
import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { AdminRole } from "../users/roles";

export const validate = mutation({
  args: {
    paymentId: v.id("payments"),
    applicationId: v.id("applications"),
    newStatus: v.union(v.literal("Complete"), v.literal("Failed")),
  },
  handler: async (ctx, args) => {
    await AdminRole(ctx); // Security check

    // 1. Update the payment status
    await ctx.db.patch(args.paymentId, {
      paymentStatus: args.newStatus,
      updatedAt: Date.now(),
    });

    // 2. Update the overall application status to move it to the next step
    const nextApplicationStatus = args.newStatus === "Complete" 
      ? "For Orientation" 
      : "Rejected"; // Or another status for failed payments

    await ctx.db.patch(args.applicationId, {
      applicationStatus: nextApplicationStatus,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});