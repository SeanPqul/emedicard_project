import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { AdminRole } from "../users/roles";
import { Id } from "../_generated/dataModel";
import { areAllDocumentsVerified } from "../lib/documentStatus";
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
// == 2. GET APPLICANT DETAILS (FOR ORIENTATION SCHEDULER) ==
// =================================================================
export const getApplicantDetails = query({
  args: { applicationId: v.id("applications") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Authentication failed.");

    // Ensure the user has admin privileges
    const adminCheck = await AdminRole(ctx);
    if (!adminCheck.isAdmin) {
      throw new Error("You do not have permission to view applicant details.");
    }

    const application = await ctx.db.get(args.applicationId);
    if (!application) {
      throw new Error("Application not found.");
    }

    const applicant = await ctx.db.get(application.userId);
    if (!applicant) {
      throw new Error("Applicant user not found.");
    }

    const jobCategory = await ctx.db.get(application.jobCategoryId);
    if (!jobCategory) {
      throw new Error("Job category not found.");
    }

    return {
      ...applicant,
      applicationStatus: application.applicationStatus,
      jobCategory: {
        _id: jobCategory._id,
        name: jobCategory.name,
        colorCode: jobCategory.colorCode,
      },
    };
  },
});

// =================================================================
// == 2. UPDATE APPLICANT STATUS (FOR ADMIN ACTIONS) ==
// =================================================================
export const updateApplicantStatus = mutation({
  args: {
    userId: v.id("users"),
    status: v.union(
      v.literal("Submitted"),
      v.literal("For Orientation"),
      v.literal("For Document Verification"),
      v.literal("Payment Validation"),
      v.literal("Scheduled"),
      v.literal("Attendance Validation"),
      v.literal("Under Review"),
      v.literal("Approved"),
      v.literal("Rejected"),
      v.literal("Expired")
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

    const adminUser = await ctx.db.query("users").withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject)).unique();
    if (!adminUser) throw new Error("Admin user not found.");

    const applicant = await ctx.db.get(userId);
    if (!applicant) throw new Error("Applicant not found.");

    await ctx.db.patch(existingForm._id, {
      applicationStatus: status,
      adminRemarks: remarks,
      updatedAt: Date.now(), // Update the timestamp
      lastUpdatedBy: adminUser._id, // Record the admin who made the update
    });

    // Log admin activity for application status update
    await ctx.db.insert("adminActivityLogs", {
      adminId: adminUser._id,
      activityType: "application_status_update",
      details: `Updated application for ${applicant.fullname} to ${status}. ${remarks ? `Remarks: ${remarks}` : ""}`,
      timestamp: Date.now(),
      applicationId: existingForm._id,
      jobCategoryId: existingForm.jobCategoryId, // Ensure jobCategoryId is always included
    });

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

    const adminUser = await ctx.db.query("users").withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject)).unique();
    if (!adminUser) throw new Error("Admin user not found.");

    const documentUpload = await ctx.db.get(documentUploadId);
    if (!documentUpload) throw new Error("Document upload not found.");

    const application = await ctx.db.get(documentUpload.applicationId);
    if (!application) throw new Error("Application not found.");

    const applicant = await ctx.db.get(application.userId);
    if (!applicant) throw new Error("Applicant not found.");

    const documentType = await ctx.db.get(documentUpload.documentTypeId);
    const docName = documentType?.name || "a document";

    await ctx.db.patch(documentUploadId, { reviewStatus: status, adminRemarks: remarks, reviewedAt: Date.now(), reviewedBy: adminUser._id });

    // Check if all documents are now verified (accepts both "Verified" and "Approved")
    const allDocuments = await ctx.db
      .query("documentUploads")
      .withIndex("by_application", (q) => q.eq("applicationId", application._id))
      .collect();
    
    const allVerified = areAllDocumentsVerified(allDocuments);
    
    // If all documents are verified, update application status appropriately
    // This handles cases where status is "For Document Verification" OR parallel document verification during "Scheduled"
    const statusesThatNeedUpdate = ["For Document Verification", "Scheduled", "For Orientation", "Documents Need Revision"];
    if (allVerified && statusesThatNeedUpdate.includes(application.applicationStatus)) {
      // Check if orientation is required and pending
      const jobCategory = await ctx.db.get(application.jobCategoryId);
      const requiresOrientation = jobCategory?.requireOrientation === "Yes" || jobCategory?.requireOrientation === true;
      
      let newStatus = application.applicationStatus;
      let shouldUpdate = false;
      
      // Determine the next appropriate status
      if (application.applicationStatus === "For Document Verification" || application.applicationStatus === "Documents Need Revision") {
        // Moving from document verification stage
        if (requiresOrientation && !application.orientationCompleted) {
          newStatus = "For Orientation";
        } else {
          newStatus = "Under Review";
        }
        shouldUpdate = true;
      } else if (application.applicationStatus === "Scheduled" && requiresOrientation && !application.orientationCompleted) {
        // Documents verified during orientation wait - stay as Scheduled but no status change needed
        // The dashboard will show docs as completed based on documentsVerified flag
        shouldUpdate = false;
      } else if (application.applicationStatus === "For Orientation" && (!requiresOrientation || application.orientationCompleted)) {
        // Orientation not needed or already done, move to review
        newStatus = "Under Review";
        shouldUpdate = true;
      }
      
      if (shouldUpdate && newStatus !== application.applicationStatus) {
        await ctx.db.patch(application._id, {
          applicationStatus: newStatus,
          updatedAt: Date.now(),
        });
        
        // Notify user that documents are verified
        await ctx.db.insert("notifications", {
          userId: application.userId,
          title: "Documents Verified",
          message: "All your documents have been verified and approved!",
          notificationType: "status_update",
          isRead: false,
        });
      }
    }

    // Log admin activity
    await ctx.db.insert("adminActivityLogs", {
      adminId: adminUser._id,
      activityType: "document_verification",
      details: `${status.toLowerCase()} document '${docName}' for ${applicant.fullname}. ${remarks ? `Remarks: ${remarks}` : ""}`,
      timestamp: Date.now(),
      documentUploadId: documentUploadId,
      applicationId: application._id, // Ensure applicationId is always included
      jobCategoryId: application.jobCategoryId, // Ensure jobCategoryId is always included
    });

    return { success: true };
  },
});

// =================================================================
// == 4. TRACK ORIENTATION ATTENDANCE (FOR ADMIN ACTIONS) ==
// =================================================================
// UPDATED: Uses orientationBookings table
export const trackOrientationAttendance = mutation({
  args: {
    bookingId: v.id("orientationBookings"),
    status: v.union(v.literal("completed"), v.literal("missed")),
  },
  handler: async (ctx, { bookingId, status }) => {
    const adminCheck = await AdminRole(ctx);
    if (!adminCheck.isAdmin) {
      throw new Error("You do not have permission to track attendance.");
    }

    await ctx.db.patch(bookingId, { status });
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
      .order("desc")
      .collect();

    return applications;
  },
});
