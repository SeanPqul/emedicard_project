# Phase 2: Lab Test Findings - Implementation Complete

## ✅ What's Been Implemented (Backend)

### 1. **Schema Changes** (`schema.ts`)
- ✅ Added `labTestFindings` table with all fields
- ✅ Updated `healthCards` table with `includedFindings` array
- ✅ Added proper indexes for querying

### 2. **Backend Mutations** (`convex/labFindings/index.ts`)
- ✅ `recordLabFinding` - Record new lab finding (Admin/System Admin)
- ✅ `getLabFindings` - Query findings by application (grouped by test type)
- ✅ `getLabFinding` - Get single finding details
- ✅ `updateLabFinding` - Update existing finding (before card generation)
- ✅ `deleteLabFinding` - Soft delete finding (before card generation)
- ✅ `linkFindingToCard` - Internal mutation to link finding to generated card
- ✅ `getFindingsByReferral` - Get findings linked to a referral
- ✅ `getFindingsSummary` - Quick stats for admin dashboard

### 3. **Reference Data** (`convex/labFindings/referenceData.ts`)
- ✅ `LAB_FINDING_OPTIONS` - Dropdown options for each test type
- ✅ `MONITORING_PERIOD_RECOMMENDATIONS` - Default monitoring periods
- ✅ `FINDING_STATUS_LABELS` - UI labels for statuses
- ✅ `TEST_TYPE_LABELS` - UI labels for test types

### 4. **Health Card Generation Updated** (`generateHealthCard.ts`)
- ✅ Fetches lab findings for application
- ✅ Populates URINALYSIS, X-RAY/SPUTUM, STOOL sections in HTML
- ✅ Stores `includedFindings` array in health card record
- ✅ Links findings back to health card ID
- ✅ Falls back to empty sections if no findings

---

## 🎯 How It Works (Complete Flow)

### **Scenario: Applicant with Medical Finding**

```
Day 1: Admin Reviews Urinalysis Document
  ↓
Sees elevated WBC (Medical Issue ⚠️)
  ↓
Admin creates documentReferralHistory:
  - issueType: "medical_referral"
  - medicalReferralCategory: "elevated_urinalysis"
  - status: "pending"
  - Applicant notified to see Dr. Santos
  
Day 5: Applicant Gets Treatment (external system)

Day 12: Applicant Submits Cleared Medical Certificate
  ↓
Admin Reviews Cleared Document
  ↓
Admin Records Lab Finding (NEW - Phase 2):
  ┌──────────────────────────────────────┐
  │ 🧪 Record Lab Test Finding           │
  │                                       │
  │ Test Type: ● Urinalysis               │
  │ Finding: WBC elevated – Cleared ▼     │
  │ Cleared Date: 2025-11-15              │
  │ Monitoring: 6 months                  │
  │ Retest Due: 2026-05-15                │
  │ Doctor: Dr. Maria Santos              │
  │ ☑ Show on health card                 │
  │ [Save]                                │
  └──────────────────────────────────────┘
  
Backend creates labTestFindings record:
{
  _id: "finding_101",
  applicationId: "app_123",
  testType: "urinalysis",
  findingKind: "WBC elevated – Cleared post-Rx",
  findingStatus: "cleared_with_monitoring",
  clearedDate: 1731628800000,
  monitoringExpiry: 1747785600000, // +6 months
  doctor Name: "Dr. Maria Santos",
  showOnCard: true,
  recordedBy: "admin_user_id"
}

Admin also updates documentReferralHistory:
  status: "cleared"

Day 15: All Documents Approved
  ↓
Admin clicks "Finalize & Approve"
  ↓
Application status → "Approved"
  ↓
Health Card Auto-Generates with Finding:

┌─────────────────────────────────────┐
│ BACK OF HEALTH CARD                 │
├─────────────────────────────────────┤
│ URINALYSIS                          │
├──────┬──────────────┬───────────────┤
│ Date │ Kind         │ Exp Date      │
├──────┼──────────────┼───────────────┤
│11/15 │WBC Cleared   │05/15/26       │  ← POPULATED!
│      │              │               │
└──────┴──────────────┴───────────────┘

Database Updates:
- healthCards.includedFindings: ["finding_101"]
- labTestFindings.healthCardId: "healthcard_456"
```

---

## 📊 Database Schema Details

### **labTestFindings Table**

```typescript
{
  _id: Id<"labTestFindings">,
  
  // Relationships
  applicationId: Id<"applications">,
  healthCardId?: Id<"healthCards">,       // Set after card generation
  referralHistoryId?: Id<"documentReferralHistory">,
  
  // Test Info
  testType: "urinalysis" | "xray_sputum" | "stool",
  findingKind: string,                     // From dropdown
  findingStatus: "cleared_with_monitoring" | "cleared_no_monitoring" | "pending_retest",
  
  // Dates
  clearedDate: number,                     // When applicant passed retest
  monitoringExpiry: number,                // When monitoring period ends
  monitoringPeriodMonths: number,          // 3, 6, or 12
  
  // Medical Context
  doctorName: string,
  treatmentNotes?: string,
  clinicAddress?: string,
  
  // Display
  showOnCard: boolean,
  
  // Audit
  recordedBy: Id<"users">,
  recordedAt: number,
  updatedAt?: number,
  deletedAt?: number,
}
```

---

## 🧪 Testing Instructions

### **Test 1: No Findings (Most Common - 90% of cases)**

