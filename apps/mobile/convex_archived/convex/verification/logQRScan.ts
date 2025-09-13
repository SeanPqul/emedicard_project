import { mutation } from "../_generated/server";
import { v } from "convex/values";

// Enhanced QR scanning with location and device tracking
export const logQRScanMutation = mutation({
  args: {
    verificationToken: v.string(),
    scanLocation: v.optional(v.object({
      latitude: v.number(),
      longitude: v.number(),
      address: v.optional(v.string()),
    })),
    deviceInfo: v.optional(v.object({
      platform: v.string(),
      deviceId: v.string(),
      appVersion: v.string(),
    })),
    userAgent: v.optional(v.string()),
    ipAddress: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    try {
      // Find health card by verification token
      const healthCard = await ctx.db
        .query("healthCards")
        .withIndex("by_verification_token", (q) => q.eq("verificationToken", args.verificationToken))
        .unique();

      if (!healthCard) {
        throw new Error("Invalid verification token");
      }

      // Check if card is still valid
      const currentTime = Date.now();
      if (healthCard.expiresAt < currentTime) {
        throw new Error("Health card has expired");
      }

      // Create comprehensive verification log
      const logId = await ctx.db.insert("verificationLogs", {
        healthCardId: healthCard._id,
        scannedAt: currentTime,
        userAgent: args.userAgent,
        ipAddress: args.ipAddress,
        verificationStatus: "Success",
      });

      // Get application and user details for the response
      const application = await ctx.db.get(healthCard.applicationId);
      const user = application ? await ctx.db.get(application.userId) : null;
      const jobCategory = application ? await ctx.db.get(application.jobCategoryId) : null;

      return {
        logId,
        healthCard: {
          ...healthCard,
          user,
          application,
          jobCategory,
        },
        scanInfo: {
          scannedAt: currentTime,
          location: args.scanLocation,
          device: args.deviceInfo,
        },
      };
    } catch (error) {
      console.error("Error logging QR scan:", error);
      throw new Error(error instanceof Error ? error.message : "Failed to verify QR code. Please try again.");
    }
  },
});


