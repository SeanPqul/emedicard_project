<<<<<<< HEAD
// import { mutation, action } from "./_generated/server";
// import { api } from "./_generated/api";
// import { v } from "convex/values";
// import { faker } from '@faker-js/faker';

// /**
//  * Main seeding action that orchestrates the entire seeding process
//  * Usage: npx convex run seed:all
//  */
// export const all = action({
//   args: {},
//   handler: async (ctx) => {
//     console.log("🌱 Starting comprehensive database seed...");
    
//     try {
//       // Step 1: Create job categories and document requirements
//       console.log("📋 Setting up job categories and requirements...");
//       await ctx.runMutation(api.seed.setupCategories);
      
//       // Step 2: Create users
//       console.log("👥 Creating test users...");
//       const userIds = await ctx.runMutation(api.seed.createUsers);
      
//       // Step 3: Create forms for users
//       console.log("📝 Creating application forms...");
//       const formIds = await ctx.runMutation(api.seed.createForms, { userIds });
      
//       // Step 4: Generate and upload requirements (fake storage)
//       console.log("📄 Generating document requirements...");
//       const DUMMY_TEXT = "Placeholder text for seeding purposes. This is example content.";
//       const dummyBytes = new TextEncoder().encode(DUMMY_TEXT);
//       const storageId = await ctx.storage.storeBlob(dummyBytes);
      
//       await ctx.runMutation(api.seed.createRequirements, { formIds, storageId });
//       // Step 5: Create payments
//       console.log("💰 Creating payment records...");
//       await ctx.runMutation(api.seed.createPayments, { formIds });
      
//       // Step 6: Create application forms status
//       console.log("📋 Creating application form statuses...");
//       await ctx.runMutation(api.seed.createApplicationForms, { userIds, formIds });
      
//       // Step 7: Create orientations for food handlers
//       console.log("🎓 Creating orientations...");
//       await ctx.runMutation(api.seed.createOrientations, { formIds });
      
//       // Step 8: Create health cards for approved applications
//       console.log("💳 Issuing health cards...");
//       const healthCardIds = await ctx.runMutation(api.seed.createHealthCards, { formIds });
      
//       // Step 9: Create notifications
//       console.log("🔔 Creating notifications...");
//       await ctx.runMutation(api.seed.createNotifications, { userIds, formIds });
      
//       // Step 10: Create verification logs
//       console.log("📝 Creating verification logs...");
//       await ctx.runMutation(api.seed.createVerificationLogs, { healthCardIds });
      
//       console.log("✅ Database seeding completed successfully!");
      
//       return {
//         success: true,
//         message: "Database seeded successfully",
//         summary: {
//           users: userIds.length,
//           forms: formIds.length,
//           healthCards: healthCardIds.length
//         }
//       };
//     } catch (error) {
//       console.error("❌ Error during seeding:", error);
//       return {
//         success: false,
//         message: "Error occurred during seeding",
//         error: (error as Error).message
//       };
//     }
//   }
// });

// /**
//  * Clear all data from the database
//  * Usage: npx convex run seed:clear
//  */
// export const clear = mutation({
//   args: {
//     onlyFakeData: v.optional(v.boolean())
//   },
//   handler: async (ctx, args) => {
//     const onlyFakeData = args.onlyFakeData ?? true; // Default to only clearing fake data
//     console.log(`🗑️ Starting database cleanup... (${onlyFakeData ? 'fake data only' : 'all data'})`);
    
//     // Clear tables in reverse dependency order
//     const tables = [
//       "verificationLogs",
//       "notifications",
//       "healthCards",
//       "orientations",
//       "applicationForms",
//       "payments",
//       "requirements",
//       "forms",
//       "documentRequirements",
//       "jobCategory",
//       "users"
//     ];
    
//     let totalDeleted = 0;
//     const deletionSummary: Record<string, number> = {};
    
