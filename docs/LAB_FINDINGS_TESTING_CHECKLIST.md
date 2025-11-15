# Lab Findings Integration - Testing Checklist
## 🧪 Comprehensive Testing Guide

**Date**: January 15, 2025  
**Feature**: Lab Findings Integration into Document Verification  
**Risk Level**: LOW (optional feature, non-breaking)

---

## ✅ Pre-Test Checklist

- [ ] Development server running (`npm run dev`)
- [ ] Backend Convex synced
- [ ] Test user with admin/system_admin role ready
- [ ] Test application with medical referral available

---

## 🧪 Test Scenarios

### Test 1: Normal Workflow (No Impact Test)
**Objective**: Verify existing workflow still works perfectly

**Steps**:
1. Open document verification page for any application
2. Review non-medical documents (e.g., Valid ID, Photo)
3. Approve documents normally
4. ✅ **Expected**: No "Record Finding" button appears
5. ✅ **Expected**: Approval works exactly as before

**Status**: [ ] PASS [ ] FAIL  
**Notes**: ______________________________

---

### Test 2: Medical Document - First Submission
**Objective**: Verify button doesn't appear for initial medical submissions

**Steps**:
1. Open application with medical documents (chest x-ray, urinalysis, etc.)
2. Review the medical document (first submission, not resubmitted)
3. Check available buttons: View, Extract
4. ✅ **Expected**: NO "Record Finding" button (because not a resubmission)
5. Can refer to doctor normally
6. ✅ **Expected**: Everything works as usual

**Status**: [ ] PASS [ ] FAIL  
**Notes**: ______________________________

---

### Test 3: Resubmitted Medical Document (Main Feature Test)
**Objective**: Test the new Lab Findings integration

**Preparation**:
- Need an application where medical document was referred and resubmitted
- Application status should NOT be "Rejected" or "Approved"

**Steps**:
1. Open doc verification for application with resubmitted medical cert
2. ✅ **Expected**: See "Record Finding" button (teal color) after View/Extract
3. Click "Record Finding" button
4. ✅ **Expected**: Inline form opens with:
   - Teal gradient background
   - Title: "Record Lab Finding for [Document Name]"
   - Blue info box explaining it's optional
   - Lab Findings form with all fields
   - Close (X) button in top-right
5. Fill in the form:
   - Test Type: Select "Urinalysis"
   - Finding: Select "WBC elevated – Cleared post-Rx"
   - Cleared Date: Today's date
   - Monitoring Period: "1 month (Recommended)" (should be default)
   - Doctor: Should auto-fill "Dr. Marjorie D. Culas"
   - Clinic: Should auto-fill "City Health Office, Davao City"
   - Treatment Notes: (optional) "Patient completed treatment"
   - Display on card: Keep checked
6. Click "Save Finding"
7. ✅ **Expected**: 
   - Form closes
   - Success message: "✅ Lab finding recorded successfully! This will appear on the health card when approved."
   - Message disappears after 4 seconds
8. Refresh page
9. ✅ **Expected**: Can click "Record Finding" again if needed (form is reusable)
10. Proceed to approve application normally
11. ✅ **Expected**: Approval works without issues

**Status**: [ ] PASS [ ] FAIL  
**Notes**: ______________________________

---

### Test 4: Form Cancel/Close
**Objective**: Verify form can be cancelled cleanly

**Steps**:
1. Open resubmitted medical document page
2. Click "Record Finding"
3. Form opens
4. **Test A**: Click X button in top-right
   - ✅ **Expected**: Form closes cleanly
5. Click "Record Finding" again
6. **Test B**: Click "Cancel" button at bottom
   - ✅ **Expected**: Form closes cleanly
7. Click "Record Finding" again
8. **Test C**: Fill partial data, then click Cancel
   - ✅ **Expected**: Form closes, no data saved, no errors
9. ✅ **Expected**: Can reopen form multiple times without issues

**Status**: [ ] PASS [ ] FAIL  
**Notes**: ______________________________

---

### Test 5: Optional Feature Test (Skip Recording)
**Objective**: Verify recording findings is truly optional

**Steps**:
1. Open application with resubmitted medical document
2. See "Record Finding" button
3. **DO NOT CLICK IT**
4. Scroll down and approve application directly
5. ✅ **Expected**: Application approves without any errors
6. ✅ **Expected**: Health card generates (without findings - this is OK!)
7. ✅ **Expected**: No validation errors about missing findings

**Status**: [ ] PASS [ ] FAIL  
**Notes**: ______________________________

---

### Test 6: Health Card Generation with Findings
**Objective**: Verify findings appear on generated health card

**Preparation**:
- Application with resubmitted medical document
- Record a lab finding first

**Steps**:
1. Open doc verification page
2. Record a lab finding:
   - Test Type: X-Ray / Sputum
   - Finding: "Chest X-ray abnormal – TB ruled out, Cleared"
   - Cleared Date: 01/15/2025
   - Monitoring Period: 1 month
   - Doctor: Dr. Marjorie D. Culas
3. Approve all documents
4. Approve application (finalize)
5. Wait for health card generation
6. View generated health card
7. ✅ **Expected**: Finding appears in "X-RAY / SPUTUM" section on card back
8. ✅ **Expected**: Shows: Date | Kind | Exp Date
9. ✅ **Expected**: Expiry date = Cleared date + 1 month

**Status**: [ ] PASS [ ] FAIL  
**Notes**: ______________________________

---

