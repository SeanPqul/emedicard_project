import { query } from "../_generated/server";
import { Doc, Id } from "../_generated/dataModel";

export const getDashboardDataQuery = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
      
    if (!user) return null;
    
    // First, get forms and notifications in parallel
    const [forms, notifications]: [Doc<"forms">[], Doc<"notifications">[]] = await Promise.all([
      ctx.db
        .query("forms")
        .withIndex("by_user", (q) => q.eq("userId", user._id))
        .collect(),
      ctx.db
        .query("notifications")
        .withIndex("by_user", (q) => q.eq("userId", user._id))
        .order("desc")
        .take(10), // Limit to recent notifications
    ]);
    
    // Then get health cards using the forms data
    const allHealthCards = await ctx.db.query("healthCards").collect();
    const healthCards = allHealthCards.filter(card => {
      // Find matching form to check if it's user's card
      return forms.some((form: Doc<"forms">) => form._id === card.formId);
    });
    
    // Get payments for user's forms
    const payments = await Promise.all(
      forms.map(async (form) => {
        const payment = await ctx.db
          .query("payments")
          .withIndex("by_form", (q) => q.eq("formId", form._id))
          .unique();
        return payment;
      })
    ).then(results => results.filter(Boolean));
    
    // Aggregate all data with minimal payloads
    const aggregatedForms = await Promise.all(
      forms.map(async (form) => {
        const jobCategory = await ctx.db.get(form.jobCategory);
        const documents = await ctx.db
          .query("formDocuments")
          .withIndex("by_form", (q) => q.eq("formId", form._id))
          .collect();
          
        return {
          _id: form._id,
          _creationTime: form._creationTime,
          status: form.status,
          applicationType: form.applicationType,
          position: form.position,
          organization: form.organization,
          jobCategory: jobCategory ? {
            _id: jobCategory._id,
            name: jobCategory.name,
            colorCode: jobCategory.colorCode,
            requireOrientation: jobCategory.requireOrientation
          } : undefined,
          documentCount: documents.length,
          hasPayment: payments.some(p => p && p.formId === form._id),
        };
      })
    );
    
    // Calculate dashboard stats server-side
    const activeApplications = aggregatedForms.filter(app => 
      app.status === 'Submitted' || app.status === 'Under Review'
    ).length;
    
    const pendingPayments = payments.filter(payment => 
      payment && payment.status === 'Pending'
    ).length;
    
    const pendingAmount = payments
      .filter(payment => payment && payment.status === 'Pending')
      .reduce((sum, payment) => sum + (payment?.netAmount || 0), 0);
    
    const validHealthCards = healthCards.filter(card => 
      card.expiresAt > Date.now()
    ).length;
    
    const unreadNotifications = notifications.filter(n => !n.read).length;
    
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
      applications: aggregatedForms,
      
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
        type: n.type,
        read: n.read,
        actionUrl: n.actionUrl,
      })),
      
      // Recent payments with minimal context
      payments: payments.slice(-3).map(payment => {
        if (!payment) return null;
        
        const relatedForm = forms.find((f: Doc<"forms">) => f._id === payment.formId);
        return {
          _id: payment._id,
          _creationTime: payment._creationTime,
          amount: payment.amount,
          netAmount: payment.netAmount,
          method: payment.method,
          status: payment.status,
          updatedAt: payment.updatedAt,
          formId: payment.formId,
          formType: relatedForm?.applicationType,
        };
      }).filter(Boolean),
      
      // Valid health cards
      healthCards: healthCards
        .filter(card => card.expiresAt > Date.now())
        .map(card => ({
          _id: card._id,
          formId: card.formId,
          issuedAt: card.issuedAt,
          expiresAt: card.expiresAt,
          verificationToken: card.verificationToken,
        })),
    };
  },
});