//     // First, identify test users
//     const testUserIds = new Set<any>();
//     if (onlyFakeData) {
//       const users = await ctx.db.query("users").collect();
//       const testUsers = users.filter(user => 
//         user.clerkId.startsWith("test_") || 
//         user.email.includes("@example.com")
//       );
//       testUsers.forEach(user => testUserIds.add(user._id));
//     }
    
//     for (const tableName of tables) {
//       try {
//         const records = await ctx.db.query(tableName as any).collect();
//         let recordsToDelete = records;
        
//         if (onlyFakeData) {
//           if (tableName === "users") {
//             // Only delete test users
//             recordsToDelete = records.filter(user => testUserIds.has(user._id));
//           } else if (tableName === "forms") {
//             // Only delete forms belonging to test users
//             recordsToDelete = records.filter(form => testUserIds.has(form.userId));
//           } else if (tableName === "jobCategory" || tableName === "documentRequirements") {
//             // Keep job categories and document requirements as they're reference data
//             recordsToDelete = [];
//           } else if (["requirements", "payments", "applicationForms", "orientations", "healthCards"].includes(tableName)) {
//             // Delete only records associated with test user forms
//             const testFormIds = new Set();
//             const forms = await ctx.db.query("forms").collect();
//             forms.filter(form => testUserIds.has(form.userId)).forEach(form => testFormIds.add(form._id));
            
//             recordsToDelete = records.filter(record => testFormIds.has(record.formId));
//           } else if (tableName === "notifications") {
//             // Delete only notifications for test users
//             recordsToDelete = records.filter(notif => testUserIds.has(notif.userId));
//           } else if (tableName === "verificationLogs") {
//             // Delete verification logs for test health cards
//             const testHealthCardIds = new Set();
//             const healthCards = await ctx.db.query("healthCards").collect();
//             const testFormIds = new Set();
//             const forms = await ctx.db.query("forms").collect();
//             forms.filter(form => testUserIds.has(form.userId)).forEach(form => testFormIds.add(form._id));
//             healthCards.filter(card => testFormIds.has(card.formId)).forEach(card => testHealthCardIds.add(card._id));
            
//             recordsToDelete = records.filter(log => testHealthCardIds.has(log.healthCardId));
//           }
//         }
        
//         // Delete the records
//         for (const record of recordsToDelete) {
//           await ctx.db.delete(record._id);
//         }
        
//         deletionSummary[tableName] = recordsToDelete.length;
//         totalDeleted += recordsToDelete.length;
        
//         if (recordsToDelete.length > 0) {
//           console.log(`✅ Cleared ${recordsToDelete.length} records from ${tableName}`);
//         }
//       } catch (error) {
//         console.log(`⚠️ Error clearing ${tableName}:`, error);
//         deletionSummary[tableName] = 0;
//       }
//     }
    
//     console.log(`🧹 Database cleanup completed! Total records deleted: ${totalDeleted}`);
    
//     return {
//       success: true,
//       message: `Database cleared successfully (${onlyFakeData ? 'fake data only' : 'all data'})`,
//       totalDeleted,
//       deletionSummary
//     };
//   }
// });

// // Mutation to setup job categories and document requirements
// export const setupCategories = mutation({
//   args: {},
//   handler: async (ctx) => {
//     const existingCategories = await ctx.db.query("jobCategory").collect();
//     if (existingCategories.length > 0) {
//       console.log("Job categories already exist, skipping...");
//       return;
//     }
    
//     // Create the 3 job categories
//     const categories = [
//       {
//         name: "Food Handler",
//         colorCode: "#FFD700",
//         requireOrientation: "Yes"
//       },
//       {
//         name: "Non-Food Worker",
//         colorCode: "#008000",
//         requireOrientation: "No"
//       },
//       {
//         name: "Skin-to-Skin Contact",
//         colorCode: "#FF69B4",
//         requireOrientation: "No"
//       }
//     ];
    
