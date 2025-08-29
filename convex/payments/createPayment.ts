import { v } from "convex/values";
import { mutation } from "../_generated/server";

export const createPaymentMutation = mutation({
  args: {
    applicationId: v.id("applications"),
    amount: v.number(),
    serviceFee: v.number(),
    netAmount: v.number(),
    paymentMethod: v.union(
      v.literal("Gcash"),
      v.literal("Maya"),
      v.literal("BaranggayHall"),
      v.literal("CityHall")
    ),
    referenceNumber: v.string(),
    receiptId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    try {
      // Validate application exists
      const application = await ctx.db.get(args.applicationId);
      if (!application) {
        throw new Error("Application not found");
      }

      // Check if payment already exists for this application
      const existingPayment = await ctx.db
        .query("payments")
        .withIndex("by_application", (q) => q.eq("applicationId", args.applicationId))
        .unique();

      if (existingPayment) {
        throw new Error("Payment already exists for this application");
      }

      // Validate payment amounts
      if (args.amount <= 0 || args.serviceFee < 0 || args.netAmount <= 0) {
        throw new Error("Invalid payment amounts");
      }

      if (args.netAmount !== args.amount + args.serviceFee) {
        throw new Error("Net amount calculation is incorrect");
      }

      const paymentId = await ctx.db.insert("payments", {
        applicationId: args.applicationId,
        amount: args.amount,
        serviceFee: args.serviceFee,
        netAmount: args.netAmount,
        paymentMethod: args.paymentMethod,
        referenceNumber: args.referenceNumber,
        receiptStorageId: args.receiptId,
        paymentStatus: "Pending",
      });

      // Get user details for notification
      const user = await ctx.db.get(application.userId);
      if (user) {
        await ctx.db.insert("notifications", {
          userId: user._id,
          applicationId: args.applicationId,
          notificationType: "PaymentReceived",
          title: "Payment Received",
          message: `Payment submission received for ₱${args.netAmount} via ${args.paymentMethod}. Reference: ${args.referenceNumber}`,
          isRead: false,
        });
      }

      return paymentId;
    } catch (error) {
      console.error("Error creating payment:", error);
      throw new Error(error instanceof Error ? error.message : "Failed to create payment. Please try again.");
    }
  },
});


// @deprecated - Use createPaymentMutation instead. This alias will be removed in a future release.
export const createPayment = createPaymentMutation;
