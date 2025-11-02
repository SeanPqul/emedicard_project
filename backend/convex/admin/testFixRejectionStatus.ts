import { mutation, query } from "../_generated/server";

/**
 * Test function to check current rejection statuses
 * Run this first to see what needs fixing
 */
export const checkRejectionStatuses = query({
  args: {},
  handler: async (ctx) => {
    const documentRejections = await ctx.db
      .query("documentRejectionHistory")
      .collect();

    const needsFixing = documentRejections.filter(
      (r) => r.wasReplaced && r.status !== "resubmitted"
    );

    const needsPending = documentRejections.filter(
      (r) => !r.wasReplaced && (!r.status || r.status === undefined)
    );

    return {
      total: documentRejections.length,
      needsFixingToResubmitted: needsFixing.length,
      needsFixingToPending: needsPending.length,
      needsFixingDetails: needsFixing.map((r) => ({
        _id: r._id,
        wasReplaced: r.wasReplaced,
        currentStatus: r.status,
        replacedAt: r.replacedAt,
      })),
      needsPendingDetails: needsPending.map((r) => ({
        _id: r._id,
        wasReplaced: r.wasReplaced,
        currentStatus: r.status,
      })),
    };
  },
});

/**
 * Fix all rejection statuses where wasReplaced is true but status is wrong
 * NO AUTH CHECK - This is a migration/test function
 */
export const fixAllRejectionStatuses = mutation({
  args: {},
  handler: async (ctx) => {
    let fixedToResubmitted = 0;
    let fixedToPending = 0;

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
        fixedToResubmitted++;
      }
      // If wasReplaced is false and status is undefined/null, set to "pending"
      else if (
        !rejection.wasReplaced &&
        (!rejection.status || rejection.status === undefined)
      ) {
        await ctx.db.patch(rejection._id, {
          status: "pending",
        });
        fixedToPending++;
      }
    }

    // Fix payment rejection history
    const paymentRejections = await ctx.db
      .query("paymentRejectionHistory")
      .collect();

    for (const rejection of paymentRejections) {
      if (rejection.wasReplaced && rejection.status !== "resubmitted") {
        await ctx.db.patch(rejection._id, {
          status: "resubmitted",
        });
        fixedToResubmitted++;
      } else if (
        !rejection.wasReplaced &&
        (!rejection.status || rejection.status === undefined)
      ) {
        await ctx.db.patch(rejection._id, {
          status: "pending",
        });
        fixedToPending++;
      }
    }

    return {
      success: true,
      fixedToResubmitted,
      fixedToPending,
      total: fixedToResubmitted + fixedToPending,
    };
  },
});