//     const categoryIds = [];
//     for (const category of categories) {
//       const id = await ctx.db.insert("jobCategory", category);
//       categoryIds.push(id);
//     }
    
//     // Create document requirements for each category
//     const requirements = [
//       // Food Handler Requirements
//       ...["validId", "picture", "chestXrayId", "urinalysisId", "stoolId", "cedulaId"].map((fieldName, index) => ({
//         jobCategoryId: categoryIds[0],
//         name: ["Valid Government ID", "2x2 ID Picture", "Chest X-ray", "Urinalysis", "Stool Examination", "Cedula"][index],
//         description: ["Any valid government-issued ID", "Recent colored 2x2 ID picture", "Recent chest X-ray result", "Complete urinalysis test", "Stool examination result", "Community Tax Certificate"][index],
//         icon: ["card-outline", "camera-outline", "medical-outline", "flask-outline", "analytics-outline", "document-text-outline"][index],
//         required: true,
//         fieldName
//       })),
      
//       // Non-Food Worker Requirements (same base + optional security guard requirements)
//       ...["validId", "picture", "chestXrayId", "urinalysisId", "stoolId", "cedulaId"].map((fieldName, index) => ({
//         jobCategoryId: categoryIds[1],
//         name: ["Valid Government ID", "2x2 ID Picture", "Chest X-ray", "Urinalysis", "Stool Examination", "Cedula"][index],
//         description: ["Any valid government-issued ID", "Recent colored 2x2 ID picture", "Recent chest X-ray result", "Complete urinalysis test", "Stool examination result", "Community Tax Certificate"][index],
//         icon: ["card-outline", "camera-outline", "medical-outline", "flask-outline", "analytics-outline", "document-text-outline"][index],
//         required: true,
//         fieldName
//       })),
//       {
//         jobCategoryId: categoryIds[1],
//         name: "Drug Test",
//         description: "Drug test result (for Security Guards)",
//         icon: "shield-outline",
//         required: false,
//         fieldName: "drugTestId"
//       },
//       {
//         jobCategoryId: categoryIds[1],
//         name: "Neuropsychiatric Test",
//         description: "Neuropsychiatric evaluation (for Security Guards)",
//         icon: "medical-outline",
//         required: false,
//         fieldName: "neuroExamId"
//       },
      
//       // Skin-to-Skin Contact Requirements (base + hepatitis B)
//       ...["validId", "picture", "chestXrayId", "urinalysisId", "stoolId", "cedulaId"].map((fieldName, index) => ({
//         jobCategoryId: categoryIds[2],
//         name: ["Valid Government ID", "2x2 ID Picture", "Chest X-ray", "Urinalysis", "Stool Examination", "Cedula"][index],
//         description: ["Any valid government-issued ID", "Recent colored 2x2 ID picture", "Recent chest X-ray result", "Complete urinalysis test", "Stool examination result", "Community Tax Certificate"][index],
//         icon: ["card-outline", "camera-outline", "medical-outline", "flask-outline", "analytics-outline", "document-text-outline"][index],
//         required: true,
//         fieldName
//       })),
//       {
//         jobCategoryId: categoryIds[2],
//         name: "Hepatitis B Antibody Test",
//         description: "Hepatitis B surface antibody test result",
//         icon: "shield-checkmark-outline",
//         required: true,
//         fieldName: "hepatitisBId"
//       }
//     ];
    
//     for (const req of requirements) {
//       await ctx.db.insert("documentRequirements", req);
//     }
//   }
// });

// // Mutation to create test users
// export const createUsers = mutation({
//   args: {},
//   handler: async (ctx) => {
//     const userIds = [];
    
//     for (let i = 0; i < 10; i++) {
//       const firstName = faker.person.firstName();
//       const lastName = faker.person.lastName();
//       const email = faker.internet.email({ firstName, lastName, provider: 'example.com' });
      
