# 🧪 Backend Testing Guide - Phase 1 & 2

**Date:** November 15, 2025  
**Tester:** Backend Team  
**Components:** Dynamic Officials (Phase 1) + Lab Test Findings (Phase 2)

---

## 🚀 **Pre-Test Setup**

### **1. Access Convex Dashboard**
```
1. Open terminal in backend directory
2. Run: npx convex dev
3. Open: http://localhost:3000 (or the URL shown)
4. Click "Dashboard" or open Convex dashboard in browser
```

### **2. Verify Deployment**
```
✅ Check: Schema deployed without errors
✅ Check: No TypeScript errors
✅ Check: All functions visible in Dashboard
```

---

## 📋 **Test Checklist**

### ✅ **Phase 1: Dynamic Officials Management**

#### **Test 1.1: Verify systemConfig Initialization**
**What to test:** Default officials are created

**Steps:**
1. Go to Convex Dashboard → **Data** tab
2. Select `systemConfig` table
3. Look for 2 records:
   ```
   Record 1:
   - key: "city_health_officer"
   - value.name: "Dr. Marjorie D. Culas"
   - value.designation: "City Health Officer II"
   - isActive: true
   
   Record 2:
   - key: "sanitation_chief"
   - value.name: "Luzminda N. Paig"
   - value.designation: "Sanitation Chief"
   - isActive: true
   ```

**Expected Result:** ✅ 2 officials exist with correct data  
**If missing:** Run `systemConfig.initializeDefaultOfficials()` in Functions tab

**Status:** [ ] PASS / [ ] FAIL  
**Notes:**
```
_____________________________________
```

---

#### **Test 1.2: Query Active Officials**
**What to test:** `getActiveOfficials` returns current officials

**Steps:**
1. Go to Dashboard → **Functions** tab
2. Find `systemConfig/getActiveOfficials`
3. Click "Run" (no parameters needed)

**Expected Result:**
```json
[
  {
    "key": "city_health_officer",
    "name": "Dr. Marjorie D. Culas",
    "designation": "City Health Officer II",
    "signatureStorageId": "kg2...",
    "effectiveFrom": 1700000000000
  },
  {
    "key": "sanitation_chief",
    "name": "Luzminda N. Paig",
    "designation": "Sanitation Chief",
    "signatureStorageId": "kg2...",
    "effectiveFrom": 1700000000000
  }
]
```

**Status:** [ ] PASS / [ ] FAIL  
**Notes:**
```
_____________________________________
```

---

#### **Test 1.3: Update Official Details**
**What to test:** Can update official's name/designation

**Steps:**
1. Dashboard → **Functions** → `systemConfig/updateOfficialDetails`
2. Input parameters:
   ```json
   {
     "key": "city_health_officer",
     "updates": {
       "name": "Dr. Test Officer Updated"
     }
   }
   ```
3. Click "Run"
4. Go to **Data** → `systemConfig` and verify:
   - Old record has `isActive: false` and `effectiveTo` date
   - New record created with updated name and `isActive: true`

**Expected Result:** ✅ New record created, old deactivated  
**Rollback:** Run again with original name to restore

**Status:** [ ] PASS / [ ] FAIL  
**Notes:**
```
_____________________________________
```

---

#### **Test 1.4: View Official History**
**What to test:** `getOfficialHistory` shows past officials

**Steps:**
1. Dashboard → **Functions** → `systemConfig/getOfficialHistory`
2. Input: `{ "key": "city_health_officer" }`
3. Click "Run"

**Expected Result:**
```json
[
  {
    "name": "Dr. Test Officer Updated",
    "effectiveFrom": "2025-11-15",
    "effectiveTo": null,
    "isActive": true
  },
  {
    "name": "Dr. Marjorie D. Culas",
    "effectiveFrom": "2024-01-01",
    "effectiveTo": "2025-11-15",
    "isActive": false
  }
]
```

