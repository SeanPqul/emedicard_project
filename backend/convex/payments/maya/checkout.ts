/**
 * Maya Checkout Session Management
 * Creates and manages checkout sessions for Maya payments
 */

import { v } from "convex/values";
import { action, mutation, internalMutation, internalQuery } from "../../_generated/server";
import { Id } from "../../_generated/dataModel";
import { 
  createCheckoutSession, 
  logPaymentEvent 
} from "./client";
import {
  MayaCheckoutRequest,
  MayaItem,
  MayaBuyer
} from "./types";
import { MAYA_DEFAULTS, MAYA_METADATA_KEYS } from "./constants";
import { api, internal } from "../../_generated/api";

/**
 * Internal query to get checkout data for Maya
 */
export const getCheckoutData = internalQuery({
  args: {
    applicationId: v.id("applications"),
  },
  handler: async (ctx, args) => {
    // 1. Get application
    const application = await ctx.db.get(args.applicationId);
    if (!application) {
      throw new Error("Application not found");
    }
    
    // Check if application is in a state that allows payment
    const allowedStatuses = ["Pending Payment", "Submitted", "For Payment Validation"];
    if (!allowedStatuses.includes(application.applicationStatus)) {
      throw new Error(
        `Payment cannot be processed for application with status: ${application.applicationStatus}`
      );
    }
    
    // 2. Get user details
    const user = await ctx.db.get(application.userId);
    if (!user) {
      throw new Error("User not found");
    }
    
    // 3. Check for existing payment
    const existingPayment = await ctx.db
      .query("payments")
      .withIndex("by_application", q => q.eq("applicationId", args.applicationId))
      .filter(q => 
        q.or(
          q.eq(q.field("paymentStatus"), "Processing"),
          q.eq(q.field("paymentStatus"), "Pending")
        )
      )
      .first();
    
    // 4. Get job category
    const jobCategory = await ctx.db.get(application.jobCategoryId);
    const jobCategoryName = jobCategory?.name || "Health Card";
    
    return {
      application,
      user,
      existingPayment,
      jobCategoryName,
    };
  },
});

/**
 * Internal mutation to save Maya checkout data
 */
export const saveMayaCheckout = internalMutation({
  args: {
    applicationId: v.id("applications"),
    amount: v.number(),
    serviceFee: v.number(),
    totalAmount: v.number(),
    referenceNumber: v.string(),
    mayaCheckoutId: v.string(),
    mayaPaymentId: v.optional(v.string()),
    checkoutUrl: v.string(),
    metadata: v.any(),
    existingPaymentId: v.optional(v.id("payments")),
  },
  handler: async (ctx, args) => {
    let paymentId: string;
    
    if (args.existingPaymentId) {
      // Update existing payment record
      await ctx.db.patch(args.existingPaymentId, {
        mayaCheckoutId: args.mayaCheckoutId,
        mayaPaymentId: args.mayaPaymentId,
        checkoutUrl: args.checkoutUrl,
        paymentStatus: "Processing",
        paymentProvider: "maya_api",
        updatedAt: Date.now(),
      });
      paymentId = args.existingPaymentId;
    } else {
      // Create new payment record
      paymentId = await ctx.db.insert("payments", {
        applicationId: args.applicationId,
        amount: args.amount,
        serviceFee: args.serviceFee,
        netAmount: args.totalAmount,
        paymentMethod: "Maya",
        referenceNumber: args.referenceNumber,
        paymentStatus: "Processing",
        mayaCheckoutId: args.mayaCheckoutId,
        mayaPaymentId: args.mayaPaymentId,
        checkoutUrl: args.checkoutUrl,
        paymentProvider: "maya_api",
        updatedAt: Date.now(),
      });
    }
    
    // Log the payment event
    await ctx.db.insert("paymentLogs", {
      paymentId: paymentId as Id<"payments">,
      eventType: "checkout_created",
      mayaPaymentId: args.mayaPaymentId,
      mayaCheckoutId: args.mayaCheckoutId,
      amount: args.totalAmount,
      currency: MAYA_DEFAULTS.CURRENCY,
      metadata: args.metadata,
      timestamp: Date.now(),
    });
    
    // Only update application status if this is a successful Maya checkout update
    // Don't update for placeholder records
    if (args.mayaCheckoutId !== "pending" && args.checkoutUrl !== "pending") {
      const application = await ctx.db.get(args.applicationId);
      if (application && (application.applicationStatus === "Submitted" || application.applicationStatus === "Pending Payment")) {
        await ctx.db.patch(args.applicationId, {
          applicationStatus: "For Payment Validation",
          updatedAt: Date.now(),
        });
      }
    }
    
    return paymentId;
  },
});

