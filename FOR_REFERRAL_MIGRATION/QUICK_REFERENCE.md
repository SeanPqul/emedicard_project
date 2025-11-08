# Quick Reference Card - Referral Migration

## 🚀 Ultra-Fast Migration (3 Steps)

### If NO conflicts with leader's repo:
```bash
# 1. Backup
cp apps/webadmin/src/app/dashboard/[id]/doc_verif/page.tsx apps/webadmin/src/app/dashboard/[id]/doc_verif/page.tsx.backup

# 2. Copy
cp FOR_REFERRAL_MIGRATION/page.tsx apps/webadmin/src/app/dashboard/[id]/doc_verif/page.tsx

# 3. Test
npm run dev
```

Done! ✅

---

## 🔍 What Changed? (5 Key Areas)

### 1. **Constants** (Top of file)
```diff
- const remarkOptions = [...]
+ const medicalReferralReasons = [...]
+ const nonMedicalRemarkOptions = [...]
```

### 2. **Remarks Form** (Line ~715)
```diff
- {remarkOptions.map(option => (
+ {(isMedicalDocument(item.fieldIdentifier) ? medicalReferralReasons : nonMedicalRemarkOptions).map(option => (
```

### 3. **Auto-Message** (Line ~689)
```diff
- Failed medical requirement (X). Please refer to Dr. Y, at Door 7...
+ Failed Medical Result (X) - Please refer to Dr. Y at Door 7...
```

### 4. **Notification Text** (Line ~507)
```diff
- 'Referral Notifications Queued'
+ 'Pending Referral/Management Notifications'
```

### 5. **Prefill Default** (Line ~817)
```diff
- setReferralReason('Medical Follow-up Required');
+ setReferralReason('Other medical concern');
```

---

## 🎯 5-Second Summary

**One file changed**: `apps/webadmin/src/app/dashboard/[id]/doc_verif/page.tsx`

**Changes**:
- Medical docs → different remark options
- Auto-message format improved
- Notification wording more professional
- No backend changes needed ✅

---

## 🧪 Quick Test

After migration:
1. Open doc_verif page ✅
2. Medical doc shows 2 buttons ✅
3. Non-medical shows 1 button ✅
4. Type doctor name → message updates ✅
5. Save referral → NO notification ✅
6. Click "Send Referral" → notification sent ✅

---

## 🆘 Emergency Rollback

```bash
cp apps/webadmin/src/app/dashboard/[id]/doc_verif/page.tsx.backup apps/webadmin/src/app/dashboard/[id]/doc_verif/page.tsx
```

---

## 📁 Files in This Folder

- `page.tsx` - The modified code
- `MIGRATION_GUIDE.md` - Detailed instructions
- `LEADER_SUMMARY_DOC_VERIF_IMPROVEMENTS.md` - What to tell your leader
- `DEMO_SCRIPT_FOR_LEADER.md` - How to demo
- `QUICK_REFERENCE.md` - This file

---

**Created**: November 8, 2025  
**Risk Level**: 🟢 Low (frontend only)  
**Time to migrate**: ~5 minutes
