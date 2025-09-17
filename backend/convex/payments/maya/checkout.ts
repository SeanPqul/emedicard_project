/**
 * Maya Checkout Session Management
 * Creates and manages checkout sessions for Maya payments
 */

import { v } from "convex/values";
import { mutation } from "../../_generated/server";
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

/**
 * Creates a Maya checkout session for an application payment
 */
export const createMayaCheckout = mutation({
  args: {
    applicationId: v.id("applications"),
    amount: v.number(),
    serviceFee: v.number(),
  },
  handler: async (ctx, args) => {
    // 1. Validate application exists and is in correct status
    const application = await ctx.db.get(args.applicationId);
    if (!application) {
      throw new Error("Application not found");
    }
    
    // Check if application is in a state that allows payment
    const allowedStatuses = ["Submitted", "For Payment Validation"];
    if (!allowedStatuses.includes(application.applicationStatus)) {
      throw new Error(
        `Payment cannot be processed for application with status: ${application.applicationStatus}`
      );
    }
    
    // 2. Get user details for the buyer information
    const user = await ctx.db.get(application.userId);
    if (!user) {
      throw new Error("User not found");
    }
    
    // 3. Check if there's already an active payment for this application
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
    
    if (existingPayment) {
      // If there's an existing checkout URL, return it
      if (existingPayment.checkoutUrl) {
        return {
          paymentId: existingPayment._id,
          checkoutUrl: existingPayment.checkoutUrl,
          checkoutId: existingPayment.mayaCheckoutId || "",
          existingPayment: true,
        };
      }
    }
    
    // 4. Get job category details for the payment description
    const jobCategory = await ctx.db.get(application.jobCategoryId);
    const jobCategoryName = jobCategory?.name || "Health Card";
    
    // 5. Calculate total amount
    const totalAmount = args.amount + args.serviceFee;
    
    // 6. Prepare buyer information
    const nameParts = user.fullname.split(' ');
    const firstName = nameParts[0] || "Unknown";
    const lastName = nameParts.slice(1).join(' ') || "User";
    
    const buyer: MayaBuyer = {
      firstName,
      lastName,
      email: user.email,
      phone: user.phoneNumber,
    };
    
    // 7. Prepare items for the checkout
    const items: MayaItem[] = [
      {
        name: `${jobCategoryName} Application Fee`,
        quantity: 1,
        amount: {
          value: args.amount,
          currency: MAYA_DEFAULTS.CURRENCY,
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
        },
      });
    }
    
    // 8. Generate reference number
    const timestamp = Date.now();
    const referenceNumber = `EMC-${application._id.substring(0, 8)}-${timestamp}`;
    
    // 9. Prepare checkout request
    const checkoutRequest: MayaCheckoutRequest = {
      totalAmount: {
        value: totalAmount,
        currency: MAYA_DEFAULTS.CURRENCY,
      },
      buyer,
      items,
      requestReferenceNumber: referenceNumber,
      redirectUrl: {
        success: `${process.env.APP_URL || 'http://localhost:3000'}/payment/success`,
        failure: `${process.env.APP_URL || 'http://localhost:3000'}/payment/failure`,
        cancel: `${process.env.APP_URL || 'http://localhost:3000'}/payment/cancel`,
      },
      metadata: {
        [MAYA_METADATA_KEYS.APPLICATION_ID]: args.applicationId,
        [MAYA_METADATA_KEYS.USER_ID]: application.userId,
        [MAYA_METADATA_KEYS.PAYMENT_TYPE]: "health_card_application",
        [MAYA_METADATA_KEYS.ENVIRONMENT]: process.env.NODE_ENV || "development",
      },
    };
    
    try {
      // 10. Create checkout session with Maya
      const mayaResponse = await createCheckoutSession(checkoutRequest);
      
      // 11. Create or update payment record
      let paymentId: string;
      
      if (existingPayment) {
        // Update existing payment record
        await ctx.db.patch(existingPayment._id, {
          mayaCheckoutId: mayaResponse.checkoutId,
          mayaPaymentId: mayaResponse.paymentId,
          checkoutUrl: mayaResponse.redirectUrl,
          paymentStatus: "Processing",
          paymentProvider: "maya_api",
          updatedAt: Date.now(),
        });
        paymentId = existingPayment._id;
      } else {
        // Create new payment record
        paymentId = await ctx.db.insert("payments", {
          applicationId: args.applicationId,
          amount: args.amount,
          serviceFee: args.serviceFee,
          netAmount: totalAmount,
          paymentMethod: "Maya",
          referenceNumber,
          paymentStatus: "Processing",
          mayaCheckoutId: mayaResponse.checkoutId,
          mayaPaymentId: mayaResponse.paymentId,
          checkoutUrl: mayaResponse.redirectUrl,
          paymentProvider: "maya_api",
          updatedAt: Date.now(),
        });
      }
      
      // 12. Log the payment event
      await ctx.db.insert("paymentLogs", {
        paymentId,
        eventType: "checkout_created",
        mayaPaymentId: mayaResponse.paymentId,
        mayaCheckoutId: mayaResponse.checkoutId,
        amount: totalAmount,
        currency: MAYA_DEFAULTS.CURRENCY,
        metadata: checkoutRequest.metadata,
        timestamp: Date.now(),
      });
      
      // 13. Update application status if needed
      if (application.applicationStatus === "Submitted") {
        await ctx.db.patch(args.applicationId, {
          applicationStatus: "For Payment Validation",
          updatedAt: Date.now(),
        });
      }
      
      // 14. Return checkout details
      return {
        paymentId,
        checkoutUrl: mayaResponse.redirectUrl,
        checkoutId: mayaResponse.checkoutId,
        existingPayment: false,
      };
      
    } catch (error) {
      // Log error
      await ctx.db.insert("paymentLogs", {
        eventType: "payment_failed",
        amount: totalAmount,
        currency: MAYA_DEFAULTS.CURRENCY,
        errorMessage: error instanceof Error ? error.message : "Unknown error",
        metadata: { applicationId: args.applicationId },
        timestamp: Date.now(),
      });
      
      throw new Error(
        `Failed to create Maya checkout: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
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
    
    // Update application status back to Submitted
    await ctx.db.patch(payment.applicationId, {
      applicationStatus: "Submitted",
      updatedAt: Date.now(),
    });
    
    return { success: true };
  },
});
