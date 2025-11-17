import { Id } from "../_generated/dataModel";
import { mutation } from "../_generated/server";

/**
 * SAFE FIX: Corrects jobCategoryDocuments relationships
 * 
 * This mutation:
 * 1. ONLY modifies the jobCategoryDocuments table
 * 2. Does NOT touch applications, users, or uploaded documents
 * 3. Clears incorrect links and recreates correct ones
 * 
 * Run this to fix the issue where all documents are assigned to one category
 */
export const fixJobCategoryDocumentsRelationships = mutation({
  args: {},
  handler: async (ctx) => {
    console.log("🔧 Starting jobCategoryDocuments fix...");
    
    // Step 1: Get all job categories
    const allCategories = await ctx.db.query("jobCategories").collect();
    console.log(`📋 Found ${allCategories.length} job categories`);
    
    const jobCategoryMap: Record<string, Id<"jobCategories">> = {};
    for (const category of allCategories) {
      jobCategoryMap[category.name] = category._id;
    }
    
    // Step 2: Get all document types
    const allDocumentTypes = await ctx.db.query("documentTypes").collect();
    console.log(`📄 Found ${allDocumentTypes.length} document types`);
    
    const documentTypeMap: Record<string, Id<"documentTypes">> = {};
    for (const doc of allDocumentTypes) {
      documentTypeMap[doc.name] = doc._id;
    }
    
    // Step 3: CLEAR ALL existing jobCategoryDocuments links
    const existingLinks = await ctx.db.query("jobCategoryDocuments").collect();
    console.log(`🗑️ Clearing ${existingLinks.length} existing links...`);
    
    for (const link of existingLinks) {
      await ctx.db.delete(link._id);
    }
    
    // Step 4: Define CORRECT relationships for each category
    const correctRelationships: Record<string, { name: string; required: boolean }[]> = {
      "Food Category": [
        { name: "Valid Government ID", required: true },
        { name: "1x1 ID Picture", required: true },
        { name: "Chest X-ray", required: true },
        { name: "Urinalysis", required: true },
        { name: "Stool Examination", required: true },
        { name: "Cedula", required: true },
      ],
      "Non-Food Category": [
        { name: "Valid Government ID", required: true },
        { name: "1x1 ID Picture", required: true },
        { name: "Chest X-ray", required: true },
        { name: "Urinalysis", required: true },
        { name: "Stool Examination", required: true },
        { name: "Cedula", required: true },
        { name: "Drug Test", required: false },
        { name: "Neuropsychiatric Test", required: false },
      ],
      "Skin-to-Skin Category": [
        { name: "Valid Government ID", required: true },
        { name: "1x1 ID Picture", required: true },
        { name: "Chest X-ray", required: true },
        { name: "Urinalysis", required: true },
        { name: "Stool Examination", required: true },
        { name: "Cedula", required: true },
        { name: "Hepatitis B Antibody Test", required: false },
      ],
    };
    
    // Step 5: Create CORRECT links
    let createdLinks = 0;
    const linksByCategory: Record<string, number> = {};
    
    for (const [categoryName, documents] of Object.entries(correctRelationships)) {
      const jobCategoryId = jobCategoryMap[categoryName];
      
      if (!jobCategoryId) {
        console.warn(`⚠️ Category not found: ${categoryName}`);
        continue;
      }
      
      linksByCategory[categoryName] = 0;
      
      for (const doc of documents) {
        const documentTypeId = documentTypeMap[doc.name];
        
        if (!documentTypeId) {
          console.warn(`⚠️ Document type not found: ${doc.name}`);
          continue;
        }
        
        await ctx.db.insert("jobCategoryDocuments", {
          jobCategoryId,
          documentTypeId,
          isRequired: doc.required,
        });
        
        createdLinks++;
        linksByCategory[categoryName]++;
      }
    }
    
    console.log("✅ Fix complete!");
    
    return {
      message: "✅ jobCategoryDocuments relationships fixed successfully!",
      summary: {
        oldLinksDeleted: existingLinks.length,
        newLinksCreated: createdLinks,
        breakdown: linksByCategory,
      },
      details: {
        "Food Category": `${linksByCategory["Food Category"] || 0} documents`,
        "Non-Food Category": `${linksByCategory["Non-Food Category"] || 0} documents`,
        "Skin-to-Skin Category": `${linksByCategory["Skin-to-Skin Category"] || 0} documents`,
      }
    };
  },
});
