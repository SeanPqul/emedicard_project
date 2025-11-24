// convex/pricingConfig/index.ts
// Pricing Configuration Management
// Handles dynamic configuration of payment fees that can be edited by super admins

import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { Id } from "../_generated/dataModel";
import { AdminRole } from "../users/roles";

/**
 * Get active pricing for all payment methods
 * Returns current active prices for base fee and service fees
 * Public query - no auth required (pricing is public information)
 */
export const getActivePricing = query({
  args: {},
  handler: async (ctx) => {
    // Query active pricing for all keys
    const baseFee = await ctx.db
      .query("pricingConfig")
      .withIndex("by_key", (q) => q.eq("key", "base_fee"))
      .filter((q) => q.eq(q.field("value.isActive"), true))
      .first();

    const mayaServiceFee = await ctx.db
      .query("pricingConfig")
      .withIndex("by_key", (q) => q.eq("key", "maya_service_fee"))
      .filter((q) => q.eq(q.field("value.isActive"), true))
      .first();

    const baranggayServiceFee = await ctx.db
      .query("pricingConfig")
      .withIndex("by_key", (q) => q.eq("key", "baranggay_service_fee"))
      .filter((q) => q.eq(q.field("value.isActive"), true))
      .first();

    const cityhallServiceFee = await ctx.db
      .query("pricingConfig")
      .withIndex("by_key", (q) => q.eq("key", "cityhall_service_fee"))
      .filter((q) => q.eq(q.field("value.isActive"), true))
      .first();

    return {
      baseFee: baseFee
        ? {
            amount: baseFee.value.amount,
            currency: baseFee.value.currency,
            description: baseFee.value.description,
            effectiveFrom: baseFee.value.effectiveFrom,
            configId: baseFee._id,
          }
        : null,
      serviceFees: {
        Maya: mayaServiceFee
          ? {
              amount: mayaServiceFee.value.amount,
              currency: mayaServiceFee.value.currency,
              description: mayaServiceFee.value.description,
              effectiveFrom: mayaServiceFee.value.effectiveFrom,
              configId: mayaServiceFee._id,
            }
          : null,
        BaranggayHall: baranggayServiceFee
          ? {
              amount: baranggayServiceFee.value.amount,
              currency: baranggayServiceFee.value.currency,
              description: baranggayServiceFee.value.description,
              effectiveFrom: baranggayServiceFee.value.effectiveFrom,
              configId: baranggayServiceFee._id,
            }
          : null,
        CityHall: cityhallServiceFee
          ? {
              amount: cityhallServiceFee.value.amount,
              currency: cityhallServiceFee.value.currency,
              description: cityhallServiceFee.value.description,
              effectiveFrom: cityhallServiceFee.value.effectiveFrom,
              configId: cityhallServiceFee._id,
            }
          : null,
      },
    };
  },
});

/**
 * Get pricing history for a specific pricing key
 * Used for audit trail and viewing historical pricing changes
 * Admin/SuperAdmin only
 */
export const getPricingHistory = query({
  args: {
    key: v.optional(v.string()), // If not provided, returns all pricing history
  },
  handler: async (ctx, args) => {
    // Verify admin privileges
    const adminCheck = await AdminRole(ctx);
    if (!adminCheck.isAdmin) {
      throw new Error("Admin access required to view pricing history");
    }

    let pricingRecords;
    
    if (args.key) {
      // Get history for specific pricing key
      const key = args.key; // Extract to satisfy TypeScript
      pricingRecords = await ctx.db
        .query("pricingConfig")
        .withIndex("by_key", (q) => q.eq("key", key))
        .collect();
    } else {
      // Get all pricing history
      pricingRecords = await ctx.db
        .query("pricingConfig")
        .withIndex("by_updated_at")
        .order("desc")
        .collect();
    }

    // Sort by effectiveFrom (newest first)
    pricingRecords.sort((a, b) => b.value.effectiveFrom - a.value.effectiveFrom);

    // Enrich with admin user information
    const enrichedRecords = await Promise.all(
      pricingRecords.map(async (record) => {
        const admin = await ctx.db.get(record.updatedBy);
        
        return {
          _id: record._id,
          key: record.key,
          amount: record.value.amount,
          currency: record.value.currency,
          description: record.value.description,
          isActive: record.value.isActive,
          effectiveFrom: record.value.effectiveFrom,
          effectiveTo: record.value.effectiveTo,
          updatedAt: record.updatedAt,
          updatedBy: {
            _id: admin?._id,
            fullname: admin?.fullname || "Unknown Admin",
            email: admin?.email || "N/A",
          },
          notes: record.notes,
          changeReason: record.changeReason,
        };
      })
    );

    return enrichedRecords;
  },
});

