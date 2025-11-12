// convex/payments/getAllPayments.ts
import { v } from "convex/values";
import { query } from "../_generated/server";

export const get = query({
  args: {
    status: v.optional(v.string()),
    paymentMethod: v.optional(v.string()),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Fetch all payments
    let paymentsQuery = ctx.db.query("payments");
    
    // No direct filtering in query - we'll filter in code
    const allPayments = await paymentsQuery.collect();
    
    // Filter payments based on args
    let filteredPayments = allPayments;
    
    if (args.status) {
      filteredPayments = filteredPayments.filter(p => p.paymentStatus === args.status);
    }
    
    if (args.paymentMethod) {
      filteredPayments = filteredPayments.filter(p => p.paymentMethod === args.paymentMethod);
    }
    
    if (args.startDate) {
      filteredPayments = filteredPayments.filter(p => p._creationTime >= args.startDate!);
    }
    
    if (args.endDate) {
      filteredPayments = filteredPayments.filter(p => p._creationTime <= args.endDate!);
    }
    
    // Sort by creation time (newest first)
    filteredPayments.sort((a, b) => b._creationTime - a._creationTime);
    
    // Enrich each payment with application and user data
    const enrichedPayments = await Promise.all(
      filteredPayments.map(async (payment) => {
        // Get application (might be deleted)
        const application = await ctx.db.get(payment.applicationId);
        
        // Get user (might be deleted)
        let user = null;
        let jobCategory = null;
        
        if (application) {
          user = await ctx.db.get(application.userId);
          jobCategory = await ctx.db.get(application.jobCategoryId);
        }
        
        // Get receipt URL
        let receiptUrl = null;
        if (payment.receiptStorageId) {
          receiptUrl = await ctx.storage.getUrl(payment.receiptStorageId);
        }
        
        // Check rejection history count
        const rejectionHistory = await ctx.db
          .query("paymentRejectionHistory")
          .withIndex("by_application", (q) => q.eq("applicationId", payment.applicationId))
          .collect();
        
        // Return payment data even if application/user is deleted (for audit trail)
        return {
          _id: payment._id,
          _creationTime: payment._creationTime,
          amount: payment.amount,
          netAmount: payment.netAmount,
          serviceFee: payment.serviceFee,
          paymentMethod: payment.paymentMethod,
          paymentLocation: payment.paymentLocation,
          paymentStatus: payment.paymentStatus,
          referenceNumber: payment.referenceNumber,
          mayaCheckoutId: payment.mayaCheckoutId,
          mayaPaymentId: payment.mayaPaymentId,
          receiptUrl,
          updatedAt: payment.updatedAt,
          settlementDate: payment.settlementDate,
          // Application data (with fallbacks for deleted records)
          applicationId: payment.applicationId,
          applicationStatus: application?.applicationStatus || "[Deleted Application]",
          applicationType: application?.applicationType || "Unknown",
          // User data (with fallbacks for deleted records)
          userId: user?._id || "deleted",
          userFullname: user?.fullname || "[Deleted User]",
          userEmail: user?.email || "[No Email Available]",
          userPhone: user?.phoneNumber || "N/A",
          // Job category
          jobCategoryName: jobCategory?.name || "[Deleted Category]",
          jobCategoryColor: jobCategory?.colorCode || "#999999",
          // Rejection count
          rejectionCount: rejectionHistory.length,
          // Flag for orphaned records
          isOrphaned: !application || !user,
        };
      })
    );
    
    // Return all payments, including orphaned ones (don't filter nulls)
    return enrichedPayments;
  },
});

// Get payment statistics
export const getStats = query({
  args: {},
  handler: async (ctx) => {
    const allPayments = await ctx.db.query("payments").collect();
    
    const total = allPayments.length;
    const completed = allPayments.filter(p => p.paymentStatus === "Complete").length;
    const pending = allPayments.filter(p => p.paymentStatus === "Pending").length;
    const failed = allPayments.filter(p => p.paymentStatus === "Failed").length;
    const refunded = allPayments.filter(p => p.paymentStatus === "Refunded").length;
    
    const totalAmount = allPayments
      .filter(p => p.paymentStatus === "Complete")
      .reduce((sum, p) => sum + p.amount, 0);
    
    const totalNetAmount = allPayments
      .filter(p => p.paymentStatus === "Complete")
      .reduce((sum, p) => sum + p.netAmount, 0);
    
    const totalServiceFees = allPayments
      .filter(p => p.paymentStatus === "Complete")
      .reduce((sum, p) => sum + p.serviceFee, 0);
    
    // Payment method breakdown
    const maya = allPayments.filter(p => p.paymentMethod === "Maya" && p.paymentStatus === "Complete").length;
    const baranggay = allPayments.filter(p => p.paymentMethod === "BaranggayHall" && p.paymentStatus === "Complete").length;
    const cityHall = allPayments.filter(p => p.paymentMethod === "CityHall" && p.paymentStatus === "Complete").length;
    
    return {
      total,
      completed,
      pending,
      failed,
      refunded,
      totalAmount,
      totalNetAmount,
      totalServiceFees,
      byMethod: {
        maya,
        baranggay,
        cityHall,
      },
    };
  },
});
