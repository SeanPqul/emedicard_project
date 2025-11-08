import { query } from "../_generated/server";
import { v } from "convex/values";

/**
 * Get all orientation schedules
 * Includes both past and future schedules for admin management
 */
export const getAllSchedules = query({
  args: {},
  handler: async (ctx) => {
    const schedules = await ctx.db
      .query("orientationSchedules")
      .withIndex("by_date")
      .order("desc")
      .collect();

    return schedules;
  },
});

/**
 * Get a single orientation schedule by ID
 */
export const getScheduleById = query({
  args: { scheduleId: v.id("orientationSchedules") },
  handler: async (ctx, { scheduleId }) => {
    const schedule = await ctx.db.get(scheduleId);
    return schedule;
  },
});

/**
 * Get schedules for a specific date range
 */
export const getSchedulesByDateRange = query({
  args: {
    startDate: v.number(),
    endDate: v.number(),
  },
  handler: async (ctx, { startDate, endDate }) => {
    const schedules = await ctx.db
      .query("orientationSchedules")
      .withIndex("by_date")
      .filter((q) =>
        q.and(
          q.gte(q.field("date"), startDate),
          q.lte(q.field("date"), endDate)
        )
      )
      .order("asc")
      .collect();

    return schedules;
  },
});

/**
 * Get upcoming schedules (future schedules only)
 */
export const getUpcomingSchedules = query({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    
    const schedules = await ctx.db
      .query("orientationSchedules")
      .withIndex("by_date")
      .filter((q) => q.gt(q.field("date"), now))
      .order("asc")
      .collect();

    return schedules;
  },
});
