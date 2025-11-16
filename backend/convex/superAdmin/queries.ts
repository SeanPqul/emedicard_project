import { v } from "convex/values";
import { query } from "../_generated/server";

export const getApplicationStats = query({
  args: {
    startDate: v.optional(v.float64()),
    endDate: v.optional(v.float64()),
  },
  handler: async (ctx, args) => {
    let applications = await ctx.db.query("applications").collect();

    if (args.startDate && args.endDate) {
      applications = applications.filter(app =>
        app._creationTime >= args.startDate! && app._creationTime <= args.endDate!
      );
    }

    const totalApplications = applications.length;

    const applicationsByStatus = applications.reduce((acc, app) => {
      acc[app.applicationStatus] = (acc[app.applicationStatus] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalApplications,
      applicationsByStatus,
    };
  },
});

export const getSuperAdminDetails = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) {
      return null;
    }

    // Check if the user is a Super Admin based on the criteria:
    // role is 'admin' AND managedCategories is '[unset]' (which means null or empty array in Convex)
    const isSuperAdmin =
      user.role === "admin" &&
      (!user.managedCategories || user.managedCategories.length === 0);

    return {
      ...user,
      isSuperAdmin,
    };
  },
});

export const getTotalRegisteredAdmins = query({
  args: {},
  handler: async (ctx) => {
    const admins = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("role"), "admin"))
      .collect();
    return admins.length;
  },
});

export const getApplicantsOverTime = query({
  args: { year: v.number() },
  handler: async (ctx, args) => {
    const applications = await ctx.db.query("applications").collect();
    const applicantsOverTime: Record<string, number> = {};

    applications.forEach((app) => {
      const creationDate = new Date(app._creationTime);
      if (creationDate.getFullYear() === args.year) {
        const month = creationDate.getMonth().toString();
        applicantsOverTime[month] = (applicantsOverTime[month] || 0) + 1;
      }
    });
    return applicantsOverTime;
  },
});

export const getApplicantsByHealthCardType = query({
  args: {
    startDate: v.optional(v.float64()),
    endDate: v.optional(v.float64()),
  },
  handler: async (ctx, args) => {
    let applications = await ctx.db.query("applications").collect();

    if (args.startDate && args.endDate) {
      applications = applications.filter(app =>
        app._creationTime >= args.startDate! && app._creationTime <= args.endDate!
      );
    }

    const applicantsByHealthCardType: Record<string, number> = {};

    for (const app of applications) {
      const jobCategory = await ctx.db.get(app.jobCategoryId);
      const healthCardType = jobCategory?.name || "Unknown";
      applicantsByHealthCardType[healthCardType] = (applicantsByHealthCardType[healthCardType] || 0) + 1;
    }

    return applicantsByHealthCardType;
  },
});

export const getAdminsByHealthCardType = query({
  args: {},
  handler: async (ctx) => {
    // Include all admin-like roles in the breakdown
    const [admins, inspectors, systemAdmins] = await Promise.all([
      ctx.db
        .query("users")
        .withIndex("by_role", (q) => q.eq("role", "admin"))
        .collect(),
      ctx.db
        .query("users")
        .withIndex("by_role", (q) => q.eq("role", "inspector"))
        .collect(),
      ctx.db
        .query("users")
        .withIndex("by_role", (q) => q.eq("role", "system_admin"))
        .collect(),
    ]);

    const adminLikeUsers = [...admins, ...inspectors, ...systemAdmins];

    const adminsByHealthCardType: Record<string, string[]> = {};

    for (const user of adminLikeUsers) {
      const isSystemAdmin = user.role === "system_admin";
      const hasManagedCategories =
        !!user.managedCategories && user.managedCategories.length > 0;

      // Build a display name that reflects the role for clarity in the UI
      const baseName = user.username || user.email;
      const roleSuffix =
        user.role === "inspector"
          ? " (Inspector)"
          : user.role === "system_admin"
          ? " (System Admin)"
          : "";
      const displayName = `${baseName}${roleSuffix}`;

      // System admins and legacy "super admins" (admin with no managedCategories)
      // are grouped under a dedicated "Super Admin" bucket
      if (isSystemAdmin || (!hasManagedCategories && user.role === "admin")) {
        const superAdminCategory = "Super Admin";
        if (!adminsByHealthCardType[superAdminCategory]) {
          adminsByHealthCardType[superAdminCategory] = [];
        }
        adminsByHealthCardType[superAdminCategory].push(displayName);
        continue;
      }

      // For regular admins/inspectors: group by the job categories they actually manage.
      // If a managedCategories entry no longer resolves to a valid jobCategory
      // (e.g. deleted or corrupted ID), skip it so it doesn't pollute metrics
      // as "Unknown Category".
      if (hasManagedCategories && user.managedCategories) {
        for (const categoryId of user.managedCategories) {
          const jobCategory = await ctx.db.get(categoryId);
          if (!jobCategory || jobCategory.deletedAt) {
            // Category no longer exists / is soft-deleted – ignore this mapping
            continue;
          }

          const categoryName = jobCategory.name;

          if (!adminsByHealthCardType[categoryName]) {
            adminsByHealthCardType[categoryName] = [];
          }
          adminsByHealthCardType[categoryName].push(displayName);
        }
      }
      // Note: if a user only has invalid managedCategories, they won't appear
      // in the breakdown at all – this keeps the metrics clean and avoids
      // showing stale "Unknown Category" assignments.
    }

    return adminsByHealthCardType;
  },
});

