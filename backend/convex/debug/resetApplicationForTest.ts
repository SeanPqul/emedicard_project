import { mutation } from "../_generated/server";
import { v } from "convex/values";

export const reset = mutation({
  args: {
    applicationId: v.id("applications"),
  },
  handler: async (ctx, args) => {
    const application = await ctx.db.get(args.applicationId);
    if (!application) {
      throw new Error("Application not found");
    }

    // Reset to For Document Verification status
    // Clear orientationCompleted so we can test the validation
    await ctx.db.patch(args.applicationId, {
      applicationStatus: "For Document Verification",
      orientationCompleted: undefined, // or false
      updatedAt: Date.now(),
    });

    return {
      success: true,
      message: "Application reset to 'For Document Verification' with orientationCompleted = undefined",
      applicationId: args.applicationId,
    };
  },
});
