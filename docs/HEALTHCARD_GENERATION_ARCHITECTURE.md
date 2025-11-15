# Health Card Generation Architecture & Lab Findings System
## 📋 Comprehensive Planning Document

**Created:** November 15, 2025  
**Version:** 1.0  
**Status:** Planning & Analysis Phase  
**Author:** Senior Full-Stack Architecture Team

---

## 🎯 Executive Summary

This document outlines the architectural design for the **Health Card Generation System** with integrated **Laboratory Findings Management**. The system addresses three critical problems:

1. **Official Signature Management** - Making health card signatories configurable instead of hardcoded
2. **Laboratory Findings Tracking** - Recording medical test results on health cards for public health compliance
3. **Role-Based Generation Control** - Defining who can generate, regenerate, and manage health cards

---

## 🚨 Problem Statement

### **Current State Issues**

#### Problem 1: Hardcoded Officials
```typescript
// Current: generateHealthCard.ts (Lines 545-559)
<div class="signatory-name">Luzminda N. Paig</div>
<div class="signatory-title">Sanitation Chief</div>

<div class="bottom-official-name">Dr. Marjorie D. Culas</div>
<div class="bottom-official-title">City Health Officer</div>
```

**Issues:**
- ❌ When officials change, requires code deployment
- ❌ No historical accuracy (old cards show new officials' names)
- ❌ No audit trail of who signed what
- ❌ Cannot preview cards with new official names before deployment

#### Problem 2: No Lab Findings on Health Cards
```
Current health card back side:
┌──────────────────────────────────┐
│ URINALYSIS                       │
├──────────┬──────────┬────────────┤
│ Date     │ Kind     │ Exp Date   │
├──────────┼──────────┼────────────┤
│          │          │            │ ← Empty (unused)
│          │          │            │ ← Empty (unused)
└──────────┴──────────┴────────────┘
```

**Issues:**
- ❌ Medical referrals are tracked but outcomes don't appear on cards
- ❌ Employers/inspectors can't see monitoring requirements
- ❌ No way to enforce periodic retests (e.g., TB follow-up)
- ❌ Doesn't align with Philippine DOH standards (reference file shows these should be populated)

#### Problem 3: Unclear Generation Authority
```
Current flow:
Admin/System Admin approves → Health card auto-generates
```

**Questions:**
- ⁉️ Who can manually regenerate cards?
- ⁉️ Who updates official names/signatures?
- ⁉️ Can regular admins retrieve generated cards?
- ⁉️ What happens when signatures change?

---

## 🏗️ Proposed Architecture

### **Three-Tier System Design**

```
┌─────────────────────────────────────────────────────────────────┐
│                    SYSTEM CONFIGURATION LAYER                    │
│  (System Admin Only - Manages Officials & System Settings)      │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────────────┐
│                  HEALTH CARD GENERATION LAYER                    │
│    (Auto-triggered on Approval + Manual Admin Retrieval)        │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────────────┐
│                  LAB FINDINGS MANAGEMENT LAYER                   │
│        (Admins Record Findings During Document Review)          │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔐 Role-Based Access Control (RBAC) Matrix

| Action | System Admin | Admin | Inspector | Applicant |
|--------|-------------|-------|-----------|-----------|
| **Configure Officials** | ✅ Full Control | ❌ No | ❌ No | ❌ No |
| **Upload Signatures** | ✅ Yes | ❌ No | ❌ No | ❌ No |
| **Approve Applications** | ✅ Yes | ✅ Yes | ❌ No | ❌ No |
| **Auto-Generate Cards** | ✅ (on approval) | ✅ (on approval) | ❌ No | ❌ No |
| **Manually Regenerate** | ✅ Yes | ❌ No | ❌ No | ❌ No |
| **Retrieve/Download Cards** | ✅ Yes | ✅ Yes | ❌ No | ✅ Own Only |
| **Record Lab Findings** | ✅ Yes | ✅ Yes | ❌ No | ❌ No |
| **View Lab Findings** | ✅ All | ✅ Own Category | ✅ On Scan | ✅ Own Only |
| **Scan/Verify Cards** | ✅ Yes | ✅ Yes | ✅ Yes | ❌ No |

---

## 📊 Database Schema Design

### **1. New Table: `systemConfig`**

**Purpose:** Store configurable system settings (officials, signatures, etc.)

```typescript
// backend/convex/schema.ts

systemConfig: defineTable({
  // Configuration Key (unique identifier)
  key: v.string(), // "city_health_officer", "sanitation_chief"
  
  // Official Information
  value: v.object({
    name: v.string(), // "Dr. Maria Santos"
    designation: v.string(), // "City Health Officer"
    signatureStorageId: v.optional(v.id("_storage")),
    isActive: v.boolean(), // Is this the current official?
    effectiveFrom: v.float64(), // When they took office
    effectiveTo: v.optional(v.float64()), // When they stepped down (null = current)
  }),
  
  // Audit Trail
  updatedAt: v.float64(),
  updatedBy: v.id("users"), // System Admin who made the change
  notes: v.optional(v.string()), // "Appointed per City Order No. 2025-123"
  
  // Change History (for major updates)
  changeReason: v.optional(v.string()), // "Official retirement", "New appointment"
})
  .index("by_key", ["key"])
  .index("by_key_active", ["key", "value.isActive"]) // Fast lookup for current officials
  .index("by_effective_date", ["key", "value.effectiveFrom"]), // Historical queries
```

**Sample Data:**
```json
{
  "_id": "config_001",
  "key": "city_health_officer",
  "value": {
    "name": "Dr. Marjorie D. Culas",
    "designation": "City Health Officer",
    "signatureStorageId": "storage_abc123",
    "isActive": true,
    "effectiveFrom": 1609459200000, // Jan 1, 2021
    "effectiveTo": null // Still current
  },
  "updatedAt": 1609459200000,
  "updatedBy": "sysadmin_user_id",
  "notes": "Initial system configuration"
}
```

---

### **2. New Table: `labTestFindings`**

**Purpose:** Store laboratory test results that appear on health cards

```typescript
// backend/convex/schema.ts

labTestFindings: defineTable({
  // Core References
  applicationId: v.id("applications"),
  healthCardId: v.optional(v.id("healthCards")), // Linked when card is generated
  documentReferralId: v.optional(v.id("documentReferralHistory")), // Links back to referral workflow
  
  // Test Type
  testType: v.union(
    v.literal("urinalysis"),
    v.literal("xray_sputum"),
    v.literal("stool"),
    v.literal("hepatitis_test"),
    v.literal("drug_test"),
    v.literal("neuro_exam")
  ),
  
  // Finding Details (What appears on health card)
  findingKind: v.string(), // e.g., "WBC elevated – Cleared post-Rx" (from reference list)
  findingStatus: v.union(
    v.literal("cleared"),                 // Issue resolved, no follow-up needed
    v.literal("cleared_with_monitoring"), // Cleared but requires periodic retest
    v.literal("on_treatment"),            // Currently undergoing treatment
    v.literal("for_followup"),            // Scheduled follow-up required
    v.literal("refer_specialist")         // Needs specialist consultation
  ),
  
  // Health Card Display Dates
  testDate: v.float64(),          // When the test was performed (cleared test date)
  expiryDate: v.optional(v.float64()), // When next retest is due (if monitoring required)
  
  // Medical Details (Backend only - not printed on card)
  originalFinding: v.optional(v.string()),   // "WBC: 15-20/hpf (normal: 0-5)"
  treatmentGiven: v.optional(v.string()),    // "Antibiotics - Amoxicillin 500mg x7 days"
  doctorName: v.optional(v.string()),        // "Dr. Maria Santos"
  doctorNotes: v.optional(v.string()),       // "Retest in 6 months to confirm clearance"
  
  // Admin Tracking
  recordedBy: v.id("users"),     // Admin who recorded this finding
  recordedAt: v.float64(),
  
  // Health Card Display Control
  showOnCard: v.boolean(),              // Whether to print on health card (default: true for cleared)
  cardDisplayOrder: v.optional(v.float64()), // Order in test section (1st row, 2nd row)
})
  .index("by_application", ["applicationId"])
  .index("by_health_card", ["healthCardId"])
  .index("by_test_type", ["testType", "findingStatus"])
  .index("by_expiry", ["expiryDate"]) // For automated expiry notifications
  .index("by_referral", ["documentReferralId"]), // Link back to referral workflow
```

**Sample Data:**
```json
{
  "_id": "finding_101",
  "applicationId": "app_abc123",
  "healthCardId": "card_xyz789",
  "documentReferralId": "referral_456",
  "testType": "urinalysis",
  "findingKind": "WBC elevated – Cleared post-Rx",
  "findingStatus": "cleared_with_monitoring",
  "testDate": 1731628800000, // Nov 15, 2025
  "expiryDate": 1747180800000, // May 15, 2026
  "originalFinding": "WBC: 15-20/hpf",
  "treatmentGiven": "Antibiotics - 7 days",
  "doctorName": "Dr. Maria Santos",
  "doctorNotes": "Retest in 6 months",
  "showOnCard": true,
  "cardDisplayOrder": 1,
  "recordedBy": "admin_user_id",
  "recordedAt": 1731628800000
}
```

---

### **3. Update Existing: `healthCards` Table**

**Add fields to track which officials signed the card**

```typescript
healthCards: defineTable({
  // ... existing fields (applicationId, registrationNumber, etc.)
  
  // NEW: Snapshot of Officials at Time of Issuance
  signedBy: v.object({
    cityHealthOfficer: v.object({
      name: v.string(),
      designation: v.string(),
      signatureUrl: v.optional(v.string()), // URL at time of generation
      configId: v.optional(v.id("systemConfig")), // Links to config record
    }),
    sanitationChief: v.object({
      name: v.string(),
      designation: v.string(),
      signatureUrl: v.optional(v.string()),
      configId: v.optional(v.id("systemConfig")),
    }),
  }),
  
  // NEW: Lab Findings Snapshot (IDs of findings included on this card)
  includedFindings: v.optional(v.array(v.id("labTestFindings"))),
  
  // ... rest of existing fields
})
  .index("by_application", ["applicationId"])
  .index("by_registration", ["registrationNumber"])
  .index("by_status", ["status"]),
```

**Why Snapshot Officials?**
- ✅ **Historical Accuracy**: Old cards always show who was in office when issued
- ✅ **Audit Compliance**: Can verify signatures even after officials change
- ✅ **Immutable Records**: Cards don't "break" when new officials are appointed

---

## 🔄 System Flow Analysis

### **Flow 1: Initial Setup (System Admin) - ONE TIME**

```
┌─────────────────────────────────────────────────────────────────┐
│ STEP 1: System Admin Configures Officials                       │
├─────────────────────────────────────────────────────────────────┤
│ System Admin logs in → Navigates to "System Configuration"      │
│                                                                  │
│ Uploads signatures:                                              │
│ - City Health Officer signature (PNG/JPG)                       │
│ - Sanitation Chief signature (PNG/JPG)                          │
│                                                                  │
│ Fills in official details:                                       │
│ ┌──────────────────────────────────────────────────────────────┐│
│ │ Position: City Health Officer                                ││
│ │ Name: Dr. Marjorie D. Culas                                  ││
│ │ Designation: City Health Officer                             ││
│ │ Effective From: January 1, 2021                              ││
│ │ Notes: Initial appointment per City Order No. 2021-001       ││
│ │ [Upload Signature]                                           ││
│ │ [Save Configuration]                                         ││
│ └──────────────────────────────────────────────────────────────┘│
│                                                                  │
│ System creates systemConfig records:                             │
│ - key: "city_health_officer" → Dr. Culas                        │
│ - key: "sanitation_chief" → Luzminda N. Paig                    │
│                                                                  │
│ ✅ Officials are now configurable (no code changes needed)      │
└─────────────────────────────────────────────────────────────────┘
```

---

### **Flow 2: Application Approval with Lab Findings (Admin/System Admin)**

```
┌─────────────────────────────────────────────────────────────────┐
│ STEP 1: Application Submitted                                   │
├─────────────────────────────────────────────────────────────────┤
│ Applicant uploads documents:                                     │
│ - Urinalysis, Chest X-ray, Stool exam, etc.                    │
│                                                                  │
│ Application status: "For Document Verification"                  │
└─────────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────────┐
│ STEP 2: Admin Reviews Documents                                 │
├─────────────────────────────────────────────────────────────────┤
│ Admin opens application in dashboard                             │
│ Reviews urinalysis document → Sees: "WBC: 15-20/hpf (elevated)" │
│                                                                  │
│ Admin clicks: "Refer for Medical Management"                     │
│ Selects: "Elevated Urinalysis"                                  │
│ Enters: Doctor name, clinic address                             │
│                                                                  │
│ System creates documentReferralHistory:                          │
│ {                                                                │
│   issueType: "medical_referral",                                │
│   medicalReferralCategory: "elevated_urinalysis",               │
│   status: "pending",                                            │
│   referredAt: [timestamp]                                       │
│ }                                                                │
│                                                                  │
│ Application status → "Referred for Medical Management"           │
│ Notification sent to applicant                                   │
└─────────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────────┐
│ STEP 3: Applicant Gets Treatment                                │
├─────────────────────────────────────────────────────────────────┤
│ Applicant visits doctor → Gets antibiotics → Takes medication   │
│ Gets new urinalysis test → Results show normal WBC              │
│ Doctor writes clearance letter with note:                       │
│ "WBC now normal. Recommend retest in 6 months."                 │
│                                                                  │
│ Applicant uploads:                                               │
│ - New urinalysis document (cleared)                             │
│ - Doctor clearance letter                                       │
│                                                                  │
│ System updates referral:                                         │
│ { status: "resubmitted", replacedAt: [timestamp] }              │
│                                                                  │
│ Application status → "For Document Verification" (again)         │
│ Admin notification: "New documents resubmitted"                  │
└─────────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────────┐
│ STEP 4: Admin Reviews Cleared Documents + Records Finding       │
├─────────────────────────────────────────────────────────────────┤
│ Admin reviews new urinalysis → Sees normal results              │
│ Reads doctor clearance → Notes 6-month retest recommendation    │
│                                                                  │
│ Admin does TWO actions:                                          │
│                                                                  │
│ A) Updates documentReferralHistory:                              │
│    { status: "cleared", clearedAt: [timestamp] }                │
│                                                                  │
│ B) Opens "Record Lab Finding" form:                             │
│    ┌───────────────────────────────────────────────────────────┐│
│    │ Test Type: Urinalysis                                     ││
│    │ Finding: [Dropdown] WBC elevated – Cleared post-Rx        ││
│    │ Test Date: November 15, 2025                              ││
│    │ Expiry Date: May 15, 2026 (6 months)                      ││
│    │ Treatment: Antibiotics - 7 days                           ││
│    │ Doctor: Dr. Maria Santos                                  ││
│    │ Notes: Retest in 6 months to confirm clearance           ││
│    │ ☑ Show on health card                                     ││
│    │ [Save Finding]                                            ││
│    └───────────────────────────────────────────────────────────┘│
│                                                                  │
│ System creates labTestFindings record (see schema above)         │
│                                                                  │
│ All other documents approved → Admin clicks "Finalize & Approve"│
│ Application status → "Approved"                                  │
└─────────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────────┐
│ STEP 5: AUTO Health Card Generation (System)                    │
├─────────────────────────────────────────────────────────────────┤
│ Triggered by: Application approval (finalizeApplication.ts)     │
│                                                                  │
│ 1. Fetch current officials from systemConfig:                   │
│    const officials = await getActiveOfficials(ctx);             │
│    // Returns: city_health_officer, sanitation_chief           │
│                                                                  │
│ 2. Fetch lab findings for this application:                     │
│    const findings = await getLabFindings(ctx, applicationId);   │
│    // Returns: 1 urinalysis finding                            │
│                                                                  │
│ 3. Generate registration number:                                │
│    const regNumber = "000123-25"                                │
│                                                                  │
│ 4. Generate HTML with populated sections:                       │
│    - Front: Applicant info + official signatures                │
│    - Back: Lab findings populated in test sections              │
│                                                                  │
│ 5. Store in healthCards table with snapshots:                   │
│    {                                                             │
│      applicationId, registrationNumber, htmlContent,            │
│      signedBy: {                                                │
│        cityHealthOfficer: { name: "Dr. Culas", ... },          │
│        sanitationChief: { name: "Luzminda N. Paig", ... }      │
│      },                                                          │
│      includedFindings: ["finding_101"],                         │
│      status: "active"                                           │
│    }                                                             │
│                                                                  │
│ 6. Link finding to health card:                                 │
│    await db.patch(findingId, { healthCardId })                  │
│                                                                  │
│ ✅ Health card generated automatically                           │
│ ✅ Notification sent to applicant                                │
└─────────────────────────────────────────────────────────────────┘
```

---

### **Flow 3: Official Change (System Admin) - WHEN OFFICIALS CHANGE**

```
┌─────────────────────────────────────────────────────────────────┐
│ SCENARIO: New City Health Officer Appointed                     │
├─────────────────────────────────────────────────────────────────┤
│ System Admin logs in → "System Configuration" page              │
│                                                                  │
│ Sees current official:                                           │
│ ┌──────────────────────────────────────────────────────────────┐│
│ │ ✓ City Health Officer (Active)                               ││
│ │ Name: Dr. Marjorie D. Culas                                  ││
│ │ Effective: Jan 1, 2021 - Present                             ││
│ │ [View History] [Replace Official]                            ││
│ └──────────────────────────────────────────────────────────────┘│
│                                                                  │
│ Clicks "Replace Official" → Opens form:                         │
│ ┌──────────────────────────────────────────────────────────────┐│
│ │ New Official Details:                                         ││
│ │ Name: Dr. Jane Doe                                           ││
│ │ Designation: City Health Officer                             ││
│ │ Effective From: January 1, 2026                              ││
│ │ Change Reason: New appointment per City Order No. 2025-456   ││
│ │ Notes: Previous officer retired                              ││
│ │ [Upload New Signature]                                       ││
│ │ [Save Changes]                                               ││
│ └──────────────────────────────────────────────────────────────┘│
│                                                                  │
│ System does TWO operations:                                      │
│                                                                  │
│ 1. Updates OLD official record:                                 │
│    {                                                             │
│      key: "city_health_officer",                                │
│      value: {                                                   │
│        name: "Dr. Marjorie D. Culas",                           │
│        isActive: false, ← CHANGED                               │
│        effectiveFrom: 1609459200000,                            │
│        effectiveTo: 1735689600000 ← SET (Jan 1, 2026)          │
│      }                                                           │
│    }                                                             │
│                                                                  │
│ 2. Creates NEW official record:                                 │
│    {                                                             │
│      key: "city_health_officer",                                │
│      value: {                                                   │
│        name: "Dr. Jane Doe",                                    │
│        isActive: true, ← NEW OFFICIAL                           │
│        effectiveFrom: 1735689600000, // Jan 1, 2026            │
│        effectiveTo: null // Currently active                    │
│      },                                                          │
│      changeReason: "New appointment",                           │
│      notes: "Previous officer retired"                          │
│    }                                                             │
│                                                                  │
│ ✅ Old health cards still show "Dr. Culas" (historical accuracy)│
│ ✅ New health cards will show "Dr. Jane Doe" (current official) │
│ ✅ No code deployment needed                                     │
└─────────────────────────────────────────────────────────────────┘
```

---

### **Flow 4: Manual Regeneration (System Admin Only)**

```
┌─────────────────────────────────────────────────────────────────┐
│ SCENARIO: Card Lost/Damaged - Need Reissue                      │
├─────────────────────────────────────────────────────────────────┤
│ Applicant contacts support: "Lost my health card"               │
│ Admin escalates to System Admin                                  │
│                                                                  │
│ System Admin → Searches application                              │
│ Opens application details → Sees existing health card            │
│                                                                  │
│ ┌──────────────────────────────────────────────────────────────┐│
│ │ Health Card Status                                            ││
│ │ Registration: 000123-25                                       ││
│ │ Issued: Nov 15, 2025                                          ││
│ │ Status: Active                                                ││
│ │                                                                ││
│ │ [View Card] [Download PDF] [Revoke] [🔄 Regenerate]          ││
│ └──────────────────────────────────────────────────────────────┘│
│                                                                  │
│ Clicks "🔄 Regenerate" → Confirmation dialog:                    │
│ ┌──────────────────────────────────────────────────────────────┐│
│ │ ⚠️ Regenerate Health Card?                                    ││
│ │                                                                ││
│ │ This will:                                                     ││
│ │ • Create a new card with same registration number             ││
│ │ • Use CURRENT officials' signatures                           ││
│ │ • Preserve existing lab findings                              ││
│ │ • Mark old card as superseded                                 ││
│ │                                                                ││
│ │ Reason: [Lost/Damaged/Correction/Other]                       ││
│ │ Notes: ________________________________                        ││
│ │                                                                ││
│ │ [Cancel] [Confirm Regeneration]                               ││
│ └──────────────────────────────────────────────────────────────┘│
│                                                                  │
│ On confirm:                                                      │
│ 1. Old card marked as superseded (not revoked)                  │
│ 2. New card generated with current officials                     │
│ 3. Admin activity logged                                         │
│ 4. Applicant notified                                            │
│                                                                  │
│ ✅ New card available for download                               │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎛️ Implementation Plan

