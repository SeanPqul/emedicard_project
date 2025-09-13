import { mutation } from "../_generated/server";
import { v } from "convex/values";

export const updateStatus = mutation({
  args: {
    applicationId: v.id("applications"),
    newStatus: v.string(), // Add newStatus argument
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
