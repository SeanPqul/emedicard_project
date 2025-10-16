// convex/admin/validatePayment.ts
import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { AdminRole } from "../users/roles";

export const validate = mutation({
  args: {
    paymentId: v.id("payments"),
    applicationId: v.id("applications"),
    newStatus: v.union(v.literal("Complete"), v.literal("Failed")),
  },
  handler: async (ctx, args) => {
    const adminCheck = await AdminRole(ctx); // Security check
    if (!adminCheck.isAdmin) throw new Error("Not authorized");

    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Authentication failed.");
    const user = await ctx.db.query("users").withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject)).unique();
    if (!user) throw new Error("Admin user not found.");

    const application = await ctx.db.get(args.applicationId);
    if (!application) throw new Error("Application not found.");

    const applicant = await ctx.db.get(application.userId);
    if (!applicant) throw new Error("Applicant not found.");

    // 1. Update the payment status
    await ctx.db.patch(args.paymentId, {
      paymentStatus: args.newStatus,
      updatedAt: Date.now(),
    });

    // 2. Check if orientation is required for this job category
    const jobCategory = await ctx.db.get(application.jobCategoryId);
    const requiresOrientation = jobCategory?.requireOrientation === 'Yes' || jobCategory?.requireOrientation === true;

    // 3. Update the overall application status to move it to the next step
    let nextApplicationStatus: string;
    if (args.newStatus === "Complete") {
      // If payment is complete, check if orientation is required
      nextApplicationStatus = requiresOrientation ? "For Orientation" : "Under Review";
    } else {
      // Payment failed
      nextApplicationStatus = "Rejected";
    }

    await ctx.db.patch(args.applicationId, {
      applicationStatus: nextApplicationStatus,
      updatedAt: Date.now(),
    });

    // 4. Log admin activity
    const activityType = args.newStatus === 'Failed' ? 'payment_rejection' : 'payment_approval';
    const details = `Payment for application of ${applicant.fullname} was ${args.newStatus.toLowerCase()}.`;

    await ctx.db.insert("adminActivityLogs", {
      adminId: user._id,
      activityType: activityType,
      details: details,
      timestamp: Date.now(),
      applicationId: args.applicationId,
      jobCategoryId: application.jobCategoryId,
    });

    return { success: true };
  },
});
