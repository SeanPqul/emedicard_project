# 🏥 Health Card Inspector Signature Implementation

**Implementation Date**: November 15-16, 2025  
**Status**: ✅ Production Ready  
**Version**: 2.0

---

## 📋 **Table of Contents**

1. [Overview](#overview)
2. [Business Requirements](#business-requirements)
3. [Technical Implementation](#technical-implementation)
4. [How It Works](#how-it-works)
5. [File Changes](#file-changes)
6. [Database Schema](#database-schema)
7. [Testing Guide](#testing-guide)
8. [System Config Management](#system-config-management)
9. [Troubleshooting](#troubleshooting)

---

## 📖 **Overview**

This implementation adds dynamic inspector names to health cards based on card type (Yellow/Green/Pink) while maintaining a consistent signature image and title across all cards.

### **Key Features:**
- ✅ Yellow cards show the orientation instructor who conducted the training
- ✅ Green/Pink cards show the most recent active orientation instructor
- ✅ All cards use the same signature image (Luzminda signature)
- ✅ All cards use the same title: "Sanitation Chief"
- ✅ Automatic updates as new orientations are completed
- ✅ Fallback to systemConfig if no orientation data exists

---

## 🎯 **Business Requirements**

### **Problem Statement:**
Previously, all health cards showed a hardcoded "Luzminda N. Paig" as the Sanitation Chief, regardless of which inspector actually handled the application or orientation.

### **Solution:**
Dynamic inspector names based on card type and orientation data:

| Card Type | Inspector Name | Title | Signature |
|-----------|---------------|-------|-----------|
| **Yellow** (Food Handlers) | Orientation instructor for THAT application | Sanitation Chief | Luzminda signature |
| **Green** (Non-Food) | Most recent orientation instructor | Sanitation Chief | Luzminda signature |
| **Pink** (Skin-to-Skin) | Most recent orientation instructor | Sanitation Chief | Luzminda signature |

### **Why This Approach?**

1. **Yellow Cards (Food Handlers)**:
   - MUST complete orientation
   - Card should show who conducted THEIR training
   - Provides accountability and traceability

2. **Green/Pink Cards**:
   - Do NOT require orientation
   - Use most recent orientation instructor as a proxy for "current active inspector"
   - Automatically updates as new orientations happen

3. **Consistent Signature**:
   - One signature image for all cards (simplified management)
   - Signature image stored in systemConfig, easy to update

---

## 🔧 **Technical Implementation**

### **Architecture Overview**

```
Health Card Generation Flow:
│
├─ 1. Fetch systemConfig officials (City Health Officer + Sanitation Chief)
├─ 2. Classify card type (yellow/green/pink) based on job category
│
├─ 3. Determine Inspector:
│   │
│   ├─ IF Yellow Card:
│   │   └─ Query orientationBookings for THIS application
│   │   └─ Get instructor.name from that booking
│   │
│   └─ IF Green/Pink Card:
│       └─ Query ALL completed orientationBookings
│       └─ Sort by completedAt (most recent first)
│       └─ Get instructor.name from most recent
│
├─ 4. Override sanitationChief.name with inspector name
├─ 5. Generate HTML with dynamic inspector name
└─ 6. Store snapshot in healthCards table
```

---

## 💻 **How It Works**

### **Step-by-Step Flow**

#### **1. Yellow Card Generation (Food Handler)**

```typescript
// Application: Food handler completes orientation
// orientationBookings entry created with instructor info

// When health card is generated:
1. Classify card type → "yellow"
2. Query: getOrientationInstructor(applicationId)
3. Result: { name: "SeanPaul", designation: "Sanitation Chief" }
4. Card displays: "SeanPaul, Sanitation Chief"
```

**Example:**
```
Applicant: John Doe (Service Crew)
Orientation Date: Nov 10, 2025
Orientation Instructor: SeanPaul
Health Card Generated: Nov 11, 2025
Card Shows: "SeanPaul, Sanitation Chief" ✅
```

---

#### **2. Green/Pink Card Generation**

```typescript
// Application: Non-food worker or skin-to-skin worker (no orientation)

// When health card is generated:
1. Classify card type → "green" or "pink"
2. Query: getMostRecentOrientationInstructor()
3. Fetch all completed orientations, sort by completedAt
4. Result: { name: "akoinspector", designation: "Sanitation Chief" }
5. Card displays: "akoinspector, Sanitation Chief"
```

**Example:**
```
Timeline:
- Nov 10: SeanPaul conducts food orientation
- Nov 15: akoinspector conducts food orientation (most recent)
- Nov 16: Pink card generated for massage therapist

Card Shows: "akoinspector, Sanitation Chief" ✅
(Uses most recent orientation instructor)
```

---

#### **3. Automatic Updates**

```
Timeline Example:
┌─────────────────────────────────────────────────┐
│ Nov 10: SeanPaul conducts orientation           │
│   → Yellow cards: "SeanPaul"                    │
│   → Green/Pink cards: "SeanPaul"                │
├─────────────────────────────────────────────────┤
│ Nov 15: akoinspector conducts orientation       │
│   → Yellow cards: "akoinspector"                │
│   → Green/Pink cards: "akoinspector" (updated!) │
├─────────────────────────────────────────────────┤
│ Nov 20: testinspector conducts orientation      │
│   → Yellow cards: "testinspector"               │
│   → Green/Pink cards: "testinspector" (updated!)│
└─────────────────────────────────────────────────┘
```

---

## 📁 **File Changes**

### **Modified Files**

#### **1. `convex/healthCards/generateHealthCard.ts`**

**Changes:**
- Added `getMostRecentOrientationInstructor()` query (lines 1155-1199)
- Added `getOrientationInstructor()` query (lines 1201-1242)
- Modified card generation logic (lines 915-963)
- Updated signature handling

**Key Functions:**

```typescript
// NEW: Get most recent orientation instructor (for Green/Pink cards)
export const getMostRecentOrientationInstructor = internalQuery({
  args: {},
  handler: async (ctx) => {
    const completedBookings = await ctx.db
      .query("orientationBookings")
      .withIndex("by_status", (q) => q.eq("status", "completed"))
      .collect();
    
    const bookingsWithInstructor = completedBookings
      .filter(b => b.instructor?.name)
      .sort((a, b) => (b.completedAt || 0) - (a.completedAt || 0));
    
    return {
      name: bookingsWithInstructor[0].instructor.name,
      designation: "Sanitation Chief",
    };
  },
});

// NEW: Get orientation instructor for specific application (for Yellow cards)
export const getOrientationInstructor = internalQuery({
  args: { applicationId: v.id("applications") },
  handler: async (ctx, args) => {
    const booking = await ctx.db
      .query("orientationBookings")
      .withIndex("by_application", (q) => q.eq("applicationId", args.applicationId))
      .filter((q) => q.eq(q.field("status"), "completed"))
      .first();
    
    return {
      name: booking.instructor.name,
      designation: "Sanitation Chief",
    };
  },
});
```

---

#### **2. `convex/systemConfig/index.ts`**

**Changes:**
- Added `updateSanitationChiefSignature()` mutation (lines 189-216)
- Allows updating the signature image without changing name/designation

**Key Function:**

```typescript
export const updateSanitationChiefSignature = mutation({
  args: { signatureStorageId: v.id("_storage") },
  handler: async (ctx, args) => {
    const sanitationChief = await ctx.db
      .query("systemConfig")
      .withIndex("by_key", (q) => q.eq("key", "sanitation_chief"))
      .filter((q) => q.eq(q.field("value.isActive"), true))
      .first();

    await ctx.db.patch(sanitationChief._id, {
      value: {
        ...sanitationChief.value,
        signatureStorageId: args.signatureStorageId,
      },
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});
```

---

## 🗄️ **Database Schema**

### **Tables Used**

#### **1. `orientationBookings`**

```typescript
{
  _id: Id<"orientationBookings">,
  applicationId: Id<"applications">,
  status: "completed" | "scheduled" | "cancelled" | ...,
  instructor: {
    name: string,        // e.g., "SeanPaul"
    designation: string, // e.g., "Health Inspector"
  },
  completedAt: number,  // Timestamp when orientation was completed
  checkInTime: number,
  checkOutTime: number,
}
```

**Indexes Used:**
- `by_application` → Get orientation for specific application
- `by_status` → Get all completed orientations

---

#### **2. `systemConfig`**

```typescript
{
  _id: Id<"systemConfig">,
  key: "sanitation_chief",
  value: {
    name: "Luzminda N. Paig",
    designation: "Sanitation Chief",
    signatureStorageId: Id<"_storage">,
    isActive: true,
    effectiveFrom: number,
    effectiveTo?: number,
  },
  updatedAt: number,
  updatedBy: Id<"users">,
}
```

**Purpose:**
- Fallback name if no orientation data exists
- Stores signature image reference
- Can be updated via system config page

---

#### **3. `healthCards`**

```typescript
{
  _id: Id<"healthCards">,
  applicationId: Id<"applications">,
  registrationNumber: string,
  cardType: "yellow" | "green" | "pink",
  signedBy: {
    sanitationChief: {
      name: string,           // Inspector name (snapshot at generation time)
      designation: string,    // "Sanitation Chief"
      signatureUrl: string,   // Signature image URL
      configId?: Id<"systemConfig">,
    },
    cityHealthOfficer: { ... }
  },
  issuedDate: number,
  expiryDate: number,
}
```

**Key Points:**
- `signedBy` is a **snapshot** at generation time
- If inspector name changes later, old cards remain unchanged
- Provides historical accuracy

---

## 🧪 **Testing Guide**

### **Test Case 1: Yellow Card with Orientation**

**Setup:**
1. Create food handler application
2. Book orientation with inspector "SeanPaul"
3. Complete orientation (check-in/check-out)
4. Approve application

**Expected Result:**
```
Health Card:
Name: [Applicant Name]
Occupation: Service Crew
Inspector: SeanPaul
Title: Sanitation Chief
Signature: [Luzminda signature image]
```

**Verify:**
- Check Convex logs for: `✅ Yellow card: Using orientation instructor SeanPaul`

---

### **Test Case 2: Green Card (No Orientation)**

**Setup:**
1. Create non-food worker application
2. Approve application (no orientation required)

**Expected Result:**
```
Health Card:
Name: [Applicant Name]
Occupation: Security Guard
Inspector: [Most recent orientation instructor]
Title: Sanitation Chief
Signature: [Luzminda signature image]
```

**Verify:**
- Check Convex logs for: `✅ green card: Using most recent inspector [name]`

---

### **Test Case 3: Multiple Orientations**

**Setup:**
1. SeanPaul conducts orientation on Nov 10
2. Generate green card → Should show "SeanPaul"
3. akoinspector conducts orientation on Nov 15
4. Generate another green card → Should show "akoinspector"

**Expected Result:**
- First card: "SeanPaul"
- Second card: "akoinspector" (automatically updated)

---

### **Test Case 4: Fallback to systemConfig**

**Setup:**
1. Create new database with no orientations
2. Generate any card

**Expected Result:**
```
Inspector: Luzminda N. Paig (from systemConfig)
Title: Sanitation Chief
```

**Verify:**
- Check Convex logs for: `⚠️ No recent orientation found, using fallback`

---

## ⚙️ **System Config Management**

### **Update Signature Image**

#### **Via Convex Dashboard:**

1. Go to: https://dashboard.convex.dev
2. Navigate to **Storage** tab
3. Upload new signature image
4. Copy the Storage ID (starts with `kg...`)
5. Go to **Functions** tab
6. Run: `systemConfig/updateSanitationChiefSignature`
7. Input: `{ "signatureStorageId": "kg23x402qkj8sfm5x7kkcmbkqs7vevee" }`

#### **Result:**
- All future health cards use the new signature
- Existing cards remain unchanged (immutable snapshot)

---

### **Update Default Inspector Name**

If you need to change the fallback inspector name:

1. Go to **Data** tab
2. Find `systemConfig` table
3. Find entry with `key: "sanitation_chief"`
4. Edit `value.name` field
5. Save

**Note:** This only affects cards when no orientation data exists.

---

## 🐛 **Troubleshooting**

### **Issue 1: Card shows "Luzminda N. Paig" instead of inspector**

**Possible Causes:**
1. No completed orientations in database
2. Orientation booking missing `instructor` field
3. Query error

**Debug Steps:**
1. Check Convex logs for error messages
2. Verify orientationBookings table has completed entries
3. Verify `instructor.name` field is populated
4. Run query manually: `getMostRecentOrientationInstructor()`

---

### **Issue 2: Yellow card shows wrong inspector**

**Possible Causes:**
1. Application has no orientation booking
2. Orientation status is not "completed"
3. Wrong application ID

**Debug Steps:**
1. Check Convex logs: `[getOrientationInstructor] Fetching for application: [id]`
2. Query orientationBookings: `by_application` index
3. Verify `status === "completed"`
4. Verify `instructor` field exists

---

### **Issue 3: Green/Pink cards not updating**

**Possible Causes:**
1. Old cards are immutable (working as designed)
2. New orientations not marked as "completed"
3. `completedAt` field not set

**Debug Steps:**
1. Check if you're viewing an OLD card (regenerate to see changes)
2. Verify new orientation has `status: "completed"`
3. Verify `completedAt` timestamp is set
4. Check logs: `[getMostRecentOrientationInstructor] Found X completed orientations`

---

## 📊 **Console Log Reference**

### **Yellow Card Generation:**
```
Health card type classified as: yellow for job category: Food Category
[DEBUG] Yellow card detected, fetching orientation instructor for application j7...
[getOrientationInstructor] Fetching for application: j7...
[getOrientationInstructor] Orientation booking: { found: true, instructor: {...}, status: 'completed' }
[getOrientationInstructor] Returning instructor: { name: 'SeanPaul', originalDesignation: 'Health Inspector', overriddenTo: 'Sanitation Chief' }
✅ Yellow card: Using orientation instructor SeanPaul (Sanitation Chief)
```

### **Green/Pink Card Generation:**
```
Health card type classified as: green for job category: Non-Food Category
[DEBUG] green card detected, fetching most recent orientation instructor
[getMostRecentOrientationInstructor] Fetching most recent completed orientation
[getMostRecentOrientationInstructor] Found 5 completed orientations
[getMostRecentOrientationInstructor] Recent booking: { found: true, instructor: {...}, completedAt: 1731708433000, totalWithInstructor: 5 }
[getMostRecentOrientationInstructor] Returning instructor: { name: 'akoinspector', originalDesignation: 'Health Inspector' }
✅ green card: Using most recent inspector akoinspector (Sanitation Chief)
```

---

## 🎯 **Key Benefits**

1. **Accountability**: Yellow cards show who actually conducted the training
2. **Automation**: Green/Pink cards auto-update as new orientations happen
3. **Consistency**: All cards use same signature and title
4. **Flexibility**: Easy to update signature via systemConfig
5. **Historical Accuracy**: Old cards preserve original inspector names
6. **Fallback Safety**: Uses systemConfig if no orientation data exists

---

## 📝 **Future Enhancements (Optional)**

1. **Per-Inspector Signatures**: Store unique signatures per inspector
2. **Inspector Schedule**: Track which inspector is "on duty" by date
3. **Manual Override**: Allow admin to manually select inspector per card
4. **Designation Customization**: Allow different titles per inspector role

---

## 👥 **Roles & Permissions**

### **Inspector Role**
- Can conduct orientations
- Name appears on health cards
- Managed via `users.role = "inspector"`
- Must have `managedCategories` set

### **System Admin**
- Can update systemConfig
- Can change signatures
- Can view all cards

---

## 📚 **Related Documentation**

- `COLOR_CODED_HEALTHCARD_IMPLEMENTATION.md` - Card color system
- `INSPECTOR_ROLE_IMPLEMENTATION.md` - Inspector role details
- Convex Schema: `convex/schema.ts` lines 214-274 (orientationBookings)

---

**Implementation Complete**: November 16, 2025 ✅  
**Implemented By**: AI Assistant with Sean  
**Approved By**: [Pending Leader Review]

---

## 📞 **Support**

For questions or issues, check:
1. This documentation
2. Convex logs (dashboard.convex.dev)
3. Code comments in `generateHealthCard.ts`

---

**End of Documentation**
