import { v } from "convex/values";
import { internal } from "../_generated/api";
import type { Doc } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";
import { mutation, query } from "../_generated/server";



// Query to get all inspectors
export const getInspectors = query({
  handler: async (ctx: QueryCtx) => {
    return await ctx.db.query("users").withIndex("by_role", (q) => q.eq("role", "inspector")).collect();
  },
});

// Mutation to schedule an orientation
export const scheduleOrientation = mutation({
  args: {
    applicationId: v.id("applications"),
    orientationDate: v.float64(),
    timeSlot: v.string(),
    assignedInspectorId: v.id("users"),
    orientationVenue: v.string(),
    allowConflict: v.optional(v.boolean()), // Allow override
  },
  handler: async (ctx: MutationCtx, args) => {
    // Check for existing orientation for this application
    const existingOrientation = await ctx.db.query("orientations")
      .withIndex("by_application", (q) => q.eq("applicationId", args.applicationId))
      .unique();

    // Check for inspector conflicts (unless allowConflict is true)
    if (!args.allowConflict) {
      const allOrientations = await ctx.db.query("orientations").collect();
      
      const conflicts = allOrientations.filter((orientation) => {
        // Skip if it's the same application (for updates)
        if (existingOrientation && orientation.applicationId === args.applicationId) {
          return false;
        }

        // Check if same inspector, date, and time slot
        return (
          orientation.assignedInspectorId === args.assignedInspectorId &&
          orientation.orientationDate === args.orientationDate &&
          orientation.timeSlot === args.timeSlot
        );
      });

      if (conflicts.length > 0) {
        throw new Error(
          `Inspector is already assigned to ${conflicts.length} orientation(s) at this time. ` +
          `Set allowConflict=true to override.`
        );
      }
    }

    if (existingOrientation) {
      // Update existing orientation
      return await ctx.db.patch(existingOrientation._id, {
        orientationDate: args.orientationDate,
        timeSlot: args.timeSlot,
        assignedInspectorId: args.assignedInspectorId,
        orientationVenue: args.orientationVenue,
        orientationStatus: "Scheduled",
        scheduledAt: Date.now(),
      });
    } else {
      // Create new orientation
      // Generate QR code data containing the application ID for scanning
      const qrCodeData = `EMC-ORIENTATION-${args.applicationId}`;

      return await ctx.db.insert("orientations", {
        applicationId: args.applicationId,
        orientationDate: args.orientationDate,
        timeSlot: args.timeSlot,
        assignedInspectorId: args.assignedInspectorId,
        orientationVenue: args.orientationVenue,
        orientationStatus: "Scheduled",
        qrCodeUrl: qrCodeData,
        scheduledAt: Date.now(),
      });
    }
  },
});

// Query to get orientation details for an application
export const getOrientationByApplicationId = query({
  args: { applicationId: v.id("applications") },
  handler: async (ctx: QueryCtx, args) => {
    return await ctx.db.query("orientations")
      .withIndex("by_application", (q) => q.eq("applicationId", args.applicationId))
      .unique();
  },
});

// Query to get available time slots for a given date and venue
export const getAvailableTimeSlots = query({
  args: {
    orientationDate: v.float64(),
    orientationVenue: v.string(),
  },
  handler: async (ctx: QueryCtx, args) => {
    const timeSlots = [
      "9:00 AM - 11:00 AM",
      "1:00 PM - 3:00 PM",
      "3:00 PM - 5:00 PM",
    ];
    const maxCapacityPerSlot = 10; // Example capacity

    const scheduledOrientations = await ctx.db.query("orientations")
      .withIndex("by_date_timeslot_venue", (q) =>
        q.eq("orientationDate", args.orientationDate)
      )
      .collect();

    const venueOrientations = scheduledOrientations.filter(
        (o) => o.orientationVenue === args.orientationVenue
    );

    const slotCounts = venueOrientations.reduce((acc: Record<string, number>, curr: Doc<"orientations">) => {
      if(curr.timeSlot) acc[curr.timeSlot] = (acc[curr.timeSlot] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return timeSlots.map(slot => {
      const count = slotCounts[slot] || 0;
      let status: "Available" | "Almost Full" | "Full";
      if (count >= maxCapacityPerSlot) {
        status = "Full";
      } else if (count >= maxCapacityPerSlot * 0.7) { // 70% full
        status = "Almost Full";
      } else {
        status = "Available";
      }
      return {
        timeSlot: slot,
        status,
        currentBookings: count,
        maxCapacity: maxCapacityPerSlot,
      };
    });
  },
});
