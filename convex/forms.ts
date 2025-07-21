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

    const applications = await ctx.db
      .query("applicationForms")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    const applicationDetails = await Promise.all(
      applications.map(async (app) => {
        const form = await ctx.db.get(app.formId);
        const jobCategory = form ? await ctx.db.get(form.jobCategory) : null;
        return {
          ...app,
          form,
          jobCategory,
        };
      })
    );

    return applicationDetails;
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

    // Check if application already exists
    const existingApplication = await ctx.db
      .query("applicationForms")
      .withIndex("by_form", (q) => q.eq("formId", args.formId))
      .unique();

    if (existingApplication) {
      throw new Error("Application has already been submitted");
    }

    // Validate that all required documents are uploaded
    const requirements = await ctx.db
      .query("requirements")
      .withIndex("by_form", (q) => q.eq("formId", args.formId))
      .unique();

    if (!requirements) {
      throw new Error("No documents uploaded. Please upload required documents first.");
    }

    // Check required fields based on job category
    const jobCategory = await ctx.db.get(form.jobCategory);
    if (!jobCategory) {
      throw new Error("Invalid job category");
    }

    // Validate required documents are present
    const requiredFields = ["validId", "picture", "chestXrayId", "urinalysisId", "stoolId", "cedulaId"];
    
    // Add specific requirements based on job category
    if (jobCategory.name.toLowerCase().includes("security") || jobCategory.name.toLowerCase().includes("guard")) {
      requiredFields.push("neuroExamId", "drugTestId");
    }
    
    if (jobCategory.colorCode.toLowerCase() === "#ffc0cb" || jobCategory.name.toLowerCase().includes("pink")) {
      requiredFields.push("hepatitisBId");
    }

    // Check all required fields are present
    for (const field of requiredFields) {
      if (!requirements[field as keyof typeof requirements]) {
        throw new Error(`Missing required document: ${field}. Please upload all required documents.`);
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
      });

      // Create application form record
      const applicationId = await ctx.db.insert("applicationForms", {
        userId: user._id,
        formId: args.formId,
        status: "Submitted",
        approvedAt: Date.now(),
      });

      // Create notification for user
      await ctx.db.insert("notifications", {
        userId: user._id,
        formsId: args.formId,
        type: "PaymentReceived",
        message: `Application submitted successfully! Payment of ₱${totalAmount} via ${args.paymentMethod} is being processed. Reference: ${args.paymentReferenceNumber}`,
        read: false,
      });

      // If orientation is required, create a placeholder orientation record
      if (jobCategory.requireOrientation === "yes") {
        const orientationSchedule = Date.now() + (7 * 24 * 60 * 60 * 1000); // 7 days from now
        const qrCode = `emedicard-orientation-${args.formId}-${Date.now()}`;
        
        await ctx.db.insert("orientations", {
          formId: args.formId,
          scheduleAt: orientationSchedule,
          qrCodeUrl: qrCode,
          checkInTime: 0,
          checkOutTime: 0,
        });

        // Add orientation notification
        await ctx.db.insert("notifications", {
          userId: user._id,
          formsId: args.formId,
          type: "OrientationScheduled",
          message: `Food safety orientation scheduled for ${new Date(orientationSchedule).toLocaleDateString()}. You will receive more details soon.`,
          read: false,
        });
      }

      return {
        success: true,
        applicationId,
        paymentId,
        message: "Application submitted successfully! You will receive notifications about the processing status.",
        requiresOrientation: jobCategory.requireOrientation === "yes",
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
