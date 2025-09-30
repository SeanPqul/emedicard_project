import { v } from "convex/values";
import { query } from "../_generated/server";

export const getRecentAdminActivities = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Authentication failed.");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user || user.role !== "admin") {
      throw new Error("You do not have permission to view admin activities.");
    }

    let activities;

    // If SuperAdmin, return all activities
    if (user.role === "admin" && (!user.managedCategories || user.managedCategories.length === 0)) {
      activities = await ctx.db
        .query("adminActivityLogs")
        .withIndex("by_timestamp")
        .order("desc")
        .take(10); // Get the 10 most recent activities
    } else {
      // For regular admins, filter by managed categories
      const managedCategoryIds = user.managedCategories || [];
      if (managedCategoryIds.length === 0) {
        return []; // No managed categories, no activities to show
      }

      const allActivities = [];
      for (const categoryId of managedCategoryIds) {
        const categoryActivities = await ctx.db
          .query("adminActivityLogs")
          .withIndex("by_jobCategoryId", (q) => q.eq("jobCategoryId", categoryId))
          .order("desc")
          .take(10); // Take 10 from each to ensure we get recent ones
        allActivities.push(...categoryActivities);
      }

      // Sort all collected activities by timestamp and take the most recent 10
      allActivities.sort((a, b) => b.timestamp - a.timestamp);
      activities = allActivities.slice(0, 10);
    }

    // Fetch applicant names for each activity
    const activitiesWithApplicantNames = await Promise.all(
      activities.map(async (activity) => {
        if (activity.applicationId) {
          const application = await ctx.db.get(activity.applicationId);
          if (application) {
            const applicant = await ctx.db.get(application.userId);
            return { ...activity, applicantName: applicant?.fullname };
          }
        }
        return activity;
      })
    );

    return activitiesWithApplicantNames;
  },
});

export const getAllAdminActivities = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Authentication failed.");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user || user.role !== "admin") {
      throw new Error("You do not have permission to view admin activities.");
    }

    let activities;

    // If SuperAdmin, return all activities
    if (user.role === "admin" && (!user.managedCategories || user.managedCategories.length === 0)) {
      activities = await ctx.db.query("adminActivityLogs").withIndex("by_timestamp").order("desc").collect();
    } else {
      // For regular admins, filter by managed categories
      const managedCategoryIds = user.managedCategories || [];
      if (managedCategoryIds.length === 0) {
        return []; // No managed categories, no activities to show
      }
      
      const allActivities = [];
      for (const categoryId of managedCategoryIds) {
        const categoryActivities = await ctx.db
          .query("adminActivityLogs")
          .withIndex("by_jobCategoryId", q => q.eq("jobCategoryId", categoryId))
          .collect();
        allActivities.push(...categoryActivities);
      }
      allActivities.sort((a, b) => b.timestamp - a.timestamp);
      activities = allActivities;
    }

    // Fetch applicant names for each activity
    const activitiesWithApplicantNames = await Promise.all(
      activities.map(async (activity) => {
        if (activity.applicationId) {
          const application = await ctx.db.get(activity.applicationId);
          if (application) {
            const applicant = await ctx.db.get(application.userId);
            return { ...activity, applicantName: applicant?.fullname };
          }
        }
        return activity;
      })
    );
    return activitiesWithApplicantNames;
  },
});

export const getApplicationActivityLogs = query({
  args: {
    applicationId: v.id("applications"),
  },
  handler: async (ctx, { applicationId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Authentication failed.");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user || user.role !== "admin") {
      throw new Error("You do not have permission to view application activity logs.");
    }

    const application = await ctx.db.get(applicationId);
    if (!application) throw new Error("Application not found.");

    // For regular admins, check if they can view logs for this application
    if (user.managedCategories && user.managedCategories.length > 0) {
        if (!user.managedCategories.includes(application.jobCategoryId)) {
            throw new Error("You do not have permission to view logs for this application.");
        }
    }

    const activities = await ctx.db
      .query("adminActivityLogs")
      .withIndex("by_applicationId", (q) => q.eq("applicationId", applicationId))
      .order("desc")
      .collect();

    // Fetch applicant names for each activity
    const activitiesWithApplicantNames = await Promise.all(
      activities.map(async (activity) => {
        if (activity.applicationId) {
          const application = await ctx.db.get(activity.applicationId);
          if (application) {
            const applicant = await ctx.db.get(application.userId);
            return { ...activity, applicantName: applicant?.fullname };
          }
        }
        return activity;
      })
    );
    return activitiesWithApplicantNames;
  },
});