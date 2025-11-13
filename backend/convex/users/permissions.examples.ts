/**
 * Permission Helper Usage Examples
 * 
 * This file demonstrates how to use the centralized permission helpers
 * to simplify access control checks throughout the application.
 */

import { mutation, query } from "../_generated/server";
import { v } from "convex/values";
import { 
  hasAccess, 
  requireAccess, 
  getAccessibleCategories,
  filterByCategory,
  isSystemAdmin 
} from "./permissions";

// ============================================================================
// EXAMPLE 1: Protected Mutation with requireAccess
// ============================================================================

export const approveApplication = mutation({
  args: {
    applicationId: v.id("applications"),
  },
  handler: async (ctx, args) => {
    // Get the application
    const application = await ctx.db.get(args.applicationId);
    if (!application) {
      throw new Error("Application not found");
    }
    
    // ✅ BEFORE: Manual access check (duplicated everywhere)
    // const privileges = await AdminRole(ctx);
    // if (!privileges.isAdmin) {
    //   throw new Error("Admin access required");
    // }
    // if (privileges.managedCategories !== "all" && 
    //     !privileges.managedCategories.includes(application.jobCategoryId)) {
    //   throw new Error("No access to this category");
    // }
    
    // ✅ AFTER: Simple one-liner
    await requireAccess(ctx, "category", application.jobCategoryId);
    
    // Continue with approval logic...
    await ctx.db.patch(args.applicationId, {
      applicationStatus: "Approved",
      approvedAt: Date.now(),
    });
    
    return { success: true };
  },
});

// ============================================================================
// EXAMPLE 2: Conditional Logic with hasAccess
// ============================================================================

export const getApplicationDetails = query({
  args: {
    applicationId: v.id("applications"),
  },
  handler: async (ctx, args) => {
    const application = await ctx.db.get(args.applicationId);
    if (!application) {
      throw new Error("Application not found");
    }
    
    // ✅ Check access without throwing (useful for conditional features)
    const canEdit = await hasAccess(ctx, "category", application.jobCategoryId);
    const canViewSensitiveData = await hasAccess(ctx, "all_data");
    
    return {
      ...application,
      // Only show edit buttons if user has access
      canEdit,
      // Only show sensitive fields if system admin
      adminNotes: canViewSensitiveData ? application.adminRemarks : undefined,
    };
  },
});

// ============================================================================
// EXAMPLE 3: System Admin Only Features
// ============================================================================

export const createAdminUser = mutation({
  args: {
    email: v.string(),
    managedCategories: v.array(v.id("jobCategories")),
  },
  handler: async (ctx, args) => {
    // ✅ Only system admins can create other admins
    await requireAccess(ctx, "user_management");
    
    // Continue with user creation...
    // ... clerk API calls, etc.
    
    return { success: true };
  },
});

// ============================================================================
// EXAMPLE 4: Filter Data by Category Access
// ============================================================================

export const listApplications = query({
  args: {},
  handler: async (ctx) => {
    // Get all applications
    const allApplications = await ctx.db
      .query("applications")
      .collect();
    
    // ✅ BEFORE: Manual filtering (easy to mess up)
    // const privileges = await AdminRole(ctx);
    // let filtered;
    // if (privileges.managedCategories === "all") {
    //   filtered = allApplications;
    // } else {
    //   filtered = allApplications.filter(app => 
    //     privileges.managedCategories.includes(app.jobCategoryId)
    //   );
    // }
    
    // ✅ AFTER: One line
    const accessibleApplications = await filterByCategory(ctx, allApplications);
    
    return accessibleApplications;
  },
});

// ============================================================================
// EXAMPLE 5: Get Accessible Categories for Dropdowns
// ============================================================================

export const getJobCategoriesForAdmin = query({
  args: {},
  handler: async (ctx) => {
    const allowedCategories = await getAccessibleCategories(ctx);
    
    if (allowedCategories === "all") {
      // System admin - return all categories
      return await ctx.db.query("jobCategories").collect();
    } else {
      // Regular admin - return only their categories
      const categories = await Promise.all(
        allowedCategories.map(id => ctx.db.get(id))
      );
      return categories.filter(cat => cat !== null);
    }
  },
});

// ============================================================================
// EXAMPLE 6: Role-Based UI Data
// ============================================================================

export const getDashboardData = query({
  args: {},
  handler: async (ctx) => {
    const isSysAdmin = await isSystemAdmin(ctx);
    
    return {
      showCreateAdminButton: isSysAdmin,
      showSystemConfigMenu: isSysAdmin,
      showAllCategoriesToggle: isSysAdmin,
      // ... other conditional UI data
    };
  },
});

// ============================================================================
// EXAMPLE 7: Multiple Resource Checks
// ============================================================================

export const bulkApproveApplications = mutation({
  args: {
    applicationIds: v.array(v.id("applications")),
  },
  handler: async (ctx, args) => {
    const applications = await Promise.all(
      args.applicationIds.map(id => ctx.db.get(id))
    );
    
    // Check access to ALL applications before proceeding
    for (const app of applications) {
      if (!app) continue;
      
      const hasPermission = await hasAccess(ctx, "category", app.jobCategoryId);
      if (!hasPermission) {
        throw new Error(
          `No access to application ${app._id} (category: ${app.jobCategoryId})`
        );
      }
    }
    
    // All checks passed - proceed with bulk approval
    await Promise.all(
      applications.map(app => 
        app ? ctx.db.patch(app._id, { applicationStatus: "Approved" }) : null
      )
    );
    
    return { success: true, count: applications.length };
  },
});
