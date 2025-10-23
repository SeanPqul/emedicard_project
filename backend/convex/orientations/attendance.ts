import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { Doc } from "../_generated/dataModel";
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

    // Get current inspector user
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }

    const inspector = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!inspector) {
      throw new Error("Inspector user not found");
    }

    // Perform check-in
    const checkInTime = Date.now();
    await ctx.db.patch(orientation._id, {
      checkInTime,
      checkedInBy: inspector._id,
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

    // Get current inspector user
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }

    const inspector = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!inspector) {
      throw new Error("Inspector user not found");
    }

    // Perform check-out
    const checkOutTime = Date.now();
    await ctx.db.patch(orientation._id, {
      checkOutTime,
      checkedOutBy: inspector._id,
      orientationStatus: "Completed",
    });

    // Update application and mark orientation as completed
    const application = await ctx.db.get(args.applicationId);
    if (application) {
      // Check if all documents are verified
      const documents = await ctx.db
        .query("documentUploads")
        .withIndex("by_application", (q) => q.eq("applicationId", args.applicationId))
        .collect();
      
      const allDocumentsVerified = documents.length > 0 && documents.every(doc => doc.reviewStatus === "Verified");
      
      // Only progress to "Under Review" if documents are verified
      // Otherwise keep current status but mark orientation as complete
      const newStatus = allDocumentsVerified ? "Under Review" : application.applicationStatus;
      
      await ctx.db.patch(args.applicationId, {
        applicationStatus: newStatus,
        orientationCompleted: true,
      });

      // Send appropriate notification based on status
      const message = allDocumentsVerified 
        ? "You have successfully completed your food safety orientation. Your application will now be reviewed."
        : "You have successfully completed your food safety orientation. Please ensure all documents are submitted and verified.";
      
      await ctx.db.insert("notifications", {
        userId: application.userId,
        applicationId: args.applicationId,
        title: "Orientation Completed!",
        message,
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

    // Get all orientation schedules for the selected date
    const schedules = await ctx.db
      .query("orientationSchedules")
      .withIndex("by_date", (q) => q.eq("date", args.selectedDate))
      .collect();

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
              jobCategory: jobCategory?.name || "Unknown",
              jobCategoryColor: jobCategory?.colorCode || "#gray",
              applicationStatus: application.applicationStatus,
              orientationStatus: orientation.orientationStatus,
              checkInTime: orientation.checkInTime,
              checkOutTime: orientation.checkOutTime,
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
        // Check if all documents are verified
        const documents = await ctx.db
          .query("documentUploads")
          .withIndex("by_application", (q) =>
            q.eq("applicationId", orientation.applicationId)
          )
          .collect();

        const allDocumentsVerified =
          documents.length > 0 &&
          documents.every((doc) => doc.reviewStatus === "Verified");

        // Update application status based on document verification
        const newStatus = allDocumentsVerified
          ? "Under Review"
          : application.applicationStatus;

        await ctx.db.patch(orientation.applicationId, {
          applicationStatus: newStatus,
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
            title: "Orientation Attendance Validated",
            message: allDocumentsVerified
              ? "Your orientation attendance has been validated. Your application is now under review."
              : "Your orientation attendance has been validated. Please ensure all documents are submitted and verified.",
            notificationType: "Orientation",
            isRead: false,
          });
        }

        completedCount++;
      } else if (
        !orientation.checkInTime ||
        !orientation.checkOutTime
      ) {
        // Mark as missed if not fully attended
        await ctx.db.patch(orientation._id, {
          orientationStatus: "Missed",
        });

        // Notify applicant
        const user = await ctx.db.get(application.userId);
        if (user) {
          await ctx.db.insert("notifications", {
            userId: user._id,
            applicationId: orientation.applicationId,
            title: "Orientation Attendance: Missed",
            message:
              "You did not complete the orientation session. Please reschedule your orientation.",
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
      details: `Finalized orientation session on ${new Date(args.selectedDate).toLocaleDateString()} at ${args.timeSlot} (${args.venue}). Completed: ${completedCount}, Missed: ${missedCount}`,
      timestamp: Date.now(),
    });

    return {
      success: true,
      completedCount,
      missedCount,
      message: `Session finalized. ${completedCount} completed, ${missedCount} missed.`,
    };
  },
});