### **Phase 1: System Configuration (Foundation)**
**Timeline:** 3-4 days  
**Owner:** Backend + System Admin UI

#### Tasks:
1. ✅ **Schema Changes**
   - Add `systemConfig` table
   - Add `signedBy` field to `healthCards`
   - Deploy schema to Convex

2. ✅ **Backend Mutations**
   - `createOrUpdateOfficial(key, value)` - System Admin only
   - `getActiveOfficials()` - Query current officials
   - `getOfficialHistory(key)` - View past officials

3. ✅ **System Admin UI** (Web Admin)
   - System Configuration page (`/super-admin/system-config`)
   - Official management form (add/edit)
   - Signature upload component
   - History viewer

4. ✅ **Update Health Card Generation**
   - Fetch officials from `systemConfig` instead of hardcoded
   - Store `signedBy` snapshot in health cards
   - Update HTML template to use dynamic officials

**Deliverables:**
- Officials are configurable via UI
- Health cards use dynamic signatures
- Historical accuracy maintained

---

### **Phase 2: Lab Findings System (Core Feature)**
**Timeline:** 5-6 days  
**Owner:** Backend + Admin UI

#### Tasks:
1. ✅ **Schema Changes**
   - Add `labTestFindings` table
   - Add `includedFindings` to `healthCards`
   - Deploy schema