**Status:** [ ] PASS / [ ] FAIL  
**Notes:**
```
_____________________________________
```

---

### ✅ **Phase 2: Lab Test Findings**

#### **Test 2.1: Get Existing Application ID**
**What to test:** Find a valid application for testing

**Steps:**
1. Dashboard → **Data** → `applications` table
2. Find an application with `status: "approved"` or `"pending"`
3. Copy the `_id` (e.g., `"j97abc123..."`)
4. **Note:** If application is already approved, use a pending one

**Application ID for testing:**
```
_____________________________________
```

---

#### **Test 2.2: Record Lab Finding (Urinalysis)**
**What to test:** `recordLabFinding` saves finding correctly

**Steps:**
1. Dashboard → **Functions** → `labFindings/recordLabFinding`
2. Input parameters:
   ```json
   {
     "applicationId": "YOUR_APPLICATION_ID_HERE",
     "testType": "urinalysis",
     "findingKind": "wbc_elevated",
     "clearedDate": "2025-11-15",
     "monitoringMonths": 6,
     "notes": "WBC count 15-20/hpf, cleared post-antibiotic treatment",
     "clearingDoctor": "Dr. Maria Santos",
     "showOnCard": true
   }
   ```
3. Click "Run"

**Expected Result:** Returns finding ID (e.g., `"j98xyz456..."`)

**Status:** [ ] PASS / [ ] FAIL  
**Finding ID:**
```
_____________________________________
```

---

#### **Test 2.3: Record Additional Findings (X-Ray)**
**What to test:** Multiple findings per application

**Steps:**
1. Dashboard → **Functions** → `labFindings/recordLabFinding`
2. Input parameters:
   ```json
   {
     "applicationId": "YOUR_APPLICATION_ID_HERE",
     "testType": "xray_sputum",
     "findingKind": "infiltrates",
     "clearedDate": "2025-11-10",
     "monitoringMonths": 12,
     "notes": "Minimal infiltrates noted, cleared after follow-up",
     "clearingDoctor": "Dr. Juan Dela Cruz",
     "showOnCard": true
   }
   ```
3. Click "Run"

**Expected Result:** Returns second finding ID

**Status:** [ ] PASS / [ ] FAIL  
**Notes:**
```
_____________________________________
```

---

#### **Test 2.4: Query Lab Findings**
**What to test:** `getLabFindings` fetches all findings for application

**Steps:**
1. Dashboard → **Functions** → `labFindings/getLabFindings`
2. Input: `{ "applicationId": "YOUR_APPLICATION_ID_HERE" }`
3. Click "Run"

**Expected Result:**
```json
[
  {
    "_id": "j98xyz456...",
    "testType": "urinalysis",
    "findingKind": "wbc_elevated",
    "findingDisplay": "WBC elevated – Cleared",
    "clearedDate": "2025-11-15T00:00:00.000Z",
    "retestDate": "2026-05-15T00:00:00.000Z",
    "clearingDoctor": "Dr. Maria Santos",
    "showOnCard": true
  },
  {
    "_id": "j99abc789...",
    "testType": "xray_sputum",
    "findingKind": "infiltrates",
    "clearedDate": "2025-11-10T00:00:00.000Z",
    "retestDate": "2026-11-10T00:00:00.000Z",
    "showOnCard": true
  }
]
```

**Status:** [ ] PASS / [ ] FAIL  
**Notes:**
```
_____________________________________
```

---

#### **Test 2.5: Get Findings Summary**
**What to test:** `getFindingsSummary` shows counts

**Steps:**
1. Dashboard → **Functions** → `labFindings/getFindingsSummary`
2. Input: `{ "applicationId": "YOUR_APPLICATION_ID_HERE" }`
3. Click "Run"

**Expected Result:**
```json
{
  "totalFindings": 2,
  "urinalysisCount": 1,
  "xrayCount": 1,
  "stoolCount": 0,
  "hasFindings": true
}
```

