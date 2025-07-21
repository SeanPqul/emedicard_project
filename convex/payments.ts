import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getUserPayments = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return []; // Return empty if not authenticated
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      return []; // Return empty if user does not exist in DB yet
    }

    const userForms = await ctx.db
      .query("forms")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    if (userForms.length === 0) {
      return [];
    }

    const formIds = userForms.map((form) => form._id);

    const payments = await Promise.all(
      formIds.map(async (formId) => {
        const payment = await ctx.db
          .query("payments")
          .withIndex("by_form", (q) => q.eq("formId", formId))
          .unique();
        return payment;
      })
    );

    return payments.filter(Boolean) as any[];
  },
});

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

export const updatePaymentStatus = mutation({
  args: {
    paymentId: v.id("payments"),
    status: v.union(
      v.literal("Pending"),
      v.literal("Complete"),
      v.literal("Failed")
    ),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    try {
      const payment = await ctx.db.get(args.paymentId);
      if (!payment) {
        throw new Error("Payment not found");
      }

      await ctx.db.patch(args.paymentId, { status: args.status });

      // Get form and user details for notification
      const form = await ctx.db.get(payment.formId);
      const user = form ? await ctx.db.get(form.userId) : null;

      if (user) {
        let notificationMessage = "";
        let notificationType: "PaymentReceived" | "FormApproved" = "PaymentReceived";

        switch (args.status) {
          case "Complete":
            notificationMessage = `Payment confirmed! ₱${payment.netAmount} via ${payment.method}. Reference: ${payment.referenceNumber}`;
            notificationType = "PaymentReceived";
            break;
          case "Failed":
            notificationMessage = `Payment failed for ₱${payment.netAmount} via ${payment.method}. ${args.reason || "Please try again or contact support."}`;
            notificationType = "PaymentReceived";
            break;
          default:
            notificationMessage = `Payment status updated to ${args.status} for ₱${payment.netAmount}`;
        }

        await ctx.db.insert("notifications", {
          userId: user._id,
          formsId: payment.formId,
          type: notificationType,
          message: notificationMessage,
          read: false,
        });
      }

      return args.paymentId;
    } catch (error) {
      console.error("Error updating payment status:", error);
      throw new Error(error instanceof Error ? error.message : "Failed to update payment status. Please try again.");
    }
  },
});

// Log payment submission attempt
export const logPaymentAttempt = mutation({
  args: {
    formId: v.id("forms"),
    method: v.union(
      v.literal("Gcash"),
      v.literal("Maya"),
      v.literal("BaranggayHall"),
      v.literal("CityHall")
    ),
    amount: v.number(),
    referenceNumber: v.string(),
    success: v.boolean(),
    errorMessage: v.optional(v.string()),
    deviceInfo: v.optional(v.object({
      platform: v.string(),
      deviceId: v.string(),
      appVersion: v.string(),
    })),
  },
  handler: async (ctx, args) => {
    try {
      // This could be stored in a separate payment_logs table in a real app
      console.log("Payment attempt logged:", {
        formId: args.formId,
        method: args.method,
        amount: args.amount,
        referenceNumber: args.referenceNumber,
        success: args.success,
        errorMessage: args.errorMessage,
        timestamp: Date.now(),
        deviceInfo: args.deviceInfo,
      });

      // If successful, create the actual payment record
      if (args.success) {
        const form = await ctx.db.get(args.formId);
        if (form) {
          const user = await ctx.db.get(form.userId);
          if (user) {
            await ctx.db.insert("notifications", {
              userId: user._id,
              formsId: args.formId,
              type: "PaymentReceived",
              message: `Payment attempt successful! ₱${args.amount} via ${args.method}. Processing...`,
              read: false,
            });
          }
        }
      }

      return { success: true, timestamp: Date.now() };
    } catch (error) {
      console.error("Error logging payment attempt:", error);
      return { success: false, error: "Failed to log payment attempt" };
    }
  },
});

// Retry payment submission
export const retryPayment = mutation({
  args: {
    paymentId: v.id("payments"),
    newReferenceNumber: v.optional(v.string()),
    newReceiptId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    try {
      const payment = await ctx.db.get(args.paymentId);
      if (!payment) {
        throw new Error("Payment not found");
      }

      if (payment.status === "Complete") {
        throw new Error("Cannot retry a completed payment");
      }

      const updates: any = {
        status: "Pending" as const,
      };

      if (args.newReferenceNumber) {
        updates.referenceNumber = args.newReferenceNumber;
      }

      if (args.newReceiptId) {
        updates.receiptId = args.newReceiptId;
      }

      await ctx.db.patch(args.paymentId, updates);

      // Get form and user details for notification
      const form = await ctx.db.get(payment.formId);
      const user = form ? await ctx.db.get(form.userId) : null;

      if (user) {
        await ctx.db.insert("notifications", {
          userId: user._id,
          formsId: payment.formId,
          type: "PaymentReceived",
          message: `Payment retry submitted for ₱${payment.netAmount} via ${payment.method}. New reference: ${args.newReferenceNumber || payment.referenceNumber}`,
          read: false,
        });
      }

      return args.paymentId;
    } catch (error) {
      console.error("Error retrying payment:", error);
      throw new Error(error instanceof Error ? error.message : "Failed to retry payment. Please try again.");
    }
  },
});

export const getPaymentByFormId = query({
  args: { formId: v.id("forms") },
  handler: async (ctx, args) => {
    const payment = await ctx.db
      .query("payments")
      .withIndex("by_form", (q) => q.eq("formId", args.formId))
      .unique();
    
    return payment;
  },
});
