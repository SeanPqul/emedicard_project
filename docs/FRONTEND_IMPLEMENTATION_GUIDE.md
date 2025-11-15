# Frontend Implementation Guide - Lab Findings & System Config
**Date:** November 15, 2025  
**For:** Team Leader (Mobile App)  
**Scope:** WebAdmin Frontend Changes Only (No Mobile Changes Required)

---

## 🎯 **OVERVIEW**

This guide documents the **backend changes** and **frontend implementation requirements** for two new features:

1. **Lab Test Findings System** (Phase 2) - Medical findings on health cards
2. **Dynamic Officials Management** (Phase 1) - System admin can update officials

**Mobile App:** ✅ **NO CHANGES REQUIRED** - These features are admin-only

---

## 📦 **WHAT WAS CHANGED IN BACKEND**

### **Backend Changes Summary**

#### **1. Authentication Fixes** ✅ COMPLETED
**Files Modified:**
- `backend/convex/labFindings/index.ts`
- `backend/convex/systemConfig/index.ts`

**What Was Fixed:**
```typescript
// ❌ OLD (Broken Auth)
const user = await ctx.db.query("users")...
if (!user || !["admin", "system_admin"].includes(user.role ?? "")) {
  throw new Error("Admin access required");
}

// ✅ NEW (Working Auth)
import { AdminRole } from "../users/roles";

const adminCheck = await AdminRole(ctx);
if (!adminCheck.isAdmin) {
  throw new Error("Admin access required...");
}
```

**Why This Matters:**
- The old code didn't properly check Clerk authentication
- `AdminRole` helper correctly validates:
  - User is authenticated via Clerk
  - User exists in database
  - User has proper role (admin/system_admin)

#### **2. New Backend Functions**

**Lab Findings Module** (`convex/labFindings/index.ts`):
```typescript
// For Admins - Record medical findings
recordLabFinding(args) → { success, findingId }

// Query findings for an application
getLabFindings(applicationId) → { urinalysis[], xray_sputum[], stool[], all[] }

// Get summary statistics
getFindingsSummary(applicationId) → { total, showOnCard, byType{}, hasFindings }

// Update/Delete (only before health card generated)
updateLabFinding(findingId, updates)
deleteLabFinding(findingId)

// TEST ONLY - Remove in production!
recordLabFindingTest(args) // No auth check
```

**System Config Module** (`convex/systemConfig/index.ts`):
```typescript
// For System Admins - Manage officials
getActiveOfficials() → { cityHealthOfficer, sanitationChief }
setOfficial(key, name, designation, signatureStorageId) 
updateOfficialDetails(officialId, updates)
getOfficialHistory(key) → Official[]
```

#### **3. Database Schema Changes**

**New Tables:**
```typescript
// Lab Test Findings
labTestFindings {
  applicationId: Id<"applications">
  testType: "urinalysis" | "xray_sputum" | "stool"
  findingKind: string // "WBC elevated – Cleared post-Rx"
  findingStatus: "cleared_with_monitoring" | "cleared_no_monitoring" | "pending_retest"
  clearedDate: timestamp
  monitoringExpiry: timestamp
  monitoringPeriodMonths: 3 | 6 | 12
  doctorName: string
  showOnCard: boolean
  recordedBy: Id<"users">
  healthCardId?: Id<"healthCards"> // Set after card generated
}

// System Configuration
systemConfig {
  key: "city_health_officer" | "sanitation_chief"
  value: {
    name: string
    designation: string
    signatureStorageId?: Id<"_storage">
    isActive: boolean
    effectiveFrom: timestamp
    effectiveTo?: timestamp
  }
  updatedBy: Id<"users">
  notes?: string
}
```

**Updated Tables:**
```typescript
// Health Cards - Added snapshots
healthCards {
  // ... existing fields ...
  signedBy?: {
    cityHealthOfficer: { name, designation, signatureUrl, configId }
    sanitationChief: { name, designation, signatureUrl, configId }
  }
  includedFindings?: Id<"labTestFindings">[]
}
```

---

## 🎨 **FRONTEND IMPLEMENTATION REQUIREMENTS**

### **Role-Based Access Control**

