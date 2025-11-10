import { v } from "convex/values";
import { mutation } from "../_generated/server";

export const updateHealthCardMutation = mutation({
  args: {
    healthCardId: v.id("healthCards"),
    status: v.optional(v.union(v.literal("active"), v.literal("revoked"), v.literal("expired"))),
    expiryDate: v.optional(v.number()),
    revokedAt: v.optional(v.number()),
    revokedReason: v.optional(v.string()),
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
