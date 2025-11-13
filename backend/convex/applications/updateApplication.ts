import { v } from "convex/values";
import { mutation } from "../_generated/server";

export const updateApplicationMutation = mutation({
  args: {
    applicationId: v.id("applications"),
    applicationType: v.optional(v.union(v.literal("New"), v.literal("Renew"))),
    jobCategoryId: v.optional(v.id("jobCategories")),
    position: v.optional(v.string()),
    organization: v.optional(v.string()),
    civilStatus: v.optional(v.string()),
    firstName: v.optional(v.string()),
    middleName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    suffix: v.optional(v.string()),
    age: v.optional(v.number()),
    nationality: v.optional(v.string()),
    gender: v.optional(v.union(v.literal("Male"), v.literal("Female"), v.literal("Other"))),
    applicationStatus: v.optional(v.union(
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
    )),
  },
  handler: async (ctx, args) => {
    const { applicationId, ...updates } = args;
    
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const application = await ctx.db.get(applicationId);
    if (!application) {
      throw new Error("Application not found");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user || application.userId !== user._id) {
      throw new Error("Not authorized to update this application");
    }

    await ctx.db.patch(applicationId, updates);
    return applicationId;
  },
});
