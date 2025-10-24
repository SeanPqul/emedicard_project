/**
 * Abandoned Payment Handler
 * Handles payments that are stuck in "Processing" state when users abandon the checkout
 */

import { v } from "convex/values";
import { mutation, query } from "../../_generated/server";
import { Id } from "../../_generated/dataModel";

// Timeout duration in milliseconds (5 minutes)
const PAYMENT_TIMEOUT_MS = 5 * 60 * 1000;

/**
 * Checks if a payment is abandoned (stuck in Processing state)
 */
export const checkIfPaymentAbandoned = query({
  args: {
    paymentId: v.id("payments"),
  },
  handler: async (ctx, args) => {
    const payment = await ctx.db.get(args.paymentId);
    if (!payment) {
      throw new Error("Payment not found");
    }

    // Only check processing payments
    if (payment.paymentStatus !== "Processing") {
      return {
        isAbandoned: false,
        status: payment.paymentStatus,
        message: `Payment is already ${payment.paymentStatus}`,
      };
    }

    // Check if payment has been processing for too long
    const now = Date.now();
    const paymentAge = now - payment._creationTime;
    const isAbandoned = paymentAge > PAYMENT_TIMEOUT_MS;

    return {
      isAbandoned,
      status: payment.paymentStatus,
      ageInMinutes: Math.floor(paymentAge / 60000),
      message: isAbandoned 
        ? "Payment has been processing for too long and may be abandoned"
        : "Payment is still within the normal processing time",
    };
  },
});

/**
 * Handles an abandoned payment by cancelling it
 */
export const handleAbandonedPayment = mutation({
  args: {
    paymentId: v.id("payments"),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const payment = await ctx.db.get(args.paymentId);
    if (!payment) {
      throw new Error("Payment not found");
    }

    // Only handle processing payments
    if (payment.paymentStatus !== "Processing") {
      return {
        success: false,
        message: `Cannot cancel payment with status: ${payment.paymentStatus}`,
      };
    }

    // Update payment status to cancelled
    await ctx.db.patch(args.paymentId, {
      paymentStatus: "Cancelled",
      failureReason: args.reason || "Payment abandoned by user",
      updatedAt: Date.now(),
    });

    // Log the cancellation
    await ctx.db.insert("paymentLogs", {
      paymentId: args.paymentId,
      eventType: "payment_cancelled",
      mayaPaymentId: payment.mayaPaymentId,
      mayaCheckoutId: payment.mayaCheckoutId,
      metadata: { 
        reason: args.reason || "User abandoned checkout",
        abandonedAfterMinutes: Math.floor((Date.now() - payment._creationTime) / 60000),
      },
      timestamp: Date.now(),
    });

    // Update application status back to Submitted
    const application = await ctx.db.get(payment.applicationId);
    if (application) {
      await ctx.db.patch(payment.applicationId, {
        applicationStatus: "Submitted",
        updatedAt: Date.now(),
      });

      // Send notification to user
      await ctx.db.insert("notifications", {
        userId: application.userId,
        applicationId: application._id,
        title: "Payment Cancelled",
        message: "Your payment was cancelled. You can retry the payment at any time.",
        notificationType: "Payment",
        isRead: false,
      });
    }

    return {
      success: true,
      message: "Payment successfully cancelled",
    };
  },
});

/**
 * Gets the latest payment for an application to check its status
 */
export const getLatestPaymentForApplication = query({
  args: {
    applicationId: v.id("applications"),
  },
  handler: async (ctx, args) => {
    // Get the most recent payment for this application
    const payment = await ctx.db
      .query("payments")
      .withIndex("by_application", q => q.eq("applicationId", args.applicationId))
      .order("desc")
      .first();

    if (!payment) {
      return null;
    }

    // Check if it's abandoned
    const isProcessing = payment.paymentStatus === "Processing";
    const ageInMs = Date.now() - payment._creationTime;
    const isAbandoned = isProcessing && ageInMs > PAYMENT_TIMEOUT_MS;

    return {
      paymentId: payment._id,
      status: payment.paymentStatus,
      checkoutUrl: payment.checkoutUrl,
      isProcessing,
      isAbandoned,
      ageInMinutes: Math.floor(ageInMs / 60000),
      createdAt: payment._creationTime,
    };
  },
});

/**
 * Automatically cancels abandoned payments (can be called periodically)
 */
export const cleanupAbandonedPayments = mutation({
  args: {},
  handler: async (ctx) => {
    const cutoffTime = Date.now() - PAYMENT_TIMEOUT_MS;
    
    // Find all processing payments older than the timeout
    const abandonedPayments = await ctx.db
      .query("payments")
      .filter(q => 
        q.and(
          q.eq(q.field("paymentStatus"), "Processing"),
          q.lt(q.field("_creationTime"), cutoffTime)
        )
      )
      .collect();

    const results = [];
    
    for (const payment of abandonedPayments) {
      try {
        // Cancel the abandoned payment
        await ctx.db.patch(payment._id, {
          paymentStatus: "Cancelled",
          failureReason: "Payment abandoned - timeout exceeded",
          updatedAt: Date.now(),
        });

        // Log the cancellation
        await ctx.db.insert("paymentLogs", {
          paymentId: payment._id,
          eventType: "payment_cancelled",
          mayaPaymentId: payment.mayaPaymentId,
          mayaCheckoutId: payment.mayaCheckoutId,
          metadata: { 
            reason: "Automatic cleanup - payment timeout",
            ageInMinutes: Math.floor((Date.now() - payment._creationTime) / 60000),
          },
          timestamp: Date.now(),
        });

        // Update application status back to Submitted
        const application = await ctx.db.get(payment.applicationId);
        if (application) {
          await ctx.db.patch(payment.applicationId, {
            applicationStatus: "Submitted",
            updatedAt: Date.now(),
          });
        }

        results.push({
          paymentId: payment._id,
          success: true,
        });
      } catch (error) {
        results.push({
          paymentId: payment._id,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return {
      processed: results.length,
      results,
    };
  },
});
