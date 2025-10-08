# Header Standardization Implementation

## Overview
Standardized all green branded headers across the application to ensure consistent spacing, alignment, and sizing. This improves visual consistency and makes future header implementations easier to maintain.

## Changes Made

### 1. Created Standardized Constants
**File:** `src/shared/constants/header.constants.ts`

Centralized all header-related sizing and spacing values:
- **Padding & Spacing:**
  - Horizontal padding: 20px (scaled)
  - Top padding: 48px (vertical scaled) - accounts for status bar
  - Bottom padding: 16px (vertical scaled)
  - Icon-to-text gap: 12px (scaled)

- **Icon Sizes:**
  - Standard icon size: 24px (moderate scaled)
  - Icon button container: 40px (moderate scaled)
  - Action button icon: 20px (moderate scaled)

- **Typography:**
  - Title font size: 22px (moderate scaled)
  - Title line height: 28px (moderate scaled)
  - Subtitle font size: 13px (moderate scaled)
  - Title-to-subtitle margin: 2px (vertical scaled)

- **Badge:**
  - Min width: 18px
  - Height: 18px
  - Border width: 2px
  - Font size: 10px

- **Colors:**
  - Badge: `#EF4444`
  - White: `#FFFFFF`
  - White overlay: `rgba(255, 255, 255, 0.2)`
  - White transparent: `rgba(255, 255, 255, 0.85)`

### 2. Updated Headers

All headers now use consistent spacing, sizing, and the new constants:

#### NotificationHeader
- **Location:** `src/widgets/notification/`
- **Changes:**
  - Fixed icon positioning with proper container sizing
  - Removed manual margins, now using `gap` property
  - Standardized action button size to 40px
  - Uses consistent padding values

#### HealthCardsHeader
- **Location:** `src/screens/shared/HealthCardsScreen/`
- **Changes:**
  - Back button now has proper 40px container
  - Removed extra padding, uses gap instead
  - Consistent icon sizing (24px)

#### ApplicationListHeader
- **Location:** `src/widgets/application-list/`
- **Changes:**
  - Filter button standardized to 40px
  - Horizontal padding now consistent (20px)
  - Top padding standardized (48px)

#### ProfileHeader
- **Location:** `src/widgets/profile/`
- **Changes:**
  - Updated to use standardized padding constants
  - Consistent spacing with other headers

#### ApplicationDetailHeader
- **Location:** `src/widgets/application-detail/`
- **Changes:**
  - Back button now 40px with proper centering
  - Uses gap property for spacing
  - Consistent padding across all sides

#### DocumentViewHeader
- **Location:** `src/screens/shared/ViewDocumentsScreen/`
- **Changes:**
  - Back button standardized to 40px
  - Icon size consistent at 24px
  - Uses gap for proper spacing

## Benefits

### 1. **Visual Consistency**
All headers now have:
- Same horizontal padding (20px)
- Same top padding accounting for status bar (48px)
- Same icon sizes (24px)
- Same action button sizes (40px)
- Same spacing between icon and text (12px)

### 2. **Maintainability**
- Single source of truth for all header dimensions
- Easy to update values across all headers
- Clear constants with descriptive names

### 3. **Developer Experience**
- New headers can reference constants
- No need to guess spacing values
- Type-safe with TypeScript

## Usage for Future Headers

When creating a new green branded header, import and use the constants:

```typescript
import { HEADER_CONSTANTS } from '@shared/constants/header.constants';

// In styles
export const styles = StyleSheet.create({
  headerContent: {
    paddingHorizontal: HEADER_CONSTANTS.HORIZONTAL_PADDING,
    paddingTop: HEADER_CONSTANTS.TOP_PADDING,
    paddingBottom: HEADER_CONSTANTS.BOTTOM_PADDING,
    gap: HEADER_CONSTANTS.ICON_TEXT_GAP,
  },
  iconButton: {
    width: HEADER_CONSTANTS.ICON_BUTTON_SIZE,
    height: HEADER_CONSTANTS.ICON_BUTTON_SIZE,
  },
});

// In component
<Ionicons 
  name="icon-name" 
  size={HEADER_CONSTANTS.ICON_SIZE} 
  color={HEADER_CONSTANTS.WHITE} 
/>
```

## Before vs After

### Before Standardization
- NotificationHeader: Used `marginRight` for icon spacing
- HealthCardsHeader: Back button had extra padding
- ApplicationListHeader: Different padding scale (20 vs lg)
- Inconsistent icon button sizes: 40px vs 44px vs 24px
- Mixed use of theme.spacing and hardcoded values

### After Standardization
- All headers use `gap` property for spacing
- All icon buttons are 40x40px
- All icons are 24px
- All headers use same padding values
- Centralized constants for easy updates

## Testing
- ✅ TypeScript compilation successful
- ✅ All headers updated and consistent
- ✅ No breaking changes to functionality
- ✅ Backward compatible with existing code

## Next Steps
When implementing the Payment Screen headers, use these same constants to maintain consistency.

