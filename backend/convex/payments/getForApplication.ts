// convex/payments/getForApplication.ts
import { query } from "../_generated/server";
import { v } from "convex/values";

export const get = query({
  args: { applicationId: v.id("applications") },
  handler: async (ctx, args) => {
    // 1. Find the payment record for this application
    const payment = await ctx.db
      .query("payments")
      .withIndex("by_application", q => q.eq("applicationId", args.applicationId))
      .first();
      
    if (!payment) return null;

    // 2. Get the application to find the user and submission date
    const application = await ctx.db.get(args.applicationId);
    if (!application) return null;

    // 3. Get the user to find their name
    const user = await ctx.db.get(application.userId);
    if (!user) return null;

    // 4. Get the URL for the receipt image if it exists
    let receiptUrl = null;
    if (payment.receiptStorageId) {
      receiptUrl = await ctx.storage.getUrl(payment.receiptStorageId);
    }

    // 5. Return everything in one neat package
    return {
      paymentId: payment._id,
      applicantName: user.fullname,
      submissionDate: application._creationTime,
      paymentMethod: payment.paymentMethod,
      paymentStatus: payment.paymentStatus,
      receiptUrl: receiptUrl,
    };
  },
});