```typescript
// Role Capabilities Matrix
┌─────────────────────┬────────────┬──────────────────┐
│ Feature             │ Admin      │ System Admin     │
├─────────────────────┼────────────┼──────────────────┤
│ Record Lab Finding  │ ✅ Yes     │ ✅ Yes           │
│ Edit Lab Finding    │ ✅ Yes     │ ✅ Yes           │
│ Delete Lab Finding  │ ✅ Yes     │ ✅ Yes           │
│ View Lab Findings   │ ✅ Yes     │ ✅ Yes           │
│ Manage Officials    │ ❌ No      │ ✅ Yes (ONLY)    │
│ View Officials      │ ✅ Yes     │ ✅ Yes           │
└─────────────────────┴────────────┴──────────────────┘
```

### **WebAdmin Routes Structure**

```
apps/webadmin/src/app/
├── dashboard/                          # Admin Dashboard
│   ├── page.tsx                        # Main dashboard
│   ├── [id]/                           # Application details page
│   │   └── page.tsx                    # ADD: Lab findings section here
│   ├── rejection-history/              # Referral history
│   │   └── page.tsx                    # Already exists
│   └── NEW: lab-findings/              # ⚠️ NEW PAGE
│       └── page.tsx                    # Lab findings manager
│
└── super-admin/                        # System Admin Dashboard
    ├── page.tsx                        # Main super admin dashboard
    ├── admin-activity/
    ├── orientation-schedules/
    └── NEW: system-config/             # ⚠️ NEW PAGE
        └── page.tsx                    # Officials management
```

---

## 🔧 **IMPLEMENTATION DETAILS**

### **Feature 1: Lab Findings Recorder (Admin/System Admin)**

#### **Where to Integrate:**
In your **Document Verification / Referral Flow**

**Location:** `apps/webadmin/src/app/dashboard/[id]/page.tsx` (or wherever you handle document review)

#### **When to Show:**
When admin refers a document with **medical findings** (e.g., abnormal X-ray, elevated urinalysis)

#### **Component: LabFindingRecorderForm**