### Test 7: Multiple Findings
**Objective**: Test recording multiple findings for same application

**Steps**:
1. Application with multiple resubmitted medical documents (e.g., urinalysis + x-ray)
2. Record finding for urinalysis document
3. Record finding for x-ray document
4. Approve application
5. ✅ **Expected**: Health card shows BOTH findings in respective sections

**Status**: [ ] PASS [ ] FAIL  
**Notes**: ______________________________

---

### Test 8: Rejected Application (Button Should NOT Appear)
**Objective**: Verify button doesn't appear for rejected applications

**Steps**:
1. Open doc verification for a REJECTED application
2. ✅ **Expected**: "Record Finding" button does NOT appear
3. ✅ **Expected**: Cannot record findings for rejected apps

**Status**: [ ] PASS [ ] FAIL  
**Notes**: ______________________________

---

### Test 9: Existing Referral/Flag Forms (No Conflicts)
**Objective**: Verify Lab Findings form doesn't break existing forms

**Steps**:
1. Open any document for review
2. Click "Refer to Doctor" button
3. ✅ **Expected**: Referral form opens normally
4. Close referral form
5. Click "Flag for Revision" button
6. ✅ **Expected**: Flag form opens normally
7. Close flag form
8. (If resubmitted medical doc) Click "Record Finding"
9. ✅ **Expected**: Lab Findings form opens normally
10. ✅ **Expected**: All three forms work independently without conflicts

**Status**: [ ] PASS [ ] FAIL  
**Notes**: ______________________________

---

### Test 10: Mobile Responsiveness
**Objective**: Verify form works on smaller screens

**Steps**:
1. Open browser dev tools
2. Switch to mobile view (iPhone 12 or similar)
3. Open resubmitted medical document page
4. ✅ **Expected**: "Record Finding" button visible and clickable
5. Click button
6. ✅ **Expected**: Form displays correctly on small screen
7. ✅ **Expected**: All fields accessible
8. ✅ **Expected**: Buttons don't overlap

**Status**: [ ] PASS [ ] FAIL  
**Notes**: ______________________________

---

## 🔍 Edge Cases to Test

### Edge Case 1: Network Error During Save
**Steps**:
1. Open network throttling in dev tools
2. Fill lab findings form
3. Disconnect network briefly
4. Click "Save Finding"
5. ✅ **Expected**: Error message displays
6. ✅ **Expected**: Form data preserved (can retry)

**Status**: [ ] PASS [ ] FAIL

---

### Edge Case 2: Concurrent Form Opens
**Steps**:
1. Open "Refer to Doctor" form
2. While referral form is open, click "Record Finding"
3. ✅ **Expected**: Only one form visible at a time
4. ✅ **Expected**: No UI glitches or overlaps

**Status**: [ ] PASS [ ] FAIL

---

### Edge Case 3: Long Document Names
**Steps**:
1. Test with document that has very long name
2. Click "Record Finding"
3. ✅ **Expected**: Form title wraps or truncates gracefully
4. ✅ **Expected**: No layout breaking

**Status**: [ ] PASS [ ] FAIL

---

## 🚨 Critical Checks

### ❌ MUST NOT BREAK:
- [ ] Normal document approval workflow
- [ ] Payment validation flow
- [ ] Orientation checks
- [ ] Referral to doctor functionality
- [ ] Flag for revision functionality
- [ ] Application finalization
- [ ] Health card generation (even without findings)

### ✅ MUST WORK:
- [ ] Button only shows for resubmitted medical docs
- [ ] Form can be opened and closed cleanly
- [ ] Findings save to database
- [ ] Findings appear on health card when recorded
- [ ] Form is truly optional (can skip)
- [ ] Success/error messages display correctly

---

## 📊 Performance Checks

- [ ] Page loads without TypeScript errors
- [ ] No console errors when opening form
- [ ] No console warnings
- [ ] Form opens/closes smoothly (< 100ms)
- [ ] Save operation completes in reasonable time (< 2s)

---

## 🎯 Acceptance Criteria

**Feature is ready for production when**:
- [ ] All test scenarios pass
- [ ] No critical bugs found
- [ ] No breaking changes to existing workflow
- [ ] Health card correctly displays findings
- [ ] Form is responsive on mobile
- [ ] Error handling works properly
- [ ] Team lead approval obtained

---

## 📝 Bug Report Template

**If you find bugs, report using this format**:

**Bug**: [Short description]  
**Severity**: [Critical/High/Medium/Low]  
**Steps to Reproduce**:
1. 
2. 
3. 

**Expected**: [What should happen]  
**Actual**: [What actually happened]  
**Screenshot**: [If applicable]  
**Browser**: [Chrome/Firefox/Safari/etc.]  
**Impact**: [How it affects functionality]

---

## ✅ Sign-Off

**Tested By**: _______________  
**Date**: _______________  
**Result**: [ ] APPROVED [ ] NEEDS FIXES  

**Approved for Production By**: _______________  
**Date**: _______________

---

## 🚀 Next Steps After Testing

If all tests pass:
1. [ ] Update user documentation
2. [ ] Notify team of new feature
3. [ ] Add feature to release notes
4. [ ] Deploy to staging
5. [ ] Final UAT on staging
6. [ ] Deploy to production
7. [ ] Monitor for issues

If tests fail:
1. [ ] Document all bugs
2. [ ] Fix critical issues
3. [ ] Re-test after fixes
4. [ ] Repeat until all tests pass