2. ✅ **Backend Mutations**
   - `recordLabFinding(applicationId, findingData)` - Admin/System Admin
   - `updateLabFinding(findingId, updates)` - Edit existing
   - `deleteLabFinding(findingId)` - Soft delete
   - `getLabFindings(applicationId)` - Query findings

3. ✅ **Admin UI Components** (Web Admin)
   - Lab Finding Recorder form
   - Dropdown with reference list (from text file)
   - Date pickers (test date, expiry date)
   - Preview health card with findings
   - Findings list view (edit/delete)

4. ✅ **Update Health Card Generation**
   - Fetch lab findings for application
   - Populate test sections in HTML template
   - Link findings to generated card
   - Show findings on card back

5. ✅ **Reference Data Setup**
   - Import finding types from text file
   - Create `labFindingTypes` lookup table (optional)
   - Categorize by test type

**Deliverables:**
- Admins can record lab findings
- Findings appear on health cards
- Findings linked to referral workflow

---

### **Phase 3: Manual Regeneration (System Admin)**
**Timeline:** 2-3 days  
**Owner:** Backend + System Admin UI

#### Tasks:
1. ✅ **Backend Mutations**
   - `regenerateHealthCard(applicationId, reason)` - System Admin only
   - Mark old card as superseded
   - Use current officials for new card
   - Preserve lab findings