```typescript
// apps/webadmin/src/components/LabFindingRecorderForm.tsx

"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { LAB_FINDING_OPTIONS, MONITORING_PERIOD_RECOMMENDATIONS } from "@/convex/labFindings/referenceData";

interface Props {
  applicationId: Id<"applications">;
  referralHistoryId?: Id<"documentReferralHistory">;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function LabFindingRecorderForm({ applicationId, referralHistoryId, onSuccess, onCancel }: Props) {
  const recordFinding = useMutation(api.labFindings.index.recordLabFinding);
  
  const [formData, setFormData] = useState({
    testType: "" as "urinalysis" | "xray_sputum" | "stool" | "",
    findingKind: "",
    findingStatus: "cleared_with_monitoring" as const,
    clearedDate: new Date().toISOString().split('T')[0],
    monitoringPeriodMonths: 6,
    doctorName: "",
    treatmentNotes: "",
    clinicAddress: "",
    showOnCard: true,
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      // Calculate monitoring expiry date
      const clearedDate = new Date(formData.clearedDate);
      const monitoringExpiry = new Date(clearedDate);
      monitoringExpiry.setMonth(monitoringExpiry.getMonth() + formData.monitoringPeriodMonths);
      
      await recordFinding({
        applicationId,
        testType: formData.testType as any,
        findingKind: formData.findingKind,
        findingStatus: formData.findingStatus,
        clearedDate: clearedDate.getTime(),
        monitoringExpiry: monitoringExpiry.getTime(),
        monitoringPeriodMonths: formData.monitoringPeriodMonths,
        doctorName: formData.doctorName,
        treatmentNotes: formData.treatmentNotes || undefined,
        clinicAddress: formData.clinicAddress || undefined,
        showOnCard: formData.showOnCard,
        referralHistoryId,
      });
      
      onSuccess?.();
    } catch (err: any) {
      setError(err.message || "Failed to record finding");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg bg-white">
      <h3 className="text-lg font-semibold">Record Lab Finding</h3>
      
      {error && (
        <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}
      
      {/* Test Type Dropdown */}
      <div>
        <label className="block text-sm font-medium mb-1">Test Type *</label>
        <select
          required
          value={formData.testType}
          onChange={(e) => {
            const testType = e.target.value as any;
            setFormData({ 
              ...formData, 
              testType,
              findingKind: "", // Reset finding kind when test type changes
              monitoringPeriodMonths: MONITORING_PERIOD_RECOMMENDATIONS[testType] || 6
            });
          }}
          className="w-full p-2 border rounded-md"
        >
          <option value="">Select Test Type</option>
          <option value="urinalysis">Urinalysis</option>
          <option value="xray_sputum">X-Ray / Sputum</option>
          <option value="stool">Stool Examination</option>
        </select>
      </div>
      
      {/* Finding Kind Dropdown */}
      {formData.testType && (
        <div>
          <label className="block text-sm font-medium mb-1">Finding *</label>
          <select
            required
            value={formData.findingKind}
            onChange={(e) => setFormData({ ...formData, findingKind: e.target.value })}
            className="w-full p-2 border rounded-md"
          >
            <option value="">Select Finding</option>
            {LAB_FINDING_OPTIONS[formData.testType].map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>
      )}
      
      {/* Cleared Date */}
      <div>
        <label className="block text-sm font-medium mb-1">Cleared Date *</label>
        <input
          type="date"
          required
          value={formData.clearedDate}
          onChange={(e) => setFormData({ ...formData, clearedDate: e.target.value })}
          className="w-full p-2 border rounded-md"
          max={new Date().toISOString().split('T')[0]}
        />
      </div>
      
      {/* Monitoring Period */}
      <div>
        <label className="block text-sm font-medium mb-1">Monitoring Period *</label>
        <select
          required
          value={formData.monitoringPeriodMonths}
          onChange={(e) => setFormData({ ...formData, monitoringPeriodMonths: Number(e.target.value) })}
          className="w-full p-2 border rounded-md"
        >
          <option value={3}>3 months</option>
          <option value={6}>6 months (Recommended)</option>
          <option value={12}>12 months</option>
        </select>
        <p className="text-xs text-gray-500 mt-1">
          Retest due: {(() => {
            const date = new Date(formData.clearedDate);
            date.setMonth(date.getMonth() + formData.monitoringPeriodMonths);
            return date.toLocaleDateString();
          })()}
        </p>
      </div>
      
      {/* Doctor Name */}
      <div>
        <label className="block text-sm font-medium mb-1">Clearing Doctor *</label>
        <input
          type="text"
          required
          value={formData.doctorName}
          onChange={(e) => setFormData({ ...formData, doctorName: e.target.value })}
          placeholder="Dr. Juan Dela Cruz"
          className="w-full p-2 border rounded-md"
        />
      </div>
      
      {/* Treatment Notes */}
      <div>
        <label className="block text-sm font-medium mb-1">Treatment Notes</label>
        <textarea
          value={formData.treatmentNotes}
          onChange={(e) => setFormData({ ...formData, treatmentNotes: e.target.value })}
          placeholder="Patient completed antibiotic treatment..."
          rows={3}
          className="w-full p-2 border rounded-md"
        />
      </div>
      
      {/* Clinic Address */}
      <div>
        <label className="block text-sm font-medium mb-1">Clinic Address</label>
        <input
          type="text"
          value={formData.clinicAddress}
          onChange={(e) => setFormData({ ...formData, clinicAddress: e.target.value })}
          placeholder="City Health Office, Davao City"
          className="w-full p-2 border rounded-md"
        />
      </div>
      
      {/* Show on Card Checkbox */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="showOnCard"
          checked={formData.showOnCard}
          onChange={(e) => setFormData({ ...formData, showOnCard: e.target.checked })}
          className="h-4 w-4"
        />
        <label htmlFor="showOnCard" className="text-sm font-medium">
          Display this finding on health card
        </label>
      </div>
      
      {/* Buttons */}
      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save Finding"}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
```

#### **Component: LabFindingsList**

