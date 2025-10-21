import { mutation } from "../_generated/server";
import { v } from "convex/values";

/**
 * Create a new orientation schedule
 */
export const createSchedule = mutation({
  args: {
    date: v.float64(),
    time: v.string(),
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
    const now = Date.now();

    const scheduleId = await ctx.db.insert("orientationSchedules", {
      date: args.date,
      time: args.time,
      venue: args.venue,
      availableSlots: args.totalSlots, // Initially all slots are available
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
    time: v.optional(v.string()),
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

    // If totalSlots is updated, adjust availableSlots proportionally
    let availableSlots = updates.availableSlots;
    if (updates.totalSlots && !updates.availableSlots) {
      const slotsDifference = updates.totalSlots - existingSchedule.totalSlots;
      availableSlots = existingSchedule.availableSlots + slotsDifference;
      // Ensure availableSlots doesn't go negative
      availableSlots = Math.max(0, availableSlots);
    }

    // Auto-update availability based on slots
    const finalAvailableSlots = availableSlots !== undefined ? availableSlots : existingSchedule.availableSlots;
    const shouldBeAvailable = updates.isAvailable !== undefined 
      ? updates.isAvailable 
      : existingSchedule.isAvailable;
    
    // If slots are 0 or less, force unavailable
    const finalIsAvailable = finalAvailableSlots <= 0 ? false : shouldBeAvailable;

    await ctx.db.patch(scheduleId, {
      ...updates,
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
    time: v.string(),
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
    const now = Date.now();
    const scheduleIds = [];

    for (const date of args.dates) {
      const scheduleId = await ctx.db.insert("orientationSchedules", {
        date,
        time: args.time,
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
