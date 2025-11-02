import { mutation } from "../../_generated/server";

/**
 * Migration: Fix rejection status for records where wasReplaced is true but status is incorrect
 * 
 * This fixes a bug where rejection records that were resubmitted have wasReplaced: true
 * but status is still "pending" or undefined instead of "resubmitted"
 */
export const fixRejectionStatus = mutation({
  args: {},
  handler: async (ctx) => {
    // Check admin permissions
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user || user.role !== "admin") {
      throw new Error("Insufficient permissions. Only admins can run migrations.");
    }

    let fixedCount = 0;
    let skippedCount = 0;

    // Fix document rejection history
    const documentRejections = await ctx.db
      .query("documentRejectionHistory")
      .collect();

    for (const rejection of documentRejections) {
      // If wasReplaced is true but status is not "resubmitted", fix it
      if (rejection.wasReplaced && rejection.status !== "resubmitted") {
        await ctx.db.patch(rejection._id, {
          status: "resubmitted",
        });
        fixedCount++;
      } 
      // If wasReplaced is false and status is undefined or null, set to "pending"
      else if (!rejection.wasReplaced && (!rejection.status || rejection.status === undefined)) {
        await ctx.db.patch(rejection._id, {
          status: "pending",
        });
        fixedCount++;
      } else {
        skippedCount++;
      }
    }

    // Fix payment rejection history
    const paymentRejections = await ctx.db
      .query("paymentRejectionHistory")
      .collect();

    for (const rejection of paymentRejections) {
      // If wasReplaced is true but status is not "resubmitted", fix it
      if (rejection.wasReplaced && rejection.status !== "resubmitted") {
        await ctx.db.patch(rejection._id, {
          status: "resubmitted",
        });
        fixedCount++;
      }
      // If wasReplaced is false and status is undefined or null, set to "pending"
      else if (!rejection.wasReplaced && (!rejection.status || rejection.status === undefined)) {
        await ctx.db.patch(rejection._id, {
          status: "pending",
        });
        fixedCount++;
      } else {
        skippedCount++;
      }
    }

    return {
      success: true,
      message: `Fixed ${fixedCount} rejection records. Skipped ${skippedCount} records that were already correct.`,
      fixedCount,
      skippedCount,
    };
  },
});