```typescript
// apps/webadmin/src/components/LabFindingsList.tsx

"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

interface Props {
  applicationId: Id<"applications">;
}

export function LabFindingsList({ applicationId }: Props) {
  const findings = useQuery(api.labFindings.index.getLabFindings, { applicationId });
  const deleteFinding = useMutation(api.labFindings.index.deleteLabFinding);
  
  if (!findings) return <div>Loading findings...</div>;
  
  if (findings.all.length === 0) {
    return (
      <div className="p-4 bg-gray-50 rounded-md text-sm text-gray-600">
        No lab findings recorded for this application.
      </div>
    );
  }
  
  const handleDelete = async (findingId: Id<"labTestFindings">) => {
    if (!confirm("Delete this finding? This cannot be undone.")) return;
    
    try {
      await deleteFinding({ findingId });
    } catch (err: any) {
      alert(err.message || "Failed to delete finding");
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="font-semibold">Lab Findings Summary</h3>
      
      {/* Urinalysis Findings */}
      {findings.urinalysis.length > 0 && (
        <div className="border rounded-lg p-4">
          <h4 className="font-medium text-sm text-gray-700 mb-2">URINALYSIS</h4>
          {findings.urinalysis.map((finding: any) => (
            <FindingCard 
              key={finding._id} 
              finding={finding} 
              onDelete={handleDelete} 
            />
          ))}
        </div>
      )}
      
      {/* X-Ray/Sputum Findings */}
      {findings.xray_sputum.length > 0 && (
        <div className="border rounded-lg p-4">
          <h4 className="font-medium text-sm text-gray-700 mb-2">X-RAY / SPUTUM</h4>
          {findings.xray_sputum.map((finding: any) => (
            <FindingCard 
              key={finding._id} 
              finding={finding} 
              onDelete={handleDelete} 
            />
          ))}
        </div>
      )}
      
      {/* Stool Findings */}
      {findings.stool.length > 0 && (
        <div className="border rounded-lg p-4">
          <h4 className="font-medium text-sm text-gray-700 mb-2">STOOL EXAMINATION</h4>
          {findings.stool.map((finding: any) => (
            <FindingCard 
              key={finding._id} 
              finding={finding} 
              onDelete={handleDelete} 
            />
          ))}
        </div>
      )}
    </div>
  );
}

function FindingCard({ finding, onDelete }: { finding: any; onDelete: (id: Id<"labTestFindings">) => void }) {
  const clearedDate = new Date(finding.clearedDate).toLocaleDateString();
  const expiryDate = new Date(finding.monitoringExpiry).toLocaleDateString();
  const isExpiringSoon = finding.monitoringExpiry - Date.now() < 30 * 24 * 60 * 60 * 1000; // 30 days
  
  return (
    <div className="bg-gray-50 p-3 rounded-md mb-2">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <p className="font-medium text-sm">{finding.findingKind}</p>
          <p className="text-xs text-gray-600 mt-1">
            Cleared: {clearedDate} | Retest Due: <span className={isExpiringSoon ? "text-orange-600 font-medium" : ""}>{expiryDate}</span>
          </p>
          <p className="text-xs text-gray-500">Doctor: {finding.doctorName}</p>
          {finding.treatmentNotes && (
            <p className="text-xs text-gray-500 mt-1 italic">{finding.treatmentNotes}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {finding.showOnCard && (
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
              On Card
            </span>
          )}
          {!finding.healthCardId && (
            <button
              onClick={() => onDelete(finding._id)}
              className="text-xs text-red-600 hover:text-red-800"
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
```

---

### **Feature 2: System Config Manager (System Admin ONLY)**

#### **New Route:** `/super-admin/system-config`

#### **Component: SystemConfigManager**

