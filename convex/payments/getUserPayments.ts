import { query } from "../_generated/server";

export const getUserPaymentsQuery = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
      
    if (!user) return [];
    
    // Get all user forms
    const userForms = await ctx.db
      .query("applications")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
      
    if (userForms.length === 0) return [];
    
    // Aggregate payments with application details server-side
    const paymentsWithApplicationDetails = await Promise.all(
      userForms.map(async (application) => {
        const payment = await ctx.db
          .query("payments")
          .withIndex("by_application", (q) => q.eq("applicationId", application._id))
          .unique();
          
        if (!payment) return null;
        
        // Get job category for context (minimal fields)
        const jobCategory = await ctx.db.get(application.jobCategoryId);
        
        // Return minimal payload with aggregated data
        return {
          _id: payment._id,
          _creationTime: payment._creationTime,
          amount: payment.amount,
          serviceFee: payment.serviceFee,
          netAmount: payment.netAmount,
          paymentMethod: payment.paymentMethod,
          referenceNumber: payment.referenceNumber,
          paymentStatus: payment.paymentStatus,
          updatedAt: payment.updatedAt,
          application: {
            _id: application._id,
            applicationType: application.applicationType,
            position: application.position,
            organization: application.organization,
          },
          jobCategory: jobCategory ? {
            _id: jobCategory._id,
            name: jobCategory.name,
            colorCode: jobCategory.colorCode
          } : undefined,
        };
      })
    );
    
    return paymentsWithApplicationDetails.filter(Boolean);
  },
});


// @deprecated - Use getUserPaymentsQuery instead. This alias will be removed in a future release.
export const getUserPayments = getUserPaymentsQuery;
