# Demo Script - Document Verification Improvements

## Presentation Flow for Your Leader

---

## INTRO (30 seconds)

**You**: "Hi Sir/Ma'am, I've implemented improvements to our Document Verification system that will make the medical referral process more professional and efficient. Let me show you what changed."

---

## PART 1: Document Type Classification (1 minute)

**You**: "First, we now properly distinguish between two types of documents:"

**Show on screen**: Open an application in doc_verif page

**You**: 
- "**Medical Requirements** - like Chest X-ray, Urinalysis, Drug Test - these can be *approved* OR *referred to a doctor*"
- "**Non-Medical Requirements** - like Valid ID, 2x2 Picture, Cedula - these can only be *approved*"

**Point out**: 
- "See here? Medical documents show TWO buttons: 'Approve' and 'Refer to Doctor'"
- "But non-medical documents only show ONE button: 'Approve'"

---

## PART 2: Medical Referral Process (3 minutes)

**You**: "Let me show you the new medical referral workflow."

### Step 1: Click "Refer to Doctor"
**You**: "When a medical result fails, I click 'Refer to Doctor' on, let's say, the Chest X-ray."

**Show on screen**: Click the blue "Refer to Doctor" button

### Step 2: Referral Form Opens
**You**: "A form opens with specific options for medical referrals. Notice these are different from the non-medical remarks."

**Point out the fields**:
1. **Doctor Name** (required field)
   - "The admin MUST enter the doctor's name here"
   
2. **Medical Referral Reason** (checkboxes)
   - "We have pre-set medical reasons like:"
     - Abnormal chest X-ray result
     - Elevated urinalysis values
     - Positive drug test result
     - etc.

3. **Additional Notes** (auto-filled message)
   - **You**: "Watch this - as I type the doctor's name..."

### Step 3: Type Doctor Name
**You type**: "Dr. Juan Dela Cruz"

**You**: "See? The message auto-updates: *'Failed Medical Result (Chest X-ray) - Please refer to Dr. Juan Dela Cruz at Door 7, Magsaysay Complex, Magsaysay Park, Davao City.'*"

**You**: "The clinic location is pre-filled for consistency."

### Step 4: Select Referral Reason
**You**: "I select the medical reason..." (click checkbox "Abnormal chest X-ray result")

### Step 5: Save Referral
**You**: "Click 'Save Referral'..."

**Point out**: 
- "Status changes to 'Referred'"
- **IMPORTANT**: "But notice - the applicant hasn't received a notification yet!"

---

## PART 3: Pending Notification Indicator (1 minute)

**You**: "Look at the Final Actions section on the left."

**Point to the blue notification box**:
**You**: "It now shows: *'1 pending referral/management notification to be sent to applicant'*"

**You**: "This means:"
- ✅ The referral is saved
- ✅ But notification is NOT sent yet
- ✅ Admin can prepare multiple referrals first

**Optional**: Refer another medical document to show the count increase

**You**: "If I refer another medical document... watch the count update to '2 pending referral/management notifications'"

---

## PART 4: Notification Control Flow (2 minutes)

**You**: "This is the key improvement. Let me explain the workflow:"

### Before (Old System):
**You**: "Before, every time we saved a referral, an immediate notification was sent to the applicant. This could spam them with multiple notifications."

### Now (New System):
**You**: "Now, admins have control:"

1. **Save Referral** → No notification sent (just queued)
2. **Admin reviews all referrals**
3. **Admin clicks 'Send Referral Notification' button**
4. **All notifications sent at once**

**Show on screen**: Click the "Send Referral Notification" button

**You**: "When I click this, a confirmation modal appears..."

**Show confirmation modal**:
**You**: "It confirms: '2 referral notifications will be sent (one per medical document referred)'"

**Click "Send Notifications"**:
**You**: "And NOW the applicant receives the notifications."

---

## PART 5: Applicant Experience (1 minute)

**You**: "From the applicant's perspective, they will receive a clear notification like this:"

**Read out loud (or show mobile mockup)**:
```
📋 Medical Document Referral Required

Your Chest X-ray requires medical consultation.

Please refer to Dr. Juan Dela Cruz at:
📍 Door 7, Magsaysay Complex, Magsaysay Park, Davao City

Reason: Abnormal chest X-ray result

Please complete this consultation and resubmit your documents.
```

