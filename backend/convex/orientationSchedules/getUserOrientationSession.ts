import { query } from "../_generated/server";
import { v } from "convex/values";

/**
 * Get user's orientation session for a specific application
 * Returns the booked session if exists
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

    // Get user's ACTIVE session for this application (only scheduled, not cancelled)
    const session = await ctx.db
      .query("orientationSessions")
      .withIndex("by_application", (q) => 
        q.eq("applicationId", applicationId)
      )
      .filter((q) => 
        q.and(
          q.eq(q.field("userId"), identity.subject),
          q.eq(q.field("status"), "scheduled")
        )
      )
      .first();

    return session;
  },
});

// Alias for backward compatibility
export const getUserOrientationSession = getUserOrientationSessionQuery;