/**
 * Update pricing for a specific key
 * SuperAdmin only - creates new active pricing record and deactivates old one
 */
export const updatePricing = mutation({
  args: {
    key: v.string(), // "base_fee", "maya_service_fee", etc.
    amount: v.float64(),
    changeReason: v.string(), // Required - why is this price changing?
    notes: v.optional(v.string()),
    effectiveFrom: v.optional(v.float64()), // If not provided, uses current timestamp
  },
  handler: async (ctx, args) => {
    // 1. Verify System Admin privileges
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }

    const adminCheck = await AdminRole(ctx);
    if (!adminCheck.isSuperAdmin) {
      throw new Error("System Administrator access required. Only system administrators can manage pricing.");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    // 2. Validate inputs
    if (args.amount <= 0) {
      throw new Error("Amount must be greater than zero");
    }

    const validKeys = ["base_fee", "maya_service_fee", "baranggay_service_fee", "cityhall_service_fee"];
    if (!validKeys.includes(args.key)) {
      throw new Error(`Invalid pricing key. Must be one of: ${validKeys.join(", ")}`);
    }

    if (!args.changeReason || args.changeReason.trim().length === 0) {
      throw new Error("Change reason is required for audit trail");
    }

    // 3. Get current active pricing
    const currentPricing = await ctx.db
      .query("pricingConfig")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .filter((q) => q.eq(q.field("value.isActive"), true))
      .first();

    const effectiveFromTimestamp = args.effectiveFrom || Date.now();

    // 4. If there's an active pricing, deactivate it
    if (currentPricing) {
      await ctx.db.patch(currentPricing._id, {
        value: {
          ...currentPricing.value,
          isActive: false,
          effectiveTo: effectiveFromTimestamp,
        },
        updatedAt: Date.now(),
      });
    }

    // 5. Get description based on key
    const descriptions: Record<string, string> = {
      base_fee: "Base health card application fee",
      maya_service_fee: "Service fee for Maya payment method",
      baranggay_service_fee: "Service fee for Baranggay Hall payment",
      cityhall_service_fee: "Service fee for City Hall payment",
    };

    // 6. Create new pricing record
    const newPricingId = await ctx.db.insert("pricingConfig", {
      key: args.key,
      value: {
        amount: args.amount,
        currency: "PHP",
        description: descriptions[args.key],
        isActive: true,
        effectiveFrom: effectiveFromTimestamp,
        effectiveTo: undefined,
      },
      updatedAt: Date.now(),
      updatedBy: user._id,
      notes: args.notes,
      changeReason: args.changeReason,
    });

    // 7. Log activity
    await ctx.db.insert("adminActivityLogs", {
      adminId: user._id,
      adminUsername: user.username,
      adminEmail: user.email,
      activityType: "pricing_update",
      action: "update_pricing",
      details: `Updated ${args.key} from ₱${currentPricing?.value.amount || 0} to ₱${args.amount}`,
      comment: args.changeReason,
      timestamp: Date.now(),
    });

    return {
      success: true,
      pricingId: newPricingId,
      message: `Successfully updated ${args.key} to ₱${args.amount}`,
      oldAmount: currentPricing?.value.amount || null,
      newAmount: args.amount,
    };
  },
});

/**
 * Initialize pricing with default values from constants (TEST VERSION - NO AUTH)
 * USE THIS IN CONVEX DASHBOARD FOR TESTING
 * For production, use the authenticated version through webadmin
 */
