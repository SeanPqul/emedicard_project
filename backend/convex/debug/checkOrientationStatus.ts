import { query } from "../_generated/server";
import { v } from "convex/values";

export const check = query({
  args: {
    applicationId: v.id("applications"),
  },
  handler: async (ctx, args) => {
    const application = await ctx.db.get(args.applicationId);
    if (!application) {
      return { error: "Application not found" };
    }

    const jobCategory = await ctx.db.get(application.jobCategoryId);

    return {
      applicationId: application._id,
      applicationStatus: application.applicationStatus,
      orientationCompleted: application.orientationCompleted,
      jobCategoryName: jobCategory?.name,
      requiresOrientation: jobCategory?.requireOrientation,
      // Check if this application SHOULD have orientation validation
      shouldBlock: 
        (jobCategory?.requireOrientation === true || jobCategory?.requireOrientation === "true") &&
        !application.orientationCompleted,
    };
  },
});