/**
 * Internal mutation to log payment error
 */
export const logPaymentError = internalMutation({
  args: {
    applicationId: v.id("applications"),
    amount: v.number(),
    errorMessage: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("paymentLogs", {
      eventType: "payment_failed",
      amount: args.amount,
      currency: MAYA_DEFAULTS.CURRENCY,
      errorMessage: args.errorMessage,
      metadata: { applicationId: args.applicationId },
      timestamp: Date.now(),
    });
  },
});

/**
 * Creates a Maya checkout session for an application payment
 * This is now an action that can use setTimeout and external APIs
 */
export const createMayaCheckout = action({
  args: {
    applicationId: v.id("applications"),
    amount: v.number(),
    serviceFee: v.number(),
  },
  handler: async (ctx, args): Promise<{
    paymentId: string;
    checkoutUrl: string;
    checkoutId: string;
    existingPayment: boolean;
  }> => {
    // 1. Get checkout data from database
    const checkoutData = await ctx.runQuery(
      internal.payments.maya.checkout.getCheckoutData,
      { applicationId: args.applicationId }
    );
    
    const { application, user, existingPayment, jobCategoryName } = checkoutData;
    
    // If there's an existing checkout URL, return it
    if (existingPayment && existingPayment.checkoutUrl) {
      return {
        paymentId: existingPayment._id,
        checkoutUrl: existingPayment.checkoutUrl,
        checkoutId: existingPayment.mayaCheckoutId || "",
        existingPayment: true,
      };
    }
    
    // 2. Calculate total amount
    const totalAmount = 60; // ₱50 base + ₱10 service fee
    
    // 3. Prepare buyer information
    const nameParts = user.fullname.split(' ');
    const firstName = nameParts[0] || "Unknown";
    const lastName = nameParts.slice(1).join(' ') || "User";
    
    // Handle phone number - Maya requires it in a specific format
    let phone = user.phoneNumber || "";
    if (!phone) {
      // Use a default Philippine phone number if none provided
      phone = "639000000000";
    } else {
      // Remove any + or leading zeros
      phone = phone.replace(/^\+/, '').replace(/^0/, '');
      // Add country code if missing
      if (phone.startsWith("9") && phone.length === 10) {
        phone = "63" + phone;
      }
    }
    
    const buyer: MayaBuyer = {
      firstName,
      lastName,
      contact: {
        phone: phone,
        email: user.email,
      },
    };
    
    // 4. Prepare items for the checkout
    const items: MayaItem[] = [
      {
        name: `${jobCategoryName} Application Fee`,
        quantity: 1,
        amount: {
          value: args.amount,
          currency: MAYA_DEFAULTS.CURRENCY,
          details: {},
        },
        totalAmount: {
          value: args.amount,
          currency: MAYA_DEFAULTS.CURRENCY,
          details: {},
        },
      },
    ];
    
    if (args.serviceFee > 0) {
      items.push({
        name: "Service Fee",
        quantity: 1,
        amount: {
          value: args.serviceFee,
          currency: MAYA_DEFAULTS.CURRENCY,
          details: {},
        },
        totalAmount: {
          value: args.serviceFee,
          currency: MAYA_DEFAULTS.CURRENCY,
          details: {},
        },
      });
    }
    
    // 5. Generate reference number
    const timestamp = Date.now();
    const referenceNumber = `EMC-${application._id.substring(0, 8)}-${timestamp}`;
    
    // 6. Create payment record first to get paymentId
    let paymentId: string;
    if (existingPayment) {
      paymentId = existingPayment._id;
    } else {
      // Create placeholder payment record
      paymentId = await ctx.runMutation(
        internal.payments.maya.checkout.saveMayaCheckout,
        {
          applicationId: args.applicationId,
          amount: args.amount,
          serviceFee: args.serviceFee,
          totalAmount,
          referenceNumber,
          mayaCheckoutId: "pending", // Temporary value
          mayaPaymentId: undefined,
          checkoutUrl: "pending", // Temporary value
          metadata: {},
          existingPaymentId: undefined,
        }
      );
    }
    
    // 7. Now prepare checkout request with paymentId in redirect URLs
    const checkoutRequest: MayaCheckoutRequest = {
      totalAmount: {
        value: totalAmount,
        currency: MAYA_DEFAULTS.CURRENCY,
      },
      buyer,
      items,
      requestReferenceNumber: referenceNumber,
      redirectUrl: {
        success: `${process.env.CONVEX_URL || 'https://your-app.convex.site'}/payment-redirect?status=success&paymentId=${paymentId}&applicationId=${args.applicationId}`,
        failure: `${process.env.CONVEX_URL || 'https://your-app.convex.site'}/payment-redirect?status=failure&paymentId=${paymentId}&applicationId=${args.applicationId}`,
        cancel: `${process.env.CONVEX_URL || 'https://your-app.convex.site'}/payment-redirect?status=cancel&paymentId=${paymentId}&applicationId=${args.applicationId}`,
      },
      metadata: {
        applicationId: args.applicationId,
        paymentId: paymentId,
      },
    };
    
    // Debug logging
    console.log("Maya checkout request:", JSON.stringify(checkoutRequest, null, 2));
    
    try {
      // 8. Create checkout session with Maya
      const mayaResponse = await createCheckoutSession(checkoutRequest);
      
      // 9. Update payment record with Maya details
      await ctx.runMutation(
        internal.payments.maya.checkout.saveMayaCheckout,
        {
          applicationId: args.applicationId,
          amount: args.amount,
          serviceFee: args.serviceFee,
          totalAmount,
          referenceNumber,
          mayaCheckoutId: mayaResponse.checkoutId,
          mayaPaymentId: mayaResponse.paymentId,
          checkoutUrl: mayaResponse.redirectUrl,
          metadata: checkoutRequest.metadata,
          existingPaymentId: paymentId as Id<"payments">,
        }
      );
      
      // 9. Return checkout details
      return {
        paymentId,
        checkoutUrl: mayaResponse.redirectUrl,
        checkoutId: mayaResponse.checkoutId,
        existingPayment: false,
      };
      
    } catch (error) {
      // Clean up the placeholder payment record if it was just created
      if (!existingPayment && paymentId) {
        try {
          // Delete the failed payment record
          await ctx.runMutation(internal.payments.maya.checkout.deleteFailedPayment, {
            paymentId: paymentId as Id<"payments">,
          });
        } catch (cleanupError) {
          console.error("Failed to clean up payment record:", cleanupError);
        }
      }
      
      // Log error
      await ctx.runMutation(
        internal.payments.maya.checkout.logPaymentError,
        {
          applicationId: args.applicationId,
          amount: totalAmount,
          errorMessage: error instanceof Error ? error.message : "Unknown error",
        }
      );
      
      throw new Error(
        `Failed to create Maya checkout: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  },
});

/**
 * Internal mutation to delete failed payment records
 */
export const deleteFailedPayment = internalMutation({
  args: {
    paymentId: v.id("payments"),
  },
  handler: async (ctx, args) => {
    const payment = await ctx.db.get(args.paymentId);
    if (!payment) {
      return; // Already deleted
    }
    
    // Only delete if it's a pending placeholder
    if (payment.mayaCheckoutId === "pending" && payment.checkoutUrl === "pending") {
      await ctx.db.delete(args.paymentId);
    }
  },
});

/**
 * Cancels a Maya checkout session
 */
export const cancelMayaCheckout = mutation({
  args: {
    paymentId: v.id("payments"),
  },
  handler: async (ctx, args) => {
    const payment = await ctx.db.get(args.paymentId);
    if (!payment) {
      throw new Error("Payment not found");
    }
    
    // Only allow cancellation of processing payments
    if (payment.paymentStatus !== "Processing") {
      throw new Error(`Cannot cancel payment with status: ${payment.paymentStatus}`);
    }
    
    // Update payment status
    await ctx.db.patch(args.paymentId, {
      paymentStatus: "Cancelled",
      updatedAt: Date.now(),
    });
    
    // Log the cancellation
    await ctx.db.insert("paymentLogs", {
      paymentId: args.paymentId,
      eventType: "payment_cancelled",
      mayaPaymentId: payment.mayaPaymentId,
      mayaCheckoutId: payment.mayaCheckoutId,
      metadata: { reason: "User cancelled" },
      timestamp: Date.now(),
    });
    
    // Update application status back to appropriate state
    // Check if there's a payment deadline to determine if it was "Pending Payment"
    const application = await ctx.db.get(payment.applicationId);
    if (application && application.paymentDeadline) {
      // If there's a payment deadline, it was "Pending Payment"
      await ctx.db.patch(payment.applicationId, {
        applicationStatus: "Pending Payment",
        updatedAt: Date.now(),
      });
    } else {
      // Otherwise, it was "Submitted"
      await ctx.db.patch(payment.applicationId, {
        applicationStatus: "Submitted",
        updatedAt: Date.now(),
      });
    }
    
    return { success: true };
  },
});
