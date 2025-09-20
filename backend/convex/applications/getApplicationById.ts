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

    // Get the job category
    const jobCategory = application.jobCategoryId
      ? await ctx.db.get(application.jobCategoryId)
      : null;

    // Get payment information if exists
    const payment = await ctx.db
      .query("payments")
      .withIndex("by_application", (q) => q.eq("applicationId", applicationId))
      .first();

    // Return enriched application data
    // Since form data is stored directly on the application, we create a form object from it
    return {
      ...application,
      // Map applicationStatus to status for frontend compatibility
      status: application.applicationStatus,
      form: {
        _id: application._id, // Use application ID since there's no separate form
        applicationType: application.applicationType,
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
        method: payment.paymentMethod,
        status: payment.paymentStatus,
        referenceNumber: payment.referenceNumber,
      } : undefined,
    };
  },
});