2. ✅ **System Admin UI**
   - Regenerate button in application view
   - Confirmation dialog with reason selection
   - Card version history viewer

3. ✅ **Audit Logging**
   - Log all regenerations
   - Track who, when, why
   - Link old/new cards

**Deliverables:**
- System Admin can regenerate cards
- Full audit trail
- Version history maintained

---

### **Phase 4: Automated Monitoring & Alerts**
**Timeline:** 3-4 days  
**Owner:** Backend + Notification System

#### Tasks:
1. ✅ **Scheduled Jobs**
   - Daily cron: Check expiring findings (30 days before)
   - Send retest reminders to applicants
   - Send alerts to admins

2. ✅ **Inspector Scan Enhancements**
   - Show expiry dates on scan
   - Flag expired findings
   - Show monitoring status

3. ✅ **Notification Templates**
   - "Your urinalysis retest is due in 30 days"
   - "Finding expired - card may be suspended"

**Deliverables:**
- Automated retest reminders
- Expiry tracking system
- Inspector can see monitoring status

---

## 📝 API Endpoints Summary

### **System Admin Only**

```typescript
// Configure Officials
api.systemConfig.setOfficial({
  key: "city_health_officer",
  name: "Dr. Jane Doe",
  designation: "City Health Officer",
  signatureStorageId: "...",
  effectiveFrom: Date.now(),
  notes: "New appointment"
})

// Regenerate Card
api.healthCards.regenerate({
  applicationId: "...",
  reason: "lost",
  notes: "Applicant reported lost card"
})
```

