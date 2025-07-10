// File: convex/forms.ts
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
      throw new Error("User not found");
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
      throw new Error("User not found");
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

// File: convex/payments.ts
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

// File: convex/notifications.ts
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getUserNotifications = query({
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

    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();

    return notifications;
  },
});

export const markNotificationAsRead = mutation({
  args: {
    notificationId: v.id("notifications"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.notificationId, { read: true });
  },
});

export const createNotification = mutation({
  args: {
    userId: v.id("users"),
    formsId: v.optional(v.id("forms")),
    type: v.union(
      v.literal("MissingDoc"),
      v.literal("PaymentReceived"),
      v.literal("FormApproved"),
      v.literal("OrientationScheduled"),
      v.literal("CardIssue")
    ),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    const notificationId = await ctx.db.insert("notifications", {
      userId: args.userId,
      formsId: args.formsId,
      type: args.type,
      messag: args.message, // Note: typo in schema
      read: false,
    });

    return notificationId;
  },
});

// File: convex/healthCards.ts
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getUserHealthCards = query({
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

    const healthCards = await Promise.all(
      formIds.map(async (formId) => {
        const card = await ctx.db
          .query("healthCards")
          .withIndex("by_form", (q) => q.eq("formId", formId))
          .unique();
        return card;
      })
    );

    const cardsWithDetails = await Promise.all(
      healthCards.filter(Boolean).map(async (card) => {
        const form = await ctx.db.get(card!.formId);
        const jobCategory = form ? await ctx.db.get(form.jobCategory) : null;
        return {
          ...card,
          form,
          jobCategory,
        };
      })
    );

    return cardsWithDetails;
  },
});

export const issueHealthCard = mutation({
  args: {
    formId: v.id("forms"),
    cardUrl: v.string(),
    issuedAt: v.number(),
    expiresAt: v.number(),
    verificationToken: v.string(),
  },
  handler: async (ctx, args) => {
    const healthCardId = await ctx.db.insert("healthCards", {
      formId: args.formId,
      cardUrl: args.cardUrl,
      issuedAt: args.issuedAt,
      expiresAt: args.expiresAt,
      verificationToken: args.verificationToken,
    });

    return healthCardId;
  },
});

// File: convex/jobCategories.ts
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getAllJobCategories = query({
  args: {},
  handler: async (ctx) => {
    const categories = await ctx.db.query("jobCategory").collect();
    return categories;
  },
});

export const createJobCategory = mutation({
  args: {
    name: v.string(),
    colorCode: v.string(),
    requireOrientation: v.string(),
  },
  handler: async (ctx, args) => {
    const categoryId = await ctx.db.insert("jobCategory", {
      name: args.name,
      colorCode: args.colorCode,
      requireOrientation: args.requireOrientation,
    });

    return categoryId;
  },
});

// File: convex/requirements.ts
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getFormRequirements = query({
  args: { formId: v.id("forms") },
  handler: async (ctx, args) => {
    const requirements = await ctx.db
      .query("requirements")
      .withIndex("by_form", (q) => q.eq("formId", args.formId))
      .unique();

    return requirements;
  },
});

export const getRequirementsByJobCategory = query({
  args: { jobCategoryId: v.id("jobCategory") },
  handler: async (ctx, args) => {
    const jobCategory = await ctx.db.get(args.jobCategoryId);
    if (!jobCategory) {
      throw new Error("Job category not found");
    }

    // Base requirements for all health cards
    const baseRequirements = [
      {
        name: "Valid ID",
        description: "Government-issued ID (Driver's License, National ID, Passport, etc.)",
        icon: "card-outline",
        required: true,
        fieldName: "validId"
      },
      {
        name: "2x2 Picture",
        description: "Recent colored photo with white background",
        icon: "camera-outline",
        required: true,
        fieldName: "picture"
      },
      {
        name: "Chest X-ray",
        description: "Recent chest X-ray result (within 6 months)",
        icon: "medical-outline",
        required: true,
        fieldName: "chestXrayId"
      },
      {
        name: "Urinalysis",
        description: "Complete urinalysis test result",
        icon: "flask-outline",
        required: true,
        fieldName: "urinalysisId"
      },
      {
        name: "Stool Examination",
        description: "Stool examination test result",
        icon: "medical-outline",
        required: true,
        fieldName: "stoolId"
      },
      {
        name: "Cedula",
        description: "Community Tax Certificate (Cedula)",
        icon: "document-text-outline",
        required: true,
        fieldName: "cedulaId"
      }
    ];

    let additionalRequirements = [];

    // Add job-category specific requirements
    if (jobCategory.name.toLowerCase().includes("security") || jobCategory.name.toLowerCase().includes("guard")) {
      additionalRequirements.push(
        {
          name: "Neuropsychiatric Examination",
          description: "Neuropsychiatric evaluation result (for Security Guards only)",
          icon: "medical-outline",
          required: true,
          fieldName: "neuroExamId"
        },
        {
          name: "Drug Test",
          description: "Drug test result (for Security Guards only)",
          icon: "medical-outline",
          required: true,
          fieldName: "drugTestId"
        }
      );
    }

    // Add Hepatitis B for Pink health cards
    if (jobCategory.colorCode.toLowerCase() === "#ffc0cb" || jobCategory.name.toLowerCase().includes("pink")) {
      additionalRequirements.push({
        name: "Hepatitis B Test",
        description: "Hepatitis B surface antigen test result (for Pink health cards only)",
        icon: "medical-outline",
        required: true,
        fieldName: "hepatitisBId"
      });
    }

    return {
      jobCategory,
      requirements: [...baseRequirements, ...additionalRequirements],
      totalRequirements: baseRequirements.length + additionalRequirements.length
    };
  },
});

