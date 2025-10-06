import { mutation } from "../_generated/server";
import { v } from "convex/values";

export const updateStatus = mutation({
  args: {
    applicationId: v.id("applications"),
    newStatus: v.union(
      v.literal("Draft"),
      v.literal("Pending Payment"),
      v.literal("Submitted"),
      v.literal("Documents Need Revision"),
      v.literal("Under Review"),
      v.literal("For Payment Validation"),
      v.literal("For Document Verification"),
      v.literal("For Orientation"),
      v.literal("Pending"),
      v.literal("Cancelled"),
      v.literal("Approved"),
      v.literal("Rejected")
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
