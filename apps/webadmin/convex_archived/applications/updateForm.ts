import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { Doc } from "../_generated/dataModel";

export const updateFormMutation = mutation({
  args: {
    formId: v.id("applications"),
    applicationType: v.optional(v.union(v.literal("New"), v.literal("Renew"))),
    jobCategoryId: v.optional(v.id("jobCategories")),
    position: v.optional(v.string()),
    organization: v.optional(v.string()),
    civilStatus: v.optional(v.string()),
    applicationStatus: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { formId, ...updates } = args;
    
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const form = await ctx.db.get(formId) as Doc<"applications"> | null;
    if (!form) {
      throw new Error("Form not found");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user || form.userId !== user._id) {
      throw new Error("Not authorized to update this form");
    }

    await ctx.db.patch(formId, updates);
    return formId;
  },
});