**Status:** [ ] PASS / [ ] FAIL  
**Notes:**
```
_____________________________________
```

---

### ✅ **Integration Tests: Health Card Generation**

#### **Test 3.1: Generate Card WITHOUT Findings**
**What to test:** Card generates correctly when no lab findings exist

**Steps:**
1. Find/create an application WITHOUT lab findings
2. Approve the application (via your existing frontend or Dashboard)
3. Check `healthCards` table for the generated card
4. Click the `_id` to view details
5. Check `htmlContent` field:
   - Search for "URINALYSIS" section
   - Search for "X-RAY / SPUTUM" section
   - Search for "STOOL EXAMINATION" section
   - **Verify:** All sections show empty checkboxes, no findings text

**Expected Result:**
```html
<div class="test-section">
  <div class="test-header">URINALYSIS</div>
  <div class="checkbox-item">
    <span class="checkbox">☐</span> Albumin
  </div>
  <div class="checkbox-item">
    <span class="checkbox">☐</span> Sugar
  </div>
  <!-- No findings displayed -->
</div>
```

**Status:** [ ] PASS / [ ] FAIL  
**Card ID:**
```
_____________________________________
```

---

#### **Test 3.2: Generate Card WITH Findings**
**What to test:** Card populates test sections when findings exist

**Steps:**
1. Use the application from Test 2.2 (with 2 findings)
2. If not yet approved, approve it now
3. Check `healthCards` table for the generated card
4. View `htmlContent` field:
   - Search for "URINALYSIS" section
   - **Verify:** Shows "WBC elevated – Cleared" with dates
   - Search for "X-RAY / SPUTUM" section
   - **Verify:** Shows "Infiltrates noted – Cleared" with dates

**Expected Result:**
```html
<div class="test-section">
  <div class="test-header">URINALYSIS</div>
  <div class="finding-entry">
    <div class="finding-label">WBC elevated – Cleared</div>
    <div class="finding-dates">
      <div>Cleared: Nov 15, 2025</div>
      <div>Retest: May 15, 2026</div>
    </div>
    <div class="finding-doctor">Dr. Maria Santos</div>
  </div>
</div>
```

**Status:** [ ] PASS / [ ] FAIL  
**Card ID:**
```
_____________________________________
```

---

#### **Test 3.3: Verify signedBy Snapshot**
**What to test:** Health card stores officials snapshot

**Steps:**
1. Open the health card from Test 3.2
2. Scroll to `signedBy` field
3. Verify it contains:
   ```json
   {
     "cityHealthOfficer": {
       "name": "Dr. Marjorie D. Culas",
       "designation": "City Health Officer II",
       "signatureStorageId": "kg2..."
     },
     "sanitationChief": {
       "name": "Luzminda N. Paig",
       "designation": "Sanitation Chief",
       "signatureStorageId": "kg2..."
     }
   }
   ```

**Expected Result:** ✅ Snapshot matches current officials (or officials at time of generation)

**Status:** [ ] PASS / [ ] FAIL  
**Notes:**
```
_____________________________________
```

---

#### **Test 3.4: Verify includedFindings Array**
**What to test:** Health card links to lab findings

**Steps:**
1. Open the health card from Test 3.2
2. Scroll to `includedFindings` field
3. Verify it contains array of finding IDs:
   ```json
   ["j98xyz456...", "j99abc789..."]
   ```

**Expected Result:** ✅ Array contains IDs of all `showOnCard: true` findings

**Status:** [ ] PASS / [ ] FAIL  
**Notes:**
```
_____________________________________
```

---

#### **Test 3.5: Verify Finding Backlink**
**What to test:** Lab findings link back to health card

**Steps:**
1. Go to `labTestFindings` table
2. Find the findings from Test 2.2 and 2.3
3. Check each finding has `healthCardId` field
4. Verify `healthCardId` matches the card from Test 3.2

