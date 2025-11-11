import { query } from "../_generated/server";
import { v } from "convex/values";

export const getNotificationWithDetailsQuery = query({
  args: { notificationId: v.id("notifications") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      return null;
    }

    const notification = await ctx.db.get(args.notificationId);

    // Verify the notification belongs to the user
    if (!notification || notification.userId !== user._id) {
      return null;
    }

    // Fetch application data if it exists
    let application = null;
    if (notification.applicationId) {
      const app = await ctx.db.get(notification.applicationId);
      if (app) {
        // Fetch related data
        const jobCategory = app.jobCategoryId ? await ctx.db.get(app.jobCategoryId) : null;
        
        // Get payment information (fetch most recent payment)
        const payment = await ctx.db
          .query("payments")
          .withIndex("by_application", (q) => q.eq("applicationId", notification.applicationId!))
          .order("desc")
          .first();
        
        // Construct form data from application fields
        const form = {
          _id: app._id,
          applicationType: app.applicationType,
          firstName: app.firstName,
          middleName: app.middleName,
          lastName: app.lastName,
          age: app.age,
          nationality: app.nationality,
          gender: app.gender,
          position: app.position,
          organization: app.organization,
          civilStatus: app.civilStatus,
          jobCategory: app.jobCategoryId,
        };
        
        application = {
          ...app,
          status: app.applicationStatus,
          jobCategory: jobCategory ? {
            _id: jobCategory._id,
            name: jobCategory.name,
            colorCode: jobCategory.colorCode,
            requireOrientation: jobCategory.requireOrientation,
          } : undefined,
          form,
          payment: payment ? {
            _id: payment._id,
            amount: payment.amount,
            serviceFee: payment.serviceFee,
            netAmount: payment.netAmount,
            method: payment.paymentMethod,
            status: payment.paymentStatus,
            referenceNumber: payment.referenceNumber,
          } : undefined,
        };
      }
    }

    return {
      notification,
      application
    };
  },
});

// Default export for convenience
export const getNotificationWithDetails = getNotificationWithDetailsQuery;