### **Admin/System Admin**

```typescript
// Record Lab Finding
api.labFindings.record({
  applicationId: "...",
  testType: "urinalysis",
  findingKind: "WBC elevated – Cleared post-Rx",
  findingStatus: "cleared_with_monitoring",
  testDate: Date.now(),
  expiryDate: Date.now() + (6 * 30 * 24 * 60 * 60 * 1000), // 6 months
  doctorName: "Dr. Santos",
  showOnCard: true
})

// Approve Application (triggers auto-generation)
api.admin.finalizeApplication({
  applicationId: "...",
  newStatus: "Approved"
})
```

### **All Users**

```typescript
// Get Health Card (applicant sees own only)
api.healthCards.getByApplication(applicationId)

// Download PDF
api.healthCards.downloadPDF(healthCardId)
```

---

## 🚨 Critical Decisions Needed

### **Decision 1: Who Can Record Lab Findings?**

**Option A: Admins + System Admin** (Recommended ✅)
- ✅ Faster workflow (admin records during document review)
- ✅ Admin has medical knowledge to interpret findings
- ❌ Requires training admins

**Option B: System Admin Only**
- ✅ Stricter control
- ❌ Bottleneck (all findings go through one person)
- ❌ Slower turnaround time

**Recommendation:** Option A with audit logging

