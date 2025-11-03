import { query } from "../_generated/server";
import { v } from "convex/values";

/**
 * Get user's orientation booking for a specific application
 * Returns the booked session if exists
 *
 * UPDATED: Uses unified orientationBookings table
 */
export const getUserOrientationSessionQuery = query({
  args: {
    applicationId: v.id("applications")
  },
  handler: async (ctx, { applicationId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized: User must be authenticated");
    }

    // Get user's ACTIVE booking for this application
    // Include scheduled, checked-in, and completed (not cancelled or missed)
    const booking = await ctx.db
      .query("orientationBookings")
      .withIndex("by_application", (q) =>
        q.eq("applicationId", applicationId)
      )
      .filter((q) =>
        q.and(
          q.eq(q.field("userId"), identity.subject),
          q.or(
            q.eq(q.field("status"), "scheduled"),
            q.eq(q.field("status"), "checked-in"),
            q.eq(q.field("status"), "completed")
          )
        )
      )
      .first();

    return booking;
  },
});

// Alias for backward compatibility
export const getUserOrientationSession = getUserOrientationSessionQuery;
