/**
 * Maya Webhook Handler
 * Receives and processes payment status updates from Maya
 */

import { v } from "convex/values";
import { httpAction, mutation, query } from "../../_generated/server";
import { api } from "../../_generated/api";
import { validateWebhookSignature } from "./client";
import { MAYA_HEADERS, MAYA_WEBHOOK_EVENTS } from "./constants";
import { MayaWebhookPayload } from "./types";

/**
 * HTTP action to handle Maya webhook callbacks
 * This endpoint will be registered with Maya to receive payment updates
 */
export const handleMayaWebhook = httpAction(async (ctx, request: Request) => {
  try {
    // 1. Get the raw body for signature verification
    const body = await request.text();
    
    // 2. Verify webhook signature
    const signature = request.headers.get(MAYA_HEADERS.SIGNATURE);
    
    if (!signature) {
      console.error("Maya webhook received without signature");
      return new Response("Missing signature", { status: 401 });
    }
    
    const isValid = validateWebhookSignature(signature, body);
    
    if (!isValid) {
      console.error("Maya webhook signature verification failed");
      return new Response("Invalid signature", { status: 401 });
    }
    
    // 3. Parse webhook payload
    let data: MayaWebhookPayload;
    try {
      data = JSON.parse(body);
    } catch (error) {
      console.error("Failed to parse Maya webhook payload:", error);
      return new Response("Invalid payload", { status: 400 });
    }
    
    // 4. Log webhook receipt
    await ctx.runMutation(api.payments.maya.logWebhookEvent, {
      eventType: "webhook_received",
      mayaPaymentId: data.id,
      payload: data,
    });
    
    // 5. Check for idempotency - prevent duplicate processing
    const isDuplicate = await ctx.runQuery(api.payments.maya.checkWebhookDuplicate, {
      mayaPaymentId: data.id,
      status: data.status,
    });
    
    if (isDuplicate) {
      console.log(`Duplicate webhook for payment ${data.id}, status: ${data.status}`);
      return new Response("OK", { status: 200 });
    }
    
    // 6. Handle different payment statuses
    switch (data.paymentStatus) {
      case MAYA_WEBHOOK_EVENTS.PAYMENT_SUCCESS:
        await ctx.runMutation(api.payments.maya.statusUpdates.updatePaymentSuccess, {
          mayaPaymentId: data.id,
          webhookData: data,
        });
        break;
        
      case MAYA_WEBHOOK_EVENTS.PAYMENT_FAILED:
        await ctx.runMutation(api.payments.maya.statusUpdates.updatePaymentFailed, {
          mayaPaymentId: data.id,
          failureReason: data.failureReason || "Payment failed",
          webhookData: data,
        });
        break;
        
      case MAYA_WEBHOOK_EVENTS.PAYMENT_EXPIRED:
        await ctx.runMutation(api.payments.maya.statusUpdates.updatePaymentExpired, {
          mayaPaymentId: data.id,
          webhookData: data,
        });
        break;
        
      case MAYA_WEBHOOK_EVENTS.CHECKOUT_SUCCESS:
        // Checkout completed successfully, but payment may still be processing
        console.log(`Checkout success for payment ${data.id}`);
        break;
        
      case MAYA_WEBHOOK_EVENTS.CHECKOUT_FAILURE:
        // Checkout failed
        await ctx.runMutation(api.payments.maya.statusUpdates.updatePaymentFailed, {
          mayaPaymentId: data.id,
          failureReason: "Checkout failed",
          webhookData: data,
        });
        break;
        
      case MAYA_WEBHOOK_EVENTS.CHECKOUT_DROPOUT:
        // User abandoned checkout
        await ctx.runMutation(api.payments.maya.statusUpdates.updatePaymentExpired, {
          mayaPaymentId: data.id,
          webhookData: data,
        });
        break;
        
      case MAYA_WEBHOOK_EVENTS.REFUND:
        // Handle refund
        await ctx.runMutation(api.payments.maya.statusUpdates.updatePaymentRefunded, {
          mayaPaymentId: data.id,
          webhookData: data,
        });
        break;
        
      default:
        console.log(`Unhandled webhook event: ${data.paymentStatus}`, data);
    }
    
    // 7. Return success response to Maya
    return new Response("OK", { status: 200 });
    
  } catch (error) {
    console.error("Error processing Maya webhook:", error);
    
    // Log the error but return success to prevent Maya from retrying
    // We don't want Maya to keep retrying if we have a bug
    return new Response("OK", { status: 200 });
  }
});

/**
 * Query to check if we've already processed this webhook
 * Prevents duplicate processing of the same event
 */
export const checkWebhookDuplicate = query({
  args: {
    mayaPaymentId: v.string(),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    const payment = await ctx.db
      .query("payments")
      .withIndex("by_maya_payment", q => q.eq("mayaPaymentId", args.mayaPaymentId))
      .unique();
    
    if (!payment) {
      return false;
    }
    
    // Check if payment already has this status
    const statusMap: Record<string, string> = {
      "PAYMENT_SUCCESS": "Complete",
      "PAYMENT_FAILED": "Failed",
      "PAYMENT_EXPIRED": "Expired",
      "REFUNDED": "Refunded",
    };
    
    const expectedStatus = statusMap[args.status];
    return payment.paymentStatus === expectedStatus;
  },
});

/**
 * Mutation to log webhook events for audit
 */
export const logWebhookEvent = mutation({
  args: {
    eventType: v.string(),
    mayaPaymentId: v.optional(v.string()),
    payload: v.any(),
  },
  handler: async (ctx, args) => {
    // Find associated payment if Maya ID provided
    let paymentId = undefined;
    if (args.mayaPaymentId) {
      const payment = await ctx.db
        .query("payments")
        .withIndex("by_maya_payment", q => q.eq("mayaPaymentId", args.mayaPaymentId))
        .unique();
      
      paymentId = payment?._id;
    }
    
    // Log the event
    await ctx.db.insert("paymentLogs", {
      paymentId,
      eventType: "webhook_received",
      mayaPaymentId: args.mayaPaymentId,
      metadata: args.payload,
      timestamp: Date.now(),
    });
  },
});

/**
 * Mutation to update payment status to refunded
 */
export const updatePaymentRefunded = mutation({
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
      return { success: false, error: "Payment not found" };
    }
    
    // Update payment status to refunded
    await ctx.db.patch(payment._id, {
      paymentStatus: "Refunded",
      webhookPayload: args.webhookData,
      updatedAt: Date.now(),
    });
    
    // Log the refund
    await ctx.db.insert("paymentLogs", {
      paymentId: payment._id,
      eventType: "refund_completed",
      mayaPaymentId: args.mayaPaymentId,
      amount: payment.netAmount,
      currency: "PHP",
      metadata: args.webhookData,
      timestamp: Date.now(),
    });
    
    // Send notification to user
    const application = await ctx.db.get(payment.applicationId);
    if (application) {
      await ctx.db.insert("notifications", {
        userId: application.userId,
        applicationId: application._id,
        title: "Payment Refunded",
        message: "Your payment has been refunded. Please check your account for the refund.",
        notificationType: "Payment",
        isRead: false,
      });
    }
    
    return { success: true };
  },
});
