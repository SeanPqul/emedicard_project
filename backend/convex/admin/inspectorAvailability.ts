import { v } from "convex/values";
import type { QueryCtx } from "../_generated/server";
import { query } from "../_generated/server";

/**
 * Check if an inspector is available for a specific date and time slot
 * UPDATED: Uses orientationBookings table
 */
export const checkInspectorAvailability = query({
  args: {
    inspectorId: v.id("users"),
    orientationDate: v.float64(),
    timeSlot: v.string(),
    excludeApplicationId: v.optional(v.id("applications")), // For updates
  },
  handler: async (ctx: QueryCtx, args) => {
    // Get all bookings for this inspector on this date/time
    const allBookings = await ctx.db
      .query("orientationBookings")
      .withIndex("by_date_time", (q) => 
        q.eq("scheduledDate", args.orientationDate)
         .eq("scheduledTime", args.timeSlot)
      )
      .collect();

    const conflicts = allBookings.filter((booking) => {
      // Skip if it's the same application (for updates)
      if (args.excludeApplicationId && booking.applicationId === args.excludeApplicationId) {
        return false;
      }

      // Check if same inspector assigned (checkedInBy tracks the inspector)
      return booking.checkedInBy === args.inspectorId;
    });

    return {
      isAvailable: conflicts.length === 0,
      conflictCount: conflicts.length,
      conflicts: conflicts.map((c) => ({
        applicationId: c.applicationId,
        timeSlot: c.scheduledTime,
        venue: c.venue.name,
      })),
    };
  },
});

/**
 * Get all inspectors with their availability status for a specific date/time
 * UPDATED: Uses orientationBookings table
 */
export const getInspectorsWithAvailability = query({
  args: {
    orientationDate: v.float64(),
    timeSlot: v.string(),
    excludeApplicationId: v.optional(v.id("applications")),
  },
  handler: async (ctx: QueryCtx, args) => {
    // Get all inspectors
    const inspectors = await ctx.db
      .query("users")
      .withIndex("by_role", (q) => q.eq("role", "inspector"))
      .collect();

    // Get all bookings for this date/time
    const bookingsOnDateTime = await ctx.db
      .query("orientationBookings")
      .withIndex("by_date_time", (q) => 
        q.eq("scheduledDate", args.orientationDate)
         .eq("scheduledTime", args.timeSlot)
      )
      .collect();

    const filteredBookings = bookingsOnDateTime.filter((booking) => {
      // Skip if it's the same application (for updates)
      if (args.excludeApplicationId && booking.applicationId === args.excludeApplicationId) {
        return false;
      }
      return true;
    });

    // Map inspectors with their availability
    return inspectors.map((inspector) => {
      const assignedBookings = filteredBookings.filter(
        (b) => b.checkedInBy === inspector._id
      );

      return {
        _id: inspector._id,
        fullname: inspector.fullname,
        email: inspector.email,
        isAvailable: assignedBookings.length === 0,
        assignedCount: assignedBookings.length,
        conflicts: assignedBookings.map((b) => ({
          applicationId: b.applicationId,
          venue: b.venue.name,
        })),
      };
    });
  },
});

/**
 * Get inspector's schedule for a specific date (all time slots)
 * UPDATED: Uses orientationBookings table
 */
export const getInspectorDailySchedule = query({
  args: {
    inspectorId: v.id("users"),
    orientationDate: v.float64(),
  },
  handler: async (ctx: QueryCtx, args) => {
    // Get all bookings where this inspector checked in
    const allBookings = await ctx.db
      .query("orientationBookings")
      .withIndex("by_checked_in_by", (q) => 
        q.eq("checkedInBy", args.inspectorId)
      )
      .collect();

    const dailySchedule = allBookings.filter(
      (booking) => booking.scheduledDate === args.orientationDate
    );

    return {
      inspectorId: args.inspectorId,
      date: args.orientationDate,
      totalAssignments: dailySchedule.length,
      schedule: dailySchedule.map((b) => ({
        applicationId: b.applicationId,
        timeSlot: b.scheduledTime,
        venue: b.venue.name,
        status: b.status,
      })),
    };
  },
});
