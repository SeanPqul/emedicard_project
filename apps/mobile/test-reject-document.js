// Test script to properly reject a document using the mutation
// Run this in your app console or Convex dashboard

async function testRejectDocument(documentUploadId) {
  // This assumes you're running in an environment where you can call mutations
  // You might need to adjust based on your setup
  
  const rejectArgs = {
    documentUploadId: documentUploadId,
    rejectionCategory: "quality_issue",
    rejectionReason: "Document image is not clear. Please upload a high-quality scan or photo.",
    specificIssues: [
      "Image is blurry",
      "Text is not readable",
      "Please ensure proper lighting"
    ]
  };
  
  try {
    // If running in Convex dashboard, you'll need to call the mutation differently
    // This is pseudo-code - adjust based on your environment
    const result = await callMutation("admin/documents/rejectDocument:rejectDocument", rejectArgs);
    
    console.log("Document rejected successfully:", result);
  } catch (error) {
    console.error("Failed to reject document:", error);
  }
}

// For Convex Dashboard Console, use this format:
async function rejectDocumentInDashboard(documentUploadId) {
  // Get the document first
  const doc = await db.get(documentUploadId);
  if (!doc) {
    console.error("Document not found");
    return;
  }
  
  // Find an admin user
  const admin = await db.query("users")
    .filter(q => q.eq(q.field("role"), "admin"))
    .first();
    
  if (!admin) {
    console.error("No admin user found");
    return;
  }
  
  // Manually simulate what the mutation does
  // 1. Update document status
  await db.patch(documentUploadId, {
    reviewStatus: "Rejected",
    adminRemarks: "Document image is not clear. Please upload a high-quality scan or photo.",
    reviewedBy: admin._id,
    reviewedAt: Date.now()
  });
  
  // 2. Create rejection history
  const rejectionId = await db.insert("documentRejectionHistory", {
    applicationId: doc.applicationId,
    documentTypeId: doc.documentTypeId,
    documentUploadId: documentUploadId,
    rejectedFileId: doc.storageFileId,
    originalFileName: doc.originalFileName,
    fileSize: 1000000,
    fileType: "application/pdf",
    rejectionCategory: "quality_issue",
    rejectionReason: "Document image is not clear. Please upload a high-quality scan or photo.",
    specificIssues: [
      "Image is blurry",
      "Text is not readable", 
      "Please ensure proper lighting"
    ],
    rejectedBy: admin._id,
    rejectedAt: Date.now(),
    wasReplaced: false,
    attemptNumber: 1
  });
  
  // 3. Update application status
  await db.patch(doc.applicationId, {
    applicationStatus: "Documents Need Revision",
    updatedAt: Date.now()
  });
  
  console.log("Document rejected properly!");
  console.log("Rejection ID:", rejectionId);
  console.log("Now you can test resubmission");
}

// Replace with your actual document upload ID
const DOCUMENT_UPLOAD_ID = "YOUR_DOCUMENT_UPLOAD_ID";

// Run the function
rejectDocumentInDashboard(DOCUMENT_UPLOAD_ID);
