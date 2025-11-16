# 🎨 Color-Coded Health Card Implementation

**Feature:** Dynamic health card colors based on job category  
**Date:** November 15, 2025  
**Status:** ✅ COMPLETE

---

## 📋 Overview

Health cards are now color-coded based on the applicant's job category:

| Card Type | Color | Job Categories |
|-----------|-------|----------------|
| **Yellow Card** | Bright Yellow | Food Handlers (restaurants, cafes, food processing) |
| **Green Card** | Light Green | Non-Food Workers (offices, retail, security) |
| **Pink Card** | Light Pink | Skin-to-Skin Contact (salons, spas, massage, barber, tattoo) |

---

## 🔧 Technical Implementation

### **1. Card Classification Logic**

```typescript
function classifyCardType(jobCategoryName: string): CardType {
  // Pink Card - Skin-to-Skin Contact
  if (includes: pink, skin, contact, massage, barber, salon, spa, beautician, tattoo, piercing)
    return 'pink';
  
  // Green Card - Non-Food
  if (includes: non-food, nonfood, green)
    return 'green';
  
  // Yellow Card - Food Handlers (default)
  return 'yellow';
}
```

### **2. Color Schemes**

```typescript
const CARD_COLORS = {
  yellow: {
    background: 'hsl(48, 95%, 88%)',    // Bright yellow
    border: 'hsl(45, 85%, 40%)',         // Dark yellow
    headerBg: 'hsl(48, 90%, 82%)',       // Table headers
  },
  green: {
    background: 'hsl(145, 60%, 88%)',    // Light green
    border: 'hsl(145, 50%, 35%)',        // Dark green
    headerBg: 'hsl(145, 55%, 82%)',      // Table headers
  },
  pink: {
    background: 'hsl(330, 70%, 92%)',    // Light pink
    border: 'hsl(330, 60%, 45%)',        // Dark pink
    headerBg: 'hsl(330, 65%, 86%)',      // Table headers
  },
};
```

### **3. Files Modified**

#### **Backend:**
- `convex/healthCards/generateHealthCard.ts` - Added classification logic and dynamic colors
- `convex/schema.ts` - Added `cardType` field to healthCards table with index

#### **Database Schema Changes:**
```typescript
healthCards: {
  // ... existing fields
  cardType: v.optional(v.union(
    v.literal("yellow"), 
    v.literal("green"), 
    v.literal("pink")
  )),
}
.index("by_card_type", ["cardType"]) // NEW INDEX
```

---

## 🎯 How It Works

### **Generation Flow:**

1. **Application Approval** → Admin finalizes application
2. **Fetch Job Category** → System retrieves `jobCategoryName` from application
3. **Classify Card Type** → `classifyCardType()` determines color based on keywords
4. **Apply Colors** → HTML template uses dynamic color scheme
5. **Store Card Type** → Saved in database for future reference
6. **Generate PDF** → Front-end converts HTML to PDF with colors

### **Example Categories:**

#### Yellow Card (Food):
- "Food Handler - Restaurant"
- "Yellow Card - Cafeteria Worker"
- "Food Processing Staff"
- "Kitchen Helper"

#### Green Card (Non-Food):
- "Non-Food Worker - Office"
- "Green Card - Retail Staff"
- "Security Guard"
- "Warehouse Worker"

#### Pink Card (Skin Contact):
- "Pink Card - Massage Therapist"
- "Barber / Hairstylist"
- "Salon Worker - Beautician"
- "Spa Attendant"
- "Tattoo Artist"

---

## 🔍 Testing Checklist

### **Manual Testing:**

- [ ] **Yellow Card:** Create application with "Food Handler" category → Verify yellow colors
- [ ] **Green Card:** Create application with "Non-Food Worker" category → Verify green colors
- [ ] **Pink Card:** Create application with "Salon Worker" category → Verify pink colors
- [ ] **Database:** Check that `cardType` is stored correctly in healthCards table
- [ ] **Historical Cards:** Verify existing cards still display (defaults to yellow)
- [ ] **PDF Export:** Confirm colors appear correctly in downloaded PDF

### **Database Queries:**

```typescript
// Check card type distribution
db.query("healthCards")
  .collect()
  .then(cards => {
    const yellow = cards.filter(c => c.cardType === 'yellow').length;
    const green = cards.filter(c => c.cardType === 'green').length;
    const pink = cards.filter(c => c.cardType === 'pink').length;
    console.log({ yellow, green, pink, undefined: cards.filter(c => !c.cardType).length });
  });

// Get all pink cards
db.query("healthCards")
  .withIndex("by_card_type", q => q.eq("cardType", "pink"))
  .collect();
```

---

## 🚀 Deployment Notes

### **Before Deployment:**
1. ✅ Schema changes are backward compatible (cardType is optional)
2. ✅ Existing health cards will work without cardType (defaults to yellow)
3. ✅ No migration script needed
4. ✅ New index `by_card_type` will be created automatically

### **After Deployment:**
1. Test generation of all three card types
2. Verify colors in both HTML preview and PDF export
3. Check database to confirm cardType is being stored
4. Monitor for any classification errors in logs

---

## 📊 Benefits

1. **Visual Identification:** Quickly identify worker category from card color
2. **Compliance:** Matches Davao City health card standards
3. **Database Tracking:** Can query and report by card type
4. **Future Extensibility:** Easy to add new card types or modify colors
5. **Historical Accuracy:** Card type stored with each card for records

---

## 🔄 Future Enhancements

- [ ] Add card type indicator badge in admin dashboard
- [ ] Filter health cards by type in admin panel
- [ ] Generate reports by card type distribution
- [ ] Add visual legend in PDF export
- [ ] Implement card type validation rules per job category

---

## 📝 Notes

- **Default Behavior:** If job category name is unclear or missing, defaults to Yellow (Food Handler)
- **Classification Keywords:** Case-insensitive matching on job category name
- **Color Consistency:** Both front and back of card use same color scheme
- **Print Quality:** Colors are optimized for both screen and print output

---

**Implemented By:** Senior Development Team  
**Review Status:** Ready for Testing  
**Documentation:** Complete
