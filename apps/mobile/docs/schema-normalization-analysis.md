# Schema Normalization Analysis - eMediCard

## Overview
This document analyzes the eMediCard Convex schema against SQL normalization principles (1NF through BCNF) and provides recommendations for optimization.

---

## Normalization Grade: **B+ (7.5/10)**

### Summary
- ✅ **1NF (First Normal Form)**: PASSED
- ✅ **2NF (Second Normal Form)**: PASSED
- ⚠️ **3NF (Third Normal Form)**: PARTIAL (Some violations)
- ⚠️ **BCNF (Boyce-Codd Normal Form)**: PARTIAL (Strategic denormalization present)

---

## Table-by-Table Analysis

### ✅ **1. Users Table** - GRADE: A-

```typescript
users: defineTable({
  username: v.string(),
  fullname: v.string(),
  email: v.string(),
  image: v.string(),
  gender: v.optional(v.string()),
  birthDate: v.optional(v.string()),
  phoneNumber: v.optional(v.string()),
  clerkId: v.string(),
  managedCategories: v.optional(v.array(v.id("jobCategories"))),
  role: v.optional(v.union(...)),
  updatedAt: v.optional(v.float64()),
})
```

**Normalization:**
- ✅ 1NF: Atomic values (except `managedCategories` - justified)
- ✅ 2NF: All non-key attributes depend on primary key
- ✅ 3NF: No transitive dependencies
- ⚠️ `managedCategories` array violates 1NF BUT is acceptable in NoSQL

**Issues:**
- `fullname` could be derived from firstName + middleName + lastName (not stored)
- Missing firstName, middleName, lastName as separate fields

**Recommendation:**
```typescript
users: defineTable({
  // Current
  fullname: v.string(),  // Keep for display
  
  // Add for normalization
  firstName: v.string(),
  middleName: v.optional(v.string()),
  lastName: v.string(),
  
  // Then fullname = computed from parts
})
```

---

### ⚠️ **2. Applications Table** - GRADE: C+

```typescript
applications: defineTable({
  adminRemarks: v.optional(v.string()),
  applicationStatus: v.string(),
  applicationType: v.union(v.literal("New"), v.literal("Renew")),
  approvedAt: v.optional(v.float64()),
  civilStatus: v.string(),
  firstName: v.optional(v.string()),  // ❌ VIOLATION
  lastName: v.optional(v.string()),   // ❌ VIOLATION
  gender: v.optional(v.union(...)),   // ❌ VIOLATION
  jobCategoryId: v.id("jobCategories"),
  organization: v.string(),
  position: v.string(),
  paymentDeadline: v.optional(v.float64()),
  updatedAt: v.optional(v.float64()),
  userId: v.id("users"),
  lastUpdatedBy: v.optional(v.id("users")),
  orientationCompleted: v.optional(v.boolean()),
})
```

**CRITICAL NORMALIZATION VIOLATIONS:**

#### ❌ **3NF Violation: Data Duplication**
```typescript
// These are duplicated from users table:
firstName: v.optional(v.string()),
lastName: v.optional(v.string()),
gender: v.optional(v.union(...)),
```

**Why this is wrong:**
1. User changes their name → Applications still show old name
2. Data inconsistency possible
3. Wasted storage
4. Update anomalies

**Should be:**
```typescript
// Remove from applications table
// Query by joining with users table via userId
```

#### ❌ **2NF Violation: Partial Dependency**
```typescript
organization: v.string(),  // Depends on userId, not applicationId
position: v.string(),      // Depends on userId, not applicationId
```

**These belong in a separate table:**
```typescript
userEmploymentInfo: defineTable({
  userId: v.id("users"),
  organization: v.string(),
  position: v.string(),
  employedSince: v.optional(v.float64()),
})
```

---

### ✅ **3. DocumentUploads Table** - GRADE: A

```typescript
documentUploads: defineTable({
  adminRemarks: v.optional(v.string()),
  applicationId: v.id("applications"),
  documentTypeId: v.id("documentTypes"),
  originalFileName: v.string(),
  reviewStatus: v.string(),
  reviewedAt: v.optional(v.float64()),
  reviewedBy: v.optional(v.id("users")),
  storageFileId: v.id("_storage"),
  uploadedAt: v.float64(),
  fileType: v.string(),
  extractedText: v.optional(v.string()),
  classification: v.optional(v.string()),
})
```

**Normalization:**
- ✅ 1NF: All atomic values
- ✅ 2NF: All attributes depend on full primary key
- ✅ 3NF: No transitive dependencies
- ✅ BCNF: Properly normalized

