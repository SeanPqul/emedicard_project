import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const createVerificationLog = mutation({
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
      });

      return logId;
    } catch (error) {
      console.error("Error creating verification log:", error);
      throw new Error("Failed to log verification. Please try again.");
    }
  },
});

// Enhanced QR scanning with location and device tracking
export const logQRScan = mutation({
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
        .withIndex("by_verificationToken", (q) => q.eq("verificationToken", args.verificationToken))
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
      });

      // Get form and user details for the response
      const form = await ctx.db.get(healthCard.formId);
      const user = form ? await ctx.db.get(form.userId) : null;
      const jobCategory = form ? await ctx.db.get(form.jobCategory) : null;

      return {
        logId,
        healthCard: {
          ...healthCard,
          user,
          form,
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

// Log verification attempt (successful or failed)
export const logVerificationAttempt = mutation({
  args: {
    verificationToken: v.string(),
    success: v.boolean(),
    errorMessage: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    ipAddress: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    try {
      if (args.success) {
        // If successful, create regular verification log
        const healthCard = await ctx.db
          .query("healthCards")
          .withIndex("by_verificationToken", (q) => q.eq("verificationToken", args.verificationToken))
          .unique();

        if (healthCard) {
          return await ctx.db.insert("verificationLogs", {
            healthCardId: healthCard._id,
            scannedAt: Date.now(),
            userAgent: args.userAgent,
            ipAddress: args.ipAddress,
          });
        }
      }

      // For failed attempts, we still want to log but without healthCardId
      // This would require a separate table for failed attempts in a real app
      console.log("Verification failed:", {
        token: args.verificationToken,
        error: args.errorMessage,
        timestamp: Date.now(),
      });

      return null;
    } catch (error) {
      console.error("Error logging verification attempt:", error);
      return null; // Don't throw error for logging failures
    }
  },
});

export const getVerificationLogsByHealthCard = query({
  args: { healthCardId: v.id("healthCards") },
  handler: async (ctx, args) => {
    const logs = await ctx.db
      .query("verificationLogs")
      .withIndex("by_healthcard", (q) => q.eq("healthCardId", args.healthCardId))
      .order("desc")
      .collect();

    return logs;
  },
});

export const getVerificationLogsByUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      return [];
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

    const cardIds = healthCards.filter(Boolean).map((card) => card!._id);

    const allLogs = await Promise.all(
      cardIds.map(async (cardId) => {
        const logs = await ctx.db
          .query("verificationLogs")
          .withIndex("by_healthcard", (q) => q.eq("healthCardId", cardId))
          .collect();
        return logs;
      })
    );

    const logsWithDetails = await Promise.all(
      allLogs.flat().map(async (log) => {
        const healthCard = await ctx.db.get(log.healthCardId);
        const form = healthCard ? await ctx.db.get(healthCard.formId) : null;
        const jobCategory = form ? await ctx.db.get(form.jobCategory) : null;
        return {
          ...log,
          healthCard,
          form,
          jobCategory,
        };
      })
    );

    return logsWithDetails.sort((a, b) => b.scannedAt - a.scannedAt);
  },
});

export const getVerificationStats = query({
  args: { healthCardId: v.id("healthCards") },
  handler: async (ctx, args) => {
    const logs = await ctx.db
      .query("verificationLogs")
      .withIndex("by_healthcard", (q) => q.eq("healthCardId", args.healthCardId))
      .collect();

    const totalScans = logs.length;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayScans = logs.filter(log => log.scannedAt >= today.getTime()).length;

    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    lastWeek.setHours(0, 0, 0, 0);
    const weekScans = logs.filter(log => log.scannedAt >= lastWeek.getTime()).length;

    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    lastMonth.setHours(0, 0, 0, 0);
    const monthScans = logs.filter(log => log.scannedAt >= lastMonth.getTime()).length;

    return {
      totalScans,
      todayScans,
      weekScans,
      monthScans,
      lastScanned: totalScans > 0 ? Math.max(...logs.map(log => log.scannedAt)) : null,
    };
  },
});
