# Document Status Migration Analysis
## Changing `reviewStatus` from "Approved" to "Verified"

**Date**: 2025-11-15  
**Purpose**: Change document review status from "Approved" to "Verified" for medical industry standards  
**Risk Level**: 🟡 MEDIUM-HIGH (Many hardcoded references)

---

## 📋 Current Status Values

### Schema Definition (`schema.ts` lines 97-103)
```typescript
// reviewStatus values:
// - "Pending" - Awaiting admin review
// - "Approved" - Document approved ← CHANGE TO "Verified"
// - "Rejected" - DEPRECATED
// - "Referred" - Medical referral
// - "NeedsRevision" - Document needs resubmission
```

---

## 🔍 Files That Need Changes

### 1️⃣ **CRITICAL - Backend Core** (Must change first)

#### A. Schema & Types
- ✅ `backend/convex/schema.ts` (line 99) - Update comment
- ⚠️ Check if there are TypeScript types that define this status

#### B. Backend Mutations (Sets status)
1. `backend/convex/admin/reviewDocument.ts` (line 35)
   - Currently: `reviewStatus: args.status` where `args.status` is "Approved"
   - Change: Map "Approved" → "Verified" OR change mutation arg type

2. `backend/convex/admin/adminMain.ts` (line 181)
   - `allDocuments.every(doc => doc.reviewStatus === "Approved")`
   - Change to: `=== "Verified"`

3. `backend/convex/requirements/uploadDocuments.ts` (lines 123, 126, 128)
   - Check for "Approved" comparisons

#### C. Backend Queries (Reads status)
1. `backend/convex/dashboard/getDashboardData.ts` (line 72)
   - **ALREADY FIXED**: `=== "Approved"`

2. `backend/convex/admin/finalizeApplication.ts` (multiple lines)
   - Check all document verification logic

3. `backend/convex/superAdmin/queries.ts` (multiple lines)
   - Super admin queries that filter by status

---

### 2️⃣ **CRITICAL - WebAdmin UI** (User-facing)

#### `apps/webadmin/src/app/dashboard/[id]/doc_verif/page.tsx`
**High Impact File** - Many hardcoded "Approved" references:

**Lines to change:**
- Line 111: `'Approved': 'bg-emerald-50...'` (Status badge styling)
- Line 525: Status check logic
- Line 1626, 1959, 1965, 1982, 2010, 2029: Various "Approved" checks

**UI Impact:**
- Button text: "Approve" → Should it be "Verify"?
- Status badge: "Approved" → "Verified"
- Filtering/sorting logic

---

### 3️⃣ **MEDIUM - Mobile App UI**

#### `apps/mobile/src/screens/shared/ViewDocumentsScreen/ViewDocumentsScreen.tsx`
Lines 352-359: Status display logic
```typescript
case 'Approved':
  return { color: colors.semantic.success, text: 'Approved', icon: 'checkmark-circle' };
```
- Change to: `case 'Verified':`

---

### 4️⃣ **LOW - Documentation & Tests**
- Various `.md` files with "Approved" references
- Test files that assert "Approved" status

---

## ⚠️ Migration Risks

### HIGH RISK:
1. **Existing Data**: Database already has documents with `reviewStatus: "Approved"`
   - ❌ Would break: All existing approved documents won't show as verified
   - ✅ Solution: Need data migration script

2. **WebAdmin Buttons**: "Approve" button calls mutation with "Approved" status
   - ❌ Would break: New approvals won't work
   - ✅ Solution: Change mutation args OR map at mutation level

3. **Status Filtering**: Admin dashboard filters by "Approved"
   - ❌ Would break: Can't find approved documents
   - ✅ Solution: Update all query filters

### MEDIUM RISK:
1. **Activity Logs**: May have "approved" in activity descriptions
   - ⚠️ Historical data will still say "approved"
   - ✅ Solution: Acceptable, or add text mapping

2. **Notifications**: User notifications may reference "approved"
   - ⚠️ Existing notifications will have old text
   - ✅ Solution: Only affects new notifications

---

## 📝 Recommended Migration Strategy

### Option 1: **Full Migration** (Recommended but Complex)
**Steps:**
1. Create database migration script to update all `reviewStatus: "Approved"` → `"Verified"`
2. Update all backend code simultaneously
3. Update webadmin UI
4. Update mobile app
5. Deploy all at once

**Pros:** Clean, industry-standard terminology  
**Cons:** High risk, requires coordination, database migration

---

### Option 2: **Dual Support** (Safer)
**Steps:**
1. Update backend to accept BOTH "Approved" AND "Verified"
2. Change mutations to write "Verified" for new approvals
3. Update queries to check `status === "Verified" || status === "Approved"`
4. Update UI gradually
5. Eventually deprecate "Approved"

**Pros:** No breaking changes, gradual migration  
**Cons:** Technical debt, complexity

---

### Option 3: **Display-Only Change** (Safest)
**Steps:**
1. Keep database as "Approved"
2. Only change UI display: "Approved" → "Verified"
3. No backend changes needed

**Pros:** Zero risk, immediate  
**Cons:** Not truly industry-standard (data still says "Approved")

---

## 🎯 My Recommendation

Given the complexity and risk, I recommend **Option 2: Dual Support** with this phased approach:

### Phase 1: Backend Foundation (Low Risk)
1. Update `reviewDocument.ts` to write "Verified" instead of "Approved"
2. Update all queries to check for BOTH statuses:
   ```typescript
   doc.reviewStatus === "Verified" || doc.reviewStatus === "Approved"
   ```
3. Test thoroughly

### Phase 2: UI Updates (Medium Risk)
1. Update webadmin to display "Verified" badge
2. Change button text "Approve" → "Verify"
3. Update mobile app status display

### Phase 3: Data Migration (Optional)
1. Create script to migrate old "Approved" → "Verified"
2. Run during off-peak hours
3. Remove dual support code

---

## 🚨 What NOT to Do

❌ **Don't** change backend without updating webadmin  
❌ **Don't** skip database migration if going full migration  
❌ **Don't** forget to update TypeScript types  
❌ **Don't** change only one file - must be coordinated  

---

## ✅ Checklist Before Making Changes

- [ ] Backup database
- [ ] Review ALL files in grep results
- [ ] Create rollback plan
- [ ] Test in development environment
- [ ] Update TypeScript types
- [ ] Check for any "Approved" string literals
- [ ] Test webadmin approval flow
- [ ] Test mobile app document display
- [ ] Test dashboard calculations

---

## 💡 Decision

**Should we proceed?** 
- ✅ YES if: Using Option 2 (Dual Support)
- ⚠️ MAYBE if: Using Option 1 (need dedicated migration window)
- ✅ SAFE if: Using Option 3 (display-only)

**My recommendation:** Start with **Option 2** to be safe, then migrate data later.
