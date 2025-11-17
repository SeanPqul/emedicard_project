/**
 * Permission & Access Control Helper
 * 
 * Centralizes all access control logic to avoid duplication and ensure
 * consistent permission checks across the application.
 */

import { QueryCtx, MutationCtx } from "../_generated/server";
import { Id } from "../_generated/dataModel";
import { AdminRole } from "./roles";

/**
 * Resource types that can be protected by access control
 */
export type ProtectedResource = 
  | "category"           // Job category management
  | "admin_panel"        // Admin dashboard access
  | "all_data"          // Full system data access
  | "user_management"   // Create/manage admins
  | "system_config";    // System-level configuration

/**
 * Check if the current user has access to a specific resource
 * 
 * @param ctx - Query or Mutation context
 * @param resource - The type of resource being accessed
 * @param resourceId - Optional ID of the specific resource (e.g., category ID)
 * @returns true if user has access, false otherwise
 * 
 * @example
 * // Check if user can manage a specific category
 * if (!await hasAccess(ctx, "category", categoryId)) {
 *   throw new Error("No access to this category");
 * }
 * 
 * @example
 * // Check if user can access admin panel
 * if (!await hasAccess(ctx, "admin_panel")) {
 *   throw new Error("Admin access required");
 * }
 */
export async function hasAccess(
  ctx: QueryCtx | MutationCtx,
  resource: ProtectedResource,
  resourceId?: Id<"jobCategories">
): Promise<boolean> {
  const privileges = await AdminRole(ctx);
  
  // System Administrators have access to everything
  if (privileges.isSuperAdmin) {
    return true;
  }
  
  // Non-admin users have no access
  if (!privileges.isAdmin) {
    return false;
  }
  
  // Resource-specific access checks for regular admins
  switch (resource) {
    case "category":
      // Check if admin has access to specific category
      if (!resourceId) {
        return false; // Category ID required
      }
      
      if (privileges.managedCategories === "all") {
        return true;
      }
      
      return Array.isArray(privileges.managedCategories) && 
             privileges.managedCategories.includes(resourceId);
    
    case "admin_panel":
      // All admins can access admin panel (but see filtered data)
      return true;
    
    case "all_data":
      // Only system admins can access all data
      return privileges.managedCategories === "all";
    
    case "user_management":
      // Only system admins can create/manage other admins
      return privileges.managedCategories === "all";
    
    case "system_config":
      // Only system admins can modify system configuration
      return privileges.managedCategories === "all";
    
    default:
      return false;
  }
}

/**
 * Require access to a resource, throwing an error if denied
 * 
 * @param ctx - Query or Mutation context
 * @param resource - The type of resource being accessed
 * @param resourceId - Optional ID of the specific resource
 * @throws Error if user doesn't have access
 * 
 * @example
 * // Will throw if user can't access this category
 * await requireAccess(ctx, "category", categoryId);
 * 
 * // Continue with protected logic...
 */
export async function requireAccess(
  ctx: QueryCtx | MutationCtx,
  resource: ProtectedResource,
  resourceId?: Id<"jobCategories">
): Promise<void> {
  const hasPermission = await hasAccess(ctx, resource, resourceId);
  
  if (!hasPermission) {
    const resourceName = resourceId 
      ? `${resource} (ID: ${resourceId})`
      : resource;
    
    throw new Error(
      `Access denied: You don't have permission to access ${resourceName}`
    );
  }
}

/**
 * Get all categories the current user can access
 * 
 * @param ctx - Query or Mutation context
 * @returns Array of category IDs or "all" for system admins
 * 
 * @example
 * const allowedCategories = await getAccessibleCategories(ctx);
 * 
 * if (allowedCategories === "all") {
 *   // Fetch all categories
 * } else {
 *   // Fetch only specific categories
 *   const categories = allowedCategories.map(id => db.get(id));
 * }
 */
export async function getAccessibleCategories(
  ctx: QueryCtx | MutationCtx
): Promise<"all" | Id<"jobCategories">[]> {
  const privileges = await AdminRole(ctx);
  
  if (!privileges.isAdmin) {
    return [];
  }
  
  if (privileges.managedCategories === "all") {
    return "all";
  }
  
  return Array.isArray(privileges.managedCategories) 
    ? privileges.managedCategories 
    : [];
}

/**
 * Check if current user is a System Administrator
 * 
 * @param ctx - Query or Mutation context
 * @returns true if user is system_admin
 */
export async function isSystemAdmin(
  ctx: QueryCtx | MutationCtx
): Promise<boolean> {
  const privileges = await AdminRole(ctx);
  return privileges.isSuperAdmin;
}

/**
 * Check if current user is any type of admin (regular or system)
 * 
 * @param ctx - Query or Mutation context
 * @returns true if user has admin or system_admin role
 */
export async function isAdmin(
  ctx: QueryCtx | MutationCtx
): Promise<boolean> {
  const privileges = await AdminRole(ctx);
  return privileges.isAdmin;
}

/**
 * Check if current user is in read-only oversight mode (system_admin)
 * 
 * @param ctx - Query or Mutation context
 * @returns true if user is system_admin in read-only oversight mode
 */
export async function isReadOnlyOversight(
  ctx: QueryCtx | MutationCtx
): Promise<boolean> {
  const privileges = await AdminRole(ctx);
  return privileges.isReadOnlyOversight || false;
}

/**
 * Require write access - throws error if user is in read-only mode
 * Use this guard at the beginning of mutation functions that modify application data
 * 
 * @param ctx - Mutation context
 * @throws Error if user is in read-only oversight mode
 * 
 * @example
 * export const approveDocument = mutation({
 *   handler: async (ctx, args) => {
 *     await requireWriteAccess(ctx); // Blocks system_admin from modifying
 *     // ... rest of mutation logic
 *   }
 * });
 */
export async function requireWriteAccess(
  ctx: QueryCtx | MutationCtx
): Promise<void> {
  const isReadOnly = await isReadOnlyOversight(ctx);
  
  if (isReadOnly) {
    throw new Error(
      "Access denied: System Administrators have read-only access to the admin dashboard. " +
      "You can view all data but cannot make changes to applications, documents, or payments. " +
      "Please use a regular admin account to perform this action."
    );
  }
}

/**
 * Filter a list of items by category access
 * Useful for listing applications, documents, etc.
 * 
 * @param ctx - Query or Mutation context
 * @param items - Array of items with categoryId field
 * @returns Filtered array containing only accessible items
 * 
 * @example
 * const allApplications = await ctx.db.query("applications").collect();
 * const accessibleApps = await filterByCategory(ctx, allApplications);
 */
export async function filterByCategory<T extends { jobCategoryId: Id<"jobCategories"> }>(
  ctx: QueryCtx | MutationCtx,
  items: T[]
): Promise<T[]> {
  const allowedCategories = await getAccessibleCategories(ctx);
  
  if (allowedCategories === "all") {
    return items;
  }
  
  return items.filter(item => 
    allowedCategories.includes(item.jobCategoryId)
  );
}
