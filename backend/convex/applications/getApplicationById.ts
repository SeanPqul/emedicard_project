import { v } from "convex/values";
import { query } from "../_generated/server";

export const getApplicationByIdQuery = query({
  args: { applicationId: v.id("applications") },
  handler: async (ctx, { applicationId }) => {
    // Get the application
    const application = await ctx.db.get(applicationId);
    if (!application) {
      return null;
    }

    const user = await ctx.db.get(application.userId);
    const jobCategory = application.jobCategoryId
      ? await ctx.db.get(application.jobCategoryId)
      : null;

    // Get payment information if exists (fetch most recent SUCCESSFUL payment)
    // Priority: Complete > Processing > Pending > Failed/Cancelled/Expired
    const allPayments = await ctx.db
      .query("payments")
      .withIndex("by_application", (q) => q.eq("applicationId", applicationId))
      .order("desc")
      .collect();
    
    // Find the most recent successful payment first
    let payment = allPayments.find(p => p.paymentStatus === "Complete");
    
    // If no complete payment, fall back to most recent payment (any status)
    if (!payment && allPayments.length > 0) {
      payment = allPayments[0];
    }

    // SERVER-SIDE payment deadline validation (tamper-proof)
    const now = Date.now();
    const isPaymentOverdue = application.paymentDeadline ? now > application.paymentDeadline : false;
    const daysUntilDeadline = application.paymentDeadline 
      ? Math.floor((application.paymentDeadline - now) / (1000 * 60 * 60 * 24))
      : null;

    // Return enriched application data
    return {
      ...application,
      securityGuard: application.securityGuard ?? false,
      userName: user?.fullname ?? "Unknown User",
      jobCategoryName: jobCategory?.name ?? "Unknown Category",
      // Map applicationStatus to status for frontend compatibility
      status: application.applicationStatus,
      // Server-computed deadline fields (tamper-proof)
      isPaymentOverdue,
      daysUntilDeadline,
      form: {
        _id: application._id, // Use application ID since there's no separate form
        applicationType: application.applicationType,
        firstName: application.firstName,
        middleName: application.middleName,
        lastName: application.lastName,
        age: application.age,
        nationality: application.nationality,
        gender: application.gender,
        position: application.position,
        organization: application.organization,
        civilStatus: application.civilStatus,
        jobCategory: application.jobCategoryId,
        securityGuard: application.securityGuard ?? false,
      },
      jobCategory: jobCategory ? {
        _id: jobCategory._id,
        name: jobCategory.name,
        colorCode: jobCategory.colorCode,
        requireOrientation: jobCategory.requireOrientation,
      } : undefined,
      payment: payment ? {
        _id: payment._id,
        amount: payment.amount,
        serviceFee: payment.serviceFee,
        netAmount: payment.netAmount,
        method: payment.paymentMethod,
        status: payment.paymentStatus,
        referenceNumber: payment.referenceNumber,
        updatedAt: payment.updatedAt,
        _creationTime: payment._creationTime,
      } : undefined,
    };
  },
});
