// Script to create rejection history for manually rejected documents
// Run this in Convex Dashboard console to fix the missing rejection history

async function createRejectionHistory(applicationId, documentTypeId) {
  const ctx = { db, auth: { getUserIdentity: async () => null } };
  
  console.log("Creating rejection history for testing...");
  
  // Find the rejected document upload
  const documentUpload = await ctx.db
    .query("documentUploads")
    .withIndex("by_application_document", (q) => 
      q.eq("applicationId", applicationId)
       .eq("documentTypeId", documentTypeId)
    )
    .filter(q => q.eq(q.field("reviewStatus"), "Rejected"))
    .first();
    
  if (!documentUpload) {
    console.error("No rejected document found for this application and document type");
    return;
  }
  
  console.log("Found rejected document:", documentUpload._id);
  
  // Check if rejection history already exists
  const existingHistory = await ctx.db
    .query("documentRejectionHistory")
    .withIndex("by_document_type", (q) => 
      q.eq("applicationId", applicationId)
       .eq("documentTypeId", documentTypeId)
    )
    .filter(q => q.eq(q.field("wasReplaced"), false))
    .first();
    
  if (existingHistory) {
    console.log("Rejection history already exists:", existingHistory._id);
    return existingHistory._id;
  }
  
  // Get application for user info
  const application = await ctx.db.get(applicationId);
  if (!application) {
    console.error("Application not found");
    return;
  }
  
  // Find an admin user (or use the application's user as a fallback for testing)
  const admin = await ctx.db
    .query("users")
    .filter(q => q.eq(q.field("role"), "admin"))
    .first();
    
  const rejectorId = admin ? admin._id : application.userId;
  
  // Create rejection history
  const rejectionHistoryId = await ctx.db.insert("documentRejectionHistory", {
    // Core References
    applicationId: applicationId,
    documentTypeId: documentTypeId,
    documentUploadId: documentUpload._id,
    
    // Preserved File Data
    rejectedFileId: documentUpload.storageFileId,
    originalFileName: documentUpload.originalFileName,
    fileSize: 1000000, // 1MB default for testing
    fileType: "application/pdf",
    
    // Rejection Information (test data)
    rejectionCategory: "quality_issue",
    rejectionReason: "Document is blurry and text is not readable. Please upload a clear, high-quality scan or photo.",
    specificIssues: [
      "Image quality is too low",
      "Text is blurry and illegible",
      "Please ensure good lighting when taking photo"
    ],
    
    // Tracking
    rejectedBy: rejectorId,
    rejectedAt: Date.now(),
    
    // Resubmission Tracking
    wasReplaced: false,
    attemptNumber: 1,
    
    // Audit Fields
    ipAddress: undefined,
    userAgent: undefined,
  });
  
  console.log("Created rejection history:", rejectionHistoryId);
  
  // Update application status if needed
  if (application.applicationStatus !== "Documents Need Revision") {
    await ctx.db.patch(applicationId, {
      applicationStatus: "Documents Need Revision",
      updatedAt: Date.now()
    });
    console.log("Updated application status to 'Documents Need Revision'");
  }
  
  // Create a notification for the user
  await ctx.db.insert("notifications", {
    userId: application.userId,
    applicationId: applicationId,
    title: "Document Rejected",
    message: "Your document has been rejected due to quality issues. Please upload a clearer image.",
    notificationType: "DocumentRejection",
    isRead: false,
    actionUrl: `/applications/${applicationId}/documents`
  });
  
  console.log("Created notification for user");
  console.log("\nRejection history created successfully!");
  console.log("You can now test the resubmit functionality.");
  
  return rejectionHistoryId;
}

// IMPORTANT: Replace these with your actual IDs
const APPLICATION_ID = "ms76r3heg1dk7y13ashtjdsb397rtzv3";
const DOCUMENT_TYPE_ID = "mx721yet3ztt15sxy02qzx54s17p9xxm";  // Drug Test document type

// Run the function
createRejectionHistory(APPLICATION_ID, DOCUMENT_TYPE_ID);
