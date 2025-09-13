import { mutation } from "../_generated/server";

// Comprehensive data migration to update existing records to match new schema
export const migrateAllDataToNewSchema = mutation({
  args: {},
  handler: async (ctx) => {
    console.log("🔄 Starting comprehensive data migration to match new schema...");
    
    const migrationResults = {
      notifications: 0,
      applications: 0,
      documentUploads: 0,
      payments: 0,
      healthCards: 0,
      verificationLogs: 0,
      orientations: 0,
      errors: [] as string[]
    };

    try {
      // 1. Migrate notifications table: read -> isRead, type -> notificationType, formsId -> applicationId
      console.log("📧 Migrating notifications...");
      const notifications = await ctx.db.query("notifications").collect();
      for (const notification of notifications) {
        const updates: any = {};
        let hasUpdates = false;

        // Fix read -> isRead
        if ((notification as any).read !== undefined) {
          updates.isRead = (notification as any).read;
          hasUpdates = true;
        }

        // Fix type -> notificationType
        if ((notification as any).type !== undefined) {
          updates.notificationType = (notification as any).type;
          hasUpdates = true;
        }

        // Fix formsId -> applicationId
        if ((notification as any).formsId !== undefined) {
          updates.applicationId = (notification as any).formsId;
          hasUpdates = true;
        }

        if (hasUpdates) {
          await ctx.db.patch(notification._id, updates);
          migrationResults.notifications++;
        }
      }

      // 2. Migrate applications table: status -> applicationStatus
      console.log("📄 Migrating applications...");
      const applications = await ctx.db.query("applications").collect();
      for (const application of applications) {
        if ((application as any).status !== undefined && !application.applicationStatus) {
          await ctx.db.patch(application._id, { 
            applicationStatus: (application as any).status 
          });
          migrationResults.applications++;
        }
      }

      // 3. Migrate documentUploads table: status -> reviewStatus, fileName -> originalFileName, etc.
      console.log("📎 Migrating documentUploads...");
      const documentUploads = await ctx.db.query("documentUploads").collect();
      for (const doc of documentUploads) {
        const updates: any = {};
        let hasUpdates = false;

        // Fix status -> reviewStatus
        if ((doc as any).status !== undefined) {
          updates.reviewStatus = (doc as any).status;
          hasUpdates = true;
        }

        // Fix fileName -> originalFileName
        if ((doc as any).fileName !== undefined && !(doc as any).originalFileName) {
          updates.originalFileName = (doc as any).fileName;
          hasUpdates = true;
        }

        // Fix fileId -> storageFileId
        if ((doc as any).fileId !== undefined && !(doc as any).storageFileId) {
          updates.storageFileId = (doc as any).fileId;
          hasUpdates = true;
        }

        // Fix reviewBy -> reviewedBy
        if ((doc as any).reviewBy !== undefined) {
          updates.reviewedBy = (doc as any).reviewBy;
          hasUpdates = true;
        }

        // Fix reviewAt -> reviewedAt
        if ((doc as any).reviewAt !== undefined) {
          updates.reviewedAt = (doc as any).reviewAt;
          hasUpdates = true;
        }

        // Fix remarks -> adminRemarks
        if ((doc as any).remarks !== undefined) {
          updates.adminRemarks = (doc as any).remarks;
          hasUpdates = true;
        }

        // Fix formId -> applicationId
        if ((doc as any).formId !== undefined && !(doc as any).applicationId) {
          updates.applicationId = (doc as any).formId;
          hasUpdates = true;
        }

        if (hasUpdates) {
          await ctx.db.patch(doc._id, updates);
          migrationResults.documentUploads++;
        }
      }

      // 4. Migrate payments table: status -> paymentStatus, method -> paymentMethod, formId -> applicationId
      console.log("💰 Migrating payments...");
      const payments = await ctx.db.query("payments").collect();
      for (const payment of payments) {
        const updates: any = {};
        let hasUpdates = false;

        // Fix status -> paymentStatus
        if ((payment as any).status !== undefined && !payment.paymentStatus) {
          updates.paymentStatus = (payment as any).status;
          hasUpdates = true;
        }

        // Fix method -> paymentMethod
        if ((payment as any).method !== undefined && !payment.paymentMethod) {
          updates.paymentMethod = (payment as any).method;
          hasUpdates = true;
        }

        // Fix formId -> applicationId
        if ((payment as any).formId !== undefined && !payment.applicationId) {
          updates.applicationId = (payment as any).formId;
          hasUpdates = true;
        }

        // Fix receiptId -> receiptStorageId
        if ((payment as any).receiptId !== undefined && !payment.receiptStorageId) {
          updates.receiptStorageId = (payment as any).receiptId;
          hasUpdates = true;
        }

        if (hasUpdates) {
          await ctx.db.patch(payment._id, updates);
          migrationResults.payments++;
        }
      }

      // 5. Migrate healthCards table: formId -> applicationId
      console.log("🏥 Migrating healthCards...");
      const healthCards = await ctx.db.query("healthCards").collect();
      for (const card of healthCards) {
        if ((card as any).formId !== undefined && !card.applicationId) {
          await ctx.db.patch(card._id, { 
            applicationId: (card as any).formId 
          });
          migrationResults.healthCards++;
        }
      }

      // 6. Migrate verificationLogs table: status -> verificationStatus
      console.log("🔍 Migrating verificationLogs...");
      const verificationLogs = await ctx.db.query("verificationLogs").collect();
      for (const log of verificationLogs) {
        if ((log as any).status !== undefined && !log.verificationStatus) {
          await ctx.db.patch(log._id, { 
            verificationStatus: (log as any).status 
          });
          migrationResults.verificationLogs++;
        }
      }

      // 7. Migrate orientations table: status -> orientationStatus, scheduleAt -> scheduledAt, formId -> applicationId
      console.log("📅 Migrating orientations...");
      const orientations = await ctx.db.query("orientations").collect();
      for (const orientation of orientations) {
        const updates: any = {};
        let hasUpdates = false;

        // Fix status -> orientationStatus
        if ((orientation as any).status !== undefined && !orientation.orientationStatus) {
          updates.orientationStatus = (orientation as any).status;
          hasUpdates = true;
        }

        // Fix scheduleAt -> scheduledAt
        if ((orientation as any).scheduleAt !== undefined && !orientation.scheduledAt) {
          updates.scheduledAt = (orientation as any).scheduleAt;
          hasUpdates = true;
        }

        // Fix formId -> applicationId
        if ((orientation as any).formId !== undefined && !orientation.applicationId) {
          updates.applicationId = (orientation as any).formId;
          hasUpdates = true;
        }

        if (hasUpdates) {
          await ctx.db.patch(orientation._id, updates);
          migrationResults.orientations++;
        }
      }

      console.log("✅ Data migration completed successfully!");
      
      return {
        success: true,
        message: "All data migrated to match new schema",
        results: migrationResults,
        summary: `Migrated ${Object.entries(migrationResults)
          .filter(([key, val]) => key !== 'errors' && typeof val === 'number')
          .reduce((sum, [key, val]) => sum + (val as number), 0)} records across all tables`
      };

    } catch (error) {
      console.error("❌ Data migration failed:", error);
      migrationResults.errors.push(error instanceof Error ? error.message : String(error));
      
      return {
        success: false,
        message: "Data migration failed",
        error: error instanceof Error ? error.message : String(error),
        results: migrationResults
      };
    }
  }
});