---

### **Decision 2: When Are Findings Recorded?**

**Option A: During Document Review** (Recommended ✅)
```
Admin reviews cleared documents → Records finding → Approves application → Card auto-generates
```
- ✅ Single workflow, no separate step
- ✅ Faster processing

**Option B: After Approval**
```
Admin approves → Card generates blank → Admin manually adds findings later
```
- ❌ Two-step process
- ❌ Cards issued without findings initially

**Recommendation:** Option A (record before approval)

---

### **Decision 3: Inspector Role in Lab Findings?**

**Current:** Inspectors cannot record findings (only scan/verify)

**Question:** Should inspectors be able to:
- View findings during scan? ✅ YES (public health info)
- Flag expired findings? ✅ YES (enforcement)
- Record new findings? ❌ NO (not their role)

**Recommendation:** Read-only access for inspectors

---

## 🔒 Security Considerations

### **1. Official Signature Access**
- ✅ Signatures stored in Convex storage (secure)
- ✅ Only System Admin can upload/change
- ✅ URLs are signed (time-limited access)
- ⚠️ Consider watermarking signatures

### **2. Lab Finding Privacy**
- ✅ Findings shown on card are public (by design)
- ✅ Detailed medical notes stay in backend only
- ⚠️ Doctor names visible (consider making optional)

