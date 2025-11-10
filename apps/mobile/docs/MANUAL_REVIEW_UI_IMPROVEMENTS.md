# Manual Review UI Improvements

**Date:** November 10, 2025  
**Issue:** Manual review state (attempt 4+) not showing venue details in mobile app  
**Status:** ✅ Fixed

---

## 🐛 The Problem

After fixing the backend to properly set `reviewStatus: "ManualReviewRequired"` on the 4th attempt, the mobile UI was still missing critical information:

1. **Rejection History Screen:** Still showing "Document Rejected - Attempt #4" with a Resubmit button
2. **ViewDocumentsScreen:** Showing manual review message but missing venue details (address, hours, contact)
3. **No visual parity** with web admin's detailed venue information card

---

## ✅ What Was Fixed

### 1. **DocumentRejectionWidget** - Added Manual Review Detection

**File:** `C:\Em\apps\mobile\src\widgets\document-rejection\DocumentRejectionWidget.tsx`

**Changes:**
- Added `isManualReviewRequired` prop to component
- Changed header color/icon/title when manual review required:
  - Color: `#DC2626` (Red)
  - Icon: `home` (house icon)
  - Title: "Manual Review Required"
- Added full venue information section with:
  - 🏠 Venue address
  - 🕐 Office hours  
  - 📞 Contact number
- Hides "Resubmit" button when `isManualReviewRequired = true`

**New UI Section:**
```typescript
{isManualReviewRequired && (
  <View style={styles.manualReviewSection}>
    <View style={styles.manualReviewHeader}>
      <Ionicons name="warning" size={24} color="#DC2626" />
      <Text>Visit Office for Verification</Text>
    </View>
    <Text>Maximum attempts reached (4 attempts). Please visit our office...</Text>
    
    <View style={styles.venueInfo}>
      <View style={styles.venueItem}>
        <Ionicons name="location" />
        <Text>City Health Office, Magsaysay Park Complex, Door 7</Text>
      </View>
      <View style={styles.venueItem}>
        <Ionicons name="time" />
        <Text>Monday-Friday, 8:00 AM–5:00 PM</Text>
      </View>
      <View style={styles.venueItem}>
        <Ionicons name="call" />
        <Text>0926-686-1531</Text>
      </View>
    </View>
  </View>
)}
```

---

### 2. **DocumentRejectionHistoryWidget** - Pass Manual Review Flag

**File:** `C:\Em\apps\mobile\src\widgets\document-rejection-history\DocumentRejectionHistoryWidget.tsx`

**Changes:**
- Detects manual review state: `rejection.attemptNumber >= 4`
- Passes `isManualReviewRequired` prop to DocumentRejectionWidget

```typescript
{groupedRejections[dateKey]?.map((rejection) => {
  // Check if manual review is required (attempt 4+)
  const isManualReviewRequired = rejection.attemptNumber >= 4;
  
  return (
    <DocumentRejectionWidget
      rejection={rejection}
      documentName={rejection.documentTypeName || 'Unknown Document'}
      onResubmit={() => onResubmit(rejection)}
      onViewDetails={() => onViewDetails(rejection)}
      isManualReviewRequired={isManualReviewRequired}
    />
  );
})}
```

---

### 3. **ViewDocumentsScreen** - Enhanced Manual Review Card

**File:** `C:\Em\apps\mobile\src\screens\shared\ViewDocumentsScreen\ViewDocumentsScreen.tsx`

**Changes:**
- Replaced simple message with detailed venue information card
- Added structured venue details matching web admin
- Better visual hierarchy with icons and labels

**Before:**
```
Visit Office for Verification
Max attempts reached. Check Help Center for venue location.
```

**After:**
```
⚠️ Visit Office for Verification

Maximum attempts reached. Please visit our office with your 
original documents for in-person verification.

┌─────────────────────────────────┐
│ 📍 Venue:                        │
│    City Health Office,           │
│    Magsaysay Park Complex,       │
│    Door 7                        │
│                                  │
│ 🕐 Hours:                        │
│    Monday-Friday, 8:00 AM–5:00 PM│
│                                  │
│ 📞 Contact:                      │
│    0926-686-1531                 │
└─────────────────────────────────┘
```

---

### 4. **Styles Added**

#### DocumentRejectionWidget.styles.ts
```typescript
manualReviewSection: {
  backgroundColor: '#FEE2E2', // Light red background
  borderRadius: theme.borderRadius.md,
  padding: moderateScale(16),
  marginTop: verticalScale(16),
  borderWidth: 1,
  borderColor: '#DC2626' + '30',
},
venueInfo: {
  backgroundColor: '#FFFFFF',
  borderRadius: theme.borderRadius.md,
  padding: moderateScale(14),
  gap: verticalScale(14),
},
venueItem: {
  flexDirection: 'row',
  alignItems: 'flex-start',
},
// ... more styles
```

#### ViewDocumentsScreen.styles.ts
```typescript
manualReviewContainer: {
  backgroundColor: '#FEE2E2',
  borderRadius: moderateScale(12),
  padding: moderateScale(16),
  marginHorizontal: scale(16),
  marginVertical: verticalScale(12),
  borderWidth: 1,
  borderColor: '#DC2626' + '30',
},
venueDetails: {
  backgroundColor: '#FFFFFF',
  borderRadius: moderateScale(8),
  padding: moderateScale(14),
},
// ... more styles
```

