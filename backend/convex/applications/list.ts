// convex/applications/list.ts

import { query } from "../_generated/server";
import { v } from "convex/values";
import { AdminRole } from "../users/roles"; 
import { Id } from "../_generated/dataModel";

export const list = query({
  args: {
    status: v.optional(v.string()),
    jobCategory: v.optional(v.id("jobCategories")),
    managedCategories: v.optional(v.union(v.literal("all"), v.array(v.id("jobCategories")))),
  },
  handler: async (ctx, args) => {
    // If managedCategories is not provided, fall back to checking admin role
    let adminCheck;
    if (!args.managedCategories) {
      adminCheck = await AdminRole(ctx);
      if (!adminCheck.isAdmin) {
        return [];
      }
    } else {
      // If managedCategories is provided, use it directly
      adminCheck = {
        isAdmin: true,
        managedCategories: args.managedCategories
      };
    }

    let applicationsQuery = ctx.db.query("applications");

    // Apply UI filters
    if (args.status) {
      applicationsQuery = applicationsQuery.filter(q => q.eq(q.field("applicationStatus"), args.status));
    }
    if (args.jobCategory) {
      applicationsQuery = applicationsQuery.filter(q => q.eq(q.field("jobCategoryId"), args.jobCategory));
    }

    // Apply Permission filters
    if (adminCheck.managedCategories !== "all") {
      const managedCategoryIds = adminCheck.managedCategories as Id<"jobCategories">[];
      if (!managedCategoryIds || managedCategoryIds.length === 0) {
        return []; // Admin manages zero categories
      }
      applicationsQuery = applicationsQuery.filter(q =>
        q.or(...managedCategoryIds.map(id => q.eq(q.field("jobCategoryId"), id)))
      );
    }

    const applications = await applicationsQuery.collect();

    // Join with user and job category data
    const applicationsWithDetails = await Promise.all(
      applications.map(async (application) => {
        const user = await ctx.db.get(application.userId);
        const jobCategory = await ctx.db.get(application.jobCategoryId);
        return {
          ...application,
          userName: user?.fullname ?? "Unknown User",
          jobCategoryName: jobCategory?.name ?? "Unknown Category",
        };
      })
    );
    
    return applicationsWithDetails;
  },
});
