// convex/payments/getForApplication.ts
import { v } from "convex/values";
import { query } from "../_generated/server";

export const get = query({
  args: { applicationId: v.id("applications") },
  handler: async (ctx, args) => {
    // 1. Find the most recent SUCCESSFUL payment record for this application
    // Priority: Complete > Processing > Pending > Failed/Cancelled
    const allPayments = await ctx.db
      .query("payments")
      .withIndex("by_application", q => q.eq("applicationId", args.applicationId))
      .order("desc")
      .collect();
    
    // Prioritize completed payments over cancelled ones
    let payment = allPayments.find(p => p.paymentStatus === "Complete");
    
    // If no complete payment, fall back to most recent payment
    if (!payment && allPayments.length > 0) {
      payment = allPayments[0];
    }
      
    if (!payment) return null;

    // 2. Get the application to find the user and submission date
    const application = await ctx.db.get(args.applicationId);
    if (!application) return null;

    // 3. Get the user to find their name
    const user = await ctx.db.get(application.userId);
    if (!user) return null;

    // 4. Get the URL for the receipt image if it exists
    let receiptUrl = null;
    if (payment.receiptStorageId) {
      receiptUrl = await ctx.storage.getUrl(payment.receiptStorageId);
    }

    // 5. Check if this is a resubmission by looking for payment rejection history
    // Get all payment rejection history records for this application
    const rejectionHistory = await ctx.db
      .query("paymentRejectionHistory")
      .withIndex("by_application", (q) => q.eq("applicationId", args.applicationId))
      .order("desc")
      .collect();

    // Check if current payment replaced a rejected payment
    const isResubmission = rejectionHistory.some(rejection => 
      rejection.replacementPaymentId === payment._id
    );

    // Get rejection history details with admin info
    const enrichedRejectionHistory = await Promise.all(
      rejectionHistory.map(async (rejection) => {
        const rejectedBy = await ctx.db.get(rejection.rejectedBy);
        return {
          _id: rejection._id,
          rejectionCategory: rejection.rejectionCategory,
          rejectionReason: rejection.rejectionReason,
          specificIssues: rejection.specificIssues || [],
          rejectedAt: rejection.rejectedAt,
          rejectedBy: rejectedBy?.fullname || "Admin",
          wasReplaced: rejection.wasReplaced,
          replacedAt: rejection.replacedAt,
          attemptNumber: rejection.attemptNumber,
          referenceNumber: rejection.referenceNumber,
          paymentMethod: rejection.paymentMethod,
          amount: rejection.amount,
        };
      })
    );

    // 6. Return everything in one neat package
    return {
      paymentId: payment._id,
      applicantName: user.fullname,
      submissionDate: application._creationTime,
      paymentMethod: payment.paymentMethod,
      paymentLocation: payment.paymentLocation,
      paymentStatus: payment.paymentStatus,
      receiptUrl: receiptUrl,
      checkoutUrl: payment.checkoutUrl,
      mayaCheckoutId: payment.mayaCheckoutId,
      referenceNumber: payment.referenceNumber,
      amount: payment.amount,
      netAmount: payment.netAmount,
      serviceFee: payment.serviceFee,
      isResubmission: isResubmission,
      rejectionHistory: enrichedRejectionHistory,
    };
  },
});