```typescript
// apps/webadmin/src/app/super-admin/system-config/page.tsx

"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

export default function SystemConfigPage() {
  const officials = useQuery(api.systemConfig.index.getActiveOfficials);
  const setOfficial = useMutation(api.systemConfig.index.setOfficial);
  const [editing, setEditing] = useState<"city_health_officer" | "sanitation_chief" | null>(null);
  
  if (!officials) return <div>Loading...</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">System Configuration - Officials Management</h1>
      
      <div className="space-y-6">
        {/* City Health Officer */}
        <OfficialCard
          title="City Health Officer"
          configKey="city_health_officer"
          official={officials.cityHealthOfficer}
          isEditing={editing === "city_health_officer"}
          onEdit={() => setEditing("city_health_officer")}
          onCancel={() => setEditing(null)}
          onSave={async (data) => {
            await setOfficial({
              key: "city_health_officer",
              name: data.name,
              designation: data.designation,
              signatureStorageId: data.signatureStorageId,
              notes: data.notes,
              changeReason: data.changeReason,
            });
            setEditing(null);
          }}
        />
        
        {/* Sanitation Chief */}
        <OfficialCard
          title="Sanitation Chief"
          configKey="sanitation_chief"
          official={officials.sanitationChief}
          isEditing={editing === "sanitation_chief"}
          onEdit={() => setEditing("sanitation_chief")}
          onCancel={() => setEditing(null)}
          onSave={async (data) => {
            await setOfficial({
              key: "sanitation_chief",
              name: data.name,
              designation: data.designation,
              signatureStorageId: data.signatureStorageId,
              notes: data.notes,
              changeReason: data.changeReason,
            });
            setEditing(null);
          }}
        />
      </div>
      
      <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
        <h3 className="font-semibold text-yellow-800 mb-2">⚠️ Important Notes</h3>
        <ul className="text-sm text-yellow-700 space-y-1 list-disc list-inside">
          <li>Changing officials will NOT affect existing health cards (historical accuracy preserved)</li>
          <li>New health cards will automatically use the updated officials</li>
          <li>All changes are logged for audit purposes</li>
        </ul>
      </div>
    </div>
  );
}

interface OfficialCardProps {
  title: string;
  configKey: string;
  official: any;
  isEditing: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSave: (data: any) => Promise<void>;
}

function OfficialCard({ title, configKey, official, isEditing, onEdit, onCancel, onSave }: OfficialCardProps) {
  const [formData, setFormData] = useState({
    name: official?.name || "",
    designation: official?.designation || "",
    notes: "",
    changeReason: "",
  });
  const [loading, setLoading] = useState(false);

  if (!isEditing) {
    return (
      <div className="border rounded-lg p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold text-lg">{title}</h3>
            <p className="text-gray-700 mt-1">{official?.name || "Not set"}</p>
            <p className="text-sm text-gray-500">{official?.designation || ""}</p>
            {official?.effectiveFrom && (
              <p className="text-xs text-gray-400 mt-2">
                In office since: {new Date(official.effectiveFrom).toLocaleDateString()}
              </p>
            )}
          </div>
          <button
            onClick={onEdit}
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Edit
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="border rounded-lg p-4 bg-blue-50">
      <h3 className="font-semibold text-lg mb-4">Edit {title}</h3>
      
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium mb-1">Full Name *</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Dr. Maria Santos"
            className="w-full p-2 border rounded-md"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Designation *</label>
          <input
            type="text"
            required
            value={formData.designation}
            onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
            placeholder="City Health Officer II"
            className="w-full p-2 border rounded-md"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Change Reason</label>
          <input
            type="text"
            value={formData.changeReason}
            onChange={(e) => setFormData({ ...formData, changeReason: e.target.value })}
            placeholder="New appointment per City Order No. 2025-123"
            className="w-full p-2 border rounded-md"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Notes</label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Additional notes..."
            rows={2}
            className="w-full p-2 border rounded-md"
          />
        </div>
        
        <div className="flex gap-2 pt-2">
          <button
            onClick={async () => {
              setLoading(true);
              try {
                await onSave(formData);
              } finally {
                setLoading(false);
              }
            }}
            disabled={loading || !formData.name || !formData.designation}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
```

---

## 🔄 **INTEGRATION FLOW**

### **Flow 1: Recording Lab Findings (Admin)**

```
Document Verification Page
    ↓
Admin reviews medical document (X-ray, Urinalysis, etc.)
    ↓
Finds medical issue (e.g., elevated WBC)
    ↓
[Refer Document] → medicalReferralCategory: "elevated_urinalysis"
    ↓
Applicant gets treatment, submits clearance certificate
    ↓
Admin reviews clearance certificate
    ↓
[Record Lab Finding] ← Open LabFindingRecorderForm
    ↓
Fill form:
  - Test Type: "urinalysis"
  - Finding: "WBC elevated – Cleared post-Rx"
  - Cleared Date: today
  - Monitoring Period: 6 months
  - Doctor Name: "Dr. Juan Santos"
  - Show on Card: ✅
    ↓
[Save Finding] → Backend creates labTestFindings record
    ↓
Approve Application → Health card generation
    ↓
Health card back shows:
  "URINALYSIS"
  "11/15/25 | WBC Cleared | 05/15/26"
```

### **Flow 2: Managing Officials (System Admin)**

```
Super Admin Dashboard
    ↓
[System Configuration] menu → /super-admin/system-config
    ↓
View Current Officials:
  - City Health Officer: Dr. Marjorie D. Culas
  - Sanitation Chief: Luzminda N. Paig
    ↓
[Edit City Health Officer]
    ↓
Update:
  - Name: "Dr. Maria Santos"
  - Designation: "City Health Officer II"
  - Change Reason: "New appointment"
    ↓
[Save Changes] → Backend:
  1. Deactivates old official (effectiveTo = now)
  2. Creates new official (isActive = true)
    ↓
Future health cards use new official's name
Old health cards still show old official (historical accuracy)
```

---

## 🧪 **TESTING CHECKLIST**

### **Lab Findings Tests**