**Expected Result:** ✅ All findings have `healthCardId` populated

**Status:** [ ] PASS / [ ] FAIL  
**Notes:**
```
_____________________________________
```

---

## 🔧 **Error Scenarios to Test**

### **Test 4.1: Card Generation Without Officials**
**What to test:** Fallback to signatures table

**Steps:**
1. Temporarily deactivate all officials:
   ```
   Go to systemConfig table
   Set all records: isActive = false
   ```
2. Approve an application
3. Verify card still generates (uses old signatures table)
4. **Rollback:** Reactivate officials

**Expected Result:** ✅ Card generates, no errors

**Status:** [ ] PASS / [ ] FAIL  
**Notes:**
```
_____________________________________
```

---

### **Test 4.2: Card Generation With Findings Fetch Error**
**What to test:** Card generates even if findings query fails

**Steps:**
1. This is automatic - backend handles errors gracefully
2. Check logs for any errors during card generation
3. Verify card still generates with empty test sections

**Expected Result:** ✅ No errors, card still generates

**Status:** [ ] PASS / [ ] FAIL  
**Notes:**
```
_____________________________________
```

---

### **Test 4.3: Recording Finding Without Application**
**What to test:** Validation prevents invalid findings

**Steps:**
1. Dashboard → `labFindings/recordLabFinding`
2. Input: `{ "applicationId": "invalid_id_here", ... }`
3. Click "Run"

**Expected Result:** ❌ Error: "Application not found"

**Status:** [ ] PASS / [ ] FAIL  
**Notes:**
```
_____________________________________
```

---

## 📊 **Test Summary**

### **Results Overview**
```
Phase 1 Tests:
[ ] Test 1.1 - systemConfig Initialization
[ ] Test 1.2 - Get Active Officials
[ ] Test 1.3 - Update Official Details
[ ] Test 1.4 - View Official History

Phase 2 Tests:
[ ] Test 2.1 - Get Application ID
[ ] Test 2.2 - Record Urinalysis Finding
[ ] Test 2.3 - Record X-Ray Finding
[ ] Test 2.4 - Query Lab Findings
[ ] Test 2.5 - Get Findings Summary

Integration Tests:
[ ] Test 3.1 - Card Without Findings
[ ] Test 3.2 - Card With Findings
[ ] Test 3.3 - Verify signedBy Snapshot
[ ] Test 3.4 - Verify includedFindings Array
[ ] Test 3.5 - Verify Finding Backlink

Error Scenarios:
[ ] Test 4.1 - Card Without Officials
[ ] Test 4.2 - Findings Fetch Error
[ ] Test 4.3 - Invalid Application ID
```

### **Overall Status**
- **Total Tests:** 17
- **Passed:** ___
- **Failed:** ___
- **Blocked:** ___

---

## 🐛 **Bug Tracker**

### **Issues Found**
```
1. Issue:
   Test:
   Description:
   Severity: [ ] Critical / [ ] Major / [ ] Minor
   
2. Issue:
   Test:
   Description:
   Severity: [ ] Critical / [ ] Major / [ ] Minor
```

---

## ✅ **Sign-Off**

**Tester:** _________________  
**Date:** _________________  
**Status:** [ ] All tests passed / [ ] Issues found  
**Notes:**
```
________________________________________
________________________________________
```

---

## 📝 **Additional Notes**

### **Performance Observations**
```
- Card generation time: ___ms
- Query response time: ___ms
- Any slowness noticed: ___
```

### **Data Integrity**
```
- All relationships preserved: [ ] Yes / [ ] No
- Audit fields populated: [ ] Yes / [ ] No
- No orphaned records: [ ] Yes / [ ] No
```

### **Next Steps**
```
1. ___________________________________
2. ___________________________________
3. ___________________________________
```

---

**END OF TESTING GUIDE**
