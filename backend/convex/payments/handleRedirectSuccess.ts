import { v } from "convex/values";
import { mutation } from "../_generated/server";

export const handleRedirectSuccess = mutation({
  args: {
    paymentId: v.id("payments"),
    applicationId: v.id("applications"),
  },
  handler: async (ctx, args) => {
    // Get payment record
    const payment = await ctx.db.get(args.paymentId);
    if (!payment) {
      throw new Error("Payment not found");
    }
    
    // Get application record
    const application = await ctx.db.get(args.applicationId);
    if (!application) {
      throw new Error("Application not found");
    }
    
    // Check if payment is already complete
    if (payment.paymentStatus === "Complete") {
      return { 
        success: true, 
        message: "Payment already marked as complete",
        nextStatus: application.applicationStatus 
      };
    }
    
    // Allow processing from Cancelled status (payment retry scenario)
    const allowedStatuses = ["Processing", "Pending", "Cancelled", "Failed"];
    if (!allowedStatuses.includes(payment.paymentStatus)) {
      console.warn(`Unexpected payment status for success redirect: ${payment.paymentStatus}`);
    }
    
    // Update payment status to complete
    await ctx.db.patch(args.paymentId, {
      paymentStatus: "Complete",
      updatedAt: Date.now(),
    });
    
    // Log the payment completion
    await ctx.db.insert("paymentLogs", {
      paymentId: payment._id,
      eventType: "payment_success",
      mayaCheckoutId: payment.mayaCheckoutId,
      amount: payment.netAmount,
      currency: "PHP",
      metadata: {
        source: "payment_redirect",
        mayaPaymentIdMissing: !payment.mayaPaymentId,
      },
      timestamp: Date.now(),
    });
    
    // Get job category to determine next status (Yellow Card = Food Handler)
    const jobCategory = await ctx.db.get(application.jobCategoryId);
    const requiresOrientation = jobCategory?.requireOrientation === true || jobCategory?.requireOrientation === "true";
    
    // If requires orientation (Yellow Card), go to "For Orientation"
    // Otherwise, go to "For Document Verification"
    const nextStatus = requiresOrientation ? "For Orientation" : "For Document Verification";
    
    // Update application status
    await ctx.db.patch(args.applicationId, {
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
    
    return { 
      success: true, 
      message: "Payment successfully processed",
      nextStatus 
    };
  },
});

export default handleRedirectSuccess;
