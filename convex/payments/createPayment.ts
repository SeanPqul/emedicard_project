import { v } from "convex/values";
import { mutation } from "../_generated/server";

export const createPayment = mutation({
  args: {
    formId: v.id("forms"),
    amount: v.number(),
    serviceFee: v.number(),
    netAmount: v.number(),
    method: v.union(
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
      // Validate form exists
      const form = await ctx.db.get(args.formId);
      if (!form) {
        throw new Error("Form not found");
      }

      // Check if payment already exists for this form
      const existingPayment = await ctx.db
        .query("payments")
        .withIndex("by_form", (q) => q.eq("formId", args.formId))
        .unique();

      if (existingPayment) {
        throw new Error("Payment already exists for this form");
      }

      // Validate payment amounts
      if (args.amount <= 0 || args.serviceFee < 0 || args.netAmount <= 0) {
        throw new Error("Invalid payment amounts");
      }

      if (args.netAmount !== args.amount + args.serviceFee) {
        throw new Error("Net amount calculation is incorrect");
      }

      const paymentId = await ctx.db.insert("payments", {
        formId: args.formId,
        amount: args.amount,
        serviceFee: args.serviceFee,
        netAmount: args.netAmount,
        method: args.method,
        referenceNumber: args.referenceNumber,
        receiptId: args.receiptId,
        status: "Pending",
      });

      // Get user details for notification
      const user = await ctx.db.get(form.userId);
      if (user) {
        await ctx.db.insert("notifications", {
          userId: user._id,
          formsId: args.formId,
          type: "PaymentReceived",
          title: "Payment Received",
          message: `Payment submission received for ₱${args.netAmount} via ${args.method}. Reference: ${args.referenceNumber}`,
          read: false,
        });
      }

      return paymentId;
    } catch (error) {
      console.error("Error creating payment:", error);
      throw new Error(error instanceof Error ? error.message : "Failed to create payment. Please try again.");
    }
  },
});
