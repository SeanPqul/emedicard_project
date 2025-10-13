import { mutation } from "../_generated/server";
import { v } from "convex/values";

/**
 * Book an orientation slot for a user's application
 * Validates availability and updates slot count atomically
 */
export const bookOrientationSlotMutation = mutation({
  args: {
    applicationId: v.id("applications"),
    scheduleId: v.id("orientationSchedules"),
  },
  handler: async (ctx, { applicationId, scheduleId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized: User must be authenticated");
    }

    // Verify the application belongs to the user
    const application = await ctx.db.get(applicationId);
    if (!application) {
      throw new Error("Application not found");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user || application.userId !== user._id) {
      throw new Error("Unauthorized: Application does not belong to user");
    }

    // Check if user already has a session for this application
    const existingSession = await ctx.db
      .query("orientationSessions")
      .withIndex("by_application", (q) => 
        q.eq("applicationId", applicationId)
      )
      .filter((q) => q.eq(q.field("userId"), identity.subject))
      .first();

    if (existingSession) {
      throw new Error("You already have an orientation session booked for this application");
    }

    // Get the schedule and validate availability
    const schedule = await ctx.db.get(scheduleId);
    if (!schedule) {
      throw new Error("Schedule not found");
    }

    if (!schedule.isAvailable) {
      throw new Error("This schedule is no longer available");
    }

    if (schedule.availableSlots <= 0) {
      throw new Error("No available slots for this schedule");
    }

    if (schedule.date < Date.now()) {
      throw new Error("Cannot book past schedules");
    }

    // Create the session booking
    const sessionId = await ctx.db.insert("orientationSessions", {
      userId: identity.subject,
      applicationId,
      scheduleId,
      scheduledDate: schedule.date,
      status: "scheduled",
      venue: {
        name: schedule.venue.name,
        address: schedule.venue.address,
      },
      instructor: schedule.instructor,
      createdAt: Date.now(),
    });

    // Update available slots atomically
    const newAvailableSlots = schedule.availableSlots - 1;
    await ctx.db.patch(scheduleId, {
      availableSlots: newAvailableSlots,
      isAvailable: newAvailableSlots > 0,
      updatedAt: Date.now(),
    });

    // Get the created session to return
    const createdSession = await ctx.db.get(sessionId);

    return {
      success: true,
      sessionId,
      session: createdSession,
    };
  },
});

// Alias for backward compatibility
export const bookOrientationSlot = bookOrientationSlotMutation;
