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

    // Get payment information if exists (fetch most recent payment)
    const payment = await ctx.db
      .query("payments")
      .withIndex("by_application", (q) => q.eq("applicationId", applicationId))
      .order("desc")
      .first();

    // Return enriched application data
    return {
      ...application,
      userName: user?.fullname ?? "Unknown User",
      jobCategoryName: jobCategory?.name ?? "Unknown Category",
      // Map applicationStatus to status for frontend compatibility
      status: application.applicationStatus,
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
      } : undefined,
    };
  },
});