//       const userId = await ctx.db.insert("users", {
//         username: email.split('@')[0],
//         fullname: `${firstName} ${lastName}`,
//         email,
//         image: faker.image.avatar(),
//         gender: faker.helpers.arrayElement(["Male", "Female"]),
//         birthDate: faker.date.birthdate({ min: 18, max: 65, mode: 'age' }).toISOString().split('T')[0],
//         phoneNumber: faker.phone.number('+63 9## ### ####'),
//         clerkId: `test_${faker.string.alphanumeric(20)}`
//       });
      
//       userIds.push(userId);
//     }
    
//     return userIds;
//   }
// });

// // Mutation to create forms
// export const createForms = mutation({
//   args: { userIds: v.array(v.id("users")) },
//   handler: async (ctx, { userIds }) => {
//     const categories = await ctx.db.query("jobCategory").collect();
//     const formIds = [];
    
//     const positions = {
//       "Food Handler": ["Chef", "Cook", "Food Server", "Kitchen Staff", "Barista"],
//       "Non-Food Worker": ["Security Guard", "Office Worker", "Sales Associate", "Cashier", "Janitor"],
//       "Skin-to-Skin Contact": ["Massage Therapist", "Tattoo Artist", "Nail Technician", "Spa Therapist"]
//     };
    
//     const organizations = [
//       "McDonald's Philippines", "Jollibee Foods Corporation", "SM Supermalls",
//       "Ayala Malls", "Security Bank", "BDO Unibank", "Philippine National Bank",
//       "Robinsons Retail Holdings", "Mercury Drug Corporation", "Spa Wellness Center"
//     ];
    
//     // Create at least one form per user
//     for (const userId of userIds) {
//       const category = faker.helpers.arrayElement(categories);
//       const formId = await ctx.db.insert("forms", {
//         userId,
//         applicationType: faker.helpers.arrayElement(["New", "Renew"]),
//         jobCategory: category._id,
//         position: faker.helpers.arrayElement(positions[category.name] || ["General Worker"]),
//         organization: faker.helpers.arrayElement(organizations),
//         civilStatus: faker.helpers.arrayElement(["Single", "Married", "Divorced", "Widowed"])
//       });
      
//       formIds.push(formId);
//     }
    
//     return formIds;
//   }
// });

// // Mutation to create requirements - skipping due to storage constraints
// export const createRequirements = mutation({
//   args: { 
//     formIds: v.array(v.id("forms")),
//     storageId: v.id("_storage")
//   },
//   handler: async (ctx, { formIds, storageId }) => {
//     console.log(`Creating requirements for ${formIds.length} forms using storage ID: ${storageId}`);
    
//     for (const formId of formIds) {
//       const form = await ctx.db.get(formId);
//       if (!form) continue;
      
//       const jobCategory = await ctx.db.get(form.jobCategory);
//       if (!jobCategory) continue;
      
//       // Base requirements for all
//       const requirementData: any = {
//         formId,
//         validId: storageId,
//         picture: storageId,
//         chestXrayId: storageId,
//         urinalysisId: storageId,
//         stoolId: storageId,
//         cedulaId: storageId,
//       };
      
//       // Add job-specific requirements
//       if (jobCategory.name === "Non-Food Worker") {
//         // For some non-food workers (like security guards), add extra requirements
//         if (Math.random() > 0.5) { // 50% chance to be a security guard
//           requirementData.neuroExamId = storageId;
//           requirementData.drugTestId = storageId;
//         }
//       } else if (jobCategory.name === "Skin-to-Skin Contact") {
//         // Pink card requires Hepatitis B test
//         requirementData.hepatitisBId = storageId;
//       }
      
//       await ctx.db.insert("requirements", requirementData);
//     }
    
//     console.log(`Created requirements for ${formIds.length} forms`);
//   }
// });

