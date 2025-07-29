import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getUserApplications = query({
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
      // Return empty array if user doesn't exist in database yet
      return [];
    }

    // Get forms directly instead of through applicationForms
    const forms = await ctx.db
      .query("forms")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    const formsWithDetails = await Promise.all(
      forms.map(async (form) => {
        const jobCategory = await ctx.db.get(form.jobCategory);
        
        // Get document count for this form
        const documents = await ctx.db
          .query("formDocuments")
          .withIndex("by_form", (q) => q.eq("formId", form._id))
          .collect();
        
        return {
          ...form,
          jobCategory,
          documentCount: documents.length,
          submittedAt: form.status !== "Submitted" ? undefined : form.updatedAt || form._creationTime,
        };
      })
    );

    return formsWithDetails;
  },
});

export const createForm = mutation({
  args: {
    applicationType: v.union(v.literal("New"), v.literal("Renew")),
    jobCategory: v.id("jobCategory"),
    position: v.string(),
    organization: v.string(),
    civilStatus: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      throw new Error("User not found. Please make sure your profile is set up.");
    }

    const formId = await ctx.db.insert("forms", {
      userId: user._id,
      applicationType: args.applicationType,
      jobCategory: args.jobCategory,
      position: args.position,
      organization: args.organization,
      civilStatus: args.civilStatus,
      status: "Submitted",
    });

    return formId;
  },
});

export const getFormById = query({
  args: { formId: v.id("forms") },
  handler: async (ctx, args) => {
    const form = await ctx.db.get(args.formId);
    if (!form) {
      throw new Error("Form not found");
    }
    
    const jobCategory = await ctx.db.get(form.jobCategory);
    return {
      ...form,
      jobCategory,
    };
  },
});

export const updateForm = mutation({
  args: {
    formId: v.id("forms"),
    applicationType: v.optional(v.union(v.literal("New"), v.literal("Renew"))),
    jobCategory: v.optional(v.id("jobCategory")),
    position: v.optional(v.string()),
    organization: v.optional(v.string()),
    civilStatus: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { formId, ...updates } = args;
    
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const form = await ctx.db.get(formId);
    if (!form) {
      throw new Error("Form not found");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user || form.userId !== user._id) {
      throw new Error("Not authorized to update this form");
    }

    await ctx.db.patch(formId, updates);
    return formId;
  },
});

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

    // Get required document types for this job category
    const requiredDocuments = await ctx.db
      .query("documentRequirements")
      .withIndex("by_job_category", (q) => q.eq("jobCategoryId", form.jobCategory))
      .filter((q) => q.eq(q.field("required"), true))
      .collect();

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
