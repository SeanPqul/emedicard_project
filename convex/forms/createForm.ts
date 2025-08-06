import { v } from "convex/values";
import { mutation } from "../_generated/server";

export const createForm = mutation({
  args: {
    applicationType: v.union(v.literal("New"), v.literal("Renew")),
    jobCategory: v.id("jobCategory"),
    position: v.string(),
    organization: v.string(),
    civilStatus: v.string(),
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

    const formId = await ctx.db.insert("forms", {
      userId: user._id,
      applicationType: args.applicationType,
      jobCategory: args.jobCategory,
      position: args.position,
      organization: args.organization,
      civilStatus: args.civilStatus,
      status: "Submitted",
    });

    return formId;
  },
});
