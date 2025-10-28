import { query } from "../_generated/server";

/**
 * Debug query to list all orientation schedules
 */
export const debugListAll = query({
  args: {},
  handler: async (ctx) => {
    const schedules = await ctx.db
      .query("orientationSchedules")
      .collect();
    
    return schedules.map((s) => ({
      id: s._id,
      date: s.date,
      dateISO: new Date(s.date).toISOString(),
      time: s.time,
      venue: s.venue.name,
      availableSlots: s.availableSlots,
    }));
  },
});
