# 🎯 Dynamic Inspector Names - Final Implementation

## ✅ **What's Implemented:**

### **Yellow Cards (Food Handlers)**
- Shows the **actual inspector** who approved the application
- Gets name from `users.fullname`
- Checks if inspector role has `managedCategories` for the application's job category
- **Designations**:
  - `system_admin` → "City Health Inspector"
  - `inspector` → "Food Safety Inspector"
  - `admin` → "Sanitation Inspector"

### **Green/Pink Cards (Non-Food/Skin-to-Skin)**
- Shows **fixed name** from `systemConfig.sanitation_chief`
- Default: "Luzminda N. Paig, Sanitation Chief"
- Can be updated via System Config page

### **Signature (All Cards)**
- Same signature image for ALL cards
- Stored in `systemConfig.sanitation_chief.signatureStorageId`
- Update via: `systemConfig/updateSanitationChiefSignature`

---

## 🔧 **Technical Details:**

### **1. Inspector Verification Logic**

```typescript
// backend/convex/healthCards/generateHealthCard.ts (lines 1131-1165)

// Step 1: Get inspector who approved
const inspector = await ctx.db.get(application.lastUpdatedBy);

// Step 2: Verify inspector manages this category (for role=inspector)
if (inspector.role === "inspector" && inspector.managedCategories) {
  const managesThisCategory = inspector.managedCategories.includes(application.jobCategoryId);
  if (!managesThisCategory) {
    return null; // Falls back to systemConfig sanitation_chief
  }
}

// Step 3: Determine designation
let designation = "Sanitation Inspector";
if (inspector.role === "system_admin") {
  designation = "City Health Inspector";
} else if (inspector.role === "inspector") {
  designation = "Food Safety Inspector";
}
```

### **2. Card Type Logic**

```typescript
// Lines 911-939

// After classifying card type
const cardType = classifyCardType(application.jobCategoryName);

// If YELLOW card, use dynamic inspector
if (cardType === 'yellow') {
  const inspector = await getInspectorWhoApproved(applicationId);
  if (inspector) {
    sanitationChief = {
      name: inspector.name,
      designation: inspector.designation,
      signatureUrl: sanitationChiefSignatureUrl
    };
  }
}
// If GREEN/PINK, use systemConfig sanitation_chief
```

---

## 📋 **User Roles in Database:**

### **Schema** (`convex/schema.ts`):
```typescript
users: {
  fullname: string,
  role: "applicant" | "inspector" | "admin" | "system_admin",
  managedCategories: Id<"jobCategories">[],  // Which categories they manage
}
```

### **Role Hierarchy:**
1. **system_admin**: Manages ALL categories, highest privilege
2. **admin**: Manages specific categories (or all if legacy)
3. **inspector**: Manages specific categories, typically food-related
4. **applicant**: Regular user, no admin privileges

---

## 🧪 **Test Scenarios:**

### **Test 1: Yellow Card with Inspector**
1. Create user with role=`inspector`
2. Set `managedCategories` to include food category
3. Approve food handler application as that inspector
4. Generate health card
5. **Expected**: Card shows inspector's name + "Food Safety Inspector"

### **Test 2: Yellow Card with Admin**
1. Approve food handler application as admin
2. **Expected**: Card shows admin's name + "Sanitation Inspector"

### **Test 3: Yellow Card with System Admin**
1. Approve food handler application as system_admin
2. **Expected**: Card shows system_admin's name + "City Health Inspector"

### **Test 4: Green Card (Non-Food)**
1. Approve non-food application as ANY admin
2. **Expected**: Card shows "Luzminda N. Paig, Sanitation Chief" (from systemConfig)

### **Test 5: Inspector Wrong Category**
1. Inspector manages only "Food Category"
2. Approves "Non-Food Category" application
3. Yellow card: Falls back to "Luzminda N. Paig" (inspector doesn't manage that category)

---

## 🎯 **Key Benefits:**

✅ **Accountability**: Yellow cards show who actually handled food orientation  
✅ **Role-Based**: Respects `managedCategories` for inspectors  
✅ **Flexible**: Green/Pink keep stable official name  
✅ **Single Signature**: One image for all, easy to manage  
✅ **Secure**: Verifies inspector actually manages the category  

---

## 🚨 **Fallback Behavior:**

If ANY of these fail, system falls back to `systemConfig.sanitation_chief`:
- Inspector not found
- Inspector doesn't manage the category
- `lastUpdatedBy` is null
- Query error

This ensures health cards ALWAYS have a valid signature/name.

---

**Implementation Complete**: November 15, 2025 ✅