```bash
# 1. Create test application
# 2. Upload all documents (no medical issues)
# 3. Admin approves all documents
# 4. Admin clicks "Finalize & Approve"

Expected Result:
✅ Health card generated
✅ Test sections are EMPTY (normal)
✅ No labTestFindings records
✅ healthCards.includedFindings = undefined
```

### **Test 2: One Urinalysis Finding**

```bash
# 1. Create test application
# 2. Upload urinalysis with elevated WBC
# 3. Admin refers document (medical_referral)
# 4. Applicant submits cleared certificate
# 5. Admin records lab finding via Convex Dashboard:

# Run in Dashboard Functions:
labFindings.recordLabFinding({
  applicationId: "<your_app_id>",
  testType: "urinalysis",
  findingKind: "WBC elevated – Cleared post-Rx",
  findingStatus: "cleared_with_monitoring",
  clearedDate: Date.now(),
  monitoringExpiry: Date.now() + (6 * 30 * 24 * 60 * 60 * 1000),
  monitoringPeriodMonths: 6,
  doctorName: "Dr. Maria Santos",
  showOnCard: true
})

# 6. Admin approves all other documents
# 7. Admin clicks "Finalize & Approve"

Expected Result:
✅ Health card generated
✅ URINALYSIS section has 1 populated row
✅ X-RAY and STOOL sections are empty
✅ labTestFindings.healthCardId is set
✅ healthCards.includedFindings = [finding_id]
```

### **Test 3: Multiple Findings**

```bash
# Record 1 urinalysis + 1 stool finding
# Then approve application

Expected Result:
✅ URINALYSIS section: 1 row filled
✅ STOOL section: 1 row filled
✅ X-RAY section: empty
✅ healthCards.includedFindings = [finding1_id, finding2_id]
```

### **Test 4: Finding with showOnCard = false**

```bash
# Record finding with showOnCard: false

Expected Result:
✅ Finding recorded in database
✅ NOT shown on health card (empty section)
✅ NOT in healthCards.includedFindings array
```

---

## 🔍 Verification Checklist

```bash
# After deploying schema, verify:

□ Schema deployed without errors
□ labTestFindings table exists in Dashboard
□ healthCards.includedFindings field visible

# Test recordLabFinding:
□ Can record finding (Admin)
□ Cannot record finding (Applicant) - should error
□ Cannot record on approved application - should error

# Test health card generation:
□ Cards generate with empty sections (no findings)
□ Cards generate with populated sections (with findings)
□ Finding gets healthCardId after generation
□ includedFindings array matches showOnCard findings

# Test update/delete:
□ Can update finding before card generation
□ Cannot update finding after card generation
□ Can delete finding before card generation
□ Cannot delete finding after card generation
```

---

## 🚀 Next Steps (Frontend UI - Not Yet Implemented)

The backend is complete. Frontend UI tasks remaining:

1. **Admin UI Component** - Record Lab Finding Form
2. **Integration** - Add to document verification page
3. **Display** - Show findings list for each application
4. **Edit/Delete** - UI for managing findings before approval

These will be implemented in a separate phase after backend testing is complete.

---

## 📝 API Usage Examples

### **Record Lab Finding (from Convex Dashboard for now)**

```javascript
// Function: labFindings.recordLabFinding
{
  "applicationId": "k17abc123...",
  "testType": "urinalysis",
  "findingKind": "WBC elevated – Cleared post-Rx",
  "findingStatus": "cleared_with_monitoring",
  "clearedDate": 1731628800000,
  "monitoringExpiry": 1747785600000,
  "monitoringPeriodMonths": 6,
  "doctorName": "Dr. Maria Santos",
  "treatmentNotes": "7-day antibiotic course completed",
  "showOnCard": true
}
```

### **Query Findings for Application**

```javascript
// Function: labFindings.getLabFindings
{
  "applicationId": "k17abc123..."
}

// Returns:
{
  "urinalysis": [ {finding1}, {finding2} ],
  "xray_sputum": [],
  "stool": [ {finding3} ],
  "all": [ {finding1}, {finding2}, {finding3} ]
}
```

### **Get Findings Summary**

```javascript
// Function: labFindings.getFindingsSummary
{
  "applicationId": "k17abc123..."
}

// Returns:
{
  "total": 2,
  "showOnCard": 2,
  "byType": {
    "urinalysis": 1,
    "xray_sputum": 0,
    "stool": 1
  },
  "hasFindings": true
}
```

---

## 🐛 Troubleshooting

### **Error: "Cannot add findings to approved application"**
- Findings must be recorded BEFORE approval
- Solution: Ensure admin records findings during document review

### **Error: "Cannot edit finding - health card already generated"**
- Findings are immutable after card generation
- Solution: Delete and recreate if needed (before approval only)

### **Findings not showing on card**
- Check: `showOnCard` field is `true`
- Check: Finding wasn't soft-deleted (`deletedAt` is undefined)
- Check: Health card generation ran successfully

### **Empty sections even with findings**
- Check: Findings were created BEFORE card generation
- Check: Finding.healthCardId is set (means it was included)
- Regenerate card if findings were added after generation

---

## 📈 Performance Notes

- Most applications (90%) have NO findings - system optimized for this
- Empty findings = empty arrays, not null
- Lab findings fetch is optional - card generation continues if fetch fails
- Soft delete preserves audit trail while hiding from queries

---

## ✅ Phase 2 Backend: COMPLETE

All backend functionality is implemented and ready for testing. Frontend UI integration can proceed after backend validation.

**Estimated Testing Time:** 2-3 hours  
**Estimated Frontend Integration:** 3-4 days (separate phase)