**Well-designed table!** No issues.

---

### ⚠️ **4. AdminActivityLogs Table** - GRADE: B

```typescript
adminActivityLogs: defineTable({
  adminId: v.id("users"),
  activityType: v.optional(v.string()),
  details: v.optional(v.string()),
  adminUsername: v.optional(v.string()),  // ❌ DENORMALIZED
  adminEmail: v.optional(v.string()),     // ❌ DENORMALIZED
  action: v.optional(v.string()),
  comment: v.optional(v.string()),
  timestamp: v.float64(),
  applicationId: v.optional(v.id("applications")),
  documentUploadId: v.optional(v.id("documentUploads")),
  jobCategoryId: v.optional(v.id("jobCategories")),
})
```

**3NF Violation: Transitive Dependency**
```typescript
adminId → adminUsername  // Transitive dependency
adminId → adminEmail     // Transitive dependency
```

**BUT THIS IS INTENTIONAL (Strategic Denormalization)**

**Why it's acceptable:**
1. ✅ Audit trail must preserve data even if admin user deleted
2. ✅ Historical record must be immutable
3. ✅ Performance: No joins needed for audit reports
4. ✅ Compliance: Regulatory requirement to preserve actor identity

**Verdict:** Denormalization is **justified** for audit logs.

---

### ⚠️ **5. DocumentRejectionHistory Table** - GRADE: B+

```typescript
documentRejectionHistory: defineTable({
  // References
  applicationId: v.id("applications"),
  documentTypeId: v.id("documentTypes"),
  documentUploadId: v.id("documentUploads"),
  
  // Preserved File Data (DENORMALIZED)
  rejectedFileId: v.id("_storage"),
  originalFileName: v.string(),      // ❌ Duplicate from documentUploads
  fileSize: v.float64(),
  fileType: v.string(),              // ❌ Duplicate from documentUploads
  
  // Rejection details
  rejectionCategory: v.union(...),
  rejectionReason: v.string(),
  specificIssues: v.array(v.string()),  // ⚠️ 1NF violation
  
  // Tracking
  rejectedBy: v.id("users"),
  rejectedAt: v.float64(),
  wasReplaced: v.boolean(),
  replacementUploadId: v.optional(v.id("documentUploads")),
  attemptNumber: v.float64(),
})
```

**Strategic Denormalization:**
- ❌ `originalFileName`, `fileType` duplicated from `documentUploads`
- ⚠️ `specificIssues` array violates 1NF

**BUT THIS IS JUSTIFIED:**
1. ✅ Historical record - must preserve original document metadata
2. ✅ `documentUploads` row may be replaced, but history must remain intact
3. ✅ Immutable audit trail

**Verdict:** Denormalization is **correct** for history tables.

---

### ⚠️ **6. Orientations vs OrientationSessions** - GRADE: C-

```typescript
// Table 1: orientations
orientations: defineTable({
  applicationId: v.id("applications"),
  checkInTime: v.optional(v.float64()),
  checkOutTime: v.optional(v.float64()),
  checkedInBy: v.optional(v.id("users")),
  checkedOutBy: v.optional(v.id("users")),
  orientationDate: v.optional(v.float64()),
  timeSlot: v.optional(v.string()),
  assignedInspectorId: v.optional(v.id("users")),
  orientationVenue: v.optional(v.string()),
  orientationStatus: v.union(...),
  qrCodeUrl: v.string(),
  scheduledAt: v.float64(),
})

// Table 2: orientationSessions
orientationSessions: defineTable({
  userId: v.string(),
  applicationId: v.id("applications"),
  scheduleId: v.id("orientationSchedules"),
  scheduledDate: v.float64(),  // ❌ DUPLICATE
  completedDate: v.optional(v.float64()),
  status: v.union(...),
  venue: v.object({           // ❌ DUPLICATE
    name: v.string(),
    address: v.string(),
  }),
  instructor: v.optional(v.object({  // ❌ DUPLICATE
    name: v.string(),
    designation: v.string(),
  })),
  certificateId: v.optional(v.string()),
})
```

**MAJOR NORMALIZATION ISSUE:**
- ❌ Overlapping responsibilities between two tables
- ❌ `scheduledDate` duplicated from `orientationSchedules`
- ❌ `venue` duplicated from `orientationSchedules`
- ❌ `instructor` duplicated from `orientationSchedules`

