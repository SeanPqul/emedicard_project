import { v } from "convex/values";
import { query } from "../_generated/server";

// Get all rejection history with role-based access control
export const getAllRejections = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user || user.role !== "admin") {
      throw new Error("Insufficient permissions");
    }

    // Determine if user is super admin
    const isSuperAdmin = !user.managedCategories || user.managedCategories.length === 0;

    // Get all document rejections from documentRejectionHistory
    const documentRejections = await ctx.db
      .query("documentRejectionHistory")
      .order("desc")
      .collect();

    // Filter by managed categories if not super admin
    let filteredRejections = documentRejections;
    if (!isSuperAdmin) {
      const managedCategoryIds = user.managedCategories || [];
      
      // Get all applications and filter by managed categories
      const allApplications = await ctx.db.query("applications").collect();
      const applicationsInManagedCategories = allApplications.filter(app => 
        managedCategoryIds.includes(app.jobCategoryId)
      );
      
      const managedApplicationIds = new Set(
        applicationsInManagedCategories.map(app => app._id)
      );
      
      filteredRejections = documentRejections.filter(rejection => 
        managedApplicationIds.has(rejection.applicationId)
      );
    }

    // Enrich rejection data with related information
    const enrichedRejections = await Promise.all(
      filteredRejections.map(async (rejection) => {
        const application = await ctx.db.get(rejection.applicationId);
        const applicant = application ? await ctx.db.get(application.userId) : null;
        const jobCategory = application ? await ctx.db.get(application.jobCategoryId) : null;
        const documentType = await ctx.db.get(rejection.documentTypeId);
        const rejectedBy = await ctx.db.get(rejection.rejectedBy);
        
        return {
          _id: rejection._id,
          type: "document" as const,
          applicationId: rejection.applicationId,
          applicantName: applicant?.fullname || "Unknown",
          applicantEmail: applicant?.email || "N/A",
          jobCategory: jobCategory?.name || "Unknown",
          documentType: documentType?.name || "Unknown Document",
          rejectionCategory: rejection.rejectionCategory,
          rejectionReason: rejection.rejectionReason,
          specificIssues: rejection.specificIssues || [],
          rejectedAt: rejection.rejectedAt,
          rejectedBy: rejectedBy?.fullname || "Admin",
          rejectedByEmail: rejectedBy?.email || "N/A",
          attemptNumber: rejection.attemptNumber || 1,
          wasReplaced: rejection.wasReplaced || false,
          replacedAt: rejection.replacedAt,
          status: rejection.status,
        };
      })
    );

    // Get payment rejections from paymentRejectionHistory
    const paymentRejections = await ctx.db
      .query("paymentRejectionHistory")
      .order("desc")
      .collect();

    // Filter payment rejections by managed categories if not super admin
    let filteredPaymentRejections = paymentRejections;
    if (!isSuperAdmin) {
      const managedCategoryIds = user.managedCategories || [];
      
      const allApplications = await ctx.db.query("applications").collect();
      const applicationsInManagedCategories = allApplications.filter(app => 
        managedCategoryIds.includes(app.jobCategoryId)
      );
      
      const managedApplicationIds = new Set(
        applicationsInManagedCategories.map(app => app._id)
      );
      
      filteredPaymentRejections = paymentRejections.filter(rejection => 
        managedApplicationIds.has(rejection.applicationId)
      );
    }

    // Enrich payment rejection data
    const enrichedPaymentRejections = await Promise.all(
      filteredPaymentRejections.map(async (rejection) => {
        const application = await ctx.db.get(rejection.applicationId);
        const applicant = application ? await ctx.db.get(application.userId) : null;
        const jobCategory = application ? await ctx.db.get(application.jobCategoryId) : null;
        const rejectedBy = await ctx.db.get(rejection.rejectedBy);
        
        return {
          _id: rejection._id,
          type: "payment" as const,
          applicationId: rejection.applicationId,
          applicantName: applicant?.fullname || "Unknown",
          applicantEmail: applicant?.email || "N/A",
          jobCategory: jobCategory?.name || "Unknown",
          documentType: "Payment Receipt",
          rejectionCategory: rejection.rejectionCategory,
          rejectionReason: rejection.rejectionReason,
          specificIssues: rejection.specificIssues || [],
          rejectedAt: rejection.rejectedAt,
          rejectedBy: rejectedBy?.fullname || "Admin",
          rejectedByEmail: rejectedBy?.email || "N/A",
          attemptNumber: rejection.attemptNumber || 1,
          wasReplaced: rejection.wasReplaced || false,
          replacedAt: rejection.replacedAt,
          status: rejection.status,
        };
      })
    );

    // Get admin activity logs for orientation rejections only
    // Document and payment rejections are now in their dedicated tables
    const activityLogs = await ctx.db
      .query("adminActivityLogs")
      .order("desc")
      .collect();

    // Filter activity logs for orientation rejection actions only
    const rejectionLogs = activityLogs.filter(log => 
      log.action === "Orientation Rejected"
    );

    // Filter by managed categories if not super admin
    let filteredLogs = rejectionLogs;
    if (!isSuperAdmin) {
      filteredLogs = rejectionLogs.filter(log => 
        log.jobCategoryId && user.managedCategories?.includes(log.jobCategoryId)
      );
    }

    // Enrich activity logs
    const enrichedLogs = await Promise.all(
      filteredLogs.map(async (log) => {
        const application = log.applicationId ? await ctx.db.get(log.applicationId) : null;
        const applicant = application ? await ctx.db.get(application.userId) : null;
        const jobCategory = log.jobCategoryId ? await ctx.db.get(log.jobCategoryId) : null;
        const admin = await ctx.db.get(log.adminId);

        let type: "payment" | "orientation" | "other" = "other";
        if (log.action === "Payment Rejected") type = "payment";
        else if (log.action === "Orientation Rejected") type = "orientation";

        return {
          _id: log._id,
          type,
          applicationId: log.applicationId,
          applicantName: applicant?.fullname || "Unknown",
          applicantEmail: applicant?.email || "N/A",
          jobCategory: jobCategory?.name || "Unknown",
          documentType: type === "payment" ? "Payment Receipt" : type === "orientation" ? "Orientation Attendance" : "Other",
          rejectionCategory: "admin_action",
          rejectionReason: log.details || log.action || "Rejected by admin",
          specificIssues: log.comment ? [log.comment] : [],
          rejectedAt: log.timestamp,
          rejectedBy: admin?.fullname || "Admin",
          rejectedByEmail: admin?.email || "N/A",
          attemptNumber: 1,
          wasReplaced: false,
          replacedAt: undefined,
        };
      })
    );

    // Get application rejections from applicationRejectionHistory
    const applicationRejections = await ctx.db
      .query("applicationRejectionHistory")
      .order("desc")
      .collect();

    // Filter application rejections by managed categories if not super admin
    let filteredApplicationRejections = applicationRejections;
    if (!isSuperAdmin) {
      const managedCategoryIds = user.managedCategories || [];
      filteredApplicationRejections = applicationRejections.filter(rejection => 
        managedCategoryIds.includes(rejection.jobCategoryId)
      );
    }

    // Enrich application rejection data
    const enrichedApplicationRejections = filteredApplicationRejections.map((rejection) => ({
      _id: rejection._id,
      type: "application" as const,
      applicationId: rejection.applicationId,
      applicantName: rejection.applicantName,
      applicantEmail: rejection.applicantEmail,
      jobCategory: rejection.jobCategoryName,
      documentType: "Application (Final Rejection)",
      rejectionCategory: rejection.rejectionCategory,
      rejectionReason: rejection.rejectionReason,
      specificIssues: [],
      rejectedAt: rejection.rejectedAt,
      rejectedBy: rejection.rejectedByName,
      rejectedByEmail: "", // Not stored in application rejection history
      attemptNumber: 1, // Application rejection is always final
      wasReplaced: false, // Cannot be replaced
      replacedAt: undefined,
      status: "rejected" as const, // Always rejected for application level
      rejectionType: rejection.rejectionType, // manual or automatic
      triggerSource: rejection.triggerSource, // where it came from
    }));

    // Combine all rejections (documents, payments, orientations, and applications) and sort by date
    const allRejections = [
      ...enrichedRejections, 
      ...enrichedPaymentRejections, 
      ...enrichedLogs,
      ...enrichedApplicationRejections
    ].sort(
      (a, b) => b.rejectedAt - a.rejectedAt
    );

    return allRejections;
  },
});