export const uploadRequirements = mutation({
  args: {
    formId: v.id("forms"),
    validId: v.id("_storage"),
    picture: v.id("_storage"),
    chestXrayId: v.id("_storage"),
    urinalysisId: v.id("_storage"),
    stoolId: v.id("_storage"),
    cedulaId: v.id("_storage"),
    neuroExamId: v.optional(v.id("_storage")),
    drugTestId: v.optional(v.id("_storage")),
    hepatitisBId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const requirementId = await ctx.db.insert("requirements", {
      formId: args.formId,
      validId: args.validId,
      picture: args.picture,
      chestXrayId: args.chestXrayId,
      urinalysisId: args.urinalysisId,
      stoolId: args.stoolId,
      cedulaId: args.cedulaId,
      neuroExamId: args.neuroExamId,
      drugTestId: args.drugTestId,
      hepatitisBId: args.hepatitisBId,
    });

    return requirementId;
  },
});

// File: convex/orientations.ts
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getUserOrientations = query({
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

    const orientations = await Promise.all(
      formIds.map(async (formId) => {
        const orientation = await ctx.db
          .query("orientations")
          .withIndex("by_form", (q) => q.eq("formId", formId))
          .unique();
        return orientation;
      })
    );

    return orientations.filter(Boolean);
  },
});

export const scheduleOrientation = mutation({
  args: {
    formId: v.id("forms"),
    scheduleAt: v.number(),
    qrCodeUrl: v.string(),
  },
  handler: async (ctx, args) => {
    const orientationId = await ctx.db.insert("orientations", {
      formId: args.formId,
      scheudleAt: args.scheduleAt, // Note: typo in schema
      qrCodeUrl: args.qrCodeUrl,
      checkInTime: 0,
      checkOutTime: 0,
    });

    return orientationId;
  },
});

// File: convex/verificationLogs.ts
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const logVerification = mutation({
  args: {
    healthCardId: v.id("healthCards"),
    userAgent: v.optional(v.string()),
    ipAddress: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const logId = await ctx.db.insert("verificationLogs", {
      healthCardId: args.healthCardId,
      scannedAt: Date.now(),
      userAgent: args.userAgent,
      ipAddress: args.ipAddress,
    });

    return logId;
  },
});

export const getVerificationLogs = query({
  args: { healthCardId: v.id("healthCards") },
  handler: async (ctx, args) => {
    const logs = await ctx.db
      .query("verificationLogs")
      .withIndex("by_healthcard", (q) => q.eq("healthCardId", args.healthCardId))
      .order("desc")
      .collect();

    return logs;
  },
});

// File: convex/dashboard.ts
import { query } from "./_generated/server";

export const getDashboardStats = query({
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

    // Get user's forms
    const userForms = await ctx.db
      .query("forms")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    const formIds = userForms.map((form) => form._id);

    // Get applications
    const applications = await Promise.all(
      formIds.map(async (formId) => {
        const app = await ctx.db
          .query("applicationForms")
          .withIndex("by_form", (q) => q.eq("formId", formId))
          .unique();
        return app;
      })
    );

    // Get payments
    const payments = await Promise.all(
      formIds.map(async (formId) => {
        const payment = await ctx.db
          .query("payments")
          .withIndex("by_form", (q) => q.eq("formId", formId))
          .unique();
        return payment;
      })
    );

    // Get health cards
    const healthCards = await Promise.all(
      formIds.map(async (formId) => {
        const card = await ctx.db
          .query("healthCards")
          .withIndex("by_form", (q) => q.eq("formId", formId))
          .unique();
        return card;
      })
    );

    // Get orientations
    const orientations = await Promise.all(
      formIds.map(async (formId) => {
        const orientation = await ctx.db
          .query("orientations")
          .withIndex("by_form", (q) => q.eq("formId", formId))
          .unique();
        return orientation;
      })
    );

    // Calculate stats
    const activeApplications = applications.filter(app => 
      app && (app.status === 'Submitted' || app.status === 'Under Review')
    ).length;

    const pendingPayments = payments.filter(payment => 
      payment && payment.status === 'Pending'
    ).length;

    const pendingAmount = payments
      .filter(payment => payment && payment.status === 'Pending')
      .reduce((sum, payment) => sum + (payment?.netAmount || 0), 0);

    const validHealthCards = healthCards.filter(card => 
      card && card.expiresAt > Date.now()
    ).length;

    const upcomingOrientations = orientations.filter(orientation => 
      orientation && orientation.scheudleAt > Date.now()
    ).length;

    return {
      activeApplications,
      pendingPayments,
      pendingAmount,
      validHealthCards,
      upcomingOrientations,
      totalApplications: applications.filter(Boolean).length,
      totalPayments: payments.filter(Boolean).length,
      totalHealthCards: healthCards.filter(Boolean).length,
    };
  },
});
