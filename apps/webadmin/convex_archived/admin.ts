import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { AdminRole } from "./users/roles"; // Assuming you have a function to check for admin role

// =================================================================
// == 1. GET ALL APPLICANTS (FOR ADMIN DASHBOARD) ==
// =================================================================
export const getAllApplicants = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Authentication failed.");

    // Ensure the user has admin privileges
    const adminCheck = await AdminRole(ctx);
    if (!adminCheck.isAdmin) {
      throw new Error("You do not have permission to view applicants.");
    }

    return await ctx.db.query("users")
      .withIndex("by_role", (q) => q.eq("role", "applicant"))
      .collect();
  },
});

// =================================================================
// == 2. UPDATE APPLICANT STATUS (FOR ADMIN ACTIONS) ==
// =================================================================
export const updateApplicantStatus = mutation({
  args: {
    userId: v.id("users"),
    status: v.union(
      v.literal("Pending"),
      v.literal("For Document Verification"),
      v.literal("For Payment Validation"),
      v.literal("For Orientation"),
      v.literal("Approved"),
      v.literal("Rejected"),
      v.literal("Cancelled")
    ),
    remarks: v.optional(v.string()),
  },
  handler: async (ctx, { userId, status, remarks }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Authentication failed.");

    // Ensure the user has admin privileges
    const adminCheck = await AdminRole(ctx);
    if (!adminCheck.isAdmin) {
      throw new Error("You do not have permission to update applicant status.");
    }

    const existingForm = await ctx.db.query("applications").withIndex("by_user", q => q.eq("userId", userId)).first();

    if (!existingForm) {
      throw new Error("Applicant application not found.");
    }

    await ctx.db.patch(existingForm._id, { applicationStatus: status, adminRemarks: remarks });

    // Optionally, create a notification for the applicant
    await ctx.db.insert("notifications", {
      userId,
      title: "Application Status Updated",
      message: `Your application status has been updated to: ${status}`,
      notificationType: "status_update",
      isRead: false,
    });

    return { success: true };
  },
});

// =================================================================
// == 3. VERIFY A DOCUMENT (FOR ADMIN ACTIONS) ==
// =================================================================
export const verifyDocument = mutation({
  args: {
    documentUploadId: v.id("documentUploads"),
    status: v.union(v.literal("Approved"), v.literal("Rejected")),
    remarks: v.optional(v.string()),
  },
  handler: async (ctx, { documentUploadId, status, remarks }) => {
    const adminCheck = await AdminRole(ctx);
    if (!adminCheck.isAdmin) {
      throw new Error("You do not have permission to verify documents.");
    }

    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Authentication failed.");

    const user = await ctx.db.query("users").withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject)).unique();
    if (!user) throw new Error("User not found.");

    await ctx.db.patch(documentUploadId, { reviewStatus: status, adminRemarks: remarks, reviewedAt: Date.now(), reviewedBy: user._id });
    return { success: true };
  },
});

// =================================================================
// == 4. SCHEDULE AN ORIENTATION (FOR ADMIN ACTIONS) ==
// =================================================================
export const scheduleOrientation = mutation({
  args: {
    applicationId: v.id("applications"),
    scheduleAt: v.float64(),
    venue: v.string(),
    inspectorId: v.id("users"),
  },
  handler: async (ctx, { applicationId, scheduleAt, venue, inspectorId }) => {
    const adminCheck = await AdminRole(ctx);
    if (!adminCheck.isAdmin) {
      throw new Error("You do not have permission to schedule orientations.");
    }

    await ctx.db.insert("orientations", {
      applicationId,
      scheduledAt: scheduleAt,
      //venue,
      //inspectorId,
      orientationStatus: "Scheduled",
      qrCodeUrl: "temp-qr-code", // Replace with actual QR code generation logic
    });

    return { success: true };
  },
});

// =================================================================
// == 5. TRACK ORIENTATION ATTENDANCE (FOR ADMIN ACTIONS) ==
// =================================================================
export const trackOrientationAttendance = mutation({
  args: {
    orientationId: v.id("orientations"),
    status: v.union(v.literal("Completed"), v.literal("Missed")),
  },
  handler: async (ctx, { orientationId, status }) => {
    const adminCheck = await AdminRole(ctx);
    if (!adminCheck.isAdmin) {
      throw new Error("You do not have permission to track attendance.");
    }

    await ctx.db.patch(orientationId, { orientationStatus: status });
    return { success: true };
  },
});

// =================================================================
// == 6. GET ALL INSPECTORS (FOR ADMIN DASHBOARD) ==
// =================================================================
export const getInspectors = query({
  args: {},
  handler: async (ctx) => {
    const adminCheck = await AdminRole(ctx);
    if (!adminCheck.isAdmin) {
      return [];
    }

    return await ctx.db.query("users")
      .withIndex("by_role", (q) => q.eq("role", "inspector"))
      .collect();
  },
});

// =================================================================
// == 7. GET ADMINS WITH MANAGED CATEGORIES ==
// =================================================================
export const getAdminsWithManagedCategories = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Authentication failed.");

    const adminCheck = await AdminRole(ctx);
    if (!adminCheck.isAdmin) {
      throw new Error("You do not have permission to view admins.");
    }

    const admins = await ctx.db
      .query("users")
      .withIndex("by_role", (q) => q.eq("role", "admin"))
      .collect();

    const adminsWithCategories = await Promise.all(
      admins.map(async (admin) => {
        if (admin.managedCategories) {
          const categories = await Promise.all(
            admin.managedCategories.map((categoryId) =>
              ctx.db.get(categoryId)
            )
          );
          return { ...admin, managedCategoriesData: categories };
        }
        return { ...admin, managedCategoriesData: [] };
      })
    );

    return adminsWithCategories;
  },
});

// =================================================================
// == 8. GET APPLICANTS BY MANAGED CATEGORIES ==
// =================================================================
export const getApplicantsByManagedCategories = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Authentication failed.");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user || user.role !== "admin" || !user.managedCategories) {
      // Return all applicants if the user is not an admin or has no managed categories
      return await ctx.db
        .query("applications")
        .order("desc")
        .collect();
    }

    const applications = await ctx.db
      .query("applications")
      .filter((q) =>
        q.or(
          ...user.managedCategories!.map((categoryId) =>
            q.eq(q.field("jobCategoryId"), categoryId)
          )
        )
      )
      .order("desc")},})
