import { mutation } from "../_generated/server";
import { v } from "convex/values";

// Log verification attempt (successful or failed)
export const logVerificationAttemptMutation = mutation({
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
          .withIndex("by_verification_token", (q) => q.eq("verificationToken", args.verificationToken))
          .unique();

        if (healthCard) {
          return await ctx.db.insert("verificationLogs", {
            healthCardId: healthCard._id,
            scannedAt: Date.now(),
            userAgent: args.userAgent,
            ipAddress: args.ipAddress,
            verificationStatus: "Success",
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


// @deprecated - Use logVerificationAttemptMutation instead. This alias will be removed in a future release.
export const logVerificationAttempt = logVerificationAttemptMutation;