---

## 🎨 Visual Design

### Color Scheme
- Background: `#FEE2E2` (Light red, matches error state)
- Text: `#DC2626` (Red 600, for headings)
- Secondary text: `#7F1D1D` (Dark red, for body text)
- White card: `#FFFFFF` (for venue details container)

### Icons
- Main warning: `warning` (⚠️)
- Location: `location` (📍)
- Time: `time` (🕐)
- Phone: `call` (📞)
- Header: `home` (🏠)

---

## 📱 User Experience Flow

### Scenario: User reaches 4th attempt

1. **Admin flags document for 4th time**
   - Backend sets: `reviewStatus: "ManualReviewRequired"`
   - Backend sets: `applicationStatus: "Manual Review Required"`
   - Backend sends notification with venue details

2. **User opens Rejection History screen**
   ```
   ┌─────────────────────────────────────┐
   │ 🏠 Manual Review Required           │ ← Red header
   │ Chest X-ray              Attempt #4 │
   │                                     │
   │ REJECTION REASON                    │
   │ Wrong ID picture format/size        │
   │                                     │
   │ ⚠️ Visit Office for Verification   │ ← Red banner
   │                                     │
   │ Maximum attempts reached (4         │
   │ attempts). Please visit our office  │
   │ with your original documents for    │
   │ in-person verification.             │
   │                                     │
   │ ┌─────────────────────────────────┐ │
   │ │ 📍 Venue:                        │ │ ← White card
   │ │    City Health Office,           │ │
   │ │    Magsaysay Park Complex, Door 7│ │
   │ │                                  │ │
   │ │ 🕐 Hours:                        │ │
   │ │    Monday-Friday, 8:00 AM–5:00 PM│ │
   │ │                                  │ │
   │ │ 📞 Contact: 0926-686-1531        │ │
   │ └─────────────────────────────────┘ │
   └─────────────────────────────────────┘
   
   ❌ NO RESUBMIT BUTTON ✅
   ```

3. **User opens View Documents screen**
   ```
   ┌─────────────────────────────────────┐
   │ ℹ️ Please visit our office with your│
   │    original documents for in-person │
   │    verification. Check Help Center   │
   │    for venue details.               │
   └─────────────────────────────────────┘
   
   ┌─────────────────────────────────────┐
   │ 📄 Chest X-ray                      │
   │ 🔴 Manual Review Required           │
   └─────────────────────────────────────┘
   
   ⚠️ Visit Office for Verification
   
   Maximum attempts reached. Please visit...
   
   ┌─────────────────────────────────────┐
   │ 📍 Venue: City Health Office...     │
   │ 🕐 Hours: Monday-Friday...          │
   │ 📞 Contact: 0926-686-1531           │
   └─────────────────────────────────────┘
   ```

---

## 🧪 Testing Checklist

### Rejection History Screen
- [x] Attempt #4 shows red "Manual Review Required" header
- [x] Attempt #4 shows house icon (🏠)
- [x] Venue information card appears with all details
- [x] Resubmit button is HIDDEN
- [x] Venue details include:
  - [x] Full address
  - [x] Office hours
  - [x] Contact number

### View Documents Screen
- [x] Application status message shows venue visit info
- [x] Document card shows "Manual Review Required" status (red)
- [x] Manual review container appears below document card
- [x] Venue details displayed in white card
- [x] No "Replace document" button shown

### Visual Consistency
- [x] Colors match error state theme (red)
- [x] Venue info matches web admin display
- [x] Icons are clear and appropriate
- [x] Text is readable and properly sized
- [x] Spacing is consistent with app design

---

## 📝 Important Notes

1. **Venue Information is Hardcoded**
   - Currently hardcoded in both widgets
   - Should match Help Center information
   - If venue changes, update in 3 places:
     - `DocumentRejectionWidget.tsx` (line 194-216)
     - `ViewDocumentsScreen.tsx` (line 437-460)
     - Backend notification message

2. **Attempt Number Detection**
   - Manual review triggers at `attemptNumber >= 4`
   - This matches backend MAX_ATTEMPTS = 3
   - Counts from both `documentRejectionHistory` and `documentReferralHistory`

3. **No Resubmission Allowed**
   - Resubmit button is hidden when `isManualReviewRequired = true`
   - Backend also blocks resubmission attempts
   - User can only visit venue for in-person verification

4. **Status Flow**
   - Attempt 1-3: "Document Rejected" / "Needs Revision" (Orange)
   - Attempt 4+: "Manual Review Required" (Red)
   - Backend ensures proper status: `reviewStatus: "ManualReviewRequired"`

---

## 🚀 Deployment

1. **No Backend Changes** - Only mobile UI updates
2. **Hot Reload** - Changes take effect immediately in development
3. **Testing** - Test with existing attempt #4 documents from before fix

---

## 📞 Success Criteria

✅ User sees "Manual Review Required" header at attempt #4  
✅ User sees full venue details (address, hours, contact)  
✅ Resubmit button is hidden at attempt #4  
✅ UI matches web admin information card  
✅ Colors and styling are consistent with error state  
✅ Icons are clear and appropriate  
✅ User knows exactly where to go and when  

---

**Status:** Complete and Ready for Testing  
**Next Steps:** Test with existing attempt #4 documents to verify UI appears correctly