**Recommendation:**
Merge or clearly separate:
```typescript
// Option 1: Merge into one table
orientationBookings: defineTable({
  applicationId: v.id("applications"),
  scheduleId: v.id("orientationSchedules"),
  bookingStatus: v.union("scheduled", "attended", "missed", "cancelled"),
  checkInTime: v.optional(v.float64()),
  checkOutTime: v.optional(v.float64()),
  // Don't duplicate venue/instructor - join with orientationSchedules
})

// Option 2: Clear separation
orientations: defineTable({
  // Master attendance record
  applicationId: v.id("applications"),
  sessionId: v.id("orientationSessions"),
  checkInTime: v.float64(),
  checkOutTime: v.float64(),
})

orientationSessions: defineTable({
  // Booking/reservation
  applicationId: v.id("applications"),
  scheduleId: v.id("orientationSchedules"),
  bookingStatus: v.union(...),
  // NO venue/instructor - query from scheduleId
})
```

---

### ⚠️ **7. Payments Table** - GRADE: B

```typescript
payments: defineTable({
  amount: v.float64(),
  applicationId: v.id("applications"),
  checkoutUrl: v.optional(v.string()),
  failureReason: v.optional(v.string()),
  mayaCheckoutId: v.optional(v.string()),
  mayaPaymentId: v.optional(v.string()),
  netAmount: v.float64(),              // ❌ COMPUTED VALUE
  paymentMethod: v.union(...),
  paymentProvider: v.optional(v.union(...)),
  paymentStatus: v.union(...),
  receiptStorageId: v.optional(v.id("_storage")),
  referenceNumber: v.string(),
  serviceFee: v.float64(),
  settlementDate: v.optional(v.float64()),
  transactionFee: v.optional(v.float64()),
  updatedAt: v.optional(v.float64()),
  webhookPayload: v.optional(v.any()),
})
```

**3NF Violation: Computed Field**
```typescript
netAmount = amount - serviceFee - transactionFee  // Should be computed
```

**Options:**
1. ❌ Remove `netAmount` (compute on read)
2. ✅ Keep `netAmount` for performance (strategic denormalization)

**Verdict:** If you query `netAmount` frequently, keeping it is justified. Just ensure consistency on updates.

---

## 📊 Normalization Violations Summary

### **Critical Issues (Should Fix)**

| Table | Issue | Severity | Impact |
|-------|-------|----------|--------|
| `applications` | Duplicates `firstName`, `lastName`, `gender` from `users` | HIGH | Data inconsistency |
| `applications` | `organization`, `position` should be separate table | MEDIUM | Update anomalies |
| `orientationSessions` | Duplicates data from `orientationSchedules` | HIGH | Storage waste, inconsistency |
| `orientations` + `orientationSessions` | Overlapping responsibilities | HIGH | Confusing schema |

### **Acceptable Violations (Strategic Denormalization)**

| Table | Issue | Justification |
|-------|-------|---------------|
| `adminActivityLogs` | Denormalized `adminUsername`, `adminEmail` | ✅ Audit trail preservation |
| `documentRejectionHistory` | Denormalized file metadata | ✅ Immutable history |
| `payments` | Computed `netAmount` | ✅ Performance optimization |
| `users` | Array field `managedCategories` | ✅ NoSQL pattern, query optimization |

---

## 🎯 Recommended Schema Improvements

### **1. Fix Applications Table** (Priority: HIGH)

```typescript
// REMOVE from applications:
// - firstName
// - lastName  
// - gender
// - organization
// - position

// CREATE new table:
userEmploymentInfo: defineTable({
  userId: v.id("users"),
  organization: v.string(),
  position: v.string(),
  department: v.optional(v.string()),
  employedSince: v.optional(v.float64()),
  createdAt: v.float64(),
  updatedAt: v.float64(),
}).index("by_user", ["userId"])

// KEEP in applications:
applications: defineTable({
  userId: v.id("users"),  // Join to get user info
  jobCategoryId: v.id("jobCategories"),
  applicationType: v.union(...),
  applicationStatus: v.union(...),
  civilStatus: v.string(),
  // ... rest of fields
})

// Query pattern:
const application = await db.get(applicationId);
const user = await db.get(application.userId);
const employment = await db
  .query("userEmploymentInfo")
  .withIndex("by_user", q => q.eq("userId", application.userId))
  .first();

// Display: user.firstName, user.lastName, employment.organization
```

### **2. Consolidate Orientation Tables** (Priority: HIGH)

