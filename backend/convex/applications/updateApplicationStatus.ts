import { mutation } from "../_generated/server";
import { v } from "convex/values";

export const updateStatus = mutation({
  args: {
    applicationId: v.id("applications"),
    newStatus: v.union(
      v.literal("Submitted"),
      v.literal("For Orientation"),
      v.literal("For Document Verification"),
      v.literal("Payment Validation"),
      v.literal("Scheduled"),
      v.literal("Attendance Validation"),
      v.literal("Under Review"),
      v.literal("Approved"),
      v.literal("Rejected"),
      v.literal("Expired")
    ),
  },
  handler: async (ctx, args) => {
    const application = await ctx.db.get(args.applicationId);

    if (!application) {
      throw new Error("Application not found");
    }

    // Update the application status to the newStatus provided
    await ctx.db.patch(args.applicationId, {
      applicationStatus: args.newStatus,
    });
  },
});
