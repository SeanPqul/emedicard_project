import { v } from "convex/values";
import { mutation } from "../_generated/server";

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
