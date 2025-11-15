// convex/systemConfig/index.ts
// System Configuration Management
// Handles dynamic configuration of health card officials and signatures

import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { Id } from "../_generated/dataModel";
import { AdminRole } from "../users/roles";

/**
 * Get active officials for health card generation
 * Returns current City Health Officer and Sanitation Chief
 */
export const getActiveOfficials = query({
  args: {},
  handler: async (ctx) => {
    // Query active officials
    const cityHealthOfficer = await ctx.db
      .query("systemConfig")
      .withIndex("by_key", (q) => q.eq("key", "city_health_officer"))
      .filter((q) => q.eq(q.field("value.isActive"), true))
      .first();

    const sanitationChief = await ctx.db
      .query("systemConfig")
      .withIndex("by_key", (q) => q.eq("key", "sanitation_chief"))
      .filter((q) => q.eq(q.field("value.isActive"), true))
      .first();

    // Get signature URLs from storage if available
    let cityHealthOfficerSignatureUrl: string | undefined;
    let sanitationChiefSignatureUrl: string | undefined;

    if (cityHealthOfficer?.value.signatureStorageId) {
      cityHealthOfficerSignatureUrl =
        (await ctx.storage.getUrl(cityHealthOfficer.value.signatureStorageId)) ?? undefined;
    }

    if (sanitationChief?.value.signatureStorageId) {
      sanitationChiefSignatureUrl =
        (await ctx.storage.getUrl(sanitationChief.value.signatureStorageId)) ?? undefined;
    }

    return {
      cityHealthOfficer: cityHealthOfficer
        ? {
            ...cityHealthOfficer.value,
            signatureUrl: cityHealthOfficerSignatureUrl,
            configId: cityHealthOfficer._id,
          }
        : null,
      sanitationChief: sanitationChief
        ? {
            ...sanitationChief.value,
            signatureUrl: sanitationChiefSignatureUrl,
            configId: sanitationChief._id,
          }
        : null,
    };
  },
});

/**
 * Get all officials (including inactive) for a specific position
 * Used for viewing history
 */
export const getOfficialHistory = query({
  args: {
    key: v.string(), // "city_health_officer" or "sanitation_chief"
  },
  handler: async (ctx, args) => {
    const officials = await ctx.db
      .query("systemConfig")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .collect();

    // Sort by effectiveFrom (newest first)
    officials.sort((a, b) => b.value.effectiveFrom - a.value.effectiveFrom);

    // Get signature URLs for each
    const officialsWithUrls = await Promise.all(
      officials.map(async (official) => {
        let signatureUrl: string | undefined;
        if (official.value.signatureStorageId) {
          signatureUrl = (await ctx.storage.getUrl(official.value.signatureStorageId)) ?? undefined;
        }

        return {
          _id: official._id,
          ...official.value,
          signatureUrl,
          updatedAt: official.updatedAt,
          updatedBy: official.updatedBy,
          notes: official.notes,
          changeReason: official.changeReason,
        };
      })
    );

    return officialsWithUrls;
  },
});

/**
 * Set or update an official (System Admin only)
 * Creates new official or updates existing one
 */
export const setOfficial = mutation({
  args: {
    key: v.string(), // "city_health_officer" or "sanitation_chief"
    name: v.string(),
    designation: v.string(),
    signatureStorageId: v.optional(v.id("_storage")),
    effectiveFrom: v.optional(v.float64()), // If not provided, uses current timestamp
    notes: v.optional(v.string()),
    changeReason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // 1. Verify System Admin privileges
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }

    const adminCheck = await AdminRole(ctx);
    if (!adminCheck.isSuperAdmin) {
      throw new Error("System Administrator access required. Only system administrators can manage officials.");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    // 2. Check if there's an active official for this position
    const activeOfficial = await ctx.db
      .query("systemConfig")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .filter((q) => q.eq(q.field("value.isActive"), true))
      .first();

    const effectiveFromTimestamp = args.effectiveFrom || Date.now();

    // 3. If there's an active official, deactivate them
    if (activeOfficial) {
      await ctx.db.patch(activeOfficial._id, {
        value: {
          ...activeOfficial.value,
          isActive: false,
          effectiveTo: effectiveFromTimestamp,
        },
        updatedAt: Date.now(),
      });
    }

    // 4. Create new official record
    const newOfficialId = await ctx.db.insert("systemConfig", {
      key: args.key,
      value: {
        name: args.name,
        designation: args.designation,
        signatureStorageId: args.signatureStorageId,
        isActive: true,
        effectiveFrom: effectiveFromTimestamp,
        effectiveTo: undefined,
      },
      updatedAt: Date.now(),
      updatedBy: user._id,
      notes: args.notes,
      changeReason: args.changeReason,
    });

    return { 
      success: true, 
      officialId: newOfficialId,
      message: `Successfully set ${args.name} as ${args.designation}` 
    };
  },
});

/**
 * Update an existing official's details (without changing active status)
 * System Admin only
 */
