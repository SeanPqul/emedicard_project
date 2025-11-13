/**
 * Maya Payment Status Updates
 * Handles payment status updates from webhooks and manual checks
 */

import { v } from "convex/values";
import { mutation, query } from "../../_generated/server";
import { api } from "../../_generated/api";
import { getPaymentStatus as getMayaPaymentStatus } from "./client";
import { PAYMENT_STATUS_MAP } from "./constants";

/**
 * Query to check payment status from Maya
 */
export const checkPaymentStatus = query({
  args: {
    paymentId: v.id("payments"),
  },
  handler: async (ctx, args) => {
    const payment = await ctx.db.get(args.paymentId);
    if (!payment) {
      throw new Error("Payment not found");
    }
    
    if (!payment.mayaPaymentId) {
      return {
        status: payment.paymentStatus,
        message: "No Maya payment ID associated with this payment",
      };
    }
    
    try {
      // Query Maya API for current status
      const mayaStatus = await getMayaPaymentStatus(payment.mayaPaymentId);
      
      // Map Maya status to our system status
      const mappedStatus = PAYMENT_STATUS_MAP[mayaStatus.status as keyof typeof PAYMENT_STATUS_MAP] 
        || payment.paymentStatus;
      
      return {
        status: mappedStatus,
        mayaStatus: mayaStatus.status,
        isPaid: mayaStatus.isPaid,
        amount: mayaStatus.amount,
        currency: mayaStatus.currency,
        lastUpdated: mayaStatus.updatedAt,
      };
    } catch (error) {
      return {
        status: payment.paymentStatus,
        error: error instanceof Error ? error.message : "Failed to check payment status",
      };
    }
  },
});

/**
 * Updates payment status when payment is successful
 */
export const updatePaymentSuccess = mutation({
  args: {
    mayaPaymentId: v.string(),
    webhookData: v.any(),
  },
  handler: async (ctx, args) => {
    // Find payment by Maya payment ID
    const payment = await ctx.db
      .query("payments")
      .withIndex("by_maya_payment", q => q.eq("mayaPaymentId", args.mayaPaymentId))
      .unique();
    
    if (!payment) {
      console.error("Payment not found for Maya ID:", args.mayaPaymentId);
      // Log the orphaned webhook
      await ctx.db.insert("paymentLogs", {
        eventType: "webhook_received",
        mayaPaymentId: args.mayaPaymentId,
        errorMessage: "Payment record not found",
        metadata: args.webhookData,
        timestamp: Date.now(),
      });
      return { success: false, error: "Payment not found" };
    }
    
    // Don't update if already complete
    if (payment.paymentStatus === "Complete") {
      return { success: true, message: "Payment already complete" };
    }
    
    // Update payment status to complete
    await ctx.db.patch(payment._id, {
      paymentStatus: "Complete",
      webhookPayload: args.webhookData,
      updatedAt: Date.now(),
    });
    
    // Log the successful payment
    await ctx.db.insert("paymentLogs", {
      paymentId: payment._id,
      eventType: "payment_success",
      mayaPaymentId: args.mayaPaymentId,
      mayaCheckoutId: payment.mayaCheckoutId,
      amount: payment.netAmount,
      currency: "PHP",
      metadata: args.webhookData,
      timestamp: Date.now(),
    });
    
    // Update application status to next step
    const application = await ctx.db.get(payment.applicationId);
    if (application) {
      // Determine next status based on job category (Yellow Card = Food Handler)
      const jobCategory = await ctx.db.get(application.jobCategoryId);
      const requiresOrientation = jobCategory?.requireOrientation === true || jobCategory?.requireOrientation === "true";
      
      // If requires orientation (Yellow Card), go to "For Orientation"
      // Otherwise, go to "For Document Verification"
      const nextStatus = requiresOrientation ? "For Orientation" : "For Document Verification";
      
      await ctx.db.patch(application._id, {
        applicationStatus: nextStatus,
        updatedAt: Date.now(),
      });
      
      // Send notification to user
      await ctx.db.insert("notifications", {
        userId: application.userId,
        applicationId: application._id,
        title: "Payment Successful",
        message: requiresOrientation 
          ? "Your payment has been confirmed. Please proceed to schedule your food safety orientation."
          : "Your payment has been confirmed. Please proceed to document verification.",
        notificationType: "Payment",
        isRead: false,
      });
    }
    
    return { success: true };
  },
});

/**
 * Updates payment status when payment fails
 */
