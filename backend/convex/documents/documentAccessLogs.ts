import { internalMutation, internalQuery, query } from "../_generated/server";
import { v } from "convex/values";

// Internal mutation to log document access attempts (called from HTTP endpoint)
export const logDocumentAccess = internalMutation({
  args: {
    documentId: v.string(), // Accept both valid IDs and strings for invalid requests
    applicationId: v.optional(v.id("applications")),
    userId: v.optional(v.id("users")),
    userEmail: v.optional(v.string()),
    userRole: v.optional(v.string()),
    accessStatus: v.union(
      v.literal("Success"),
      v.literal("Unauthorized"),
      v.literal("Expired"),
      v.literal("InvalidSignature"),
      v.literal("DocumentNotFound"),
      v.literal("NoSecret"),
      v.literal("InvalidRequest")
    ),
    accessMethod: v.union(
      v.literal("signed_url"),
      v.literal("direct"),
      v.literal("unknown")
    ),
    errorMessage: v.optional(v.string()),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    referrer: v.optional(v.string()),
    responseTimeMs: v.optional(v.number()),
    documentType: v.optional(v.string()),
    fileName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("documentAccessLogs", {
      ...args,
      timestamp: Date.now(),
    });
  },
});

// Query to get document access logs for a specific document
export const getDocumentAccessLogs = query({
  args: {
    documentId: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Check authentication
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Get user from database
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();
    
    if (!user) {
      throw new Error("User not found");
    }

    // Only admins and inspectors can view access logs
    if (user.role !== "admin" && user.role !== "inspector") {
      throw new Error("Unauthorized: Only admins and inspectors can view access logs");
    }

    const limit = args.limit || 100;
    
    const logs = await ctx.db
      .query("documentAccessLogs")
      .withIndex("by_document", (q) => q.eq("documentId", args.documentId))
      .order("desc")
      .take(limit);

    // Enrich logs with user information
    const enrichedLogs = await Promise.all(
      logs.map(async (log) => {
        let userName = null;
        if (log.userId) {
          const user = await ctx.db.get(log.userId);
          userName = user?.fullname || user?.username || null;
        }
        return {
          ...log,
          userName,
        };
      })
    );

    return enrichedLogs;
  },
});

// Query to get access logs for a specific application
export const getApplicationAccessLogs = query({
  args: {
    applicationId: v.id("applications"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Check authentication
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Get user from database
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();
    
    if (!user) {
      throw new Error("User not found");
    }

    // Only admins and inspectors can view access logs
    if (user.role !== "admin" && user.role !== "inspector") {
      throw new Error("Unauthorized: Only admins and inspectors can view access logs");
    }

    const limit = args.limit || 100;
    
    const logs = await ctx.db
      .query("documentAccessLogs")
      .withIndex("by_application", (q) => q.eq("applicationId", args.applicationId))
      .order("desc")
      .take(limit);

    return logs;
  },
});

// Query to get access logs by status (for security monitoring)
export const getAccessLogsByStatus = query({
  args: {
    accessStatus: v.union(
      v.literal("Success"),
      v.literal("Unauthorized"),
      v.literal("Expired"),
      v.literal("InvalidSignature"),
      v.literal("DocumentNotFound"),
      v.literal("NoSecret"),
      v.literal("InvalidRequest")
    ),
    limit: v.optional(v.number()),
    hoursBack: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Check authentication
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Get user from database
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();
    
    if (!user) {
      throw new Error("User not found");
    }

    // Only admins can view security logs
    if (user.role !== "admin") {
      throw new Error("Unauthorized: Only admins can view security logs");
    }

    const limit = args.limit || 100;
    const hoursBack = args.hoursBack || 24;
    const cutoffTime = Date.now() - (hoursBack * 60 * 60 * 1000);
    
    const logs = await ctx.db
      .query("documentAccessLogs")
      .withIndex("by_status", (q) => q.eq("accessStatus", args.accessStatus))
      .filter((q) => q.gte(q.field("timestamp"), cutoffTime))
      .order("desc")
      .take(limit);

    return logs;
  },
});

// Query to get user's own access history
export const getMyAccessHistory = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Check authentication
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Get user from database
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();
    
    if (!user) {
      throw new Error("User not found");
    }

    const limit = args.limit || 50;
    
    const logs = await ctx.db
      .query("documentAccessLogs")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(limit);

    // Filter to only show successful accesses for regular users
    if (user.role === "applicant") {
      return logs.filter(log => log.accessStatus === "Success");
    }

    return logs;
  },
});

// Internal query to get access statistics for monitoring
export const getAccessStatistics = internalQuery({
  args: {
    hoursBack: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const hoursBack = args.hoursBack || 24;
    const cutoffTime = Date.now() - (hoursBack * 60 * 60 * 1000);
    
    const logs = await ctx.db
      .query("documentAccessLogs")
      .withIndex("by_timestamp")
      .filter((q) => q.gte(q.field("timestamp"), cutoffTime))
      .collect();

    const stats = {
      total: logs.length,
      successful: logs.filter(l => l.accessStatus === "Success").length,
      unauthorized: logs.filter(l => l.accessStatus === "Unauthorized").length,
      expired: logs.filter(l => l.accessStatus === "Expired").length,
      invalidSignature: logs.filter(l => l.accessStatus === "InvalidSignature").length,
      documentNotFound: logs.filter(l => l.accessStatus === "DocumentNotFound").length,
      serverErrors: logs.filter(l => l.accessStatus === "NoSecret" || l.accessStatus === "InvalidRequest").length,
      uniqueUsers: new Set(logs.filter(l => l.userId).map(l => l.userId)).size,
      uniqueDocuments: new Set(logs.map(l => l.documentId)).size,
      avgResponseTime: logs.filter(l => l.responseTimeMs).reduce((acc, l) => acc + (l.responseTimeMs || 0), 0) / logs.filter(l => l.responseTimeMs).length || 0,
    };

    return stats;
  },
});
