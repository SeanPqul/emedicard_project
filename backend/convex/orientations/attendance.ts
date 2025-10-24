import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { AdminRole } from "../users/roles";

/**
 * Check-in attendee via QR code scan
 * Inspector scans user's QR code when they arrive
 */
export const checkIn = mutation({
  args: {
    applicationId: v.id("applications"),
  },
  handler: async (ctx, args) => {
    // Verify admin/inspector role
    const adminCheck = await AdminRole(ctx);
    if (!adminCheck.isAdmin) {
      throw new Error("Only inspectors can check in attendees");
    }

    // Get orientation record
    const orientation = await ctx.db
      .query("orientations")
      .withIndex("by_application", (q) => q.eq("applicationId", args.applicationId))
      .unique();

    if (!orientation) {
      throw new Error("No orientation scheduled for this application");
    }

    // Check if already checked in
    if (orientation.checkInTime) {
      return {
        success: false,
        message: "Already checked in",
        checkInTime: orientation.checkInTime,
      };
    }

    // Check if orientation status is Scheduled
    if (orientation.orientationStatus !== "Scheduled") {
      throw new Error(`Cannot check in. Orientation status is: ${orientation.orientationStatus}`);
    }

    // Perform check-in
    const checkInTime = Date.now();
    await ctx.db.patch(orientation._id, {
      checkInTime,
    });

    // Get application and user for notification
    const application = await ctx.db.get(args.applicationId);
    if (application) {
      await ctx.db.insert("notifications", {
        userId: application.userId,
        applicationId: args.applicationId,
        title: "Orientation Check-In Successful",
        message: "You have been checked in for the food safety orientation. Please complete the session to check out.",
        notificationType: "Orientation",
        isRead: false,
      });
    }

    return {
      success: true,
      message: "Check-in successful",
      checkInTime,
    };
  },
});

/**
 * Check-out attendee via QR code scan
 * Inspector scans user's QR code when orientation is finished
 */
export const checkOut = mutation({
  args: {
    applicationId: v.id("applications"),
  },
  handler: async (ctx, args) => {
    // Verify admin/inspector role
    const adminCheck = await AdminRole(ctx);
    if (!adminCheck.isAdmin) {
      throw new Error("Only inspectors can check out attendees");
    }

    // Get orientation record
    const orientation = await ctx.db
      .query("orientations")
      .withIndex("by_application", (q) => q.eq("applicationId", args.applicationId))
      .unique();

    if (!orientation) {
      throw new Error("No orientation scheduled for this application");
    }

    // Check if already checked out
    if (orientation.checkOutTime) {
      return {
        success: false,
        message: "Already checked out",
        checkOutTime: orientation.checkOutTime,
      };
    }

    // Check if checked in first
    if (!orientation.checkInTime) {
      throw new Error("Cannot check out without checking in first");
    }

    // Perform check-out
    const checkOutTime = Date.now();
    await ctx.db.patch(orientation._id, {
      checkOutTime,
      orientationStatus: "Completed",
    });

    // Update application status to "Attendance Validation" after check-out
    const application = await ctx.db.get(args.applicationId);
    if (application) {
      // After inspector completes check-in + check-out, set status to "Attendance Validation"
      // The Yellow Card Admin will then finalize attendance validation
      await ctx.db.patch(args.applicationId, {
        applicationStatus: "Attendance Validation",
        orientationCompleted: true,
        updatedAt: Date.now(),
      });

      // Notify user that orientation is completed and awaiting validation
      await ctx.db.insert("notifications", {
        userId: application.userId,
        applicationId: args.applicationId,
        title: "Orientation Completed!",
        message: "You have successfully completed your food safety orientation. Your attendance is now being validated by the admin.",
        notificationType: "Orientation",
        isRead: false,
      });
    }

    return {
      success: true,
      message: "Check-out successful. Orientation completed!",
      checkOutTime,
    };
  },
});

/**
 * Get attendance status for an application
 */
export const getAttendanceStatus = query({
  args: {
    applicationId: v.id("applications"),
  },
  handler: async (ctx, args) => {
    const orientation = await ctx.db
      .query("orientations")
      .withIndex("by_application", (q) => q.eq("applicationId", args.applicationId))
      .unique();

    if (!orientation) {
      return {
        hasOrientation: false,
        status: "Not Scheduled",
      };
    }

    return {
      hasOrientation: true,
      status: orientation.orientationStatus,
      checkInTime: orientation.checkInTime,
      checkOutTime: orientation.checkOutTime,
      isCheckedIn: !!orientation.checkInTime,
      isCheckedOut: !!orientation.checkOutTime,
      isCompleted: orientation.orientationStatus === "Completed",
    };
  },
});

/**
 * Get all attendees for a specific date/time/venue (for inspector view)
 */
