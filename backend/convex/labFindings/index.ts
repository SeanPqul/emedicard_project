// convex/labFindings/index.ts
// Lab Test Findings Management - Phase 2
// Handles recording and querying medical test findings that appear on health cards

import { v } from "convex/values";
import { mutation, query, internalMutation } from "../_generated/server";
import { Id } from "../_generated/dataModel";

/**
 * Record a lab test finding for an application
 * Admin/System Admin only - called when clearing a medical referral
 */
export const recordLabFinding = mutation({
  args: {
    applicationId: v.id("applications"),
    testType: v.union(
      v.literal("urinalysis"),
      v.literal("xray_sputum"),
      v.literal("stool")
    ),
    findingKind: v.string(),
    findingStatus: v.union(
      v.literal("cleared_with_monitoring"),
      v.literal("cleared_no_monitoring"),
      v.literal("pending_retest")
    ),
    clearedDate: v.float64(),
    monitoringExpiry: v.float64(),
    monitoringPeriodMonths: v.float64(),
    doctorName: v.string(),
    treatmentNotes: v.optional(v.string()),
    clinicAddress: v.optional(v.string()),
    showOnCard: v.boolean(),
    referralHistoryId: v.optional(v.id("documentReferralHistory")),
  },
  handler: async (ctx, args) => {
    // 1. Auth check - Admin or System Admin only
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user || !["admin", "system_admin"].includes(user.role ?? "")) {
      throw new Error("Admin access required");
    }

    // 2. Validate application exists and not yet approved
    const application = await ctx.db.get(args.applicationId);
    if (!application) {
      throw new Error("Application not found");
    }

    if (application.applicationStatus === "Approved") {
      throw new Error("Cannot add findings to approved application");
    }

    // 3. Insert finding record
    const findingId = await ctx.db.insert("labTestFindings", {
      applicationId: args.applicationId,
      testType: args.testType,
      findingKind: args.findingKind,
      findingStatus: args.findingStatus,
      clearedDate: args.clearedDate,
      monitoringExpiry: args.monitoringExpiry,
      monitoringPeriodMonths: args.monitoringPeriodMonths,
      doctorName: args.doctorName,
      treatmentNotes: args.treatmentNotes,
      clinicAddress: args.clinicAddress,
      showOnCard: args.showOnCard,
      referralHistoryId: args.referralHistoryId,
      recordedBy: user._id,
      recordedAt: Date.now(),
    });

    // 4. Update referral history if linked
    if (args.referralHistoryId) {
      await ctx.db.patch(args.referralHistoryId, {
        status: "cleared",
      });
    }

    return { success: true, findingId };
  },
});

/**
 * Get lab findings for an application
 * Returns findings grouped by test type for easy rendering
 */
export const getLabFindings = query({
  args: { applicationId: v.id("applications") },
  handler: async (ctx, args) => {
    const findings = await ctx.db
      .query("labTestFindings")
      .withIndex("by_application", (q) =>
        q.eq("applicationId", args.applicationId)
      )
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .collect();

    // Enrich with recorder info
    const enrichedFindings = await Promise.all(
      findings.map(async (finding) => {
        const recorder = await ctx.db.get(finding.recordedBy);
        return {
          ...finding,
          recorderName: recorder?.fullname || "Admin",
        };
      })
    );

    // Group by test type for easy rendering
    return {
      urinalysis: enrichedFindings.filter((f) => f.testType === "urinalysis"),
      xray_sputum: enrichedFindings.filter((f) => f.testType === "xray_sputum"),
      stool: enrichedFindings.filter((f) => f.testType === "stool"),
      all: enrichedFindings,
    };
  },
});

/**
 * Get a specific lab finding by ID
 */
export const getLabFinding = query({
  args: { findingId: v.id("labTestFindings") },
  handler: async (ctx, args) => {
    const finding = await ctx.db.get(args.findingId);
    if (!finding || finding.deletedAt) {
      return null;
    }

    const recorder = await ctx.db.get(finding.recordedBy);
    const application = await ctx.db.get(finding.applicationId);
    
    let referralHistory = null;
    if (finding.referralHistoryId) {
      referralHistory = await ctx.db.get(finding.referralHistoryId);
    }

    return {
      ...finding,
      recorderName: recorder?.fullname || "Admin",
      applicationStatus: application?.applicationStatus,
      referralHistory,
    };
  },
});

/**
 * Update an existing lab finding
 * Admin/System Admin only
 */