**You**: "Clear, professional, and with all the information they need."

---

## PART 6: Non-Medical Documents (1 minute)

**You**: "For non-medical documents, the process is simpler."

**Show on screen**: Scroll to Valid Government ID

**Point out**:
- "Only ONE button: 'Approve'"
- "If I need to add a remark, I click the edit icon"

**Show remark form**:
**You**: "Different remark options - these are for document quality issues, not medical:"
- Invalid Government-issued ID
- Expired ID
- Blurry or unclear photo
- etc.

**You**: "These remarks are saved but don't trigger referral workflows."

---

## PART 7: Benefits Summary (1 minute)

**You**: "To summarize the benefits:"

1. ✅ **Professional medical referral process** - doctor names, locations, clear instructions
2. ✅ **No notification spam** - admin controls when to send
3. ✅ **Better admin workflow** - batch referrals before sending
4. ✅ **Transparency** - always see pending notification count
5. ✅ **Proper documentation** - referral reasons tracked in database
6. ✅ **Compliance** - follows medical referral best practices

---

## PART 8: Technical Implementation (30 seconds)

**You**: "From a technical standpoint:"
- "Only **WebAdmin frontend** was modified - one file"
- "**Backend** already supported this workflow - no changes needed!"
- "**Mobile app** unchanged - no impact on applicants' app"

---

## CLOSING (30 seconds)

**You**: "That's the overview. The system is ready to test. Do you have any questions or would you like me to demonstrate any specific scenario?"

---

## COMMON QUESTIONS & ANSWERS

### Q1: "Can we change the clinic location?"
**A**: "Yes! Currently it's hardcoded to 'Door 7, Magsaysay Complex' but we can make this configurable per doctor or add a dropdown for different clinic locations."

### Q2: "Can we add more doctors to a list?"
**A**: "Absolutely! Right now the admin types the name freely, but we can create a doctor database with auto-complete suggestions. That would be a good next enhancement."

### Q3: "What if the admin forgets to send the notification?"
**A**: "The pending notification indicator (the blue box) will always be visible as a reminder. We could also add a dashboard alert for pending notifications if needed."

### Q4: "Can we track which doctor gets the most referrals?"
**A**: "Yes! The doctor name is stored in the database. We can create an analytics dashboard showing referral statistics per doctor, per medical requirement, etc."

### Q5: "What happens if the applicant completes the consultation?"
**A**: "They resubmit their updated medical document through the mobile app. The new submission appears in the doc_verif page for admin review again."

### Q6: "Can we print or export the referral?"
**A**: "That's a great idea! We can add a 'Generate Referral Letter' button that creates a PDF with the referral details. Would you like that added?"

---

## BACKUP SCENARIOS (If Time Permits)

### Scenario A: Mixed Approval/Referral
1. Approve Valid ID ✅
2. Approve 2x2 Picture ✅
3. Approve Urinalysis ✅
4. Refer Chest X-ray to Dr. A ⚠️
5. Refer Drug Test to Dr. B ⚠️
6. Show pending count: "2 pending notifications"
7. Send all at once

### Scenario B: High Referral Rate Warning
1. Refer 4+ medical documents
2. Show the red warning: "⚠️ High Referral Rate (4 of 6)"
3. Explain: This alerts admin to review carefully before sending

---

## TIPS FOR SUCCESSFUL DEMO

✅ **Do**:
- Speak confidently and clearly
- Point to specific UI elements as you explain
- Pause for questions
- Show enthusiasm about improvements

❌ **Don't**:
- Rush through the demo
- Use too much technical jargon
- Skip the "why this matters" explanations
- Forget to show the pending notification indicator

---

## POST-DEMO ACTION ITEMS

After the demo, ask your leader:

1. "Should we proceed with testing this on staging?"
2. "Are there any changes you'd like to see?"
3. "Should I prepare training materials for other admins?"
4. "Would you like me to schedule a demo for the full team?"

---

**Good luck with your presentation, bro! 🎉**

**Estimated Total Time**: 10-12 minutes
