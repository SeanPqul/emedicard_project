# 🔧 Database Fix Instructions - Job Category Documents

## Problem Identified
Currently, **all 21 documents** are incorrectly assigned to a **single job category** (Food Category) in the `jobCategoryDocuments` table. This causes the webadmin to show all documents for every application, regardless of the job category selected.

## Expected Behavior
- **Food Category**: 6 documents (Valid ID, 2x2 Picture, Chest X-ray, Urinalysis, Stool Exam, Cedula)
- **Non-Food Category**: 8 documents (same as Food + Drug Test + Neuropsychiatric Test)
- **Skin-to-Skin Category**: 7 documents (same as Food + Hepatitis B Test)

## What This Fix Does
✅ **SAFE** - Only modifies the `jobCategoryDocuments` table
✅ Does NOT touch:
  - Applications
  - Users
  - Document uploads
  - Health cards
  - Any user data

❌ **NOT SAFE** to run if you have:
  - Active applications in progress (users might lose their document requirements temporarily)

## How to Run the Fix

### Step 1: Backup (Optional but Recommended)
Since this only touches the `jobCategoryDocuments` table, you can export it from Convex dashboard before running the fix.

### Step 2: Run the Fix Mutation

**Option A: Via Convex Dashboard**
1. Open your Convex dashboard: https://dashboard.convex.dev
2. Select your project (tangible-pika-290)
3. Go to "Functions" tab
4. Find `admin/fixJobCategoryDocuments:fixJobCategoryDocumentsRelationships`
5. Click "Run" (no arguments needed)
6. Check the output - should show:
   ```
   {
     "message": "✅ jobCategoryDocuments relationships fixed successfully!",
     "summary": {
       "oldLinksDeleted": 21,
       "newLinksCreated": 21,
       "breakdown": {
         "Food Category": 6,
         "Non-Food Category": 8,
         "Skin-to-Skin Category": 7
       }
     }
   }
   ```

**Option B: Via Terminal (from mobile app directory)**
```bash
cd "C:\Users\My Pc\Downloads\emediCard_Projectssss\Sean_nakokuha_git\emedicard_project\apps\mobile"
npx convex run --dir ../../backend admin/fixJobCategoryDocuments:fixJobCategoryDocumentsRelationships
```

### Step 3: Verify the Fix

1. Go to Convex dashboard → Data → `jobCategoryDocuments` table
2. Filter by each `jobCategoryId` and verify:
   - Food Category has 6 links
   - Non-Food Category has 8 links
   - Skin-to-Skin Category has 7 links

3. Test in webadmin:
   - Open an application with "Food Category"
   - Should show **6 documents** only (not 21)
   - Open an application with "Non-Food Category"  
   - Should show **8 documents** only

## Expected Results

### Before Fix
- `jobCategoryDocuments`: 21 entries (all with same `jobCategoryId`)
- Webadmin shows: 21 documents for every application

### After Fix
- `jobCategoryDocuments`: 21 entries (distributed across 3 categories)
  - Food Category: 6 entries
  - Non-Food Category: 8 entries
  - Skin-to-Skin Category: 7 entries
- Webadmin shows: Only documents for the specific job category

## Rollback Plan
If something goes wrong, you can revert by running the original seed:
```bash
npx convex run --dir ../../backend admin/seed:clearSeedData
npx convex run --dir ../../backend admin/seed:seedJobCategoriesAndRequirements
```

**Note**: This will also clear and recreate job categories and document types, so use with caution if you have existing applications.

## Questions?
If you're unsure about running this, you can:
1. Test in a development/staging environment first
2. Export the `jobCategoryDocuments` table before running
3. Run it during low-traffic hours

## Technical Details
- **File**: `backend/convex/admin/fixJobCategoryDocuments.ts`
- **Function**: `fixJobCategoryDocumentsRelationships`
- **Tables Modified**: `jobCategoryDocuments` only
- **Tables Read**: `jobCategories`, `documentTypes`
