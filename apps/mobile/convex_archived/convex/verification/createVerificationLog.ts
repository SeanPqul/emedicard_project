import { mutation } from "../_generated/server";
import { v } from "convex/values";

export const createVerificationLogMutation = mutation({
  args: {
    healthCardId: v.id("healthCards"),
    userAgent: v.optional(v.string()),
    ipAddress: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    try {
      // Validate health card exists
      const healthCard = await ctx.db.get(args.healthCardId);
      if (!healthCard) {
        throw new Error("Health card not found");
      }

      // Check if card is still valid
      const currentTime = Date.now();
      if (healthCard.expiresAt < currentTime) {
        throw new Error("Health card has expired");
      }

      const logId = await ctx.db.insert("verificationLogs", {
        healthCardId: args.healthCardId,
        scannedAt: currentTime,
        userAgent: args.userAgent,
        ipAddress: args.ipAddress,
        verificationStatus: "Success",
      });

      return logId;
    } catch (error) {
      console.error("Error creating verification log:", error);
      throw new Error("Failed to log verification. Please try again.");
    }
  },
});

