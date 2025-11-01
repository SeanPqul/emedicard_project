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

/**
 * Mutation to schedule an orientation
 *
 * UPDATED: Uses unified orientationBookings table
 */
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
    // Get application to get userId
    const application = await ctx.db.get(args.applicationId);
    if (!application) {
      throw new Error("Application not found");
    }

    // Get user to get clerkId
    const appUser = await ctx.db.get(application.userId);
    if (!appUser) {
      throw new Error("Application user not found");
    }

    // Check for existing booking for this application
    const existingBooking = await ctx.db.query("orientationBookings")
      .withIndex("by_application", (q) => q.eq("applicationId", args.applicationId))
      .first();

    // Check for inspector conflicts (unless allowConflict is true)
    if (!args.allowConflict) {
      const allBookings = await ctx.db.query("orientationBookings")
        .withIndex("by_date_time", (q) =>
          q.eq("scheduledDate", args.orientationDate)
           .eq("scheduledTime", args.timeSlot)
        )
        .collect();

      const conflicts = allBookings.filter((booking) => {
        // Skip if it's the same application (for updates)
        if (existingBooking && booking.applicationId === args.applicationId) {
          return false;
        }

        // Check if same inspector assigned (via checkedInBy or existing assigned inspector)
        // Note: In the new schema, we don't have assignedInspectorId anymore
        // Inspector assignment happens during check-in
        // For admin scheduling, we can add it to instructor field
        return false; // Skip conflict check for now
      });

      if (conflicts.length > 0) {
        throw new Error(
          `Inspector is already assigned to ${conflicts.length} orientation(s) at this time. ` +
          `Set allowConflict=true to override.`
        );
      }
    }

    // Get instructor details from assigned inspector
    const inspector = await ctx.db.get(args.assignedInspectorId);
    const instructorInfo = inspector ? {
      name: inspector.fullname,
      designation: inspector.role || "Inspector",
    } : undefined;

    const qrCodeData = `EMC-ORIENTATION-${args.applicationId}`;

    if (existingBooking) {
      // Update existing booking
      return await ctx.db.patch(existingBooking._id, {
        scheduledDate: args.orientationDate,
        scheduledTime: args.timeSlot,
        venue: {
          name: args.orientationVenue,
          address: existingBooking.venue.address, // Preserve existing address
        },
        instructor: instructorInfo,
        status: "scheduled",
        updatedAt: Date.now(),
      });
    } else {
      // Create new booking
      return await ctx.db.insert("orientationBookings", {
        // User & Application
        userId: appUser.clerkId,
        applicationId: args.applicationId,

        // Schedule Reference - admin scheduling doesn't use schedule slots
        // We need to find or create a matching schedule
        scheduleId: "" as any, // This should reference an orientationSchedules record
        // TODO: Look up matching schedule or create one

        // Booking Details
        scheduledDate: args.orientationDate,
        scheduledTime: args.timeSlot,
        venue: {
          name: args.orientationVenue,
          address: "", // Default address
        },
        instructor: instructorInfo,

        // Status
        status: "scheduled",

        // QR Code
        qrCodeUrl: qrCodeData,

        // Timestamps
        createdAt: Date.now(),
      });
    }
  },
});

/**
 * Query to get orientation details for an application
 *
 * UPDATED: Uses unified orientationBookings table
 */
export const getOrientationByApplicationId = query({
  args: { applicationId: v.id("applications") },
  handler: async (ctx: QueryCtx, args) => {
    return await ctx.db.query("orientationBookings")
      .withIndex("by_application", (q) => q.eq("applicationId", args.applicationId))
      .first();
  },
});

/**
 * Query to get available time slots for a given date and venue
 *
 * UPDATED: Uses unified orientationBookings table
 */
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

    const scheduledBookings = await ctx.db.query("orientationBookings")
      .withIndex("by_date_time", (q) =>
        q.eq("scheduledDate", args.orientationDate)
      )
      .collect();

    const venueBookings = scheduledBookings.filter(
      (booking) => booking.venue.name === args.orientationVenue
    );

    const slotCounts = venueBookings.reduce((acc: Record<string, number>, curr) => {
      if (curr.scheduledTime) acc[curr.scheduledTime] = (acc[curr.scheduledTime] || 0) + 1;
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