export const getAttendeesForSession = query({
  args: {
    orientationDate: v.float64(),
    timeSlot: v.string(),
    orientationVenue: v.string(),
  },
  handler: async (ctx, args) => {
    // Verify admin/inspector role
    const adminCheck = await AdminRole(ctx);
    if (!adminCheck.isAdmin) {
      throw new Error("Unauthorized");
    }

    // Get all orientations for this session
    const orientations = await ctx.db
      .query("orientations")
      .withIndex("by_date_timeslot_venue", (q) =>
        q.eq("orientationDate", args.orientationDate)
      )
      .filter((q) =>
        q.and(
          q.eq(q.field("timeSlot"), args.timeSlot),
          q.eq(q.field("orientationVenue"), args.orientationVenue)
        )
      )
      .collect();

    // Get application and user details for each orientation
    const attendees = await Promise.all(
      orientations.map(async (orientation) => {
        const application = await ctx.db.get(orientation.applicationId);
        if (!application) return null;

        const user = await ctx.db.get(application.userId);
        if (!user) return null;

        return {
          applicationId: orientation.applicationId,
          fullname: user.fullname,
          orientationStatus: orientation.orientationStatus,
          checkInTime: orientation.checkInTime,
          checkOutTime: orientation.checkOutTime,
          qrCodeUrl: orientation.qrCodeUrl,
        };
      })
    );

    return attendees.filter((a) => a !== null);
  },
});

/**
 * Get orientation schedules for a specific date with attendance details
 * (Yellow Admin view for attendance tracking)
 */
export const getOrientationSchedulesForDate = query({
  args: {
    selectedDate: v.float64(), // Timestamp of selected date (start of day)
  },
  handler: async (ctx, args) => {
    // Verify admin role
    const adminCheck = await AdminRole(ctx);
    if (!adminCheck.isAdmin) {
      throw new Error("Unauthorized: Admin access required");
    }

    console.log('🔍 Backend Query:', {
      receivedTimestamp: args.selectedDate,
      receivedDate: new Date(args.selectedDate).toISOString(),
    });

    // Get all orientation schedules for the selected date
    const schedules = await ctx.db
      .query("orientationSchedules")
      .withIndex("by_date", (q) => q.eq("date", args.selectedDate))
      .collect();

    console.log('📅 Schedules Found:', schedules.length);
    if (schedules.length > 0) {
      console.log('First schedule date:', new Date(schedules[0].date).toISOString());
    }

    // For each schedule, get the attendees and their attendance status
    const schedulesWithAttendees = await Promise.all(
      schedules.map(async (schedule) => {
        // Get all orientations matching this schedule
        const orientations = await ctx.db
          .query("orientations")
          .withIndex("by_date_timeslot_venue", (q) =>
            q.eq("orientationDate", schedule.date)
          )
          .filter((q) =>
            q.and(
              q.eq(q.field("timeSlot"), schedule.time),
              q.eq(q.field("orientationVenue"), schedule.venue.name)
            )
          )
          .collect();

        // Get attendee details
        const attendees = await Promise.all(
          orientations.map(async (orientation) => {
            const application = await ctx.db.get(orientation.applicationId);
            if (!application) return null;

            const user = await ctx.db.get(application.userId);
            if (!user) return null;

            const jobCategory = await ctx.db.get(application.jobCategoryId);

            return {
              orientationId: orientation._id,
              applicationId: orientation.applicationId,
              fullname: user.fullname,
              gender: user.gender || application.gender || "N/A",
              jobCategory: jobCategory?.name || "Unknown",
              jobCategoryColor: jobCategory?.colorCode || "#gray",
              applicationStatus: application.applicationStatus,
              orientationStatus: orientation.orientationStatus,
              checkInTime: orientation.checkInTime,
              checkOutTime: orientation.checkOutTime,
              inspectorNotes: orientation.inspectorNotes,
              qrCodeUrl: orientation.qrCodeUrl,
            };
          })
        );

        const validAttendees = attendees.filter((a) => a !== null);

        // Get instructor details from the first orientation if assigned
        let instructorDetails = null;
        const firstOrientation = orientations[0];
        if (firstOrientation && firstOrientation.assignedInspectorId) {
          const inspector = await ctx.db.get(firstOrientation.assignedInspectorId);
          if (inspector) {
            instructorDetails = {
              name: inspector.fullname,
              email: inspector.email,
            };
          }
        }

        return {
          scheduleId: schedule._id,
          date: schedule.date,
          time: schedule.time,
          venue: schedule.venue,
          instructor: schedule.instructor || instructorDetails,
          totalSlots: schedule.totalSlots,
          availableSlots: schedule.availableSlots,
          attendees: validAttendees,
          attendeeCount: validAttendees.length,
          completedCount: validAttendees.filter(
            (a) => a.orientationStatus === "Completed"
          ).length,
          checkedInCount: validAttendees.filter((a) => a.checkInTime).length,
        };
      })
    );

    return schedulesWithAttendees;
  },
});

/**
 * Update inspector notes and status for an orientation
 * Allows inspectors to mark applicants as excused with reasons
 */
