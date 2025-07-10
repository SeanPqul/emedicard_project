import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getUserApplications = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      // Return empty array if user doesn't exist in database yet
      return [];
    }

    const applications = await ctx.db
      .query("applicationForms")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    const applicationDetails = await Promise.all(
      applications.map(async (app) => {
        const form = await ctx.db.get(app.formId);
        const jobCategory = form ? await ctx.db.get(form.jobCategory) : null;
        return {
          ...app,
          form,
          jobCategory,
        };
      })
    );

    return applicationDetails;
  },
});

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
    });

    return formId;
  },
});

export const getFormById = query({
  args: { formId: v.id("forms") },
  handler: async (ctx, args) => {
    const form = await ctx.db.get(args.formId);
    if (!form) {
      throw new Error("Form not found");
    }
    
    const jobCategory = await ctx.db.get(form.jobCategory);
    return {
      ...form,
      jobCategory,
    };
  },
});

export const updateForm = mutation({
  args: {
    formId: v.id("forms"),
    applicationType: v.optional(v.union(v.literal("New"), v.literal("Renew"))),
    jobCategory: v.optional(v.id("jobCategory")),
    position: v.optional(v.string()),
    organization: v.optional(v.string()),
    civilStatus: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { formId, ...updates } = args;
    
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const form = await ctx.db.get(formId);
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