export const updateLabFinding = mutation({
  args: {
    findingId: v.id("labTestFindings"),
    findingKind: v.optional(v.string()),
    findingStatus: v.optional(
      v.union(
        v.literal("cleared_with_monitoring"),
        v.literal("cleared_no_monitoring"),
        v.literal("pending_retest")
      )
    ),
    clearedDate: v.optional(v.float64()),
    monitoringExpiry: v.optional(v.float64()),
    monitoringPeriodMonths: v.optional(v.float64()),
    doctorName: v.optional(v.string()),
    treatmentNotes: v.optional(v.string()),
    clinicAddress: v.optional(v.string()),
    showOnCard: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // 1. Auth check
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user || !["admin", "system_admin"].includes(user.role ?? "")) {
      throw new Error("Admin access required");
    }

    // 2. Get existing finding
    const finding = await ctx.db.get(args.findingId);
    if (!finding || finding.deletedAt) {
      throw new Error("Finding not found");
    }

    // 3. Check if card already generated
    if (finding.healthCardId) {
      throw new Error(
        "Cannot edit finding - health card already generated. Delete and recreate if needed."
      );
    }

    // 4. Update fields
    const updates: any = {
      updatedAt: Date.now(),
    };

    if (args.findingKind !== undefined) updates.findingKind = args.findingKind;
    if (args.findingStatus !== undefined) updates.findingStatus = args.findingStatus;
    if (args.clearedDate !== undefined) updates.clearedDate = args.clearedDate;
    if (args.monitoringExpiry !== undefined) updates.monitoringExpiry = args.monitoringExpiry;
    if (args.monitoringPeriodMonths !== undefined)
      updates.monitoringPeriodMonths = args.monitoringPeriodMonths;
    if (args.doctorName !== undefined) updates.doctorName = args.doctorName;
    if (args.treatmentNotes !== undefined) updates.treatmentNotes = args.treatmentNotes;
    if (args.clinicAddress !== undefined) updates.clinicAddress = args.clinicAddress;
    if (args.showOnCard !== undefined) updates.showOnCard = args.showOnCard;

    await ctx.db.patch(args.findingId, updates);

    return { success: true };
  },
});

/**
 * Soft delete a lab finding
 * Admin/System Admin only
 */
export const deleteLabFinding = mutation({
  args: { findingId: v.id("labTestFindings") },
  handler: async (ctx, args) => {
    // 1. Auth check
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user || !["admin", "system_admin"].includes(user.role ?? "")) {
      throw new Error("Admin access required");
    }

    // 2. Get existing finding
    const finding = await ctx.db.get(args.findingId);
    if (!finding || finding.deletedAt) {
      throw new Error("Finding not found");
    }

    // 3. Check if card already generated
    if (finding.healthCardId) {
      throw new Error(
        "Cannot delete finding - health card already generated with this finding"
      );
    }

    // 4. Soft delete
    await ctx.db.patch(args.findingId, {
      deletedAt: Date.now(),
    });

    return { success: true };
  },
});

/**
 * Internal mutation to link finding to generated health card
 * Called by health card generation process
 */
export const linkFindingToCard = internalMutation({
  args: {
    findingId: v.id("labTestFindings"),
    healthCardId: v.id("healthCards"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.findingId, {
      healthCardId: args.healthCardId,
    });
  },
});

/**
 * Get findings for a specific referral history
 * Used to show findings linked to a medical referral
 */
export const getFindingsByReferral = query({
  args: { referralHistoryId: v.id("documentReferralHistory") },
  handler: async (ctx, args) => {
    const findings = await ctx.db
      .query("labTestFindings")
      .withIndex("by_referral", (q) =>
        q.eq("referralHistoryId", args.referralHistoryId)
      )
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .collect();

    return findings;
  },
});

/**
 * Get summary of findings for an application
 * Quick stats for admin dashboard
 */
export const getFindingsSummary = query({
  args: { applicationId: v.id("applications") },
  handler: async (ctx, args) => {
    const findings = await ctx.db
      .query("labTestFindings")
      .withIndex("by_application", (q) =>
        q.eq("applicationId", args.applicationId)
      )
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .collect();

    return {
      total: findings.length,
      showOnCard: findings.filter((f) => f.showOnCard).length,
      byType: {
        urinalysis: findings.filter((f) => f.testType === "urinalysis").length,
        xray_sputum: findings.filter((f) => f.testType === "xray_sputum").length,
        stool: findings.filter((f) => f.testType === "stool").length,
      },
      hasFindings: findings.length > 0,
    };
  },
});