// Migration to clean up old fields after successful migration
export const cleanupOldFields = mutation({
  args: {},
  handler: async (ctx) => {
    console.log("🧹 Cleaning up old fields from database records...");
    
    const cleanupResults = {
      notifications: 0,
      applications: 0,
      documentUploads: 0,
      payments: 0,
      healthCards: 0,
      verificationLogs: 0,
      orientations: 0
    };

    try {
      // Note: Convex doesn't allow removing fields directly via patch
      // This would need to be done by recreating records or manual database cleanup
      // For now, we'll just report what would be cleaned up
      
      console.log("⚠️  Note: Field cleanup requires manual database cleanup or record recreation");
      console.log("Old fields that should be removed after successful migration:");
      console.log("- notifications: read, type, formsId");
      console.log("- applications: status");
      console.log("- documentUploads: status, fileName, fileId, reviewBy, reviewAt, remarks, formId");
      console.log("- payments: status, method, formId, receiptId");
      console.log("- healthCards: formId");
      console.log("- verificationLogs: status");
      console.log("- orientations: status, scheduleAt, formId");
      
      return {
        success: true,
        message: "Cleanup plan generated - manual cleanup required",
        results: cleanupResults
      };

    } catch (error) {
      return {
        success: false,
        message: "Cleanup planning failed",
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
});