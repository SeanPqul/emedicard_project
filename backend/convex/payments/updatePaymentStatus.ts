import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { AdminRole } from "../users/roles"; // Import AdminRole

export const updatePaymentStatusMutation = mutation({
  args: {
    paymentId: v.id("payments"),
    paymentStatus: v.union(v.literal("Pending"), v.literal("Complete"), v.literal("Failed")),
  },
  handler: async (ctx, { paymentId, paymentStatus }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Authentication failed.");

    // Ensure the user has admin privileges
    const adminCheck = await AdminRole(ctx);
    if (!adminCheck.isAdmin) {
      throw new Error("You do not have permission to update payment status.");
    }

    const user = await ctx.db.query("users").withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject)).unique();
    if (!user) throw new Error("Admin user not found.");

    const payment = await ctx.db.get(paymentId);
    if (!payment) throw new Error("Payment not found");

    const application = await ctx.db.get(payment.applicationId);
    if (!application) throw new Error("Application not found for payment.");

    const applicant = await ctx.db.get(application.userId);
    if (!applicant) throw new Error("Applicant not found.");

    await ctx.db.patch(paymentId, { paymentStatus, updatedAt: Date.now() });

    // Log admin activity for payment status update
    await ctx.db.insert("adminActivityLogs", {
      adminId: user._id,
      adminUsername: user.username,
      adminEmail: user.email,
      action: `updated payment status to ${paymentStatus}`,
      comment: `Payment for ${applicant.fullname}'s application was updated to ${paymentStatus}.`,
      timestamp: Date.now(),
      applicationId: application._id,
      jobCategoryId: application.jobCategoryId, // Include jobCategoryId
    });

    return paymentId;
  },
});


// @deprecated - Use updatePaymentStatusMutation instead. This alias will be removed in a future release.
export const updatePaymentStatus = updatePaymentStatusMutation;