// Get rejection statistics for dashboard
export const getRejectionStats = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user || user.role !== "admin") {
      throw new Error("Insufficient permissions");
    }

    const isSuperAdmin = !user.managedCategories || user.managedCategories.length === 0;

    // Get all document rejections
    const allDocumentRejections = await ctx.db
      .query("documentRejectionHistory")
      .collect();

    // Get all payment rejections
    const allPaymentRejections = await ctx.db
      .query("paymentRejectionHistory")
      .collect();

    // Get all application rejections
    const allApplicationRejections = await ctx.db
      .query("applicationRejectionHistory")
      .collect();

    // Combine all rejections
    const allRejections = [
      ...allDocumentRejections, 
      ...allPaymentRejections, 
      ...allApplicationRejections
    ];

    // Filter by managed categories if needed
    let filteredRejections = allRejections;
    if (!isSuperAdmin) {
      const managedCategoryIds = user.managedCategories || [];
      
      // For application rejections, we can filter directly by jobCategoryId
      const filteredAppRejections = allApplicationRejections.filter(rejection =>
        managedCategoryIds.includes(rejection.jobCategoryId)
      );
      
      // For document and payment rejections, filter by application
      const allApplications = await ctx.db.query("applications").collect();
      const applicationsInManagedCategories = allApplications.filter(app => 
        managedCategoryIds.includes(app.jobCategoryId)
      );
      
      const managedApplicationIds = new Set(
        applicationsInManagedCategories.map(app => app._id)
      );
      
      const filteredDocAndPaymentRejections = [
        ...allDocumentRejections,
        ...allPaymentRejections
      ].filter(rejection => 
        managedApplicationIds.has(rejection.applicationId)
      );
      
      filteredRejections = [...filteredDocAndPaymentRejections, ...filteredAppRejections];
    }

    // Calculate statistics
    const totalRejections = filteredRejections.length;
    
    // Application rejections can't be resubmitted, so only check doc/payment rejections
    const docAndPaymentRejections = filteredRejections.filter(r => 
      'wasReplaced' in r // Only doc/payment have wasReplaced field
    );
    
    const pendingResubmission = docAndPaymentRejections.filter(r => !r.wasReplaced).length;
    const resubmitted = docAndPaymentRejections.filter(r => r.wasReplaced).length;
    
    // Group by rejection category
    const byCategory: Record<string, number> = {};
    filteredRejections.forEach(rejection => {
      const category = rejection.rejectionCategory || "other";
      byCategory[category] = (byCategory[category] || 0) + 1;
    });

    // Top rejection reasons
    const reasonCounts: Record<string, number> = {};
    filteredRejections.forEach(rejection => {
      const reason = rejection.rejectionReason || "No reason provided";
      reasonCounts[reason] = (reasonCounts[reason] || 0) + 1;
    });
    
    const topReasons = Object.entries(reasonCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([reason, count]) => ({ reason, count }));

    return {
      totalRejections,
      pendingResubmission,
      resubmitted,
      byCategory,
      topReasons,
    };
  },
});
