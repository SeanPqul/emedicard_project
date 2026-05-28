import { internalMutation } from "../_generated/server";
import { v } from "convex/values";

/**
 * 🎯 RUN FUNCTION: Generate Test Renewal Application
 * 
 * This creates:
 * 1. A test user (Maria Garcia Cruz)
 * 2. An approved initial application with health card (expired)
 * 3. A renewal application in "For Document Verification" status
 * 
 * Usage in Convex Dashboard:
 * - Go to Functions tab
 * - Find: testData:generateRenewalTestData
 * - Click "Run" (no arguments needed)
 * 
 * This will create renewal test data visible in admin dashboard!
 */
export const generateRenewalTestData = internalMutation({
  args: {},
  handler: async (ctx) => {
    console.log("🔄 Starting renewal test data generation...");

    // Step 1: Get Food Category (Yellow Card)
    const foodCategory = await ctx.db
      .query("jobCategories")
      .filter((q) => q.eq(q.field("name"), "Food Category"))
      .first();

    if (!foodCategory) {
      throw new Error("❌ Food Category not found. Run seed function first!");
    }

    // Step 2: Create test user (Maria Garcia Cruz)
    const testUserClerkId = `test_renewal_${Date.now()}`;
    const testUserId = await ctx.db.insert("users", {
      clerkId: testUserClerkId,
      username: "maria.cruz.renewal",
      fullname: "Maria Garcia Cruz",
      email: `maria.cruz.renewal.${Date.now()}@test.com`,
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Maria",
      role: "applicant",
      registrationStatus: "approved",
      gender: "Female",
      birthDate: "1990-05-15",
      phoneNumber: "+639123456789",
    });

    console.log("✅ Created test user:", testUserId);

    // Step 3: Create INITIAL approved application (1 year ago)
    const oneYearAgo = Date.now() - (365 * 24 * 60 * 60 * 1000);
    const initialAppId = await ctx.db.insert("applications", {
      userId: testUserId,
      applicationType: "New",
      applicationStatus: "Approved",
      jobCategoryId: foodCategory._id,
      firstName: "Maria",
      middleName: "Garcia",
      lastName: "Cruz",
      suffix: undefined,
      age: 34,
      gender: "Female",
      nationality: "Filipino",
      civilStatus: "Single",
      organization: "Sunshine Restaurant",
      position: "Food Server",
      securityGuard: false,
      approvedAt: oneYearAgo,
      isRenewal: false,
      renewalCount: 0,
    });

    console.log("✅ Created initial application:", initialAppId);

    // Step 4: Create health card for initial application (EXPIRED)
    const cardIssuedDate = oneYearAgo;
    const cardExpiryDate = oneYearAgo + (365 * 24 * 60 * 60 * 1000); // Expired now
    const registrationNumber = `YC-2024-${Math.floor(Math.random() * 100000).toString().padStart(5, "0")}`;

    const healthCardId = await ctx.db.insert("healthCards", {
      applicationId: initialAppId,
      registrationNumber,
      htmlContent: `<div>Test Health Card - ${registrationNumber}</div>`,
      issuedDate: cardIssuedDate,
      expiryDate: cardExpiryDate,
      status: "expired", // EXPIRED - eligible for renewal!
      createdAt: cardIssuedDate,
      cardType: "yellow",
    });

    // Update initial application with health card reference
    await ctx.db.patch(initialAppId, {
      healthCardId: healthCardId,
      healthCardRegistrationNumber: registrationNumber,
      healthCardIssuedAt: cardIssuedDate,
    });

    console.log("✅ Created expired health card:", healthCardId);

    // Step 5: Create RENEWAL application (current)
    const renewalAppId = await ctx.db.insert("applications", {
      userId: testUserId,
      applicationType: "Renew", // 🔄 RENEWAL TYPE
      applicationStatus: "For Document Verification", // Ready for admin review
      jobCategoryId: foodCategory._id,
      firstName: "Maria",
      middleName: "Garcia",
      lastName: "Cruz",
      suffix: undefined,
      age: 35, // One year older
      gender: "Female",
      nationality: "Filipino",
      civilStatus: "Single",
      organization: "Sunshine Restaurant",
      position: "Senior Food Server", // Promoted!
      securityGuard: false,
      // RENEWAL TRACKING FIELDS
      isRenewal: true,
      previousHealthCardId: healthCardId,
      renewalCount: 1,
    });

    console.log("✅ Created renewal application:", renewalAppId);

    // Step 6: Create some document uploads for the renewal
    // Get required document types
    const docTypes = await ctx.db.query("documentTypes").collect();
    const validIdDoc = docTypes.find((d) => d.fieldIdentifier === "validId");
    const pictureDoc = docTypes.find((d) => d.fieldIdentifier === "picture");

    // Create placeholder storage IDs (you'll need to upload real files via UI)
    const placeholderStorageId = "kg27dggvzs8zt5eh0yvdxwqm8h6zbxbg" as any; // Placeholder

    if (validIdDoc) {
      await ctx.db.insert("documentUploads", {
        applicationId: renewalAppId,
        documentTypeId: validIdDoc._id,
        storageFileId: placeholderStorageId,
        originalFileName: "maria_valid_id_renewal.jpg",
        fileType: "image/jpeg",
        uploadedAt: Date.now(),
        reviewStatus: "Pending",
      });
      console.log("✅ Created Valid ID document upload");
    }

    if (pictureDoc) {
      await ctx.db.insert("documentUploads", {
        applicationId: renewalAppId,
        documentTypeId: pictureDoc._id,
        storageFileId: placeholderStorageId,
        originalFileName: "maria_picture_renewal.jpg",
        fileType: "image/jpeg",
        uploadedAt: Date.now(),
        reviewStatus: "Pending",
      });
      console.log("✅ Created 1x1 Picture document upload");
    }

    // Step 7: Create notification for renewal
    await ctx.db.insert("notifications", {
      userId: testUserId,
      title: "Renewal Application Submitted",
      message: "Your health card renewal application has been submitted and is now under review.",
      notificationType: "application_status",
      applicationId: renewalAppId,
      isRead: false,
      jobCategoryId: foodCategory._id,
    });

    console.log("✅ Created renewal notification");

    return {
      success: true,
      message: "✅ Renewal test data generated successfully!",
      data: {
        userId: testUserId,
        userName: "Maria Garcia Cruz",
        initialApplicationId: initialAppId,
        expiredHealthCardId: healthCardId,
        healthCardNumber: registrationNumber,
        renewalApplicationId: renewalAppId,
        instructions: [
          "1. Go to web admin dashboard: /dashboard",
          "2. Look for 'Maria Garcia Cruz' in the applications table",
          "3. You'll see a '🔄 Renewal' badge next to her status",
          "4. Click 'View' to see document verification page",
          "5. You can now screenshot the renewal flow!",
          "",
          "📸 SCREENSHOT LOCATIONS:",
          "- Input: Dashboard with renewal badge visible",
          "- Output: Document verification page for renewal",
        ],
      },
    };
  },
});