// // Mutation to create payments
// export const createPayments = mutation({
//   args: { formIds: v.array(v.id("forms")) },
//   handler: async (ctx, { formIds }) => {
//     for (const formId of formIds) {
//       const amount = faker.helpers.arrayElement([50, 55, 60]);
//       const serviceFee = faker.helpers.arrayElement([10, 12, 15]);
      
//       await ctx.db.insert("payments", {
//         formId,
//         amount,
//         serviceFee,
//         netAmount: amount + serviceFee,
//         method: faker.helpers.arrayElement(["Gcash", "Maya", "BaranggayHall", "CityHall"]),
//         referenceNumber: faker.string.alphanumeric({ length: 12, casing: 'upper' }),
//         // receiptId is optional and requires actual storage upload
//         status: faker.helpers.arrayElement(["Pending", "Complete", "Failed"])
//       });
//     }
//   }
// });

// // Mutation to create application forms
// export const createApplicationForms = mutation({
//   args: { 
//     userIds: v.array(v.id("users")),
//     formIds: v.array(v.id("forms"))
//   },
//   handler: async (ctx, { userIds, formIds }) => {
//     for (let i = 0; i < formIds.length; i++) {
//       const status = faker.helpers.arrayElement(["Submitted", "Under Review", "Approved", "Rejected"]);
      
//       await ctx.db.insert("applicationForms", {
//         userId: userIds[i % userIds.length],
//         formId: formIds[i],
//         status,
//         approvedAt: status === "Approved" 
//           ? faker.date.recent({ days: 30 }).getTime() 
//           : faker.date.future().getTime(),
//         remarks: status === "Rejected" 
//           ? faker.helpers.arrayElement(["Missing documents", "Invalid ID", "Expired medical certificate"])
//           : undefined
//       });
//     }
//   }
// });

// // Mutation to create orientations
// export const createOrientations = mutation({
//   args: { formIds: v.array(v.id("forms")) },
//   handler: async (ctx, { formIds }) => {
//     // Get forms with food handler category
//     for (const formId of formIds.slice(0, 5)) { // Create 5 orientations
//       const form = await ctx.db.get(formId);
//       if (!form) continue;
      
//       const jobCategory = await ctx.db.get(form.jobCategory);
//       if (!jobCategory || jobCategory.requireOrientation !== "Yes") continue;
      
//       await ctx.db.insert("orientations", {
//         formId,
//         scheduleAt: faker.date.future({ days: 30 }).getTime(),
//         qrCodeUrl: `https://emedicard.gov.ph/orientation/${faker.string.alphanumeric(20)}`,
//         checkInTime: faker.date.recent({ days: 7 }).getTime(),
//         checkOutTime: faker.date.recent({ days: 7 }).getTime() + (2 * 60 * 60 * 1000) // 2 hours later
//       });
//     }
//   }
// });

// // Mutation to create health cards
// export const createHealthCards = mutation({
//   args: { formIds: v.array(v.id("forms")) },
//   handler: async (ctx, { formIds }) => {
//     const healthCardIds = [];
    
//     // Only create health cards for approved applications
//     const applicationForms = await ctx.db.query("applicationForms").collect();
//     const approvedForms = applicationForms
//       .filter(app => app.status === "Approved")
//       .slice(0, 10); // Create 10 health cards
    
//     for (const appForm of approvedForms) {
//       const issuedDate = faker.date.past({ years: 1 });
//       const expiryDate = new Date(issuedDate);
//       expiryDate.setFullYear(expiryDate.getFullYear() + 1);
      
//       const healthCardId = await ctx.db.insert("healthCards", {
//         formId: appForm.formId,
//         cardUrl: `https://emedicard.gov.ph/cards/${faker.string.alphanumeric(20)}.jpg`,
//         issuedAt: issuedDate.getTime(),
//         expiresAt: expiryDate.getTime(),
//         verificationToken: faker.string.alphanumeric({ length: 32, casing: 'lower' })
//       });
      
//       healthCardIds.push(healthCardId);
//     }
    
//     return healthCardIds;
//   }
// });

