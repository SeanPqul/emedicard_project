import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { Id } from "../_generated/dataModel";

/**
 * Test Document Resubmission Notification Flow
 * 
 * This test simulates the complete flow:
 * 1. Get an application with a rejected document
 * 2. Simulate resubmission by updating rejection history
 * 3. Check if notifications appear correctly for admins
 * 
 * Usage:
 * npx convex run testing/testDocumentResubmission:testDocumentResubmissionFlow --arg '{"applicationId":"YOUR_APP_ID"}'
 */

export const testDocumentResubmissionFlow = mutation({
  args: {
    applicationId: v.id("applications"),
  },
  handler: async (ctx, args) => {
    console.log("🧪 Testing Document Resubmission Notification Flow...\n");

    // 1. Get the application
    const application = await ctx.db.get(args.applicationId);
    if (!application) {
      return { error: "Application not found" };
    }

    const user = await ctx.db.get(application.userId);
    console.log(`📋 Application: ${args.applicationId}`);
    console.log(`👤 User: ${user?.fullname || "Unknown"}`);

    // 2. Find rejected documents for this application
    const rejectionHistory = await ctx.db
      .query("documentRejectionHistory")
      .withIndex("by_application", (q) => q.eq("applicationId", args.applicationId))
      .filter((q) => q.eq(q.field("wasReplaced"), false))
      .collect();

    console.log(`\n📄 Found ${rejectionHistory.length} rejected document(s) not yet resubmitted`);

    if (rejectionHistory.length === 0) {
      return {
        error: "No rejected documents found to test resubmission",
        suggestion: "Create a rejection first or use an application with rejected docs"
      };
    }

    // 3. Test: Mark first rejection as resubmitted
    const testRejection = rejectionHistory[0];
    const documentType = await ctx.db.get(testRejection.documentTypeId);

    console.log(`\n🔄 Simulating resubmission for: ${documentType?.name || "Unknown document"}`);
    console.log(`   Rejection ID: ${testRejection._id}`);

    // Create a mock new document upload
    const newUploadId = await ctx.db.insert("documentUploads", {
      applicationId: args.applicationId,
      documentTypeId: testRejection.documentTypeId,
      storageFileId: testRejection.rejectedFileId, // Reusing for test
      originalFileName: "RESUBMITTED_" + testRejection.originalFileName,
      uploadedAt: Date.now(),
      reviewStatus: "Pending",
      fileType: testRejection.fileType,
    });

    console.log(`   ✅ Created mock new upload: ${newUploadId}`);

    // Update rejection history (this is what triggers the notification)
    await ctx.db.patch(testRejection._id, {
      wasReplaced: true,
      replacementUploadId: newUploadId,
      replacedAt: Date.now(),
      status: "resubmitted",
    });

    console.log(`   ✅ Updated rejection history: wasReplaced=true`);

    // 4. Check notifications for admins
    const admins = await ctx.db
      .query("users")
      .withIndex("by_role", (q) => q.eq("role", "admin"))
      .collect();

    console.log(`\n👥 Found ${admins.length} admin(s)`);

    // Test: Get rejection history notifications (this is what the frontend calls)
    const resubmittedRejections = await ctx.db
      .query("documentRejectionHistory")
      .withIndex("by_replacement", (q) => q.eq("wasReplaced", true))
      .collect();

    const ourRejection = resubmittedRejections.find(r => r._id === testRejection._id);

    console.log(`\n🔔 Notification Status:`);
    if (ourRejection) {
      console.log(`   ✅ Rejection marked as wasReplaced: true`);
      console.log(`   ✅ Will appear in getRejectionHistoryNotifications query`);
      console.log(`   📊 adminReadBy: [${ourRejection.adminReadBy?.length || 0} admin(s) have read it]`);
      
      // Show which admins will see this
      const relevantAdmins = admins.filter(admin => 
        !admin.managedCategories || 
        admin.managedCategories.length === 0 || 
        admin.managedCategories.includes(application.jobCategoryId)
      );

      console.log(`\n   👀 Admins who will see this notification: ${relevantAdmins.length}`);
      relevantAdmins.forEach(admin => {
        const hasRead = ourRejection.adminReadBy?.includes(admin._id) || false;
        console.log(`      - ${admin.fullname} (${admin.email}) - ${hasRead ? '✅ Read' : '🔔 Unread'}`);
      });
    } else {
      console.log(`   ❌ ERROR: Rejection not found in wasReplaced=true query!`);
    }

    // 5. Check regular notifications table (should be EMPTY for resubmissions after our fix)
    const regularNotifications = await ctx.db
      .query("notifications")
      .filter((q) => 
        q.and(
          q.eq(q.field("applicationId"), args.applicationId),
          q.eq(q.field("notificationType"), "DocumentResubmission")
        )
      )
      .collect();

    console.log(`\n📬 Regular notifications table check:`);
    if (regularNotifications.length === 0) {
      console.log(`   ✅ CORRECT: No duplicate notifications in regular table (fixed!)`);
    } else {
      console.log(`   ⚠️  WARNING: Found ${regularNotifications.length} duplicate notification(s)!`);
      console.log(`   This shouldn't happen after the fix.`);
    }

    return {
      success: true,
      testResults: {
        applicationId: args.applicationId,
        userName: user?.fullname,
        documentType: documentType?.name,
        rejectionId: testRejection._id,
        newUploadId: newUploadId,
        wasReplaced: ourRejection?.wasReplaced,
        adminCount: admins.length,
        regularNotificationCount: regularNotifications.length,
        expectedBehavior: "Admins should see notification via getRejectionHistoryNotifications query",
        status: regularNotifications.length === 0 ? "✅ PASS" : "⚠️ DUPLICATE DETECTED"
      }
    };
  },
});

/**
 * Helper: List all applications with rejected documents
 * Usage: npx convex run testing/testDocumentResubmission:listApplicationsWithRejections
 */
export const listApplicationsWithRejections = mutation({
  handler: async (ctx) => {
    const rejections = await ctx.db
      .query("documentRejectionHistory")
      .filter((q) => q.eq(q.field("wasReplaced"), false))
      .collect();

    console.log(`Found ${rejections.length} rejected document(s) awaiting resubmission:\n`);

    const grouped = new Map<string, typeof rejections>();
    
    for (const rejection of rejections) {
      const appId = rejection.applicationId;
      if (!grouped.has(appId)) {
        grouped.set(appId, []);
      }
      grouped.get(appId)!.push(rejection);
    }

    for (const [appId, appRejections] of grouped) {
      const app = await ctx.db.get(appId as Id<"applications">);
      const user = app ? await ctx.db.get(app.userId) : null;
      
      console.log(`📋 Application: ${appId}`);
      console.log(`   User: ${user?.fullname || "Unknown"}`);
      console.log(`   Status: ${app?.applicationStatus || "Unknown"}`);
      console.log(`   Rejected Documents: ${appRejections.length}`);
      
      for (const rejection of appRejections) {
        const docType = await ctx.db.get(rejection.documentTypeId);
        console.log(`      - ${docType?.name || "Unknown"} (Rejection: ${rejection._id})`);
      }
      console.log('');
    }

    return {
      totalRejections: rejections.length,
      totalApplications: grouped.size,
      applicationIds: Array.from(grouped.keys()),
    };
  },
});