/**
 * 🧹 CLEANUP: Remove test renewal data
 * 
 * Use this to clean up test data after taking screenshots
 */
export const cleanupRenewalTestData = internalMutation({
  args: {
    // Optional: specify user email to clean up specific test user
    email: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const searchPattern = args.email || "renewal";
    
    // Find test users
    const users = await ctx.db.query("users").collect();
    const testUsers = users.filter((u) => 
      u.email?.includes(searchPattern) || 
      u.username?.includes("renewal")
    );

    let deletedCount = {
      users: 0,
      applications: 0,
      healthCards: 0,
      documents: 0,
      notifications: 0,
    };

    for (const user of testUsers) {
      // Delete applications
      const apps = await ctx.db
        .query("applications")
        .withIndex("by_user", (q) => q.eq("userId", user._id))
        .collect();

      for (const app of apps) {
        // Delete documents
        const docs = await ctx.db
          .query("documentUploads")
          .withIndex("by_application", (q) => q.eq("applicationId", app._id))
          .collect();
        
        for (const doc of docs) {
          await ctx.db.delete(doc._id);
          deletedCount.documents++;
        }

        // Delete health card
        if (app.healthCardId) {
          const card = await ctx.db.get(app.healthCardId);
          if (card) {
            await ctx.db.delete(card._id);
            deletedCount.healthCards++;
          }
        }

        await ctx.db.delete(app._id);
        deletedCount.applications++;
      }

      // Delete notifications
      const notifications = await ctx.db
        .query("notifications")
        .withIndex("by_user", (q) => q.eq("userId", user._id))
        .collect();

      for (const notif of notifications) {
        await ctx.db.delete(notif._id);
        deletedCount.notifications++;
      }

      // Delete user
      await ctx.db.delete(user._id);
      deletedCount.users++;
    }

    return {
      success: true,
      message: "🧹 Cleanup complete",
      deleted: deletedCount,
    };
  },
});
