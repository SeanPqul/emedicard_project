import { v } from "convex/values";
import { mutation } from "../_generated/server";

export const createApplicationMutation = mutation({
  args: {
    applicationType: v.union(v.literal("New"), v.literal("Renew")),
    jobCategoryId: v.id("jobCategories"),
    position: v.string(),
    organization: v.string(),
    civilStatus: v.string(),
    firstName: v.optional(v.string()),
    middleName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    suffix: v.optional(v.string()),
    age: v.optional(v.number()),
    nationality: v.optional(v.string()),
    gender: v.optional(v.union(v.literal("Male"), v.literal("Female"), v.literal("Other"))),
    securityGuard: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      throw new Error("User not found. Please make sure your profile is set up.");
    }

    const applicationId = await ctx.db.insert("applications", {
      userId: user._id,
      applicationType: args.applicationType,
      jobCategoryId: args.jobCategoryId,
      position: args.position,
      organization: args.organization,
      civilStatus: args.civilStatus,
      firstName: args.firstName,
      middleName: args.middleName,
      lastName: args.lastName,
      suffix: args.suffix,
      age: args.age,
      nationality: args.nationality,
      gender: args.gender,
      securityGuard: args.securityGuard ?? undefined,
      applicationStatus: "Draft", // Start as Draft until user submits
    });

    return applicationId;
  },
});
