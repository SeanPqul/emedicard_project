import { query } from "../_generated/server";
import { Doc, Id } from "../_generated/dataModel";

export const getDashboardDataQuery = query({
  args: {},
  handler: async (ctx) => {
    try {
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) return null;
      
      const user = await ctx.db
        .query("users")
        .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
        .unique();
        
      if (!user) return null;
    
    // First, get applications and notifications in parallel
    // Filter out Draft applications - they should only appear after submission
    const [allApplications, notifications]: [Doc<"applications">[], Doc<"notifications">[]] = await Promise.all([
      ctx.db
        .query("applications")
        .withIndex("by_user", (q) => q.eq("userId", user._id))
        .collect(),
      ctx.db
        .query("notifications")
        .withIndex("by_user", (q) => q.eq("userId", user._id))
        .order("desc")
        .take(10), // Limit to recent notifications
    ]);
    
    // Filter out Draft applications - only show submitted applications
    const applications = allApplications.filter(app => app.applicationStatus !== "Draft");

    // Then get health cards using the applications data (optimized)
    const applicationIds = new Set(applications.map(app => app._id));
    const allHealthCards = await ctx.db.query("healthCards").collect();
    const healthCards = allHealthCards.filter(card => 
      applicationIds.has(card.applicationId)
    );

    // Get payments for user's applications (fetch most recent payment per application)
    // Optimized: batch payment queries to reduce round trips
    const payments = await Promise.all(
      applications.map(async (application) => {
        const payment = await ctx.db
          .query("payments")
          .withIndex("by_application", (q) => q.eq("applicationId", application._id))
          .order("desc")
          .first();
        return payment;
      })
    ).then(results => results.filter((p): p is NonNullable<typeof p> => p !== null));

    // Aggregate all data with minimal payloads
    const aggregatedApplications = await Promise.all(
      applications.map(async (application) => {
        const jobCategory = await ctx.db.get(application.jobCategoryId);
        const documents = await ctx.db
          .query("documentUploads")
          .withIndex("by_application", (q) => q.eq("applicationId", application._id))
          .collect();

        // Per-application rejected documents count (pending resubmission)
        const rejectionHistory = await ctx.db
          .query("documentRejectionHistory")
          .withIndex("by_application", (q) => q.eq("applicationId", application._id))
          .collect();
        const rejectedPendingCount = rejectionHistory.filter(r => !r.wasReplaced).length;

        // Check if all documents are verified
        const documentsVerified = documents.length > 0 && documents.every(doc => doc.reviewStatus === "Verified");

        return {
          _id: application._id,
          _creationTime: application._creationTime,
          status: application.applicationStatus,
          applicationType: application.applicationType,
          position: application.position,
          organization: application.organization,
          jobCategory: jobCategory ? {
            _id: jobCategory._id,
            name: jobCategory.name,
            colorCode: jobCategory.colorCode,
            requireOrientation: jobCategory.requireOrientation
          } : undefined,
          documentCount: documents.length,
          hasPayment: payments.some(p => p && p.applicationId === application._id),
          hasRejectedDocuments: rejectedPendingCount > 0,
          rejectedDocumentsCount: rejectedPendingCount,
          documentsVerified,
          orientationCompleted: application.orientationCompleted || false,
        };
      })
    );

    // Calculate dashboard stats server-side
    const activeApplications = aggregatedApplications.filter(app =>
      app.status === 'Submitted' || app.status === 'Under Review'
    ).length;

    const pendingPayments = payments.filter(payment =>
      payment && payment.paymentStatus === 'Pending'
    ).length;

    const pendingAmount = payments
      .filter(payment => payment && payment.paymentStatus === 'Pending')
      .reduce((sum, payment) => sum + (payment?.netAmount || 0), 0);

    const validHealthCards = healthCards.filter(card =>
      card.expiryDate > Date.now()
    ).length;

    const unreadNotifications = notifications.filter(n => !n.isRead).length;

    return {
      // Minimal user profile data
      user: {
        _id: user._id,
        username: user.username,
        fullname: user.fullname,
        email: user.email,
        image: user.image,
        role: user.role,
      },

      // Aggregated applications with minimal fields
      applications: aggregatedApplications,

      // Dashboard stats (pre-calculated)
      stats: {
        activeApplications,
        pendingPayments,
        pendingAmount,
        validHealthCards,
        unreadNotifications,
      },

      // Recent notifications (limited and minimal)
      notifications: notifications.slice(0, 5).map(n => ({
        _id: n._id,
        _creationTime: n._creationTime,
        title: n.title,
        message: n.message,
        notificationType: n.notificationType,
        isRead: n.isRead,
        actionUrl: n.actionUrl,
      })),

      // Recent payments with minimal context
      payments: payments.slice(-3).map(payment => {
        if (!payment) return null;

        const relatedApplication = applications.find((a: Doc<"applications">) => a._id === payment.applicationId);
        return {
          _id: payment._id,
          _creationTime: payment._creationTime,
          amount: payment.amount,
          netAmount: payment.netAmount,
          paymentMethod: payment.paymentMethod,
          status: payment.paymentStatus,
          updatedAt: payment.updatedAt,
          applicationId: payment.applicationId,
          applicationType: relatedApplication?.applicationType,
        };
      }).filter(Boolean),

      // All health cards with full details (including expired ones)
      healthCards: await Promise.all(
        healthCards
          .map(async (card) => {
            const application = applications.find(app => app._id === card.applicationId);
            const jobCategory = application ? await ctx.db.get(application.jobCategoryId) : null;
            
            return {
              _id: card._id,
              applicationId: card.applicationId,
              registrationNumber: card.registrationNumber,
              issuedDate: card.issuedDate,
              expiryDate: card.expiryDate,
              status: card.status,
              createdAt: card.createdAt,
              application: application ? {
                _id: application._id,
                firstName: application.firstName,
                middleName: application.middleName,
                lastName: application.lastName,
                position: application.position,
                organization: application.organization,
              } : null,
              jobCategory: jobCategory ? {
                _id: jobCategory._id,
                name: jobCategory.name,
                colorCode: jobCategory.colorCode,
              } : null,
            };
          })
      ),
    };
    } catch (error) {
      console.error("Error in getDashboardDataQuery:", error);
      // Return null to trigger error handling in frontend
      return null;
    }
  },
});
