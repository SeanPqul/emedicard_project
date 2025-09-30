import { query, mutation } from "../_generated/server";
import { v } from "convex/values";

export const submitApplicationMutation = mutation({
  args: {
    applicationId: v.id("applications"),
    paymentMethod: v.optional(v.union(
      v.literal("Gcash"),
      v.literal("Maya"),
      v.literal("BaranggayHall"),
      v.literal("CityHall")
    )),
    paymentReferenceNumber: v.optional(v.string()),
    paymentReceiptId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Get user
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    // Validate application exists and belongs to user
    const application = await ctx.db.get(args.applicationId);
    if (!application) {
      throw new Error("Application not found");
    }

    if (application.userId !== user._id) {
      throw new Error("Not authorized to submit this application");
    }

    // Check if application is already submitted
    if (application.applicationStatus === "Submitted" || application.applicationStatus === "Under Review" || application.applicationStatus === "Approved") {
      throw new Error("Application has already been submitted");
    }
    
    // Also check for payment to prevent duplicate submissions
    if (application.applicationStatus !== "Draft") {
      throw new Error("Application is not in a valid state for submission");
    }

    // Get job category
    const jobCategory = await ctx.db.get(application.jobCategoryId);
    if (!jobCategory) {
      throw new Error("Invalid job category");
    }

    // Get required document types for this job category using junction table
    const jobCategoryRequirements = await ctx.db
      .query("jobCategoryDocuments")
      .withIndex("by_job_category", (q) => q.eq("jobCategoryId", application.jobCategoryId))
      .filter((q) => q.eq(q.field("isRequired"), true))
      .collect();

    // Get detailed document requirements from junction table
    const requiredDocuments = await Promise.all(
      jobCategoryRequirements.map(async (junctionRecord) => {
        const docRequirement = await ctx.db.get(junctionRecord.documentTypeId);
        if (!docRequirement) {
          throw new Error(`Document requirement ${junctionRecord.documentTypeId} not found`);
        }
        return {
          ...docRequirement,
          required: junctionRecord.isRequired // Use required status from junction table
        };
      })
    );

    // Get uploaded documents for this application
    const uploadedDocuments = await ctx.db
      .query("documentUploads")
      .withIndex("by_application", (q) => q.eq("applicationId", args.applicationId))
      .collect();

    // Check if all required documents are uploaded
    for (const reqDoc of requiredDocuments) {
      const uploadedDoc = uploadedDocuments.find(d => d.documentTypeId === reqDoc._id);
      if (!uploadedDoc) {
        throw new Error(`Missing required document: ${reqDoc.name}. Please upload all required documents.`);
      }
    }

    // NEW FLOW: Check if this is a submit-without-payment flow
    const isPaymentDeferred = !args.paymentMethod && !args.paymentReferenceNumber;

    // Check if payment already exists
    const existingPayment = await ctx.db
      .query("payments")
      .withIndex("by_application", (q) => q.eq("applicationId", args.applicationId))
      .unique();

    if (existingPayment && !isPaymentDeferred) {
      throw new Error("Payment already submitted for this application");
    }

    // Calculate payment amounts
    const baseAmount = 50; // Base application fee
    const serviceFee = 10; // Service fee
    const totalAmount = baseAmount + serviceFee;

    try {
      let paymentId = null;
      
      if (!isPaymentDeferred) {
        // OLD FLOW: Create payment record when payment is provided
        paymentId = await ctx.db.insert("payments", {
          applicationId: args.applicationId,
          amount: baseAmount,
          serviceFee: serviceFee,
          netAmount: totalAmount,
          paymentMethod: args.paymentMethod!,
          referenceNumber: args.paymentReferenceNumber!,
          receiptStorageId: args.paymentReceiptId,
          paymentStatus: "Pending",
          updatedAt: Date.now(),
        });
      }

      // Update application status based on payment flow
      if (isPaymentDeferred) {
        // NEW FLOW: Set status to "Pending Payment" and set payment deadline
        const paymentDeadline = Date.now() + (7 * 24 * 60 * 60 * 1000); // 7 days from now
        await ctx.db.patch(args.applicationId, {
          applicationStatus: "Pending Payment",
          paymentDeadline: paymentDeadline,
          updatedAt: Date.now(),
        });
      } else {
        // OLD FLOW: Set status to "Submitted" when payment is provided
        await ctx.db.patch(args.applicationId, {
          applicationStatus: "Submitted",
          updatedAt: Date.now(),
        });
      }

      // Create notification for user
      if (isPaymentDeferred) {
        // NEW FLOW: Notification for pending payment
        await ctx.db.insert("notifications", {
          userId: user._id,
          applicationId: args.applicationId,
          title: "Application Submitted - Payment Required",
          message: `Your application has been submitted successfully! Please complete the payment of ₱${totalAmount} within 7 days to proceed with processing.`,
          notificationType: "Payment",
          isRead: false,
        });
      } else {
        // OLD FLOW: Notification for submitted with payment
        await ctx.db.insert("notifications", {
          userId: user._id,
          applicationId: args.applicationId,
          title: "Application Submitted",
          message: `Application submitted successfully! Payment of ₱${totalAmount} via ${args.paymentMethod} is being processed. Reference: ${args.paymentReferenceNumber}`,
          notificationType: "PaymentReceived",
          isRead: false,
        });
      }



      return {
        success: true,
        applicationId: args.applicationId,
        paymentId,
        message: "Application submitted successfully! You will receive notifications about the processing status.",
        requiresOrientation: jobCategory.requireOrientation,
        totalAmount,
        paymentMethod: args.paymentMethod,
        referenceNumber: args.paymentReferenceNumber,
      };

    } catch (error) {
      console.error("Error submitting application:", error);
      throw new Error(error instanceof Error ? error.message : "Failed to submit application. Please try again.");
    }
  },
});
