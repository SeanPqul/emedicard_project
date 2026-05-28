# 🧪 Test Data Generation Functions

## Purpose
Generate realistic test data for taking thesis screenshots, especially for the **Renewal Module (Objective 3)**.

---

## 📸 Generate Renewal Test Data

### Function: `generateRenewalTestData`

Creates a complete renewal scenario:
- ✅ Test user: **Maria Garcia Cruz**
- ✅ Initial approved application (1 year ago)
- ✅ **Expired health card** (eligible for renewal)
- ✅ **Renewal application** with "🔄 Renewal" badge
- ✅ Status: "For Document Verification"

### How to Run:

1. **Open Convex Dashboard**
   ```
   Visit: https://dashboard.convex.dev
   ```

2. **Go to your project** → **Functions** tab

3. **Find the function:**
   ```
   testData:generateRenewalTestData
   ```

4. **Click "Run"** (no arguments needed)

5. **Check the result** - you'll see:
   ```json
   {
     "success": true,
     "message": "✅ Renewal test data generated successfully!",
     "data": {
       "userId": "...",
       "userName": "Maria Garcia Cruz",
       "renewalApplicationId": "...",
       "healthCardNumber": "YC-2024-XXXXX"
     }
   }
   ```

### Where to Screenshot:

**INPUT: Health Card Renewal Request**
- Go to: `http://localhost:3000/dashboard`
- Find: "Maria Garcia Cruz" in the applications table
- Look for: **🔄 Renewal** badge next to the status
- Screenshot this row!

**OUTPUT: Renewal Application Processing**
- Click "View" on Maria's application
- You'll see: `/dashboard/[id]/doc_verif`
- This shows the renewal's document verification
- Screenshot the document checklist!

---

## 🧹 Cleanup Test Data

### Function: `cleanupRenewalTestData`

Removes all test renewal data after taking screenshots.

### How to Run:

1. **Open Convex Dashboard** → **Functions**

2. **Find the function:**
   ```
   testData:cleanupRenewalTestData
   ```

3. **Click "Run"** with arguments:
   ```json
   {
     "email": "renewal"
   }
   ```
   *(This will delete all users with "renewal" in their email)*

4. **Check the result:**
   ```json
   {
     "success": true,
     "message": "🧹 Cleanup complete",
     "deleted": {
       "users": 1,
       "applications": 2,
       "healthCards": 1,
       "documents": 2,
       "notifications": 1
     }
   }
   ```

---

## 🎯 What Gets Created

### User
- **Name:** Maria Garcia Cruz
- **Email:** maria.cruz.renewal.[timestamp]@test.com
- **Role:** Applicant
- **Status:** Approved

### Initial Application (Past)
- **Type:** New
- **Status:** Approved
- **Job Category:** Food Category (Yellow Card)
- **Health Card:** Expired (issued 1 year ago)

### Renewal Application (Current)
- **Type:** Renew 🔄
- **Status:** For Document Verification
- **Job Category:** Food Category (Yellow Card)
- **Links to:** Previous expired health card
- **Renewal Count:** 1

---

## ⚠️ Prerequisites

Make sure you've run the seed function first:
```
admin:seedJobCategoriesAndRequirements
```

This creates the job categories and document types needed for the test data.

---

## 📝 Notes

- The function creates **placeholder document uploads** - you may need to upload real images via the UI if you want to see actual documents
- The health card is set to **expired status** to show renewal eligibility
- The renewal application is already in "For Document Verification" status, ready for admin review
- This is perfect for demonstrating the renewal flow in your thesis!

---

## 🚀 Quick Start (Full Workflow)

```bash
# 1. Seed the database (if not done already)
Run: admin:seedJobCategoriesAndRequirements

# 2. Generate renewal test data
Run: testData:generateRenewalTestData

# 3. Take screenshots
Visit: http://localhost:3000/dashboard
Screenshot: Maria Garcia Cruz with renewal badge

# 4. Cleanup (after screenshots)
Run: testData:cleanupRenewalTestData
```

Done! 🎉