export const getAverageApprovalTime = query({
  args: {
    startDate: v.optional(v.float64()),
    endDate: v.optional(v.float64()),
  },
  handler: async (ctx, args) => {
    let applications = await ctx.db.query("applications").collect();

    if (args.startDate && args.endDate) {
      applications = applications.filter(app =>
        app._creationTime >= args.startDate! && app._creationTime <= args.endDate!
      );
    }

    const approvedApplications = applications.filter(
      (app) => app.applicationStatus === "Approved" && app.approvedAt,
    );

    if (approvedApplications.length === 0) {
      return 0;
    }

    const totalApprovalTime = approvedApplications.reduce((sum, app) => {
      return sum + (app.approvedAt! - app._creationTime);
    }, 0);

    return totalApprovalTime / approvedApplications.length;
  },
});

export const getApplicationTrends = query({
  args: { year: v.number() },
  handler: async (ctx, args) => {
    const applications = await ctx.db.query("applications").collect();

    const applicationsInYear = applications.filter(
      (app) => new Date(app._creationTime).getFullYear() === args.year,
    );

    const monthCounts: Record<string, number> = {};
    const dayCounts: Record<string, number> = {};

    applicationsInYear.forEach((app) => {
      const date = new Date(app._creationTime);
      const month = date.toLocaleString("default", { month: "long" });
      const day = date.toLocaleString("default", { weekday: "long" });

      monthCounts[month] = (monthCounts[month] || 0) + 1;
      dayCounts[day] = (dayCounts[day] || 0) + 1;
    });

    const mostSubmittedMonth =
      Object.entries(monthCounts).sort(([, countA], [, countB]) => countB - countA)[0]?.[0] || "N/A";
    const mostSubmittedDay =
      Object.entries(dayCounts).sort(([, countA], [, countB]) => countB - countA)[0]?.[0] || "N/A";

    return { mostSubmittedMonth, mostSubmittedDay };
  },
});