export const updatePaymentFailed = mutation({
  args: {
    mayaPaymentId: v.string(),
    failureReason: v.optional(v.string()),
    webhookData: v.any(),
  },
  handler: async (ctx, args) => {
    // Find payment by Maya payment ID
    const payment = await ctx.db
      .query("payments")
      .withIndex("by_maya_payment", q => q.eq("mayaPaymentId", args.mayaPaymentId))
      .unique();
    
    if (!payment) {
      console.error("Payment not found for Maya ID:", args.mayaPaymentId);
      // Log the orphaned webhook
      await ctx.db.insert("paymentLogs", {
        eventType: "webhook_received",
        mayaPaymentId: args.mayaPaymentId,
        errorMessage: "Payment record not found",
        metadata: args.webhookData,
        timestamp: Date.now(),
      });
      return { success: false, error: "Payment not found" };
    }
    
    // Update payment status to failed
    await ctx.db.patch(payment._id, {
      paymentStatus: "Failed",
      failureReason: args.failureReason || "Payment failed",
      webhookPayload: args.webhookData,
      updatedAt: Date.now(),
    });
    
    // Log the failed payment
    await ctx.db.insert("paymentLogs", {
      paymentId: payment._id,
      eventType: "payment_failed",
      mayaPaymentId: args.mayaPaymentId,
      mayaCheckoutId: payment.mayaCheckoutId,
      amount: payment.netAmount,
      currency: "PHP",
      errorMessage: args.failureReason,
      metadata: args.webhookData,
      timestamp: Date.now(),
    });
    
    // Update application status back to submitted
    await ctx.db.patch(payment.applicationId, {
      applicationStatus: "Submitted",
      updatedAt: Date.now(),
    });
    
    // Send notification to user
    const application = await ctx.db.get(payment.applicationId);
    if (application) {
      await ctx.db.insert("notifications", {
        userId: application.userId,
        applicationId: application._id,
        title: "Payment Failed",
        message: `Your payment could not be processed: ${args.failureReason || 'Unknown error'}. Please try again.`,
        notificationType: "Payment",
        isRead: false,
      });
    }
    
    return { success: true };
  },
});

/**
 * Updates payment status when payment is cancelled by user
 */
export const updatePaymentCancelled = mutation({
  args: {
    mayaPaymentId: v.string(),
    webhookData: v.any(),
  },
  handler: async (ctx, args) => {
    // Find payment by Maya payment ID
    const payment = await ctx.db
      .query("payments")
      .withIndex("by_maya_payment", q => q.eq("mayaPaymentId", args.mayaPaymentId))
      .unique();
    
    if (!payment) {
      console.error("Payment not found for Maya ID:", args.mayaPaymentId);
      // Log the orphaned webhook
      await ctx.db.insert("paymentLogs", {
        eventType: "webhook_received",
        mayaPaymentId: args.mayaPaymentId,
        errorMessage: "Payment record not found",
        metadata: args.webhookData,
        timestamp: Date.now(),
      });
      return { success: false, error: "Payment not found" };
    }
    
    // Don't update if already complete
    if (payment.paymentStatus === "Complete") {
      return { success: true, message: "Payment already complete" };
    }
    
    // Update payment status to cancelled
    await ctx.db.patch(payment._id, {
      paymentStatus: "Cancelled",
      webhookPayload: args.webhookData,
      updatedAt: Date.now(),
    });
    
    // Log the cancelled payment
    await ctx.db.insert("paymentLogs", {
      paymentId: payment._id,
      eventType: "payment_cancelled",
      mayaPaymentId: args.mayaPaymentId,
      mayaCheckoutId: payment.mayaCheckoutId,
      metadata: args.webhookData,
      timestamp: Date.now(),
    });
    
    // Update application status back to submitted
    await ctx.db.patch(payment.applicationId, {
      applicationStatus: "Submitted",
      updatedAt: Date.now(),
    });
    
    // Send notification to user
    const application = await ctx.db.get(payment.applicationId);
    if (application) {
      await ctx.db.insert("notifications", {
        userId: application.userId,
        applicationId: application._id,
        title: "Payment Cancelled",
        message: "Your payment was cancelled. Please initiate a new payment to continue with your application.",
        notificationType: "Payment",
        isRead: false,
      });
    }
    
    return { success: true };
  },
});

/**
 * Updates payment status when checkout expires
 */