```
☐ Test 1: Record Urinalysis Finding
  - Navigate to application details
  - Record finding with all required fields
  - Verify finding appears in list

☐ Test 2: Generate Card with Finding
  - Approve application with findings
  - Download health card
  - Verify finding appears in URINALYSIS section

☐ Test 3: Generate Card WITHOUT Finding
  - Approve application without findings
  - Verify empty checkboxes in test sections

☐ Test 4: Delete Finding Before Card Generated
  - Record finding
  - Delete it (before approval)
  - Verify deletion works

☐ Test 5: Cannot Delete After Card Generated
  - Record finding → Approve app
  - Try to delete finding
  - Verify error: "Cannot delete - card already generated"

☐ Test 6: Auth Check (Admin can record)
  - Log in as Admin
  - Record finding
  - Verify success

☐ Test 7: Auth Check (System Admin can record)
  - Log in as System Admin
  - Record finding
  - Verify success
```

### **System Config Tests**

```
☐ Test 8: View Active Officials
  - Navigate to /super-admin/system-config
  - Verify current officials displayed

☐ Test 9: Update City Health Officer
  - Edit official details
  - Save changes
  - Verify new official is active

☐ Test 10: Historical Accuracy
  - Generate health card with Official A
  - Update to Official B
  - Generate new health card
  - Verify: Old card still shows Official A

☐ Test 11: Auth Check (System Admin ONLY)
  - Log in as Regular Admin
  - Try to access /super-admin/system-config
  - Verify access denied

☐ Test 12: View Official History
  - Check official history query
  - Verify all past officials shown with dates
```

---

## 🚨 **IMPORTANT NOTES**

### **For Mobile Team:**
```
✅ NO CHANGES REQUIRED
- Lab findings are admin-only features
- Mobile app continues to work as-is
- Health cards download still works (findings auto-populated if present)
```

### **Security Considerations:**

1. **Remove Test Function in Production:**
   ```typescript
   // ⚠️ DELETE THIS BEFORE PRODUCTION DEPLOYMENT
   // File: backend/convex/labFindings/index.ts
   export const recordLabFindingTest = mutation({ ... })
   ```

2. **Role-Based UI Rendering:**
   ```typescript
   // In your components:
   const adminPrivileges = useQuery(api.users.roles.getAdminPrivileges);
   
   // Show system config only to system admins
   {adminPrivileges?.isSuperAdmin && (
     <Link href="/super-admin/system-config">System Configuration</Link>
   )}
   ```

3. **Route Protection:**
   ```typescript
   // In middleware or layout
   if (!user.isSuperAdmin && pathname.startsWith('/super-admin/system-config')) {
     redirect('/dashboard');
   }
   ```

---

## 📚 **REFERENCE DATA**

### **Lab Finding Options (Dropdowns)**

```typescript
// Import from: convex/labFindings/referenceData.ts

LAB_FINDING_OPTIONS = {
  urinalysis: [
    "WBC elevated – Cleared post-Rx",
    "RBC elevated – Cleared post-Rx",
    "Protein detected – Cleared post-Rx",
    "Glucose detected – Cleared post-Rx",
    // ... more options
  ],
  xray_sputum: [
    "Chest X-ray abnormal – TB ruled out, Cleared",
    "Chest X-ray abnormal – Pneumonia cleared",
    // ... more options
  ],
  stool: [
    "Parasite detected – Cleared post-Rx",
    "Ova detected – Cleared post-Rx",
    // ... more options
  ]
}

MONITORING_PERIOD_RECOMMENDATIONS = {
  urinalysis: 6,     // months
  xray_sputum: 12,   // months
  stool: 3,          // months
}
```

---

## 🎯 **SUMMARY**

### **What You Need to Build:**

**For Admin Role:**
1. ✅ Lab Finding Recorder Form (integrate into document verification)
2. ✅ Lab Findings List View (show on application details page)
3. ✅ Optional: Dedicated `/dashboard/lab-findings` page for viewing all findings

**For System Admin Role:**
4. ✅ System Config Manager Page (`/super-admin/system-config`)
5. ✅ Officials Editor Component
6. ✅ Official History Viewer (optional, nice-to-have)

### **Backend Status:**
- ✅ Auth fixed (working now with AdminRole helper)
- ✅ All functions tested and working
- ✅ Database schema deployed
- ✅ No mobile changes needed

---

## 📞 **NEXT STEPS**

1. **Review this document** with your team
2. **Test backend functions** via Convex Dashboard first
3. **Build frontend components** one feature at a time:
   - Start with Lab Findings Recorder (higher priority)
   - Then System Config Manager
4. **Test thoroughly** using checklist above
5. **Remove test functions** before production deployment

---

**Questions or Issues?**
- Check backend logs via Convex Dashboard
- Use browser console for frontend errors
- Refer to existing admin pages for patterns (rejection-history, attendance-tracker)

**Good luck with the implementation! 🚀**