export const updateOfficialDetails = mutation({
  args: {
    officialId: v.id("systemConfig"),
    name: v.optional(v.string()),
    designation: v.optional(v.string()),
    signatureStorageId: v.optional(v.id("_storage")),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // 1. Verify System Admin privileges
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }

    const adminCheck = await AdminRole(ctx);
    if (!adminCheck.isSuperAdmin) {
      throw new Error("System Administrator access required. Only system administrators can update official details.");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user || user.role !== "system_admin") {
      throw new Error("System Administrator access required");
    }

    // 2. Get existing official
    const official = await ctx.db.get(args.officialId);
    if (!official) {
      throw new Error("Official not found");
    }

    // 3. Update fields (preserve existing values if not provided)
    const updatedValue = {
      ...official.value,
      ...(args.name && { name: args.name }),
      ...(args.designation && { designation: args.designation }),
      ...(args.signatureStorageId && { signatureStorageId: args.signatureStorageId }),
    };

    await ctx.db.patch(args.officialId, {
      value: updatedValue,
      updatedAt: Date.now(),
      updatedBy: user._id,
      ...(args.notes && { notes: args.notes }),
    });

    return { success: true, message: "Official details updated successfully" };
  },
});

/**
 * Get current configuration summary
 * Returns both active officials in a single call
 */
export const getConfigurationSummary = query({
  args: {},
  handler: async (ctx) => {
    // Fetch active officials directly (can't call query from query)
    const cityHealthOfficer = await ctx.db
      .query("systemConfig")
      .withIndex("by_key", (q) => q.eq("key", "city_health_officer"))
      .filter((q) => q.eq(q.field("value.isActive"), true))
      .first();

    const sanitationChief = await ctx.db
      .query("systemConfig")
      .withIndex("by_key", (q) => q.eq("key", "sanitation_chief"))
      .filter((q) => q.eq(q.field("value.isActive"), true))
      .first();

    // Check for signatures
    const cityHealthOfficerHasSignature = !!(cityHealthOfficer?.value.signatureStorageId);
    const sanitationChiefHasSignature = !!(sanitationChief?.value.signatureStorageId);
    
    return {
      cityHealthOfficer: cityHealthOfficer
        ? {
            name: cityHealthOfficer.value.name,
            designation: cityHealthOfficer.value.designation,
            hasSignature: cityHealthOfficerHasSignature,
            effectiveFrom: cityHealthOfficer.value.effectiveFrom,
          }
        : null,
      sanitationChief: sanitationChief
        ? {
            name: sanitationChief.value.name,
            designation: sanitationChief.value.designation,
            hasSignature: sanitationChiefHasSignature,
            effectiveFrom: sanitationChief.value.effectiveFrom,
          }
        : null,
      lastUpdated: Date.now(),
    };
  },
});

/**
 * Initialize system configuration with default officials
 * Should be run once during system setup (System Admin only)
 */
export const initializeDefaultOfficials = mutation({
  args: {},
  handler: async (ctx) => {
    // 1. Get or create a system user for initialization
    let user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("role"), "system_admin"))
      .first();
    
    // If no system admin exists, use any user or create a placeholder
    if (!user) {
      const anyUser = await ctx.db.query("users").first();
      if (!anyUser) {
        throw new Error("No users found in database. Please create a user first.");
      }
      user = anyUser;
    }

    // 2. Check if officials already exist
    const existingCHO = await ctx.db
      .query("systemConfig")
      .withIndex("by_key", (q) => q.eq("key", "city_health_officer"))
      .first();

    const existingSC = await ctx.db
      .query("systemConfig")
      .withIndex("by_key", (q) => q.eq("key", "sanitation_chief"))
      .first();

    if (existingCHO || existingSC) {
      throw new Error("Officials already configured. Use setOfficial to update.");
    }

    // 3. Try to migrate from existing signatures table (if available)
    const doctorSignature = await ctx.db
      .query("signatures")
      .withIndex("by_type", (q) => q.eq("type", "doctor"))
      .first();

    const sanitationSignature = await ctx.db
      .query("signatures")
      .withIndex("by_type", (q) => q.eq("type", "sanitation_chief"))
      .first();

    // 4. Create default City Health Officer
    await ctx.db.insert("systemConfig", {
      key: "city_health_officer",
      value: {
        name: "Dr. Marjorie D. Culas",
        designation: "City Health Officer",
        signatureStorageId: doctorSignature?.storageId,
        isActive: true,
        effectiveFrom: Date.now(),
        effectiveTo: undefined,
      },
      updatedAt: Date.now(),
      updatedBy: user._id,
      notes: "Initial system configuration - migrated from signatures table",
    });

    // 5. Create default Sanitation Chief
    await ctx.db.insert("systemConfig", {
      key: "sanitation_chief",
      value: {
        name: "Luzminda N. Paig",
        designation: "Sanitation Chief",
        signatureStorageId: sanitationSignature?.storageId,
        isActive: true,
        effectiveFrom: Date.now(),
        effectiveTo: undefined,
      },
      updatedAt: Date.now(),
      updatedBy: user._id,
      notes: "Initial system configuration - migrated from signatures table",
    });

    return { 
      success: true, 
      message: "Default officials initialized successfully" 
    };
  },
});
