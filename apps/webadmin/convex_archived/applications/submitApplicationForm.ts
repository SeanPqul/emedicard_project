import { query, mutation } from "../_generated/server";
import { v } from "convex/values";
import { Doc } from "../_generated/dataModel";

export const submitApplicationFormMutation = mutation({
  args: {
    formId: v.id("applications"),
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
    const form = await ctx.db.get(args.formId) as Doc<"applications"> | null;
    if (!form) {
      throw new Error("Form not found");
    }

    if (form.userId !== user._id) {
      throw new Error("Not authorized to submit this form");
    }

    // Check if form is already submitted
    if (form.applicationStatus === "Submitted" || form.applicationStatus === "Under Review" || form.applicationStatus === "Approved") {
      throw new Error("Application has already been submitted");
    }

    // Get job category
    const jobCategory = await ctx.db.get(form.jobCategoryId) as Doc<"jobCategories"> | null;
    if (!jobCategory) {
      throw new Error("Invalid job category");
    }

    // Get required document types for this job category using junction table
    const jobCategoryRequirements = await ctx.db
      .query("jobCategoryDocuments")
      .withIndex("by_job_category", (q) => q.eq("jobCategoryId", form.jobCategoryId))
      .filter((q) => q.eq(q.field("isRequired"), true))
      .collect();

    // Get detailed document requirements from junction table
    const requiredDocuments = await Promise.all(
      jobCategoryRequirements.map(async (junctionRecord) => {
        const docRequirement = await ctx.db.get(junctionRecord.documentTypeId) as Doc<"documentTypes"> | null;
        if (!docRequirement) {
          throw new Error(`Document requirement ${junctionRecord.documentTypeId} not found`);
        }
        return {
          ...docRequirement,
          isRequired: junctionRecord.isRequired // Use required status from junction table
        };
      })
    );

    // Get uploaded documents for this form
    const uploadedDocuments = await ctx.db
      .query("documentUploads")
      .withIndex("by_application", (q) => q.eq("applicationId", args.formId))
      .collect();

    // Check if all required documents are uploaded
    for (const reqDoc of requiredDocuments) {
      const uploadedDoc = uploadedDocuments.find(d => d.documentTypeId === reqDoc._id);
      if (!uploadedDoc) {
        throw new Error(`Missing required document: ${reqDoc.name}. Please upload all required documents.`);
      }
    }

    // Check if payment already exists
    const existingPayment = await ctx.db
      .query("payments")
      .withIndex("by_application", (q) => q.eq("applicationId", args.formId))
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
        applicationId: args.formId,
        amount: baseAmount,
        serviceFee: serviceFee,
        netAmount: totalAmount,
        paymentMethod: args.paymentMethod,
        referenceNumber: args.paymentReferenceNumber,
        receiptStorageId: args.paymentReceiptId,
        paymentStatus: "Pending",
        updatedAt: Date.now(),
      });

      // Update form status to Submitted
      await ctx.db.patch(args.formId, {
        applicationStatus: "Submitted",
        updatedAt: Date.now(),
      });

      // Create notification for user
      await ctx.db.insert("notifications", {
        userId: user._id,
        applicationId: args.formId,
        title: "Application Submitted",
        message: `Application submitted successfully! Payment of ₱${totalAmount} via ${args.paymentMethod} is being processed. Reference: ${args.paymentReferenceNumber}`,
        notificationType: "PaymentReceived",
        isRead: false,
      });

      // If orientation is required, create orientation record
      if (jobCategory.requireOrientation) {
        const orientationSchedule = Date.now() + (7 * 24 * 60 * 60 * 1000); // 7 days from now
        const qrCode = `emedicard-orientation-${args.formId}-${Date.now()}`;
        
        await ctx.db.insert("orientations", {
          applicationId: args.formId,
          scheduledAt: orientationSchedule,
          qrCodeUrl: qrCode,
          orientationStatus: "Scheduled",
        });

        // Add orientation notification
        await ctx.db.insert("notifications", {
          userId: user._id,
          applicationId: args.formId,
          title: "Orientation Scheduled",
          message: `Food safety orientation scheduled for ${new Date(orientationSchedule).toLocaleDateString()}. You will receive more details soon.`,
          notificationType: "OrientationScheduled",
          isRead: false,
        });
      }

      return {
        success: true,
        formId: args.formId, // This is still formId in the return object, which is fine as it's a local variable.
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