export const updateInspectorNotes = mutation({
  args: {
    orientationId: v.id("orientations"),
    notes: v.string(),
    status: v.optional(v.union(
      v.literal("Scheduled"),
      v.literal("Completed"),
      v.literal("Missed"),
      v.literal("Excused")
    )),
  },
  handler: async (ctx, args) => {
    // Verify admin/inspector role
    const adminCheck = await AdminRole(ctx);
    if (!adminCheck.isAdmin) {
      throw new Error("Unauthorized: Admin/Inspector access required");
    }

    const orientation = await ctx.db.get(args.orientationId);
    if (!orientation) {
      throw new Error("Orientation not found");
    }

    // Update orientation with inspector notes and optionally status
    const updateData: any = {
      inspectorNotes: args.notes,
    };

    if (args.status) {
      updateData.orientationStatus = args.status;
    }

    await ctx.db.patch(args.orientationId, updateData);

    // Log the activity
    const identity = await ctx.auth.getUserIdentity();
    if (identity) {
      const adminUser = await ctx.db
        .query("users")
        .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
        .unique();

      if (adminUser) {
        await ctx.db.insert("adminActivityLogs", {
          adminId: adminUser._id,
          activityType: "orientation_notes_update",
          details: `Updated orientation notes: ${args.notes}${args.status ? ` | Status: ${args.status}` : ""}`,
          timestamp: Date.now(),
          applicationId: orientation.applicationId,
        });
      }
    }

    return {
      success: true,
      message: "Inspector notes updated successfully",
    };
  },
});

/**
 * Finalize attendance validation for a session
 * Updates applicants who completed orientation to next status
 */
export const finalizeSessionAttendance = mutation({
  args: {
    scheduleId: v.id("orientationSchedules"),
    selectedDate: v.float64(),
    timeSlot: v.string(),
    venue: v.string(),
  },
  handler: async (ctx, args) => {
    // Verify admin role
    const adminCheck = await AdminRole(ctx);
    if (!adminCheck.isAdmin) {
      throw new Error("Unauthorized: Admin access required");
    }

    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Authentication failed");

    const adminUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!adminUser) throw new Error("Admin user not found");

    // Get all orientations for this session
    const orientations = await ctx.db
      .query("orientations")
      .withIndex("by_date_timeslot_venue", (q) =>
        q.eq("orientationDate", args.selectedDate)
      )
      .filter((q) =>
        q.and(
          q.eq(q.field("timeSlot"), args.timeSlot),
          q.eq(q.field("orientationVenue"), args.venue)
        )
      )
      .collect();

    let completedCount = 0;
    let missedCount = 0;
    let excusedCount = 0;

    // Process each orientation
    for (const orientation of orientations) {
      const application = await ctx.db.get(orientation.applicationId);
      if (!application) continue;

      // Check if orientation was completed (checked in AND checked out)
      if (
        orientation.checkInTime &&
        orientation.checkOutTime &&
        orientation.orientationStatus === "Completed"
      ) {
        // Update application status to "Approved" (Ready for Health Card)
        await ctx.db.patch(orientation.applicationId, {
          applicationStatus: "Approved",
          orientationCompleted: true,
          updatedAt: Date.now(),
          lastUpdatedBy: adminUser._id,
        });

        // Send notification
        const user = await ctx.db.get(application.userId);
        if (user) {
          await ctx.db.insert("notifications", {
            userId: user._id,
            applicationId: orientation.applicationId,
            title: "Application Approved!",
            message: "Your attendance has been validated. Your application is now approved and your health card will be issued soon.",
            notificationType: "Orientation",
            isRead: false,
          });
        }

        completedCount++;
      } else if (orientation.orientationStatus === "Excused") {
        // Excused applicants - keep their current status for manual handling
        // The admin has already marked them as excused with notes
        excusedCount++;
      } else if (
        !orientation.checkInTime ||
        !orientation.checkOutTime ||
        orientation.orientationStatus === "Missed"
      ) {
        // Mark as missed and reject application (send back to "For Orientation")
        await ctx.db.patch(orientation._id, {
          orientationStatus: "Missed",
        });

        // Update application status back to "For Orientation" so they can rebook
        await ctx.db.patch(orientation.applicationId, {
          applicationStatus: "For Orientation",
          orientationCompleted: false,
          updatedAt: Date.now(),
          lastUpdatedBy: adminUser._id,
        });

        // Notify applicant that they need to reschedule
        const user = await ctx.db.get(application.userId);
        if (user) {
          await ctx.db.insert("notifications", {
            userId: user._id,
            applicationId: orientation.applicationId,
            title: "Orientation Not Attended",
            message:
              "Your application has been returned because you did not complete the food safety orientation. Please schedule a new orientation session to continue.",
            notificationType: "Orientation",
            isRead: false,
          });
        }

        missedCount++;
      }
    }

    // Log admin activity
    await ctx.db.insert("adminActivityLogs", {
      adminId: adminUser._id,
      activityType: "orientation_finalization",
      details: `Finalized orientation session on ${new Date(args.selectedDate).toLocaleDateString()} at ${args.timeSlot} (${args.venue}). Completed: ${completedCount}, Missed: ${missedCount}, Excused: ${excusedCount}`,
      timestamp: Date.now(),
    });

    return {
      success: true,
      completedCount,
      missedCount,
      excusedCount,
      message: `Session finalized. ${completedCount} approved, ${missedCount} missed, ${excusedCount} excused.`,
    };
  },
});
