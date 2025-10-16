import { query } from "../_generated/server";

/**
 * Get all available orientation schedules
 * Returns only future schedules that have available slots
 */
export const getAvailableSchedulesQuery = query({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    
    // Get all schedules that are:
    // 1. In the future
    // 2. Available (isAvailable = true)
    // 3. Have slots available
    const schedules = await ctx.db
      .query("orientationSchedules")
      .withIndex("by_availability", (q) => 
        q.eq("isAvailable", true)
      )
      .filter((q) =>
        q.and(
          q.gt(q.field("date"), now),
          q.gt(q.field("availableSlots"), 0)
        )
      )
      .order("asc")
      .take(20); // Limit to next 20 schedules

    return schedules;
  },
});

// Alias for backward compatibility
export const getAvailableSchedules = getAvailableSchedulesQuery;
