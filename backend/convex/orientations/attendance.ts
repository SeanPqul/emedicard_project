import { v } from "convex/values";
import { calculateSessionBounds, isSessionActive, isSessionPast, isSessionUpcoming, getPhilippineTimeComponents } from "../lib/timezone";
import { mutation, query } from "../_generated/server";
import { Doc, Id } from "../_generated/dataModel";
import { AdminRole } from "../users/roles";

/**
 * ORIENTATION SECURITY CONFIGURATION
 * Default minimum duration if not specified in schedule
 */
const DEFAULT_MINIMUM_DURATION_MINUTES = 20; // Default: 20 minutes

/**
 * Check-in attendee via QR code scan
 * Inspector scans user's QR code when they arrive
 *
 * UPDATED: Uses orientationBookings table
 */
export const checkIn = mutation({
  args: {
    applicationId: v.id("applications"),
  },
  handler: async (ctx, args) => {
    // Get current user
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!currentUser) {
      throw new Error("User not found");
    }

    // Verify admin/inspector role
    if (currentUser.role !== "admin" && currentUser.role !== "inspector") {
      throw new Error("Only inspectors can check in attendees");
    }

    // Get orientation booking record
    const booking = await ctx.db
      .query("orientationBookings")
      .withIndex("by_application", (q) => q.eq("applicationId", args.applicationId))
      .filter((q) => q.eq(q.field("status"), "scheduled"))
      .first();

    if (!booking) {
      throw new Error("No orientation scheduled for this application");
    }

    // Check if already checked in
    if (booking.checkInTime) {
      return {
        success: false,
        message: "Already checked in",
        checkInTime: booking.checkInTime,
      };
    }

    // Validate orientation date (must be today in PHT timezone)
    if (booking.scheduledDate) {
      const now = Date.now();
      const schedulePhtComponents = getPhilippineTimeComponents(booking.scheduledDate);
      const todayPhtComponents = getPhilippineTimeComponents(now);
      
      // Compare dates in PHT timezone
      const isSameDay = 
        schedulePhtComponents.year === todayPhtComponents.year &&
        schedulePhtComponents.month === todayPhtComponents.month &&
        schedulePhtComponents.day === todayPhtComponents.day;

      if (!isSameDay) {
        const scheduledDateStr = new Date(booking.scheduledDate).toLocaleDateString('en-US', {
          timeZone: 'Asia/Manila',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
        throw new Error(
          `Cannot check in. This orientation is scheduled for ${scheduledDateStr}. ` +
          `Please return on the scheduled date.`
        );
      }
    }

    // Perform check-in
    const checkInTime = Date.now();
    await ctx.db.patch(booking._id, {
      checkInTime,
      checkedInBy: currentUser._id,
      status: "checked-in",
      updatedAt: checkInTime,
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
 *
 * UPDATED: Uses orientationBookings table
 */
export const checkOut = mutation({
  args: {
    applicationId: v.id("applications"),
  },
  handler: async (ctx, args) => {
    // Get current user
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!currentUser) {
      throw new Error("User not found");
    }

    // Verify admin/inspector role
    if (currentUser.role !== "admin" && currentUser.role !== "inspector") {
      throw new Error("Only inspectors can check out attendees");
    }

    // Get orientation booking record
    const booking = await ctx.db
      .query("orientationBookings")
      .withIndex("by_application", (q) => q.eq("applicationId", args.applicationId))
      .filter((q) => q.eq(q.field("status"), "checked-in"))
      .first();

    if (!booking) {
      throw new Error("No checked-in orientation found for this application");
    }

    // Check if already checked out
    if (booking.checkOutTime) {
      return {
        success: false,
        message: "Already checked out",
        checkOutTime: booking.checkOutTime,
      };
    }

    // Check if checked in first
    if (!booking.checkInTime) {
      throw new Error("Cannot check out without checking in first");
    }

    // Get the orientation schedule to check duration requirement
    const schedule = await ctx.db.get(booking.scheduleId);

    // Determine required duration (use schedule duration or default)
    const requiredDurationMinutes = schedule?.durationMinutes || DEFAULT_MINIMUM_DURATION_MINUTES;
    const requiredDurationMs = requiredDurationMinutes * 60 * 1000;

    // Validate minimum orientation duration to prevent fraudulent early check-outs
    const timeElapsed = Date.now() - booking.checkInTime;
    const timeElapsedMinutes = Math.floor(timeElapsed / (60 * 1000));

    // TEMPORARILY DISABLED FOR TESTING
    // TODO: Re-enable this validation before production
    /*
    if (timeElapsed < requiredDurationMs) {
      const remainingMinutes = Math.ceil((requiredDurationMs - timeElapsed) / (60 * 1000));
      throw new Error(
        `Cannot check out yet. This orientation requires ${requiredDurationMinutes} minutes. Time elapsed: ${timeElapsedMinutes} minutes. Please wait ${remainingMinutes} more minutes.`
      );
    }
    */

    // Perform check-out
    const checkOutTime = Date.now();
    await ctx.db.patch(booking._id, {
      checkOutTime,
      checkedOutBy: currentUser._id,
      status: "completed",
      completedAt: checkOutTime,
      updatedAt: checkOutTime,
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
 *
 * UPDATED: Uses orientationBookings table
 */
export const getAttendanceStatus = query({
  args: {
    applicationId: v.id("applications"),
  },
  handler: async (ctx, args) => {
    const booking = await ctx.db
      .query("orientationBookings")
      .withIndex("by_application", (q) => q.eq("applicationId", args.applicationId))
      .first();

    if (!booking) {
      return {
        hasOrientation: false,
        status: "Not Scheduled",
      };
    }

    return {
      hasOrientation: true,
      status: booking.status,
      checkInTime: booking.checkInTime,
      checkOutTime: booking.checkOutTime,
      isCheckedIn: !!booking.checkInTime,
      isCheckedOut: !!booking.checkOutTime,
      isCompleted: booking.status === "completed",
    };
  },
});

/**
 * Get all attendees for a specific date/time/venue (for inspector view)
 *
 * UPDATED: Uses orientationBookings table
 */
export const getAttendeesForSession = query({
  args: {
    orientationDate: v.float64(),
    timeSlot: v.string(),
    orientationVenue: v.string(),
  },
  handler: async (ctx, args) => {
    // Verify admin/inspector role
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized: Authentication required");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user || (user.role !== "admin" && user.role !== "inspector")) {
      throw new Error("Unauthorized: Admin or Inspector access required");
    }

    // Get all bookings for this session
    const allBookings = await ctx.db
      .query("orientationBookings")
      .withIndex("by_date_time", (q) =>
        q.eq("scheduledDate", args.orientationDate)
         .eq("scheduledTime", args.timeSlot)
      )
      .collect();

    // Filter by venue name (can't use nested field in Convex filter)
    const bookings = allBookings.filter(b => b.venue.name === args.orientationVenue);

    // Get application and user details for each booking
    const attendees = await Promise.all(
      bookings.map(async (booking) => {
        const application = await ctx.db.get(booking.applicationId);
        if (!application) return null;

        const user = await ctx.db.get(application.userId);
        if (!user) return null;

        return {
          applicationId: booking.applicationId,
          fullname: user.fullname,
          orientationStatus: booking.status,
          checkInTime: booking.checkInTime,
          checkOutTime: booking.checkOutTime,
          qrCodeUrl: booking.qrCodeUrl,
        };
      })
    );

    return attendees.filter((a) => a !== null);
  },
});

/**
 * Get orientation schedules for a specific date with attendance details
 * (Yellow Admin view for attendance tracking)
 *
 * UPDATED: Uses orientationBookings table
 */
export const getOrientationSchedulesForDate = query({
  args: {
    selectedDate: v.float64(), // Timestamp of selected date (start of day)
  },
  handler: async (ctx, args) => {
    // Verify admin/inspector role
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized: Authentication required");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user || (user.role !== "admin" && user.role !== "inspector")) {
      throw new Error("Unauthorized: Admin or Inspector access required");
    }

    // Get all orientation schedules for the selected date
    const allSchedules = await ctx.db
      .query("orientationSchedules")
      .withIndex("by_date", (q) => q.eq("date", args.selectedDate))
      .collect();

    // Filter to only show finished/past sessions that can be finalized
    const now = Date.now();
    const pastSchedules = allSchedules.filter((schedule) => {
      const startMinutes = schedule.startMinutes ?? 0;
      const endMinutes = schedule.endMinutes ?? 1439;
      const { sessionEnd } = calculateSessionBounds(
        schedule.date,
        startMinutes,
        endMinutes
      );
      return now > sessionEnd; // Only show sessions that have ended
    });

    // For each schedule, get the attendees and their attendance status
    const schedulesWithAttendees = await Promise.all(
      pastSchedules.map(async (schedule) => {
        // Get all bookings matching this schedule
        const allBookings = await ctx.db
          .query("orientationBookings")
          .withIndex("by_date_time", (q) =>
            q.eq("scheduledDate", schedule.date)
             .eq("scheduledTime", schedule.time)
          )
          .collect();

        // Filter by venue name (can't use nested field in Convex filter)
        const bookings = allBookings.filter(b => b.venue.name === schedule.venue.name);

        // Get attendee details
        const attendees = await Promise.all(
          bookings.map(async (booking) => {
            const application = await ctx.db.get(booking.applicationId);
            if (!application) return null;

            const user = await ctx.db.get(application.userId);
            if (!user) return null;

            const jobCategory = await ctx.db.get(application.jobCategoryId);

            return {
              bookingId: booking._id,  // UPDATED: Use bookingId instead of orientationId
              applicationId: booking.applicationId,
              fullname: user.fullname,
              gender: user.gender || application.gender || "N/A",
              jobCategory: jobCategory?.name || "Unknown",
              jobCategoryColor: jobCategory?.colorCode || "#gray",
              applicationStatus: application.applicationStatus,
              orientationStatus: booking.status,
              checkInTime: booking.checkInTime,
              checkOutTime: booking.checkOutTime,
              inspectorNotes: booking.inspectorNotes,
              qrCodeUrl: booking.qrCodeUrl,
            };
          })
        );

        const validAttendees = attendees.filter((a) => a !== null);

        // Get instructor details from the schedule
        let instructorDetails = schedule.instructor || null;

        // Calculate session status based on current time
        const now = Date.now();
        const startMinutes = schedule.startMinutes ?? 0;
        const endMinutes = schedule.endMinutes ?? 1439;

        // Calculate session bounds in Philippine timezone
        const { sessionStart, sessionEnd } = calculateSessionBounds(
          schedule.date,
          startMinutes,
          endMinutes
        );

        // Determine session status
        const isActive = isSessionActive(sessionStart, sessionEnd, now);
        const isPast = isSessionPast(sessionEnd, now);
        const isUpcoming = isSessionUpcoming(sessionStart, now);

        return {
          scheduleId: schedule._id,
          date: schedule.date,
          time: schedule.time,
          startMinutes: schedule.startMinutes,
          endMinutes: schedule.endMinutes,
          venue: schedule.venue,
          instructor: instructorDetails,
          totalSlots: schedule.totalSlots,
          availableSlots: schedule.availableSlots,
          attendees: validAttendees,
          attendeeCount: validAttendees.length,
          completedCount: validAttendees.filter(
            (a) => a.orientationStatus === "completed"
          ).length,
          checkedInCount: validAttendees.filter((a) => a.checkInTime).length,
          isActive,
          isPast,
          isUpcoming,
        };
      })
    );

    return schedulesWithAttendees;
  },
});

/**
 * Update inspector notes and status for an orientation
 * Allows inspectors to mark applicants as excused with reasons
 *
 * UPDATED: Uses orientationBookings table
 */
export const updateInspectorNotes = mutation({
  args: {
    orientationId: v.id("orientationBookings"),
    notes: v.string(),
    status: v.optional(v.union(
      v.literal("scheduled"),
      v.literal("completed"),
      v.literal("missed"),
      v.literal("excused")
    )),
  },
  handler: async (ctx, args) => {
    // Verify admin/inspector role
    const adminCheck = await AdminRole(ctx);
    if (!adminCheck.isAdmin) {
      throw new Error("Unauthorized: Admin/Inspector access required");
    }

    const booking = await ctx.db.get(args.orientationId);
    if (!booking) {
      throw new Error("Orientation booking not found");
    }

    // Update booking with inspector notes and optionally status
    const updateData: any = {
      inspectorNotes: args.notes,
      updatedAt: Date.now(),
    };

    if (args.status) {
      updateData.status = args.status;
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
          applicationId: booking.applicationId,
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
 * Manually update orientation status (for admin override)
 * Allows admin to mark attendees as Completed or Excused manually
 *
 * UPDATED: Uses orientationBookings table
 */
export const manuallyUpdateAttendanceStatus = mutation({
  args: {
    // Accept both names for compatibility
    bookingId: v.optional(v.id("orientationBookings")),
    orientationId: v.optional(v.id("orientationBookings")),
    newStatus: v.union(
      v.literal("completed"),
      v.literal("excused"),
      v.literal("missed")
    ),
    adminNotes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Support both parameter names
    const bookingId = args.bookingId || args.orientationId;
    if (!bookingId) {
      throw new Error("Booking ID is required");
    }
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

    const booking = await ctx.db.get(bookingId);
    if (!booking) {
      throw new Error("Orientation booking not found");
    }

    // Update booking status
    const updateData: any = {
      status: args.newStatus,
      updatedAt: Date.now(),
    };

    // If marking as Completed, ensure check-in and check-out times exist
    if (args.newStatus === "completed") {
      if (!booking.checkInTime) {
        updateData.checkInTime = Date.now();
        updateData.checkedInBy = adminUser._id;
      }
      if (!booking.checkOutTime) {
        updateData.checkOutTime = Date.now();
        updateData.checkedOutBy = adminUser._id;
        updateData.completedAt = Date.now();
      }
    }

    if (args.adminNotes) {
      updateData.inspectorNotes = args.adminNotes;
    }

    await ctx.db.patch(bookingId, updateData);

    // Update application status if marked as Completed
    if (args.newStatus === "completed") {
      await ctx.db.patch(booking.applicationId, {
        applicationStatus: "Approved",
        orientationCompleted: true,
        updatedAt: Date.now(),
        lastUpdatedBy: adminUser._id,
      });
    }

    // Log admin activity
    await ctx.db.insert("adminActivityLogs", {
      adminId: adminUser._id,
      activityType: "orientation_manual_status_update",
      details: `Manually updated orientation status to ${args.newStatus}${args.adminNotes ? ` - Notes: ${args.adminNotes}` : ""}`,
      timestamp: Date.now(),
      applicationId: booking.applicationId,
    });

    return {
      success: true,
      message: `Orientation status updated to ${args.newStatus}`,
    };
  },
});

/**
 * Finalize attendance validation for a session
 * Updates applicants who completed orientation to next status
 *
 * UPDATED: Uses orientationBookings table
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

    // Get all bookings for this session
    const allBookings = await ctx.db
      .query("orientationBookings")
      .withIndex("by_date_time", (q) =>
        q.eq("scheduledDate", args.selectedDate)
         .eq("scheduledTime", args.timeSlot)
      )
      .collect();

    // Filter by venue name (can't use nested field in Convex filter)
    const bookings = allBookings.filter(b => b.venue.name === args.venue);

    let completedCount = 0;
    let missedCount = 0;
    let excusedCount = 0;

    // Process each booking
    for (const booking of bookings) {
      const application = await ctx.db.get(booking.applicationId);
      if (!application) continue;

      // Check if orientation was completed (checked in AND checked out)
      if (
        booking.checkInTime &&
        booking.checkOutTime &&
        booking.status === "completed"
      ) {
        // Update application status to "Approved" (Yellow Card completed all requirements)
        await ctx.db.patch(booking.applicationId, {
          applicationStatus: "Approved",
          orientationCompleted: true,
          updatedAt: Date.now(),
          lastUpdatedBy: adminUser._id,
        });

        // TODO: Send notification when health card distribution feature is ready
        // For now, just update status to Approved without notification

        completedCount++;
      } else if (booking.status === "excused") {
        // Excused applicants - keep their current status for manual handling
        // The admin has already marked them as excused with notes
        excusedCount++;
      } else if (
        !booking.checkInTime ||
        !booking.checkOutTime ||
        booking.status === "missed"
      ) {
        // Mark as missed and reject application (send back to "For Orientation")
        await ctx.db.patch(booking._id, {
          status: "missed",
          updatedAt: Date.now(),
        });

        // Update application status back to "For Orientation" so they can rebook
        await ctx.db.patch(booking.applicationId, {
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
            applicationId: booking.applicationId,
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

/**
 * Get inspector's scan history with filtering options
 * Returns all check-in and check-out events performed by the inspector
 *
 * UPDATED: Uses orientationBookings table
 */
export const getInspectorScanHistory = query({
  args: {
    startDate: v.optional(v.float64()),
    endDate: v.optional(v.float64()),
    scanType: v.optional(v.union(v.literal("check-in"), v.literal("check-out"))),
    limit: v.optional(v.float64()),
  },
  handler: async (ctx, args) => {
    // Get current inspector/admin user
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized: Authentication required");
    }

    const inspector = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!inspector) {
      throw new Error("User not found");
    }

    // Verify admin/inspector role
    if (inspector.role !== "admin" && inspector.role !== "inspector") {
      throw new Error("Unauthorized: Admin or Inspector access required");
    }

    // Collect both check-ins and check-outs
    const scanEvents: Array<{
      scanType: "check-in" | "check-out";
      timestamp: number;
      booking: any;
    }> = [];

    // Get check-ins performed by this inspector
    if (!args.scanType || args.scanType === "check-in") {
      const checkIns = await ctx.db
        .query("orientationBookings")
        .withIndex("by_checked_in_by", (q) => q.eq("checkedInBy", inspector._id))
        .collect();

      for (const booking of checkIns) {
        if (booking.checkInTime) {
          // Apply date filter
          if (args.startDate && booking.checkInTime < args.startDate) continue;
          if (args.endDate && booking.checkInTime > args.endDate) continue;

          scanEvents.push({
            scanType: "check-in",
            timestamp: booking.checkInTime,
            booking,
          });
        }
      }
    }

    // Get check-outs performed by this inspector
    if (!args.scanType || args.scanType === "check-out") {
      const checkOuts = await ctx.db
        .query("orientationBookings")
        .withIndex("by_checked_out_by", (q) => q.eq("checkedOutBy", inspector._id))
        .collect();

      for (const booking of checkOuts) {
        if (booking.checkOutTime) {
          // Apply date filter
          if (args.startDate && booking.checkOutTime < args.startDate) continue;
          if (args.endDate && booking.checkOutTime > args.endDate) continue;

          scanEvents.push({
            scanType: "check-out",
            timestamp: booking.checkOutTime,
            booking,
          });
        }
      }
    }

    // Sort by timestamp (newest first)
    scanEvents.sort((a, b) => b.timestamp - a.timestamp);

    // Apply limit if specified
    const limitedEvents = args.limit
      ? scanEvents.slice(0, args.limit)
      : scanEvents;

    // Enrich with user/application details
    const enrichedEvents = await Promise.all(
      limitedEvents.map(async (event) => {
        const application = await ctx.db.get(event.booking.applicationId) as Doc<"applications"> | null;
        if (!application) return null;

        const appUser = await ctx.db.get(application.userId);
        if (!appUser) return null;

        return {
          scanType: event.scanType,
          timestamp: event.timestamp,
          attendeeName: appUser.fullname,
          applicationId: event.booking.applicationId,
          orientationDate: event.booking.scheduledDate,
          orientationTime: event.booking.scheduledTime,
          venue: event.booking.venue.name,
          orientationStatus: event.booking.status,
        };
      })
    );

    return enrichedEvents.filter((e) => e !== null);
  },
});
