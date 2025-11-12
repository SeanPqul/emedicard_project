// convex/payments/getPaymentHistory.ts
import { v } from "convex/values";
import { query } from "../_generated/server";
import { Doc } from "../_generated/dataModel";

// Enhanced payment history query with pagination and advanced filters
export const list = query({
  args: {
    // Pagination
    page: v.optional(v.number()),
    pageSize: v.optional(v.number()),
    
    // Filters
    searchQuery: v.optional(v.string()), // Search by user name, email, reference number
    status: v.optional(v.string()),
    paymentMethod: v.optional(v.string()),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    minAmount: v.optional(v.number()),
    maxAmount: v.optional(v.number()),
    applicationStatus: v.optional(v.string()),
    jobCategoryId: v.optional(v.id("jobCategories")),
    hasRejections: v.optional(v.boolean()),
    
    // Sorting
    sortBy: v.optional(v.union(
      v.literal("date"),
      v.literal("amount"),
      v.literal("status"),
      v.literal("applicant")
    )),
    sortOrder: v.optional(v.union(v.literal("asc"), v.literal("desc"))),
  },
  handler: async (ctx, args) => {
    const page = args.page ?? 1;
    const pageSize = args.pageSize ?? 50;
    const sortBy = args.sortBy ?? "date";
    const sortOrder = args.sortOrder ?? "desc";
    
    // Get all payments
    const allPayments = await ctx.db.query("payments").collect();
    
    // Enrich payments with related data
    const enrichedPayments = await Promise.all(
      allPayments.map(async (payment) => {
        const application = await ctx.db.get(payment.applicationId);
        if (!application) return null;
        
        const user = await ctx.db.get(application.userId);
        const jobCategory = await ctx.db.get(application.jobCategoryId);
        
        // Get receipt URL
        let receiptUrl = null;
        if (payment.receiptStorageId) {
          receiptUrl = await ctx.storage.getUrl(payment.receiptStorageId);
        }
        
        // Get rejection history
        const rejectionHistory = await ctx.db
          .query("paymentRejectionHistory")
          .withIndex("by_application", (q) => q.eq("applicationId", payment.applicationId))
          .collect();
        
        // Get last admin who validated payment
        let validatedBy = null;
        if (payment.paymentStatus === "Complete") {
          const activityLog = await ctx.db
            .query("adminActivityLogs")
            .withIndex("by_applicationId", (q) => q.eq("applicationId", payment.applicationId))
            .filter((q) => q.eq(q.field("action"), "Payment Approved"))
            .first();
          
          if (activityLog) {
            const admin = await ctx.db.get(activityLog.adminId);
            validatedBy = admin?.fullname || admin?.email;
          }
        }
        
        return {
          _id: payment._id,
          _creationTime: payment._creationTime,
          
          // Payment details
          amount: payment.amount,
          netAmount: payment.netAmount,
          serviceFee: payment.serviceFee,
          transactionFee: payment.transactionFee ?? 0,
          paymentMethod: payment.paymentMethod,
          paymentStatus: payment.paymentStatus,
          paymentProvider: payment.paymentProvider,
          referenceNumber: payment.referenceNumber,
          mayaCheckoutId: payment.mayaCheckoutId,
          mayaPaymentId: payment.mayaPaymentId,
          failureReason: payment.failureReason,
          receiptUrl,
          updatedAt: payment.updatedAt,
          settlementDate: payment.settlementDate,
          
          // Application details
          applicationId: application._id,
          applicationStatus: application.applicationStatus,
          applicationType: application.applicationType,
          
          // User details (preserved even if soft-deleted)
          userId: user?._id,
          userFullname: user?.fullname || "[Deleted User]",
          userEmail: user?.email || "[No Email Available]",
          userPhone: user?.phoneNumber || "N/A",
          userDeleted: user?.deletedAt ? true : false,
          
          // Job category (preserved even if soft-deleted)
          jobCategoryId: application.jobCategoryId,
          jobCategoryName: jobCategory?.name || "[Deleted Category]",
          jobCategoryColor: jobCategory?.colorCode,
          categoryDeleted: jobCategory?.deletedAt ? true : false,
          
          // Additional metadata
          rejectionCount: rejectionHistory.length,
          hasRejections: rejectionHistory.length > 0,
          isResubmission: rejectionHistory.some(r => r.wasReplaced),
          validatedBy,
        };
      })
    );
    
    // Filter out nulls
    let filteredPayments = enrichedPayments.filter(p => p !== null) as NonNullable<typeof enrichedPayments[0]>[];
    
    // Apply filters
    if (args.searchQuery) {
      const query = args.searchQuery.toLowerCase();
      filteredPayments = filteredPayments.filter(p => 
        p.userFullname.toLowerCase().includes(query) ||
        p.userEmail.toLowerCase().includes(query) ||
        p.referenceNumber.toLowerCase().includes(query) ||
        p.mayaCheckoutId?.toLowerCase().includes(query) ||
        p.mayaPaymentId?.toLowerCase().includes(query)
      );
    }
    
    if (args.status) {
      filteredPayments = filteredPayments.filter(p => p.paymentStatus === args.status);
    }
    
    if (args.paymentMethod) {
      filteredPayments = filteredPayments.filter(p => p.paymentMethod === args.paymentMethod);
    }
    
    if (args.applicationStatus) {
      filteredPayments = filteredPayments.filter(p => p.applicationStatus === args.applicationStatus);
    }
    
    if (args.jobCategoryId) {
      filteredPayments = filteredPayments.filter(p => p.jobCategoryId === args.jobCategoryId);
    }
    
    if (args.hasRejections !== undefined) {
      filteredPayments = filteredPayments.filter(p => p.hasRejections === args.hasRejections);
    }
    
    if (args.startDate) {
      filteredPayments = filteredPayments.filter(p => p._creationTime >= args.startDate!);
    }
    
    if (args.endDate) {
      filteredPayments = filteredPayments.filter(p => p._creationTime <= args.endDate!);
    }
    
    if (args.minAmount !== undefined) {
      filteredPayments = filteredPayments.filter(p => p.amount >= args.minAmount!);
    }
    
    if (args.maxAmount !== undefined) {
      filteredPayments = filteredPayments.filter(p => p.amount <= args.maxAmount!);
    }
    
    // Apply sorting
    filteredPayments.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case "date":
          comparison = a._creationTime - b._creationTime;
          break;
        case "amount":
          comparison = a.amount - b.amount;
          break;
        case "status":
          comparison = a.paymentStatus.localeCompare(b.paymentStatus);
          break;
        case "applicant":
          comparison = a.userFullname.localeCompare(b.userFullname);
          break;
      }
      
      return sortOrder === "desc" ? -comparison : comparison;
    });
    
    // Calculate statistics
    const stats = {
      totalRecords: filteredPayments.length,
      totalAmount: filteredPayments
        .filter(p => p.paymentStatus === "Complete")
        .reduce((sum, p) => sum + p.amount, 0),
      totalNetAmount: filteredPayments
        .filter(p => p.paymentStatus === "Complete")
        .reduce((sum, p) => sum + p.netAmount, 0),
      totalFees: filteredPayments
        .filter(p => p.paymentStatus === "Complete")
        .reduce((sum, p) => sum + p.serviceFee + (p.transactionFee ?? 0), 0),
      statusBreakdown: {
        complete: filteredPayments.filter(p => p.paymentStatus === "Complete").length,
        pending: filteredPayments.filter(p => p.paymentStatus === "Pending").length,
        processing: filteredPayments.filter(p => p.paymentStatus === "Processing").length,
        failed: filteredPayments.filter(p => p.paymentStatus === "Failed").length,
        refunded: filteredPayments.filter(p => p.paymentStatus === "Refunded").length,
        cancelled: filteredPayments.filter(p => p.paymentStatus === "Cancelled").length,
        expired: filteredPayments.filter(p => p.paymentStatus === "Expired").length,
      },
      methodBreakdown: {
        maya: filteredPayments.filter(p => p.paymentMethod === "Maya").length,
        baranggayHall: filteredPayments.filter(p => p.paymentMethod === "BaranggayHall").length,
        cityHall: filteredPayments.filter(p => p.paymentMethod === "CityHall").length,
      },
    };
    
    // Apply pagination
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedPayments = filteredPayments.slice(startIndex, endIndex);
    
    return {
      payments: paginatedPayments,
      pagination: {
        currentPage: page,
        pageSize,
        totalPages: Math.ceil(filteredPayments.length / pageSize),
        totalRecords: filteredPayments.length,
        hasNextPage: endIndex < filteredPayments.length,
        hasPreviousPage: page > 1,
      },
      statistics: stats,
    };
  },
});