export const initializePricingTest = mutation({
  args: {},
  handler: async (ctx) => {
    // NO AUTH CHECK - FOR TESTING ONLY
    
    // Check if pricing already initialized
    const existingPricing = await ctx.db
      .query("pricingConfig")
      .withIndex("by_key", (q) => q.eq("key", "base_fee"))
      .first();

    if (existingPricing) {
      throw new Error("Pricing already initialized. Use updatePricing to change values.");
    }

    const now = Date.now();

    // Get first admin with empty managedCategories (= system admin)
    const allAdmins = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("role"), "admin"))
      .collect();
    
    const systemAdmin = allAdmins.find(admin => 
      !admin.managedCategories || admin.managedCategories.length === 0
    );

    if (!systemAdmin) {
      throw new Error("No system admin found. Please create an admin with empty managedCategories first.");
    }

    // Create initial pricing records from current constants
    const pricingData = [
      {
        key: "base_fee",
        amount: 50,
        description: "Base health card application fee",
        changeReason: "Initial pricing setup",
      },
      {
        key: "maya_service_fee",
        amount: 10,
        description: "Service fee for Maya payment method",
        changeReason: "Initial pricing setup",
      },
      {
        key: "baranggay_service_fee",
        amount: 10,
        description: "Service fee for Baranggay Hall payment",
        changeReason: "Initial pricing setup",
      },
      {
        key: "cityhall_service_fee",
        amount: 10,
        description: "Service fee for City Hall payment",
        changeReason: "Initial pricing setup",
      },
    ];

    const createdIds = [];

    for (const pricing of pricingData) {
      const id = await ctx.db.insert("pricingConfig", {
        key: pricing.key,
        value: {
          amount: pricing.amount,
          currency: "PHP",
          description: pricing.description,
          isActive: true,
          effectiveFrom: now,
          effectiveTo: undefined,
        },
        updatedAt: now,
        updatedBy: systemAdmin._id,
        notes: "Initial migration from hardcoded constants",
        changeReason: pricing.changeReason,
      });

      createdIds.push(id);
    }

    // Log activity
    await ctx.db.insert("adminActivityLogs", {
      adminId: systemAdmin._id,
      adminUsername: systemAdmin.username,
      adminEmail: systemAdmin.email,
      activityType: "pricing_initialization",
      action: "initialize_pricing",
      details: "Initialized pricing configuration from hardcoded constants",
      comment: "Migration: Base fee ₱50, Service fees ₱10",
      timestamp: now,
    });

    return {
      success: true,
      message: "Successfully initialized pricing configuration",
      createdCount: createdIds.length,
      pricingIds: createdIds,
    };
  },
});

/**
 * Initialize pricing with default values from constants
 * ONE-TIME MIGRATION - Run this to populate the database with initial pricing
 * SuperAdmin only
 */
export const initializePricing = mutation({
  args: {},
  handler: async (ctx) => {
    // Verify System Admin privileges
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }

    const adminCheck = await AdminRole(ctx);
    if (!adminCheck.isSuperAdmin) {
      throw new Error("System Administrator access required.");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    // Check if pricing already initialized
    const existingPricing = await ctx.db
      .query("pricingConfig")
      .withIndex("by_key", (q) => q.eq("key", "base_fee"))
      .first();

    if (existingPricing) {
      throw new Error("Pricing already initialized. Use updatePricing to change values.");
    }

    const now = Date.now();

    // Create initial pricing records from current constants
    const pricingData = [
      {
        key: "base_fee",
        amount: 50,
        description: "Base health card application fee",
        changeReason: "Initial pricing setup",
      },
      {
        key: "maya_service_fee",
        amount: 10,
        description: "Service fee for Maya payment method",
        changeReason: "Initial pricing setup",
      },
      {
        key: "baranggay_service_fee",
        amount: 10,
        description: "Service fee for Baranggay Hall payment",
        changeReason: "Initial pricing setup",
      },
      {
        key: "cityhall_service_fee",
        amount: 10,
        description: "Service fee for City Hall payment",
        changeReason: "Initial pricing setup",
      },
    ];

    const createdIds = [];

    for (const pricing of pricingData) {
      const id = await ctx.db.insert("pricingConfig", {
        key: pricing.key,
        value: {
          amount: pricing.amount,
          currency: "PHP",
          description: pricing.description,
          isActive: true,
          effectiveFrom: now,
          effectiveTo: undefined,
        },
        updatedAt: now,
        updatedBy: user._id,
        notes: "Initial migration from hardcoded constants",
        changeReason: pricing.changeReason,
      });

      createdIds.push(id);
    }

    // Log activity
    await ctx.db.insert("adminActivityLogs", {
      adminId: user._id,
      adminUsername: user.username,
      adminEmail: user.email,
      activityType: "pricing_initialization",
      action: "initialize_pricing",
      details: "Initialized pricing configuration from hardcoded constants",
      comment: "Migration: Base fee ₱50, Service fees ₱10",
      timestamp: now,
    });

    return {
      success: true,
      message: "Successfully initialized pricing configuration",
      createdCount: createdIds.length,
      pricingIds: createdIds,
    };
  },
});
