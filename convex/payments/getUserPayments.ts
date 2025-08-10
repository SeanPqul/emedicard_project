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
      .query("forms")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
      
    if (userForms.length === 0) return [];
    
    // Aggregate payments with form details server-side
    const paymentsWithFormDetails = await Promise.all(
      userForms.map(async (form) => {
        const payment = await ctx.db
          .query("payments")
          .withIndex("by_form", (q) => q.eq("formId", form._id))
          .unique();
          
        if (!payment) return null;
        
        // Get job category for context (minimal fields)
        const jobCategory = await ctx.db.get(form.jobCategory);
        
        // Return minimal payload with aggregated data
        return {
          _id: payment._id,
          _creationTime: payment._creationTime,
          amount: payment.amount,
          serviceFee: payment.serviceFee,
          netAmount: payment.netAmount,
          method: payment.method,
          referenceNumber: payment.referenceNumber,
          status: payment.status,
          updatedAt: payment.updatedAt,
          form: {
            _id: form._id,
            applicationType: form.applicationType,
            position: form.position,
            organization: form.organization,
          },
          jobCategory: jobCategory ? {
            _id: jobCategory._id,
            name: jobCategory.name,
            colorCode: jobCategory.colorCode
          } : undefined,
        };
      })
    );
    
    return paymentsWithFormDetails.filter(Boolean);
  },
});


// @deprecated - Use getUserPaymentsQuery instead. This alias will be removed in a future release.
export const getUserPayments = getUserPaymentsQuery;
