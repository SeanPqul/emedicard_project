import { v } from "convex/values";
import { mutation } from "../_generated/server";

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