export const updatePaymentExpired = mutation({
  args: {
    mayaPaymentId: v.string(),
    webhookData: v.any(),
  },
  handler: async (ctx, args) => {
    // Find payment by Maya payment ID
    const payment = await ctx.db
      .query("payments")
      .withIndex("by_maya_payment", q => q.eq("mayaPaymentId", args.mayaPaymentId))
      .unique();
    
    if (!payment) {
      console.error("Payment not found for Maya ID:", args.mayaPaymentId);
      // Log the orphaned webhook
      await ctx.db.insert("paymentLogs", {
        eventType: "webhook_received",
        mayaPaymentId: args.mayaPaymentId,
        errorMessage: "Payment record not found",
        metadata: args.webhookData,
        timestamp: Date.now(),
      });
      return { success: false, error: "Payment not found" };
    }
    
    // Don't update if already complete
    if (payment.paymentStatus === "Complete") {
      return { success: true, message: "Payment already complete" };
    }
    
    // Update payment status to expired
    await ctx.db.patch(payment._id, {
      paymentStatus: "Expired",
      webhookPayload: args.webhookData,
      updatedAt: Date.now(),
    });
    
    // Log the expired payment
    await ctx.db.insert("paymentLogs", {
      paymentId: payment._id,
      eventType: "payment_expired",
      mayaPaymentId: args.mayaPaymentId,
      mayaCheckoutId: payment.mayaCheckoutId,
      metadata: args.webhookData,
      timestamp: Date.now(),
    });
    
    // Update application status back to submitted
    await ctx.db.patch(payment.applicationId, {
      applicationStatus: "Submitted",
      updatedAt: Date.now(),
    });
    
    // Send notification to user
    const application = await ctx.db.get(payment.applicationId);
    if (application) {
      await ctx.db.insert("notifications", {
        userId: application.userId,
        applicationId: application._id,
        title: "Payment Session Expired",
        message: "Your payment session has expired. Please initiate a new payment to continue.",
        notificationType: "Payment",
        isRead: false,
      });
    }
    
    return { success: true };
  },
});

/**
 * Syncs payment status with Maya API
 */
export const syncPaymentStatus = mutation({
  args: {
    paymentId: v.id("payments"),
  },
  handler: async (ctx, args) => {
    const payment = await ctx.db.get(args.paymentId);
    if (!payment) {
      throw new Error("Payment not found");
    }
    
    if (!payment.mayaPaymentId) {
      // Payment doesn't have mayaPaymentId - this can happen with redirect-only payments
      // Just return the current status without syncing
      console.log("Payment doesn't have mayaPaymentId, skipping sync:", args.paymentId);
      return {
        success: true,
        status: payment.paymentStatus,
        synced: false,
        message: "Payment doesn't have Maya payment ID - possibly processed via redirect only",
      };
    }
    
    try {
      // Query Maya API for current status
      const mayaStatus = await getMayaPaymentStatus(payment.mayaPaymentId);
      
      // Map Maya status to our system status
      const mappedStatus = PAYMENT_STATUS_MAP[mayaStatus.status as keyof typeof PAYMENT_STATUS_MAP] 
        || payment.paymentStatus;
      
      // Update if status has changed
      if (mappedStatus !== payment.paymentStatus) {
        await ctx.db.patch(args.paymentId, {
          paymentStatus: mappedStatus as any,
          updatedAt: Date.now(),
        });
        
        // Log the status sync
        await ctx.db.insert("paymentLogs", {
          paymentId: args.paymentId,
          eventType: "status_check",
          mayaPaymentId: payment.mayaPaymentId,
          metadata: {
            previousStatus: payment.paymentStatus,
            newStatus: mappedStatus,
            mayaStatus: mayaStatus.status,
          },
          timestamp: Date.now(),
        });
        
        // Handle status-specific actions
        if (mappedStatus === "Complete" && mayaStatus.isPaid) {
          await ctx.runMutation(api.payments.maya.statusUpdates.updatePaymentSuccess, {
            mayaPaymentId: payment.mayaPaymentId!,
            webhookData: mayaStatus,
          });
        }
      }
      
      return {
        success: true,
        status: mappedStatus,
        synced: true,
      };
    } catch (error) {
      // Log sync error
      await ctx.db.insert("paymentLogs", {
        paymentId: args.paymentId,
        eventType: "status_check",
        mayaPaymentId: payment.mayaPaymentId,
        errorMessage: error instanceof Error ? error.message : "Sync failed",
        timestamp: Date.now(),
      });
      
      throw error;
    }
  },
});
