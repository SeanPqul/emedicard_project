import { mutation } from "../_generated/server";
import { v } from "convex/values";
import {
  formatTimeRange,
  validateTimeRange,
  calculateDuration,
} from "./timeUtils";

/**
 * Create a new orientation schedule
 */
export const createSchedule = mutation({
  args: {
    date: v.float64(),
    startMinutes: v.float64(),
    endMinutes: v.float64(),
    venue: v.object({
      name: v.string(),
      address: v.string(),
      capacity: v.float64(),
    }),
    totalSlots: v.float64(),
    instructor: v.optional(
      v.object({
        name: v.string(),
        designation: v.string(),
      })
    ),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Validate time range
    validateTimeRange(args.startMinutes, args.endMinutes);

    // Generate formatted time string from structured data
    const time = formatTimeRange(args.startMinutes, args.endMinutes);
    const durationMinutes = calculateDuration(args.startMinutes, args.endMinutes);

    const now = Date.now();

    const scheduleId = await ctx.db.insert("orientationSchedules", {
      date: args.date,
      time,
      startMinutes: args.startMinutes,
      endMinutes: args.endMinutes,
      durationMinutes,
      venue: args.venue,
      availableSlots: args.totalSlots,
      totalSlots: args.totalSlots,
      isAvailable: true,
      instructor: args.instructor,
      notes: args.notes,
      createdAt: now,
      updatedAt: now,
    });

    return { success: true, scheduleId };
  },
});

/**
 * Update an existing orientation schedule
 */
export const updateSchedule = mutation({
  args: {
    scheduleId: v.id("orientationSchedules"),
    date: v.optional(v.float64()),
    startMinutes: v.optional(v.float64()),
    endMinutes: v.optional(v.float64()),
    venue: v.optional(
      v.object({
        name: v.string(),
        address: v.string(),
        capacity: v.float64(),
      })
    ),
    totalSlots: v.optional(v.float64()),
    availableSlots: v.optional(v.float64()),
    isAvailable: v.optional(v.boolean()),
    instructor: v.optional(
      v.object({
        name: v.string(),
        designation: v.string(),
      })
    ),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, { scheduleId, ...updates }) => {
    const existingSchedule = await ctx.db.get(scheduleId);
    
    if (!existingSchedule) {
      throw new Error("Schedule not found");
    }

    // Determine final start/end minutes
    const finalStartMinutes = updates.startMinutes ?? existingSchedule.startMinutes;
    const finalEndMinutes = updates.endMinutes ?? existingSchedule.endMinutes;

    // If time is being updated, validate and regenerate time string
    let timeUpdate: { time?: string; startMinutes?: number; endMinutes?: number; durationMinutes?: number } = {};
    if (updates.startMinutes !== undefined || updates.endMinutes !== undefined) {
      if (finalStartMinutes === undefined || finalEndMinutes === undefined) {
        throw new Error("Both startMinutes and endMinutes must be provided when updating time");
      }
      validateTimeRange(finalStartMinutes, finalEndMinutes);
      timeUpdate = {
        time: formatTimeRange(finalStartMinutes, finalEndMinutes),
        startMinutes: finalStartMinutes,
        endMinutes: finalEndMinutes,
        durationMinutes: calculateDuration(finalStartMinutes, finalEndMinutes),
      };
    }

    // If totalSlots is updated, adjust availableSlots proportionally
    let availableSlots = updates.availableSlots;
    if (updates.totalSlots && !updates.availableSlots) {
      const slotsDifference = updates.totalSlots - existingSchedule.totalSlots;
      availableSlots = existingSchedule.availableSlots + slotsDifference;
      availableSlots = Math.max(0, availableSlots);
    }

    // Auto-update availability based on slots
    const finalAvailableSlots = availableSlots !== undefined ? availableSlots : existingSchedule.availableSlots;
    const shouldBeAvailable = updates.isAvailable !== undefined 
      ? updates.isAvailable 
      : existingSchedule.isAvailable;
    
    const finalIsAvailable = finalAvailableSlots <= 0 ? false : shouldBeAvailable;

    await ctx.db.patch(scheduleId, {
      ...updates,
      ...timeUpdate,
      ...(availableSlots !== undefined && { availableSlots }),
      isAvailable: finalIsAvailable,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

/**
 * Delete an orientation schedule
 * Only allowed if no bookings exist for this schedule
 */
export const deleteSchedule = mutation({
  args: {
    scheduleId: v.id("orientationSchedules"),
  },
  handler: async (ctx, { scheduleId }) => {
    // Check if there are any bookings for this schedule
    const bookings = await ctx.db
      .query("orientationSessions")
      .withIndex("by_schedule", (q) => q.eq("scheduleId", scheduleId))
      .collect();

    if (bookings.length > 0) {
      throw new Error(
        `Cannot delete schedule: ${bookings.length} booking(s) exist for this schedule. Please cancel or reassign bookings first.`
      );
    }

    await ctx.db.delete(scheduleId);

    return { success: true, message: "Schedule deleted successfully" };
  },
});

/**
 * Bulk create schedules for multiple dates with same time and venue
 * Useful for creating weekly schedules
 */
export const bulkCreateSchedules = mutation({
  args: {
    dates: v.array(v.float64()),
    startMinutes: v.float64(),
    endMinutes: v.float64(),
    venue: v.object({
      name: v.string(),
      address: v.string(),
      capacity: v.float64(),
    }),
    totalSlots: v.float64(),
    instructor: v.optional(
      v.object({
        name: v.string(),
        designation: v.string(),
      })
    ),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Validate time range once for all schedules
    validateTimeRange(args.startMinutes, args.endMinutes);
    const time = formatTimeRange(args.startMinutes, args.endMinutes);
    const durationMinutes = calculateDuration(args.startMinutes, args.endMinutes);

    const now = Date.now();
    const scheduleIds = [];

    for (const date of args.dates) {
      const scheduleId = await ctx.db.insert("orientationSchedules", {
        date,
        time,
        startMinutes: args.startMinutes,
        endMinutes: args.endMinutes,
        durationMinutes,
        venue: args.venue,
        availableSlots: args.totalSlots,
        totalSlots: args.totalSlots,
        isAvailable: true,
        instructor: args.instructor,
        notes: args.notes,
        createdAt: now,
        updatedAt: now,
      });
      scheduleIds.push(scheduleId);
    }

    return {
      success: true,
      count: scheduleIds.length,
      scheduleIds,
    };
  },
});

/**
 * Toggle schedule availability
 */
export const toggleAvailability = mutation({
  args: {
    scheduleId: v.id("orientationSchedules"),
  },
  handler: async (ctx, { scheduleId }) => {
    const schedule = await ctx.db.get(scheduleId);
    
    if (!schedule) {
      throw new Error("Schedule not found");
    }

    // Cannot enable if slots are full
    if (schedule.availableSlots <= 0 && !schedule.isAvailable) {
      throw new Error("Cannot enable schedule - no slots available");
    }

    await ctx.db.patch(scheduleId, {
      isAvailable: !schedule.isAvailable,
      updatedAt: Date.now(),
    });

    return {
      success: true,
      isAvailable: !schedule.isAvailable,
    };
  },
});
