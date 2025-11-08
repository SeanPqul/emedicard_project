import { mutation } from "../_generated/server";
import { v } from "convex/values";

/**
 * One-time fix for orientation schedules with incorrect UTC timestamps
 * This fixes schedules that were created with local timezone timestamps instead of UTC
 */
export const fixScheduleDates = mutation({
  args: {},
  handler: async (ctx) => {
    const schedules = await ctx.db.query("orientationSchedules").collect();
    
    const fixes = [];
    
    for (const schedule of schedules) {
      // The bug was: dates stored as local time instead of UTC
      // Web admin in UTC+8 would show dates 11 days ahead
      // Example: stored 1761350400000 (Oct 25 UTC) displays as Nov 5 local
      
      // Check if this schedule looks wrong by comparing to display expectations
      const storedDate = new Date(schedule.date);
      
      // If the date appears to be off, we should fix it
      // For now, let's just log what we find
      fixes.push({
        id: schedule._id,
        currentTimestamp: schedule.date,
        currentISO: storedDate.toISOString(),
        time: schedule.time,
        venue: schedule.venue.name
      });
    }
    
    return {
      message: `Found ${fixes.length} schedules`,
      schedules: fixes
    };
  },
});

/**
 * Fix a specific schedule's date
 */
export const fixSpecificScheduleDate = mutation({
  args: {
    scheduleId: v.id("orientationSchedules"),
    correctTimestamp: v.number(),
  },
  handler: async (ctx, args) => {
    const schedule = await ctx.db.get(args.scheduleId);
    
    if (!schedule) {
      throw new Error("Schedule not found");
    }
    
    await ctx.db.patch(args.scheduleId, {
      date: args.correctTimestamp,
      updatedAt: Date.now(),
    });
    
    return {
      success: true,
      message: `Updated schedule from ${new Date(schedule.date).toISOString()} to ${new Date(args.correctTimestamp).toISOString()}`,
    };
  },
});
