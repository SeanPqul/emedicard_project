import { v } from "convex/values";
import type { QueryCtx } from "../_generated/server";
import { query } from "../_generated/server";

/**
 * Check if an inspector is available for a specific date and time slot
 */
export const checkInspectorAvailability = query({
  args: {
    inspectorId: v.id("users"),
    orientationDate: v.float64(),
    timeSlot: v.string(),
    excludeApplicationId: v.optional(v.id("applications")), // For updates
  },
  handler: async (ctx: QueryCtx, args) => {
    // Get all orientations for this inspector on this date/time
    const allOrientations = await ctx.db
      .query("orientations")
      .collect();

    const conflicts = allOrientations.filter((orientation) => {
      // Skip if it's the same application (for updates)
      if (args.excludeApplicationId && orientation.applicationId === args.excludeApplicationId) {
        return false;
      }

      // Check if same inspector, date, and time slot
      return (
        orientation.assignedInspectorId === args.inspectorId &&
        orientation.orientationDate === args.orientationDate &&
        orientation.timeSlot === args.timeSlot
      );
    });

    return {
      isAvailable: conflicts.length === 0,
      conflictCount: conflicts.length,
      conflicts: conflicts.map((c) => ({
        applicationId: c.applicationId,
        timeSlot: c.timeSlot,
        venue: c.orientationVenue,
      })),
    };
  },
});

/**
 * Get all inspectors with their availability status for a specific date/time
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

    // Get all orientations for this date/time
    const allOrientations = await ctx.db
      .query("orientations")
      .collect();

    const orientationsOnDateTime = allOrientations.filter((orientation) => {
      // Skip if it's the same application (for updates)
      if (args.excludeApplicationId && orientation.applicationId === args.excludeApplicationId) {
        return false;
      }

      return (
        orientation.orientationDate === args.orientationDate &&
        orientation.timeSlot === args.timeSlot
      );
    });

    // Map inspectors with their availability
    return inspectors.map((inspector) => {
      const assignedOrientations = orientationsOnDateTime.filter(
        (o) => o.assignedInspectorId === inspector._id
      );

      return {
        _id: inspector._id,
        fullname: inspector.fullname,
        email: inspector.email,
        isAvailable: assignedOrientations.length === 0,
        assignedCount: assignedOrientations.length,
        conflicts: assignedOrientations.map((o) => ({
          applicationId: o.applicationId,
          venue: o.orientationVenue,
        })),
      };
    });
  },
});

/**
 * Get inspector's schedule for a specific date (all time slots)
 */
export const getInspectorDailySchedule = query({
  args: {
    inspectorId: v.id("users"),
    orientationDate: v.float64(),
  },
  handler: async (ctx: QueryCtx, args) => {
    const allOrientations = await ctx.db
      .query("orientations")
      .collect();

    const dailySchedule = allOrientations.filter(
      (orientation) =>
        orientation.assignedInspectorId === args.inspectorId &&
        orientation.orientationDate === args.orientationDate
    );

    return {
      inspectorId: args.inspectorId,
      date: args.orientationDate,
      totalAssignments: dailySchedule.length,
      schedule: dailySchedule.map((o) => ({
        applicationId: o.applicationId,
        timeSlot: o.timeSlot,
        venue: o.orientationVenue,
        status: o.orientationStatus,
      })),
    };
  },
});
