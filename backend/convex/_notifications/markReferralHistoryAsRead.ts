import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { Id } from "../_generated/dataModel";

/**
 * Mark Referral/Issue History as Read with Dual-Write Pattern
 *
 * Updates BOTH old and new tables to mark admin as having read the notification.
 */
export const markReferralHistoryAsRead = mutation({
  args: {
    referralId: v.union(
      v.id("documentReferralHistory"),
      v.id("documentRejectionHistory"),
      v.id("paymentRejectionHistory")
    ),
    referralType: v.union(
      v.literal("document"),
      v.literal("payment")
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const admin = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!admin) {
      throw new Error("User not found");
    }

    // Get the referral/rejection record from the appropriate table
    let currentReadBy: Id<"users">[] = [];

    if (args.referralType === "document") {
      // Try to get from new table first
      const referral = await ctx.db.get(args.referralId as Id<"documentReferralHistory">);

      if (referral) {
        // Found in new table
        currentReadBy = referral.adminReadBy || [];

        if (!currentReadBy.includes(admin._id)) {
          // DUAL-WRITE: Update new table
          await ctx.db.patch(args.referralId as Id<"documentReferralHistory">, {
            adminReadBy: [...currentReadBy, admin._id],
          });

          // Also update corresponding old table record if it exists
          const oldRejection = await ctx.db
            .query("documentRejectionHistory")
            .withIndex("by_document_type", (q) =>
              q.eq("applicationId", referral.applicationId)
               .eq("documentTypeId", referral.documentTypeId)
            )
            .order("desc")
            .first();

          if (oldRejection) {
            const oldReadBy = oldRejection.adminReadBy || [];
            if (!oldReadBy.includes(admin._id)) {
              await ctx.db.patch(oldRejection._id, {
                adminReadBy: [...oldReadBy, admin._id],
              });
            }
          }
        }
      } else {
        // Not found in new table, try old table
        const rejection = await ctx.db.get(args.referralId as Id<"documentRejectionHistory">);
        if (!rejection) {
          throw new Error("Document referral/rejection history not found");
        }

        currentReadBy = rejection.adminReadBy || [];

        if (!currentReadBy.includes(admin._id)) {
          await ctx.db.patch(args.referralId as Id<"documentRejectionHistory">, {
            adminReadBy: [...currentReadBy, admin._id],
          });
        }
      }
    } else {
      // Payment rejection (no new table for this yet)
      const rejection = await ctx.db.get(args.referralId as Id<"paymentRejectionHistory">);
      if (!rejection) {
        throw new Error("Payment rejection history not found");
      }
      currentReadBy = rejection.adminReadBy || [];

      if (!currentReadBy.includes(admin._id)) {
        await ctx.db.patch(args.referralId as Id<"paymentRejectionHistory">, {
          adminReadBy: [...currentReadBy, admin._id],
        });
      }
    }

    return { success: true };
  },
});
