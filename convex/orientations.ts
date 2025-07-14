import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getOrientationByFormId = query({
  args: { formId: v.id("forms") },
  handler: async (ctx, args) => {
    const orientation = await ctx.db
      .query("orientations")
      .withIndex("by_form", (q) => q.eq("formId", args.formId))
      .unique();
    
    if (!orientation) {
      return null;
    }

    const form = await ctx.db.get(args.formId);
    const jobCategory = form ? await ctx.db.get(form.jobCategory) : null;

    return {
      ...orientation,
      form,
      jobCategory,
    };
  },
});

export const getUserOrientations = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      return [];
    }

    const userForms = await ctx.db
      .query("forms")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    const formIds = userForms.map((form) => form._id);

    const orientations = await Promise.all(
      formIds.map(async (formId) => {
        const orientation = await ctx.db
          .query("orientations")
          .withIndex("by_form", (q) => q.eq("formId", formId))
          .unique();
        return orientation;
      })
    );

    const orientationsWithDetails = await Promise.all(
      orientations.filter(Boolean).map(async (orientation) => {
        const form = await ctx.db.get(orientation!.formId);
        const jobCategory = form ? await ctx.db.get(form.jobCategory) : null;
        return {
          ...orientation,
          form,
          jobCategory,
        };
      })
    );

    return orientationsWithDetails;
  },
});

export const createOrientation = mutation({
  args: {
    formId: v.id("forms"),
    scheduleAt: v.number(),
    qrCodeUrl: v.string(),
  },
  handler: async (ctx, args) => {
    const orientationId = await ctx.db.insert("orientations", {
      formId: args.formId,
      scheduleAt: args.scheduleAt,
      qrCodeUrl: args.qrCodeUrl,
      checkInTime: 0,
      checkOutTime: 0,
    });

    return orientationId;
  },
});

export const updateOrientationCheckIn = mutation({
  args: {
    orientationId: v.id("orientations"),
    checkInTime: v.number(),
    scanLocation: v.optional(v.object({
      latitude: v.number(),
      longitude: v.number(),
      address: v.optional(v.string()),
    })),
    deviceInfo: v.optional(v.object({
      platform: v.string(),
      deviceId: v.string(),
      appVersion: v.string(),
    })),
  },
  handler: async (ctx, args) => {
    try {
      const orientation = await ctx.db.get(args.orientationId);
      if (!orientation) {
        throw new Error("Orientation not found");
      }

      // Check if orientation is scheduled for today
      const today = new Date();
      const orientationDate = new Date(orientation.scheduleAt);
      if (orientationDate.toDateString() !== today.toDateString()) {
        throw new Error("Orientation check-in is only allowed on the scheduled date");
      }

      // Check if already checked in
      if (orientation.checkInTime > 0) {
        throw new Error("Already checked in for this orientation");
      }

      await ctx.db.patch(args.orientationId, {
        checkInTime: args.checkInTime,
      });

      // Get form and user details for notification
      const form = await ctx.db.get(orientation.formId);
      const user = form ? await ctx.db.get(form.userId) : null;

      // Create notification for successful check-in
      if (user) {
        await ctx.db.insert("notifications", {
          userId: user._id,
          formsId: orientation.formId,
          type: "OrientationScheduled",
          message: `Successfully checked in to orientation at ${new Date(args.checkInTime).toLocaleTimeString()}`,
          read: false,
        });
      }

      return {
        orientationId: args.orientationId,
        checkInTime: args.checkInTime,
        success: true,
        message: "Successfully checked in to orientation",
      };
    } catch (error) {
      console.error("Error checking in to orientation:", error);
      throw new Error(error instanceof Error ? error.message : "Failed to check in to orientation. Please try again.");
    }
  },
});

export const updateOrientationCheckOut = mutation({
  args: {
    orientationId: v.id("orientations"),
    checkOutTime: v.number(),
    scanLocation: v.optional(v.object({
      latitude: v.number(),
      longitude: v.number(),
      address: v.optional(v.string()),
    })),
    deviceInfo: v.optional(v.object({
      platform: v.string(),
      deviceId: v.string(),
      appVersion: v.string(),
    })),
  },
  handler: async (ctx, args) => {
    try {
      const orientation = await ctx.db.get(args.orientationId);
      if (!orientation) {
        throw new Error("Orientation not found");
      }

      // Check if user has checked in first
      if (orientation.checkInTime === 0) {
        throw new Error("You must check in before checking out");
      }

      // Check if already checked out
      if (orientation.checkOutTime > 0) {
        throw new Error("Already checked out from this orientation");
      }

      // Validate check-out time is after check-in time
      if (args.checkOutTime <= orientation.checkInTime) {
        throw new Error("Check-out time must be after check-in time");
      }

      await ctx.db.patch(args.orientationId, {
        checkOutTime: args.checkOutTime,
      });

      // Get form and user details for notification
      const form = await ctx.db.get(orientation.formId);
      const user = form ? await ctx.db.get(form.userId) : null;

      // Calculate duration
      const duration = Math.round((args.checkOutTime - orientation.checkInTime) / 1000 / 60); // in minutes

      // Create notification for successful check-out
      if (user) {
        await ctx.db.insert("notifications", {
          userId: user._id,
          formsId: orientation.formId,
          type: "OrientationScheduled",
          message: `Successfully checked out from orientation at ${new Date(args.checkOutTime).toLocaleTimeString()}. Duration: ${duration} minutes`,
          read: false,
        });
      }

      return {
        orientationId: args.orientationId,
        checkOutTime: args.checkOutTime,
        duration: duration,
        success: true,
        message: "Successfully checked out from orientation",
      };
    } catch (error) {
      console.error("Error checking out from orientation:", error);
      throw new Error(error instanceof Error ? error.message : "Failed to check out from orientation. Please try again.");
    }
  },
});

export const completeOrientation = mutation({
  args: {
    orientationId: v.id("orientations"),
    checkInTime: v.number(),
    checkOutTime: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.orientationId, {
      checkInTime: args.checkInTime,
      checkOutTime: args.checkOutTime,
    });
    return args.orientationId;
  },
});
