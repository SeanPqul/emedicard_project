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
    const admins = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("role"), "admin"))
      .collect();

    const adminsByHealthCardType: Record<string, string[]> = {};

    for (const admin of admins) {
      if (admin.managedCategories && admin.managedCategories.length > 0) {
        for (const categoryId of admin.managedCategories) {
          const jobCategory = await ctx.db.get(categoryId);
          const categoryName = jobCategory?.name || "Unknown Category";

          if (!adminsByHealthCardType[categoryName]) {
            adminsByHealthCardType[categoryName] = [];
          }
          adminsByHealthCardType[categoryName].push(admin.username || admin.email);
        }
      } else {
        const superAdminCategory = "Super Admin";
        if (!adminsByHealthCardType[superAdminCategory]) {
          adminsByHealthCardType[superAdminCategory] = [];
        }
        adminsByHealthCardType[superAdminCategory].push(admin.username || admin.email);
      }
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