// // Mutation to create notifications
// export const createNotifications = mutation({
//   args: { 
//     userIds: v.array(v.id("users")),
//     formIds: v.array(v.id("forms"))
//   },
//   handler: async (ctx, { userIds, formIds }) => {
//     const notificationTypes = ["MissingDoc", "PaymentReceived", "FormApproved", "OrientationScheduled", "CardIssue"];
//     const messages = {
//       MissingDoc: "Please upload missing documents for your health card application.",
//       PaymentReceived: "Your payment has been received and is being processed.",
//       FormApproved: "Congratulations! Your health card application has been approved.",
//       OrientationScheduled: "Your orientation has been scheduled. Please check your email for details.",
//       CardIssue: "Your health card is ready for pickup/download."
//     };
    
//     // Create 10 notifications
//     for (let i = 0; i < 10; i++) {
//       const type = faker.helpers.arrayElement(notificationTypes);
      
//       await ctx.db.insert("notifications", {
//         userId: faker.helpers.arrayElement(userIds),
//         formsId: Math.random() > 0.3 ? faker.helpers.arrayElement(formIds) : undefined,
//         type: type as any,
//         message: messages[type as keyof typeof messages],
//         read: faker.datatype.boolean()
//       });
//     }
//   }
// });

// // Mutation to create verification logs
// export const createVerificationLogs = mutation({
//   args: { healthCardIds: v.array(v.id("healthCards")) },
//   handler: async (ctx, { healthCardIds }) => {
//     // Create 10 verification logs
//     for (let i = 0; i < 10; i++) {
//       if (healthCardIds.length === 0) break;
      
//       await ctx.db.insert("verificationLogs", {
//         healthCardId: faker.helpers.arrayElement(healthCardIds),
//         scannedAt: faker.date.recent({ days: 30 }).getTime(),
//         userAgent: faker.internet.userAgent(),
//         ipAddress: faker.internet.ip()
//       });
//     }
//   }
// });
=======
import { mutation } from "./_generated/server";
import { Id } from "./_generated/dataModel";