```typescript
// OPTION A: Single table (simpler)
orientationAttendance: defineTable({
  applicationId: v.id("applications"),
  scheduleId: v.id("orientationSchedules"),
  bookingStatus: v.union(
    v.literal("scheduled"),
    v.literal("checked-in"),
    v.literal("completed"),
    v.literal("missed"),
    v.literal("cancelled")
  ),
  checkInTime: v.optional(v.float64()),
  checkOutTime: v.optional(v.float64()),
  checkedInBy: v.optional(v.id("users")),
  checkedOutBy: v.optional(v.id("users")),
  qrCodeUrl: v.string(),
  inspectorNotes: v.optional(v.string()),
  createdAt: v.float64(),
  updatedAt: v.float64(),
})
.index("by_application", ["applicationId"])
.index("by_schedule", ["scheduleId"])
.index("by_status", ["bookingStatus"])

// Query venue/time/instructor by joining with orientationSchedules
```

### **3. Normalize Users Table** (Priority: MEDIUM)

```typescript
users: defineTable({
  // Identity
  clerkId: v.string(),
  email: v.string(),
  username: v.string(),
  
  // Name (normalized)
  firstName: v.string(),
  middleName: v.optional(v.string()),
  lastName: v.string(),
  fullname: v.string(),  // Computed: firstName + middleName + lastName
  
  // Profile
  image: v.string(),
  gender: v.optional(v.union(...)),
  birthDate: v.optional(v.string()),
  phoneNumber: v.optional(v.string()),
  
  // System
  role: v.union(...),  // NOT optional
  managedCategories: v.optional(v.array(v.id("jobCategories"))),
  isActive: v.boolean(),  // ADD for soft delete
  createdAt: v.float64(),  // ADD
  updatedAt: v.float64(),
  deletedAt: v.optional(v.float64()),  // ADD
})
```

---

## 📈 Final Grade Breakdown

| Normalization Form | Status | Grade |
|-------------------|--------|-------|
| **1NF** (Atomic values) | ✅ PASS | A |
| **2NF** (No partial dependencies) | ⚠️ PARTIAL | C+ |
| **3NF** (No transitive dependencies) | ⚠️ PARTIAL | B- |
| **BCNF** (Proper functional dependencies) | ⚠️ PARTIAL | B |

### **Overall: 7.5/10** (B+)

---

## 💡 Comparison: Your Schema vs Industry Standard

### **Typical SaaS App Schema Quality:**

```
Poor (4/10)     ⚪⚪⚪⚪⚫⚫⚫⚫⚫⚫  No normalization, duplicates everywhere
Below Avg (5/10) ⚪⚪⚪⚪⚪⚫⚫⚫⚫⚫  Some normalization, many issues
Average (6/10)   ⚪⚪⚪⚪⚪⚪⚫⚫⚫⚫  Basic normalization
Good (7/10)      ⚪⚪⚪⚪⚪⚪⚪⚫⚫⚫  Well-normalized, few issues
**Your Schema**  ⚪⚪⚪⚪⚪⚪⚪⭐⚫⚫  7.5/10
Excellent (8/10) ⚪⚪⚪⚪⚪⚪⚪⚪⚫⚫  Highly normalized
Perfect (10/10)  ⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪  Textbook normalization
```

**You're ABOVE average compared to most production SaaS apps.**

---

## 🚀 Action Items

### **Immediate (Do Now)**
1. ✅ Add `firstName`, `middleName`, `lastName` to users table
2. ✅ Remove `firstName`, `lastName`, `gender` from applications table
3. ✅ Create `userEmploymentInfo` table for organization/position

### **Short Term (Next Sprint)**
4. ✅ Consolidate orientation tables into single table
5. ✅ Add `createdAt` timestamps to all tables
6. ✅ Add soft delete fields (`isActive`, `deletedAt`)

### **Long Term (Next Quarter)**
7. ✅ Convert all string enums to v.union() for type safety
8. ✅ Add composite indexes for common query patterns
9. ✅ Document strategic denormalization decisions

---

## ✅ Conclusion

Your schema is **good but not perfect**. The main issues:

1. **Applications table has too much denormalized user data** (violates 3NF)
2. **Orientation tables are confusing and overlapping** (design issue)
3. **Missing some timestamp/soft delete fields** (best practice)

BUT you got the **hard parts right**:
- ✅ Proper audit trails
- ✅ Strategic denormalization where justified
- ✅ Good indexing strategy
- ✅ Clear relationships

**Fix the high-priority issues, and you'll have an A-grade schema.** 🎯