// Export all payments for CSV/PDF generation
export const exportAll = query({
  args: {
    status: v.optional(v.string()),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    jobCategoryId: v.optional(v.id("jobCategories")),
  },
  handler: async (ctx, args) => {
    const allPayments = await ctx.db.query("payments").collect();
    
    const exportData = await Promise.all(
      allPayments.map(async (payment) => {
        const application = await ctx.db.get(payment.applicationId);
        if (!application) return null;
        
        const user = await ctx.db.get(application.userId);
        const jobCategory = await ctx.db.get(application.jobCategoryId);
        
        // Apply filters
        if (args.status && payment.paymentStatus !== args.status) return null;
        if (args.startDate && payment._creationTime < args.startDate) return null;
        if (args.endDate && payment._creationTime > args.endDate) return null;
        if (args.jobCategoryId && application.jobCategoryId !== args.jobCategoryId) return null;
        
        return {
          date: new Date(payment._creationTime).toISOString(),
          referenceNumber: payment.referenceNumber,
          applicantName: user?.fullname || "[Deleted User]",
          email: user?.email || "[No Email Available]",
          phone: user?.phoneNumber || "N/A",
          jobCategory: jobCategory?.name || "[Deleted Category]",
          applicationType: application.applicationType,
          amount: payment.amount,
          netAmount: payment.netAmount,
          serviceFee: payment.serviceFee,
          transactionFee: payment.transactionFee ?? 0,
          paymentMethod: payment.paymentMethod,
          paymentStatus: payment.paymentStatus,
          mayaCheckoutId: payment.mayaCheckoutId || "",
          mayaPaymentId: payment.mayaPaymentId || "",
          settlementDate: payment.settlementDate ? new Date(payment.settlementDate).toISOString() : "",
        };
      })
    );
    
    return exportData.filter(d => d !== null);
  },
});