### **3. Card Regeneration**
- ✅ System Admin only
- ✅ Full audit trail
- ✅ Reason required
- ⚠️ Rate limit (prevent abuse)

---

## 📊 Success Metrics

### **After Implementation:**

1. **Configuration Flexibility**
   - ✅ Can change officials without code deployment
   - ✅ <5 minutes to update signature

2. **Lab Findings Usage**
   - Target: 30% of applications have findings
   - Track: Finding types distribution
   - Monitor: Retest compliance rate

3. **Card Generation**
   - Auto-generation success rate: >99%
   - Manual regenerations: <5% of total cards
   - Average generation time: <10 seconds

4. **User Satisfaction**
   - Admin feedback: Easier to manage officials
   - Applicant feedback: Clear retest instructions
   - Inspector feedback: Better monitoring visibility

---

## 🚀 Next Steps

### **Immediate Actions:**

1. **Review & Approve This Plan**
   - Stakeholder sign-off
   - Technical team review
   - Timeline confirmation

2. **Set Up Development Branch**
   ```bash
   git checkout -b feature/healthcard-lab-findings
   ```

3. **Start Phase 1: System Configuration**
   - Schema changes first
   - Backend mutations
   - System Admin UI

4. **Create Task Breakdown**
   - Break phases into tickets
   - Assign to team members
   - Set up progress tracking

---

## 📚 References

- Health card reference file: `HEALTH_CARD_LABORATORY_FINDINGS.txt`
- Current generation logic: `backend/convex/healthCards/generateHealthCard.ts`
- Referral system: `backend/convex/documents/referralQueries.ts`
- Schema: `backend/convex/schema.ts`
- System Admin docs: `SYSTEM_ADMIN_ROLE.md`

---

## ✅ Sign-Off

| Role | Name | Approval | Date |
|------|------|----------|------|
| Tech Lead | _________ | ☐ Approved | ______ |
| Backend Dev | _________ | ☐ Approved | ______ |
| Frontend Dev | _________ | ☐ Approved | ______ |
| System Admin | _________ | ☐ Approved | ______ |
| Project Manager | _________ | ☐ Approved | ______ |

---

**Document Version:** 1.0  
**Last Updated:** November 15, 2025  
**Status:** ⏳ Awaiting Approval
