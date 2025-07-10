import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getUserPayments = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    const userForms = await ctx.db
      .query("forms")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

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

    return payments.filter(Boolean);
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

    return paymentId;
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
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.paymentId, { status: args.status });
    return args.paymentId;
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
