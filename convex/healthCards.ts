import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getUserHealthCards = query({
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
      throw new Error("User not found");
    }

    const userForms = await ctx.db
      .query("forms")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    const formIds = userForms.map((form) => form._id);

    const healthCards = await Promise.all(
      formIds.map(async (formId) => {
        const card = await ctx.db
          .query("healthCards")
          .withIndex("by_form", (q) => q.eq("formId", formId))
          .unique();
        return card;
      })
    );

    const cardsWithDetails = await Promise.all(
      healthCards.filter(Boolean).map(async (card) => {
        const form = await ctx.db.get(card!.formId);
        const jobCategory = form ? await ctx.db.get(form.jobCategory) : null;
        return {
          ...card,
          form,
          jobCategory,
        };
      })
    );

    return cardsWithDetails;
  },
});

export const issueHealthCard = mutation({
  args: {
    formId: v.id("forms"),
    cardUrl: v.string(),
    issuedAt: v.number(),
    expiresAt: v.number(),
    verificationToken: v.string(),
  },
  handler: async (ctx, args) => {
    const healthCardId = await ctx.db.insert("healthCards", {
      formId: args.formId,
      cardUrl: args.cardUrl,
      issuedAt: args.issuedAt,
      expiresAt: args.expiresAt,
      verificationToken: args.verificationToken,
    });

    return healthCardId;
  },
});

export const getHealthCardByVerificationToken = query({
  args: { verificationToken: v.string() },
  handler: async (ctx, args) => {
    const healthCard = await ctx.db
      .query("healthCards")
      .withIndex("by_verificationToken", (q) => q.eq("verificationToken", args.verificationToken))
      .unique();

    if (!healthCard) {
      throw new Error("Health card not found");
    }

    const form = await ctx.db.get(healthCard.formId);
    const user = form ? await ctx.db.get(form.userId) : null;
    const jobCategory = form ? await ctx.db.get(form.jobCategory) : null;

    return {
      ...healthCard,
      form,
      user,
      jobCategory,
    };
  },
});

export const getHealthCardByFormId = query({
  args: { formId: v.id("forms") },
  handler: async (ctx, args) => {
    const healthCard = await ctx.db
      .query("healthCards")
      .withIndex("by_form", (q) => q.eq("formId", args.formId))
      .unique();

    return healthCard;
  },
});

export const updateHealthCard = mutation({
  args: {
    healthCardId: v.id("healthCards"),
    cardUrl: v.optional(v.string()),
    expiresAt: v.optional(v.number()),
    verificationToken: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { healthCardId, ...updates } = args;
    
    const healthCard = await ctx.db.get(healthCardId);
    if (!healthCard) {
      throw new Error("Health card not found");
    }

    await ctx.db.patch(healthCardId, updates);
    return healthCardId;
  },
});
