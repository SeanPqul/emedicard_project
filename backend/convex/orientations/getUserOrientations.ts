import { query } from "../_generated/server";

/**
 * Get all orientation bookings for the current user
 * UPDATED: Uses orientationBookings table
 */
export const getUserOrientationsQuery = query({
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

    // Get all bookings for this user
    const bookings = await ctx.db
      .query("orientationBookings")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .collect();

    // Enrich with schedule and application data
    const enrichedBookings = await Promise.all(
      bookings.map(async (booking) => {
        const schedule = await ctx.db.get(booking.scheduleId);
        const application = await ctx.db.get(booking.applicationId);
        
        return {
          ...booking,
          schedule,
          application,
        };
      })
    );

    return enrichedBookings;
  },
});


// @deprecated - Use getUserOrientationsQuery instead. This alias will be removed in a future release.
export const getUserOrientations = getUserOrientationsQuery;