/**
 * Get inspector's scan history with filtering options
 * Returns all check-in and check-out events performed by the inspector
 */
export const getInspectorScanHistory = query({
  args: {
    startDate: v.optional(v.float64()),
    endDate: v.optional(v.float64()),
    scanType: v.optional(v.union(v.literal("check-in"), v.literal("check-out"))),
    limit: v.optional(v.float64()),
  },
  handler: async (ctx, args) => {
    // Verify admin/inspector role
    const adminCheck = await AdminRole(ctx);
    if (!adminCheck.isAdmin) {
      throw new Error("Unauthorized");
    }

    // Get current inspector user
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }

    const inspector = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!inspector) {
      throw new Error("Inspector user not found");
    }

    // Collect both check-ins and check-outs
    const scanEvents: Array<{
      scanType: "check-in" | "check-out";
      timestamp: number;
      orientation: any;
    }> = [];

    // Get check-ins performed by this inspector
    if (!args.scanType || args.scanType === "check-in") {
      const checkIns = await ctx.db
        .query("orientations")
        .withIndex("by_checked_in_by", (q) => q.eq("checkedInBy", inspector._id))
        .collect();

      for (const orientation of checkIns) {
        if (orientation.checkInTime) {
          // Apply date filter
          if (args.startDate && orientation.checkInTime < args.startDate) continue;
          if (args.endDate && orientation.checkInTime > args.endDate) continue;

          scanEvents.push({
            scanType: "check-in",
            timestamp: orientation.checkInTime,
            orientation,
          });
        }
      }
    }

    // Get check-outs performed by this inspector
    if (!args.scanType || args.scanType === "check-out") {
      const checkOuts = await ctx.db
        .query("orientations")
        .withIndex("by_checked_out_by", (q) => q.eq("checkedOutBy", inspector._id))
        .collect();

      for (const orientation of checkOuts) {
        if (orientation.checkOutTime) {
          // Apply date filter
          if (args.startDate && orientation.checkOutTime < args.startDate) continue;
          if (args.endDate && orientation.checkOutTime > args.endDate) continue;

          scanEvents.push({
            scanType: "check-out",
            timestamp: orientation.checkOutTime,
            orientation,
          });
        }
      }
    }

    // Sort by timestamp descending (newest first)
    scanEvents.sort((a, b) => b.timestamp - a.timestamp);

    // Apply limit if specified
    const limitedEvents = args.limit
      ? scanEvents.slice(0, args.limit)
      : scanEvents;

    // Enrich with application and user data
    const enrichedEvents = await Promise.all(
      limitedEvents.map(async (event) => {
        try {
          const applicationDoc = await ctx.db.get(event.orientation.applicationId);
          if (!applicationDoc) return null;

          // Type guard to ensure it's an application document
          if (!('userId' in applicationDoc) || !applicationDoc.userId) return null;

          // Type assertion after validation
          const application = applicationDoc as Doc<"applications">;

          const userDoc = await ctx.db.get(application.userId);
          if (!userDoc) return null;

          // Type guard to ensure it's a user document
          if (!('fullname' in userDoc)) return null;

          // Type assertion after validation
          const user = userDoc as Doc<"users">;

          return {
            scanType: event.scanType,
            timestamp: event.timestamp,
            attendeeName: user.fullname,
            applicationId: event.orientation.applicationId,
            orientationDate: event.orientation.orientationDate,
            timeSlot: event.orientation.timeSlot,
            venue: event.orientation.orientationVenue,
            checkInTime: event.orientation.checkInTime,
            checkOutTime: event.orientation.checkOutTime,
            orientationStatus: event.orientation.orientationStatus,
          };
        } catch (error) {
          // Handle case where application or user might not exist
          return null;
        }
      })
    );

    return enrichedEvents.filter((e) => e !== null);
  },
});