export const seedData = mutation({
  args: {},
  handler: async (ctx) => {
    console.log("🔄 Starting database seeding...");

    // 1. Seed Job Categories
    const jobCategories = [
      { name: "Food Handler", colorCode: "#FFD700", requireOrientation: "Yes" },
      { name: "Non-Food Worker", colorCode: "#00FF00", requireOrientation: "No" },
      { name: "Skin-to-Skin Contact Worker", colorCode: "#FF69B4", requireOrientation: "No" },
    ];

    const jobCategoryIds: Record<string, Id<"jobCategory">> = {};
    for (const category of jobCategories) {
      const existing = await ctx.db
        .query("jobCategory")
        .filter((q) => q.eq(q.field("name"), category.name))
        .first();

      if (existing) {
        jobCategoryIds[category.name] = existing._id;
      } else {
        const id = await ctx.db.insert("jobCategory", category);
        jobCategoryIds[category.name] = id;
      }
    }
    console.log(`✅ Seeded ${Object.keys(jobCategoryIds).length} job categories.`);

    // 2. Define Document Types (based on original script)
    const documentTypes = [
      { name: "Valid Government ID", fieldName: "validId", description: "Any valid government-issued ID", icon: "card-outline" },
      { name: "2x2 ID Picture", fieldName: "picture", description: "Recent colored 2x2 ID picture", icon: "camera-outline" },
      { name: "Chest X-ray", fieldName: "chestXrayId", description: "Recent chest X-ray result", icon: "medical-outline" },
      { name: "Urinalysis", fieldName: "urinalysisId", description: "Complete urinalysis test", icon: "flask-outline" },
      { name: "Stool Examination", fieldName: "stoolId", description: "Stool examination result", icon: "analytics-outline" },
      { name: "Cedula", fieldName: "cedulaId", description: "Community Tax Certificate", icon: "document-text-outline" },
      { name: "Drug Test", fieldName: "drugTestId", description: "Drug test result (for Security Guards)", icon: "shield-outline" },
      { name: "Neuropsychiatric Test", fieldName: "neuroExamId", description: "Neuropsychiatric evaluation (for Security Guards)", icon: "medical-outline" },
      { name: "Hepatitis B Antibody Test", fieldName: "hepatitisBId", description: "Hepatitis B surface antibody test result", icon: "shield-checkmark-outline" },
    ];
    
    // Create a map for easy lookup
    const documentTypesMap = new Map(documentTypes.map(doc => [doc.name, doc]));

    // 3. Link Documents to Categories by creating Document Requirements
    const categoryRequirementMap: Record<string, { name: string; required: boolean }[]> = {
      "Food Handler": [
        { name: "Valid Government ID", required: true },
        { name: "2x2 ID Picture", required: true },
        { name: "Chest X-ray", required: true },
        { name: "Urinalysis", required: true },
        { name: "Stool Examination", required: true },
        { name: "Cedula", required: true },
      ],
      "Non-Food Worker": [
        { name: "Valid Government ID", required: true },
        { name: "2x2 ID Picture", required: true },
        { name: "Chest X-ray", required: true },
        { name: "Urinalysis", required: true },
        { name: "Stool Examination", required: true },
        { name: "Cedula", required: true },
        { name: "Drug Test", required: false },
        { name: "Neuropsychiatric Test", required: false },
      ],
      "Skin-to-Skin Contact Worker": [
        { name: "Valid Government ID", required: true },
        { name: "2x2 ID Picture", required: true },
        { name: "Chest X-ray", required: true },
        { name: "Urinalysis", required: true },
        { name: "Stool Examination", required: true },
        { name: "Cedula", required: true },
        { name: "Hepatitis B Antibody Test", required: false },
      ],
    };

    let requirementsCreated = 0;
    for (const [categoryName, reqList] of Object.entries(categoryRequirementMap)) {
      const jobCategoryId = jobCategoryIds[categoryName];
      if (!jobCategoryId) {
        console.warn(`⚠️ Could not find job category ID for "${categoryName}"`);
        continue;
      }

      for (const req of reqList) {
        const docDetails = documentTypesMap.get(req.name);
        if (!docDetails) {
          console.warn(`⚠️ Could not find document details for "${req.name}"`);
          continue;
        }

        // Check if this requirement already exists for this category
        const existingRequirement = await ctx.db
          .query("documentRequirements")
          .withIndex("by_job_category", (q) => q.eq("jobCategoryId", jobCategoryId))
          .filter((q) => q.eq(q.field("fieldName"), docDetails.fieldName))
          .first();

        if (!existingRequirement) {
          await ctx.db.insert("documentRequirements", {
            jobCategoryId,
            name: docDetails.name,
            description: docDetails.description,
            icon: docDetails.icon,
            required: req.required,
            fieldName: docDetails.fieldName,
          });
          requirementsCreated++;
        }
      }
    }
    console.log(`✅ Created ${requirementsCreated} new document requirements.`);

    return {
      message: "✅ Database seed complete",
      categoriesCreated: Object.keys(jobCategoryIds).length,
      requirementsCreated,
    };
  },
});

export const clearSeedData = mutation({
  args: {},
  handler: async (ctx) => {
    // Clear Document Requirements
    const requirements = await ctx.db.query("documentRequirements").collect();
    for (const req of requirements) {
      await ctx.db.delete(req._id);
    }

    // Clear Job Categories
    const categories = await ctx.db.query("jobCategory").collect();
    for (const cat of categories) {
      await ctx.db.delete(cat._id);
    }

    return {
      message: "🧹 Seed data cleared",
      deleted: {
        documentRequirements: requirements.length,
        jobCategories: categories.length,
      },
    };
  },
});
>>>>>>> 05b3e18 (UI Improvement and Bug fixes)
