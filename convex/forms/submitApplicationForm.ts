import { query, mutation } from "../_generated/server";
import { v } from "convex/values";

export const submitApplicationForm = mutation({
  args: {
    formId: v.id("forms"),
    paymentMethod: v.union(
      v.literal("Gcash"),
      v.literal("Maya"),
      v.literal("BaranggayHall"),
      v.literal("CityHall")
    ),
    paymentReferenceNumber: v.string(),
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

    // Validate form exists and belongs to user
    const form = await ctx.db.get(args.formId);
    if (!form) {
      throw new Error("Form not found");
    }

    if (form.userId !== user._id) {
      throw new Error("Not authorized to submit this form");
    }

    // Check if form is already submitted
    if (form.status === "Submitted" || form.status === "Under Review" || form.status === "Approved") {
      throw new Error("Application has already been submitted");
    }

    // Get job category
    const jobCategory = await ctx.db.get(form.jobCategory);
    if (!jobCategory) {
      throw new Error("Invalid job category");
    }

    // Get required document types for this job category using junction table
    const jobCategoryRequirements = await ctx.db
      .query("jobCategoryRequirements")
      .withIndex("by_category", (q) => q.eq("jobCategoryId", form.jobCategory))
      .filter((q) => q.eq(q.field("required"), true))
      .collect();

    // Get detailed document requirements from junction table
    const requiredDocuments = await Promise.all(
      jobCategoryRequirements.map(async (junctionRecord) => {
        const docRequirement = await ctx.db.get(junctionRecord.documentRequirementId);
        if (!docRequirement) {
          throw new Error(`Document requirement ${junctionRecord.documentRequirementId} not found`);
        }
        return {
          ...docRequirement,
          required: junctionRecord.required // Use required status from junction table
        };
      })
    );

    // Get uploaded documents for this form
    const uploadedDocuments = await ctx.db
      .query("formDocuments")
      .withIndex("by_form", (q) => q.eq("formId", args.formId))
      .collect();

    // Check if all required documents are uploaded
    for (const reqDoc of requiredDocuments) {
      const uploadedDoc = uploadedDocuments.find(d => d.documentRequirementId === reqDoc._id);
      if (!uploadedDoc) {
        throw new Error(`Missing required document: ${reqDoc.name}. Please upload all required documents.`);
      }
    }

    // Check if payment already exists
    const existingPayment = await ctx.db
      .query("payments")
      .withIndex("by_form", (q) => q.eq("formId", args.formId))
      .unique();

    if (existingPayment) {
      throw new Error("Payment already submitted for this form");
    }

    // Calculate payment amounts
    const baseAmount = 50; // Base application fee
    const serviceFee = 10; // Service fee
    const totalAmount = baseAmount + serviceFee;

    try {
      // Create payment record
      const paymentId = await ctx.db.insert("payments", {
        formId: args.formId,
        amount: baseAmount,
        serviceFee: serviceFee,
        netAmount: totalAmount,
        method: args.paymentMethod,
        referenceNumber: args.paymentReferenceNumber,
        receiptId: args.paymentReceiptId,
        status: "Pending",
        updatedAt: Date.now(),
      });

      // Update form status to Submitted
      await ctx.db.patch(args.formId, {
        status: "Submitted",
        updatedAt: Date.now(),
      });

      // Create notification for user
      await ctx.db.insert("notifications", {
        userId: user._id,
        formsId: args.formId,
        title: "Application Submitted",
        message: `Application submitted successfully! Payment of ₱${totalAmount} via ${args.paymentMethod} is being processed. Reference: ${args.paymentReferenceNumber}`,
        type: "PaymentReceived",
        read: false,
      });

      // If orientation is required, create orientation record
      if (jobCategory.requireOrientation) {
        const orientationSchedule = Date.now() + (7 * 24 * 60 * 60 * 1000); // 7 days from now
        const qrCode = `emedicard-orientation-${args.formId}-${Date.now()}`;
        
        await ctx.db.insert("orientations", {
          formId: args.formId,
          scheduleAt: orientationSchedule,
          qrCodeUrl: qrCode,
          status: "Scheduled",
        });

        // Add orientation notification
        await ctx.db.insert("notifications", {
          userId: user._id,
          formsId: args.formId,
          title: "Orientation Scheduled",
          message: `Food safety orientation scheduled for ${new Date(orientationSchedule).toLocaleDateString()}. You will receive more details soon.`,
          type: "OrientationScheduled",
          read: false,
        });
      }

      return {
        success: true,
        formId: args.formId,
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
