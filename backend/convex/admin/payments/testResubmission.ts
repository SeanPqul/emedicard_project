// convex/admin/payments/testResubmission.ts
import { v } from "convex/values";
import { mutation } from "../../_generated/server";

/**
 * TEST ONLY: Simulate a payment resubmission to test notification logic
 * This bypasses auth and directly calls the createPayment logic
 */
export const testResubmission = mutation({
  args: {
    applicationId: v.id("applications"),
    amount: v.number(),
    serviceFee: v.number(),
    netAmount: v.number(),
    paymentMethod: v.union(
      v.literal("Maya"),
      v.literal("BaranggayHall"),
      v.literal("CityHall")
    ),
    referenceNumber: v.string(),
  },
  handler: async (ctx, args) => {
    console.log('🧪 TEST: Starting resubmission test');
    
    // Validate application exists
    const application = await ctx.db.get(args.applicationId);
    if (!application) {
      throw new Error("Application not found");
    }

    console.log('✅ Application found:', application._id);

    // Check if payment already exists for this application
    const existingPayment = await ctx.db
      .query("payments")
      .withIndex("by_application", (q) => q.eq("applicationId", args.applicationId))
      .unique();

    let isResubmission = false;
    let oldPaymentId = null;

    if (existingPayment) {
      console.log('🔍 Existing payment found:', {
        paymentId: existingPayment._id,
        status: existingPayment.paymentStatus,
        applicationId: args.applicationId
      });
      
      // Check if this is a resubmission (previous payment was rejected)
      if (existingPayment.paymentStatus === "Failed") {
        console.log('✅ Detected resubmission - old payment failed');
        isResubmission = true;
        oldPaymentId = existingPayment._id;
        // Delete or mark the old payment as replaced
        await ctx.db.delete(existingPayment._id);
      } else {
        throw new Error("Payment already exists for this application");
      }
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
      paymentStatus: "Pending",
    });

    console.log('💳 New payment created:', paymentId);

    // If this is a resubmission, mark the rejection as replaced and notify admins
    if (isResubmission && oldPaymentId) {
      console.log('🔄 Processing resubmission for payment:', oldPaymentId);
      
      const rejectionRecord = await ctx.db
        .query("paymentRejectionHistory")
        .withIndex("by_payment", (q) => q.eq("paymentId", oldPaymentId))
        .order("desc")
        .first();

      console.log('📋 Rejection record found:', rejectionRecord?._id);

      if (rejectionRecord) {
        await ctx.db.patch(rejectionRecord._id, {
          wasReplaced: true,
          replacementPaymentId: paymentId,
          replacedAt: Date.now(),
        });
        console.log('✅ Marked rejection as replaced');
      }

      // Notify all relevant admins about the resubmission
      const allAdmins = await ctx.db
        .query("users")
        .withIndex("by_role", (q) => q.eq("role", "admin"))
        .collect();
      
      console.log('👥 Total admins found:', allAdmins.length);
      
      // Filter admins who manage this category or super admins
      const relevantAdmins = allAdmins.filter(admin => 
        !admin.managedCategories || 
        admin.managedCategories.length === 0 || 
        admin.managedCategories.includes(application.jobCategoryId)
      );

      console.log('🎯 Relevant admins for jobCategory', application.jobCategoryId, ':', relevantAdmins.length);

      // Get user name for notification
      const user = await ctx.db.get(application.userId);
      const userName = user?.fullname || "Applicant";
      
      // Notify each relevant admin
      for (const admin of relevantAdmins) {
        console.log('📧 Creating notification for admin:', admin.fullname);
        await ctx.db.insert("notifications", {
          userId: admin._id,
          applicationId: args.applicationId,
          title: "Payment Resubmitted",
          message: `${userName} has resubmitted payment for their application after rejection. Please review the new payment submission.`,
          notificationType: "payment_resubmitted",
          isRead: false,
          jobCategoryId: application.jobCategoryId,
          actionUrl: `/dashboard/${args.applicationId}/payment_validation`,
        });
      }
      
      console.log('✅ Created', relevantAdmins.length, 'notifications for resubmission');

      // Update application status to "For Payment Validation"
      await ctx.db.patch(args.applicationId, {
        applicationStatus: "For Payment Validation",
        updatedAt: Date.now(),
      });
      
      console.log('✅ Updated application status to For Payment Validation');
    }

    return { 
      success: true, 
      paymentId,
      isResubmission,
      message: isResubmission ? 'Resubmission processed and admins notified' : 'First payment created'
    };
  },
});
