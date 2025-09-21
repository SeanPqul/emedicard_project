/**
 * Maya Payment Return Handler
 * Handles when users return from Maya checkout page
 */

import { v } from "convex/values";
import { action } from "../../_generated/server";
import { api } from "../../_generated/api";
import { Id } from "../../_generated/dataModel";

type PaymentReturnResult = {
  success: boolean;
  status: string;
  message: string;
};

/**
 * Handles user return from Maya checkout
 * This should be called when the app deep links are triggered
 */
export const handlePaymentReturn = action({
  args: {
    applicationId: v.id("applications"),
    status: v.union(v.literal("success"), v.literal("failed"), v.literal("cancelled")),
  },
  handler: async (ctx, args): Promise<PaymentReturnResult> => {
    try {
      // 1. Find the payment for this application
      const payment: any = await ctx.runQuery(api.payments.getPaymentByApplication.getPaymentByApplication, {
        applicationId: args.applicationId,
      });
      
      if (!payment) {
        throw new Error("No payment found for this application");
      }
      
      // 2. If payment is already complete, just return the status
      if (payment.paymentStatus === "Complete") {
        return {
          success: true,
          status: "Complete",
          message: "Payment already processed successfully",
        };
      }
      
      // 3. If status is success from Maya redirect, sync with Maya API if possible
      if (args.status === "success") {
        if (payment.mayaPaymentId) {
          // Sync the payment status with Maya
          const syncResult: any = await ctx.runMutation(
            api.payments.maya.statusUpdates.syncPaymentStatus,
            {
              paymentId: payment._id,
            }
          );
          
          return {
            success: true,
            status: syncResult.status,
            message: syncResult.status === "Complete" 
              ? "Payment successful!" 
              : "Payment is being processed",
          };
        } else {
          // No mayaPaymentId - payment was processed via redirect only
          // If payment is already marked as complete, just return success
          if (payment.paymentStatus === "Complete") {
            return {
              success: true,
              status: "Complete",
              message: "Payment successful!",
            };
          }
          
          // Otherwise, return the current status
          return {
            success: true,
            status: payment.paymentStatus,
            message: "Payment is being processed",
          };
        }
      }
      
      // 4. Handle failed or cancelled status
      if (args.status === "failed" || args.status === "cancelled") {
        // For cancelled status, we need to use the cancelMayaCheckout mutation
        if (args.status === "cancelled") {
          await ctx.runMutation(api.payments.maya.checkout.cancelMayaCheckout, {
            paymentId: payment._id,
          });
          
          return {
            success: false,
            status: "Cancelled",
            message: "Payment cancelled.",
          };
        }
        
        // For failed status, update using the regular mutation
        await ctx.runMutation(api.payments.updatePaymentStatus.updatePaymentStatusMutation, {
          paymentId: payment._id,
          paymentStatus: "Failed",
        });
        
        return {
          success: false,
          status: "Failed",
          message: "Payment failed. Please try again.",
        };
      }
      
      return {
        success: false,
        status: payment.paymentStatus,
        message: "Payment status unchanged",
      };
      
    } catch (error) {
      console.error("Error handling payment return:", error);
      throw new Error(
        error instanceof Error 
          ? error.message 
          : "Failed to process payment return"
      );
    }
  },
});

/**
 * Action to manually check payment status
 * Can be called periodically or on-demand
 */
export const checkPaymentStatus = action({
  args: {
    paymentId: v.id("payments"),
  },
  handler: async (ctx, args): Promise<any> => {
    try {
      // Get current payment status from Maya
      const status: any = await ctx.runQuery(
        api.payments.maya.statusUpdates.checkPaymentStatus,
        {
          paymentId: args.paymentId,
        }
      );
      
      // If status indicates payment is complete, sync it
      if (status.isPaid && status.status !== "Complete") {
        await ctx.runMutation(
          api.payments.maya.statusUpdates.syncPaymentStatus,
          {
            paymentId: args.paymentId,
          }
        );
      }
      
      return status;
    } catch (error) {
      console.error("Error checking payment status:", error);
      throw error;
    }
  },
});
