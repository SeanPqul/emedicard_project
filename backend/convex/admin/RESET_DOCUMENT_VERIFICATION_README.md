# Reset Document Verification - Instructions

## Overview
This script resets the document verification process for a specific application, allowing you to start fresh. This is useful when encountering bugs or needing to reset test runs.

## What It Does
1. ✅ Resets all document uploads to "Pending" status
2. 🗑️ Deletes all rejection history records
3. 🗑️ Deletes all referral history records
4. 🔬 Deletes all lab test findings
5. 📝 Resets application status to "Under Review"
6. 📧 Sends notification to the applicant
7. 📊 Logs the reset action in admin activity logs

---

## Method 1: Using Convex Dashboard (Recommended)

### Steps:
1. **Open Convex Dashboard**
   - Go to: [https://dashboard.convex.dev](https://dashboard.convex.dev)
   - Navigate to your project

2. **Find the Reset Function**
   - Click on "Functions" in the left sidebar
   - Search for: `admin/testResetDocumentVerification`
   - Click on the `runReset` function

3. **Run the Function**
   - In the arguments field, enter:
     ```json
     {
       "applicationId": "ms77es6x9nd3r39pc5n5ghaveh7ve3yd"
     }
     ```
   - Click **"Run"**

4. **Check the Results**
   - You'll see detailed logs in the console
   - The function will return a success message with stats
   - Refresh the Document Verification page in your webadmin

---

## Method 2: Using Node.js Script

### Steps:
1. **Make sure you're in the backend directory**
   ```powershell
   cd "C:\Users\My Pc\Downloads\emediCard_Projectssss\Sean_nakokuha_git\emedicard_project\backend"
   ```

2. **Run the Convex function via CLI**
   ```powershell
   npx convex run admin/testResetDocumentVerification:runReset --arg '{"applicationId":"ms77es6x9nd3r39pc5n5ghaveh7ve3yd"}'
   ```

   Note: You must be logged in as an admin user for this to work.

---

## For Your Specific Application

**Application ID:** `ms77es6x9nd3r39pc5n5ghaveh7ve3yd`
**Applicant:** Seanpaul Lapasanda

### Quick Copy-Paste Commands:

**Convex Dashboard JSON:**
```json
{
  "applicationId": "ms77es6x9nd3r39pc5n5ghaveh7ve3yd"
}
```

**CLI Command:**
```powershell
cd "C:\Users\My Pc\Downloads\emediCard_Projectssss\Sean_nakokuha_git\emedicard_project\backend"
npx convex run admin/testResetDocumentVerification:runReset --arg '{"applicationId":"ms77es6x9nd3r39pc5n5ghaveh7ve3yd"}'
```

---

## Expected Output

When the reset is successful, you'll see:
```
====================================
RESETTING DOCUMENT VERIFICATION
====================================
Application ID: ms77es6x9nd3r39pc5n5ghaveh7ve3yd
Applicant: Seanpaul Lapasanda
Current Status: [Current Status]
====================================

📄 Found X document uploads
  ↻ Resetting: Valid Government ID (Status: Approved → Pending)
  ↻ Resetting: 2×2 ID Picture (Status: Approved → Pending)
  ...
✅ Reset X document uploads to Pending status

🗑️  Found X rejection history records
🗑️  Found X referral history records
🔬 Found X lab test findings
✅ Reset application status to "Under Review"
📧 Sent notification to applicant

====================================
✅ RESET COMPLETE
====================================
Documents Reset: 6
Rejection History Deleted: 0
Referral History Deleted: 0
Lab Findings Deleted: 0
New Status: Under Review
====================================
```

---

## Verification

After running the reset:
1. Go to: `/dashboard/ms77es6x9nd3r39pc5n5ghaveh7ve3yd/doc_verif`
2. All documents should show status: **"Pending"**
3. Application status should be: **"Under Review"**
4. Progress bar should be reset
5. No rejection/referral history should be visible

---

## Troubleshooting

### Error: "Not authorized"
- Make sure you're logged in as an admin
- Check your admin permissions

### Error: "Application not found"
- Double-check the application ID
- Ensure the ID is correct: `ms77es6x9nd3r39pc5n5ghaveh7ve3yd`

### Function not found
- Make sure you've saved the file: `backend/convex/admin/testResetDocumentVerification.ts`
- Restart your Convex dev server if needed:
  ```powershell
  npx convex dev
  ```

---

## Files Created
- ✅ `backend/convex/admin/resetDocumentVerification.ts` - Main reset function
- ✅ `backend/convex/admin/testResetDocumentVerification.ts` - Test script with detailed logging
- ✅ `backend/convex/admin/RESET_DOCUMENT_VERIFICATION_README.md` - This file

---

## Need Help?
If you encounter any issues, check:
1. Convex Dashboard logs
2. Browser console for errors
3. Make sure Convex dev server is running
4. Verify you're logged in as an admin user