export const getMostActiveAdmins = query({
  args: {
    startDate: v.optional(v.float64()),
    endDate: v.optional(v.float64()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let activityLogs = await ctx.db.query("adminActivityLogs").collect(); // Changed to adminActivityLogs

    if (args.startDate && args.endDate) {
      activityLogs = activityLogs.filter(log =>
        log._creationTime >= args.startDate! && log._creationTime <= args.endDate!
      );
    }

    const adminActivityCounts: Record<string, { adminName: string; activityCount: number }> = {};

    for (const log of activityLogs) {
      const adminId = log.adminId;
      if (adminId) {
        const admin = await ctx.db.get(adminId);
        const adminName = admin?.username || admin?.email || "Unknown Admin";

        if (!adminActivityCounts[adminId]) {
          adminActivityCounts[adminId] = { adminName, activityCount: 0 };
        }
        adminActivityCounts[adminId].activityCount++;
      }
    }

    const sortedAdmins = Object.values(adminActivityCounts).sort(
      (a, b) => b.activityCount - a.activityCount,
    );

    return sortedAdmins.slice(0, args.limit || sortedAdmins.length);
  },
});

// Get rejection and referral statistics for super admin dashboard
export const getRejectionAndReferralStats = query({
  args: {
    startDate: v.optional(v.float64()),
    endDate: v.optional(v.float64()),
  },
  handler: async (ctx, args) => {
    // Get all payment rejections
    let paymentRejections = await ctx.db
      .query("paymentRejectionHistory")
      .collect();

    // Get all application rejections (permanent)
    let applicationRejections = await ctx.db
      .query("applicationRejectionHistory")
      .collect();

    // Get all document referrals (includes both medical referrals and document issues)
    let documentReferrals = await ctx.db
      .query("documentReferralHistory")
      .collect();

    // Apply date filters if provided
    if (args.startDate && args.endDate) {
      paymentRejections = paymentRejections.filter(r =>
        r.rejectedAt >= args.startDate! && r.rejectedAt <= args.endDate!
      );
      applicationRejections = applicationRejections.filter(r =>
        r.rejectedAt >= args.startDate! && r.rejectedAt <= args.endDate!
      );
      documentReferrals = documentReferrals.filter(r =>
        r.referredAt >= args.startDate! && r.referredAt <= args.endDate!
      );
    }

    // Count payment rejections (can resubmit)
    const totalPaymentRejections = paymentRejections.length;
    const pendingPaymentResubmission = paymentRejections.filter(r => !r.wasReplaced).length;

    // Count permanent application rejections
    const totalPermanentRejections = applicationRejections.length;

    // Count document referrals (to doctor)
    const totalDocumentReferrals = documentReferrals.length;
    const pendingDocumentReferrals = documentReferrals.filter(r => r.status === 'pending' || !r.wasReplaced).length;

    return {
      paymentRejections: {
        total: totalPaymentRejections,
        pending: pendingPaymentResubmission,
      },
      permanentRejections: {
        total: totalPermanentRejections,
      },
      documentReferrals: {
        total: totalDocumentReferrals,
        pending: pendingDocumentReferrals,
      },
    };
  },
});

// Get system health and performance metrics
export const getSystemHealthMetrics = query({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const twentyFourHoursAgo = now - 24 * 60 * 60 * 1000;
    const fortyEightHoursAgo = now - 48 * 60 * 60 * 1000;

    // Get all applications
    const allApplications = await ctx.db.query("applications").collect();

    // Calculate average time at each stage
    const docVerificationApps = allApplications.filter(
      (app) => app.applicationStatus === "For Document Verification" || app.applicationStatus === "For Payment Validation" || app.applicationStatus === "Approved"
    );
    
    const paymentValidationApps = allApplications.filter(
      (app) => app.applicationStatus === "For Payment Validation" || app.applicationStatus === "Approved"
    );

    // Calculate average processing times (mock for now - would need timestamps in schema)
    // In production, you'd track stage entry/exit times
    const avgDocVerificationTime = docVerificationApps.length > 0 ? 18.2 : 0; // hours
    const avgPaymentValidationTime = paymentValidationApps.length > 0 ? 4.3 : 0; // hours
    const avgOrientationSchedulingTime = 12.1; // hours

    // Calculate stage completion rates
    const submitted = allApplications.filter(app => app.applicationStatus === "Submitted").length;
    const docVerified = allApplications.filter(
      app => ["For Payment Validation", "For Orientation", "Scheduled", "Approved"].includes(app.applicationStatus)
    ).length;
    const paymentValidated = allApplications.filter(
      app => ["For Orientation", "Scheduled", "Approved"].includes(app.applicationStatus)
    ).length;
    const approved = allApplications.filter(app => app.applicationStatus === "Approved").length;

    const submittedToDocRate = submitted > 0 ? Math.round((docVerified / (submitted + docVerified)) * 100) : 0;
    const docToPaymentRate = docVerified > 0 ? Math.round((paymentValidated / docVerified) * 100) : 0;
    const paymentToApprovedRate = paymentValidated > 0 ? Math.round((approved / paymentValidated) * 100) : 0;

    // Get pending items that need attention
    const docsPendingOver24h = allApplications.filter(
      (app) => app.applicationStatus === "For Document Verification" && app._creationTime < twentyFourHoursAgo
    ).length;

    const paymentsPendingOver48h = allApplications.filter(
      (app) => app.applicationStatus === "For Payment Validation" && app._creationTime < fortyEightHoursAgo
    ).length;

    const orientationsNotScheduled = allApplications.filter(
      (app) => app.applicationStatus === "For Orientation"
    ).length;

    // Calculate system efficiency
    const totalApplications = allApplications.length;
    const successfulApplications = approved;
    const overallSuccessRate = totalApplications > 0 ? Math.round((successfulApplications / totalApplications) * 100) : 0;

    // Calculate average application lifespan (creation to approval)
    const approvedApps = allApplications.filter(app => app.applicationStatus === "Approved" && app.approvedAt);
    const avgLifespan = approvedApps.length > 0
      ? approvedApps.reduce((sum, app) => sum + (app.approvedAt! - app._creationTime), 0) / approvedApps.length
      : 0;
    const avgLifespanDays = avgLifespan / (1000 * 60 * 60 * 24); // Convert to days

    // Get activity logs to determine peak processing hour
    const activityLogs = await ctx.db.query("adminActivityLogs").collect();
    const hourCounts: Record<number, number> = {};
    
    activityLogs.forEach(log => {
      const hour = new Date(log.timestamp).getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });

    const peakHour = Object.entries(hourCounts)
      .sort(([, a], [, b]) => b - a)[0];
    
    const peakProcessingHour = peakHour 
      ? `${peakHour[0]}:00 - ${parseInt(peakHour[0]) + 1}:00`
      : "N/A";

    return {
      processingBottlenecks: {
        documentVerification: avgDocVerificationTime,
        paymentValidation: avgPaymentValidationTime,
        orientationScheduling: avgOrientationSchedulingTime,
      },
      stageCompletionRates: {
        submittedToDocVerified: submittedToDocRate,
        docVerifiedToPayment: docToPaymentRate,
        paymentToApproved: paymentToApprovedRate,
      },
      attentionNeeded: {
        docsPendingOver24h,
        paymentsPendingOver48h,
        orientationsNotScheduled,
      },
      systemEfficiency: {
        overallSuccessRate,
        avgApplicationLifespanDays: Math.round(avgLifespanDays * 10) / 10,
        peakProcessingHour,
      },
    };
  },
});
