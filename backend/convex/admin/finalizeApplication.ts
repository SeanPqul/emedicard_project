// convex/admin/finalizeApplication.ts
import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { AdminRole } from "../users/roles";
import { internal } from "../_generated/api";

export const finalize = mutation({
  args: {
    applicationId: v.id("applications"),
    newStatus: v.union(v.literal("Approved"), v.literal("Rejected")),
  },
  handler: async (ctx, args) => {
    await AdminRole(ctx); // Security check

    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Authentication failed.");

    const adminUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!adminUser) throw new Error("Admin user not found.");

    // 1. Get all uploaded documents for this application to validate them.
    const uploadedDocs = await ctx.db
      .query("documentUploads")
      .withIndex("by_application", q => q.eq("applicationId", args.applicationId))
      .collect();

    // 1.1 Fetch the list of documents relevant for this job category
    const application = await ctx.db.get(args.applicationId);
    if (!application) throw new Error("Application not found.");

    const jobDocs = await ctx.db
      .query("jobCategoryDocuments")
      .withIndex("by_job_category", q => q.eq("jobCategoryId", application.jobCategoryId))
      .collect();

    // Load document type metadata to filter by fieldIdentifier when needed
    const docTypeMap = new Map<string, { fieldIdentifier?: string; name?: string }>();
    for (const jd of jobDocs) {
      const dt: any = await ctx.db.get(jd.documentTypeId as any);
      docTypeMap.set((jd.documentTypeId as any).toString(), { fieldIdentifier: dt?.fieldIdentifier, name: dt?.name });
    }

    // Determine which document types are actually required
    // - Only 'isRequired' docs are enforced
    // - For Non-Food (pink/non-food handling differs), exclude Drug Test / Neuro when securityGuard === false
    const jobCategory = await ctx.db.get(application.jobCategoryId);
    const catName = jobCategory?.name?.toLowerCase() || "";
    const isNonFood = catName.includes("non-food") || catName.includes("nonfood");

    const requiredDocs = jobDocs.filter(jd => jd.isRequired).filter(jd => {
      const key = (jd.documentTypeId as any).toString();
      const fid = docTypeMap.get(key)?.fieldIdentifier || "";
      if (isNonFood && application.securityGuard !== true) {
        if (fid === "drugTestId" || fid === "neuroExamId") return false; // not required for non-guards
      }
      return true;
    });

    const relevantDocTypeIds = new Set(requiredDocs.map(jd => jd.documentTypeId));

    // 1.2 Build a map of the LATEST upload per relevant document type
    const latestByType = new Map<string, typeof uploadedDocs[number]>();
    for (const up of uploadedDocs) {
      // Skip uploads for documents not part of this job category
      if (!relevantDocTypeIds.has(up.documentTypeId as any)) continue;
      const existing = latestByType.get((up.documentTypeId as any).toString());
      if (!existing || (up.uploadedAt ?? 0) > (existing.uploadedAt ?? 0)) {
        latestByType.set((up.documentTypeId as any).toString(), up);
      }
    }

    // 2. Perform validation on the backend for security, using only latest uploads for relevant docs
    // 2.1 Ensure each relevant document has an upload
    const missing: string[] = [];
    for (const jd of requiredDocs) {
      const key = (jd.documentTypeId as any).toString();
      const latest = latestByType.get(key);
      if (!latest) {
        const name = docTypeMap.get(key)?.name || "Unknown";
        missing.push(name);
      }
    }
    if (missing.length > 0) {
      throw new Error(
        `Please review and assign a status (Approve, Refer, or Flag) to all documents before proceeding. Missing: ${missing.join(", ")}`
      );
    }

    // 2.2 Check for any Pending among the latest uploads
    const pendingDocs = [...latestByType.values()].filter(doc => doc.reviewStatus === "Pending");
    if (pendingDocs.length > 0) {
      const names = pendingDocs.map(d => docTypeMap.get((d.documentTypeId as any).toString())?.name || "Unknown");
      throw new Error(
        `Please review and assign a status (Approve, Refer, or Flag) to all documents before proceeding. Pending: ${names.join(", ")}`
      );
    }

    // 2.3 Check for referred or needs revision when attempting final approval
    const hasReferralsOrIssues = [...latestByType.values()].some(doc =>
      doc.reviewStatus === "Rejected" ||
      doc.reviewStatus === "Referred" ||
      doc.reviewStatus === "NeedsRevision"
    );

    if (args.newStatus === "Rejected" && !hasReferralsOrIssues) {
      throw new Error("To send referral notifications, at least one document must be referred or flagged.");
    }

    // Get application and applicant details for logging (already fetched above)
    const applicant = await ctx.db.get(application.userId);
    if (!applicant) throw new Error("Applicant not found.");

    // 2.5. CRITICAL: Validate payment before approval
    if (args.newStatus === "Approved") {
      // Check payment status - must be completed and validated
      const payment = await ctx.db
        .query("payments")
        .withIndex("by_application", (q) => q.eq("applicationId", args.applicationId))
        .first();
      
      if (!payment) {
        throw new Error("Cannot approve application. No payment record found. The applicant must complete payment first.");
      }
      
      if (payment.paymentStatus !== "Complete") {
        throw new Error(
          `Cannot approve application. Payment status is "${payment.paymentStatus}". ` +
          "The payment must be completed and validated before document approval."
        );
      }
      
      // Check application payment status
      if (application.applicationStatus === "Pending Payment") {
        throw new Error("Cannot approve application. Application is still pending payment. Please ensure payment has been validated first.");
      }
    }
    
    // 2.6. CRITICAL: Check orientation requirement for Food Handlers ONLY
    // Note: Document verification can happen in parallel with orientation
    // Admin can review documents while applicant attends/books orientation
    // BUT final approval requires BOTH documents approved AND orientation completed
    if (args.newStatus === "Approved") {
      const jobCategory = await ctx.db.get(application.jobCategoryId);
      const categoryName = jobCategory?.name?.toLowerCase() || '';
      
      // Only check orientation for Food Handlers, exclude non-food and pink card
      const isNonFood = categoryName.includes('non-food') || categoryName.includes('nonfood');
      const isPinkCard = categoryName.includes('pink') || categoryName.includes('skin') || categoryName.includes('contact');
      const isFoodHandler = !isNonFood && !isPinkCard && categoryName.includes('food');
      
      const requiresOrientation = isFoodHandler && (
        jobCategory?.requireOrientation === true || 
        jobCategory?.requireOrientation === "true" ||
        jobCategory?.requireOrientation === "Yes"
      );
      
      if (requiresOrientation && !application.orientationCompleted) {
        throw new Error(
          "Cannot approve application. This applicant must complete the mandatory Food Safety Orientation before final approval. " +
          "Please verify that the applicant has both checked in and checked out from their scheduled orientation session. " +
          "Note: You can continue reviewing documents while waiting for the applicant to attend orientation."
        );
      }
    }

    // 3. Determine the next status in the workflow.
    // When documents are approved, the application is complete (not moving to payment validation)
    // Payment validation should have already happened BEFORE document verification
    const nextApplicationStatus = args.newStatus === "Approved" 
      ? "Approved"  // Documents approved = application complete and ready for health card
      : "Rejected";  // If rejected, the process stops here.

    // 4. Update the application's overall status.
    const updateData: any = {
      applicationStatus: nextApplicationStatus,
      updatedAt: Date.now(),
      lastUpdatedBy: adminUser._id,
    };
    
    // Set approvedAt timestamp when application is approved
    if (nextApplicationStatus === "Approved") {
      updateData.approvedAt = Date.now();
    }
    
    await ctx.db.patch(args.applicationId, updateData);

    // 4.5. Generate health card automatically when approved
    if (nextApplicationStatus === "Approved") {
      try {
        // Schedule health card generation (runs immediately but asynchronously)
        await ctx.scheduler.runAfter(0, internal.healthCards.generateHealthCard.generateHealthCard, {
          applicationId: args.applicationId,
        });
      } catch (error) {
        console.error("Error scheduling health card generation:", error);
        // Don't fail the approval if health card generation scheduling fails
        // Admin can manually regenerate it later
      }
    }

    // 4.6. Send notification to applicant when application is approved
    if (nextApplicationStatus === "Approved") {
      await ctx.db.insert("notifications", {
        userId: applicant._id,
        applicationId: args.applicationId,
        title: "Application Approved!",
        message: `Congratulations! Your ${(await ctx.db.get(application.jobCategoryId))?.name || 'health card'} application has been approved. Your documents have been verified and your application is now complete.`,
        notificationType: "ApplicationApproved",
        isRead: false,
      });
    }

    // 4.6. If sending referral/issue notifications, schedule batch notification
    if (args.newStatus === "Rejected") {
      // Schedule notifications for all pending referrals/issues
      // This will send proper medical terminology messages
      // @ts-ignore - Deep type instantiation limitation
      await ctx.scheduler.runAfter(0, internal.admin.documents.sendReferralNotifications.sendReferralNotifications, {
        applicationId: args.applicationId,
      });
    }

    // 5. Log admin activity with updated terminology
    const activityDetails = args.newStatus === "Approved"
      ? `Finalized document verification for ${applicant.fullname} - Approved and moved to ${nextApplicationStatus}`
      : `Sent referral/issue notifications for ${applicant.fullname}`;

    await ctx.db.insert("adminActivityLogs", {
      adminId: adminUser._id,
      activityType: args.newStatus === "Approved" ? "application_finalization" : "referral_notifications_sent",
      details: activityDetails,
      timestamp: Date.now(),
      applicationId: args.applicationId,
      jobCategoryId: application.jobCategoryId,
    });

    return { success: true, nextStatus: nextApplicationStatus };
  },
});
