# Changelog

All notable changes to the eMediCard application will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2024-01-15

### Added
- **CTAButton Component** (`src/components/CTAButton.tsx`)
  - New specialized call-to-action button component
  - Three variants: primary, secondary, outline
  - Enhanced touch targets (56px minimum, 64px for large)
  - Built-in loading states with animation
  - Full accessibility support with ARIA labels

- **DashboardHeader Component** (`src/components/ui/DashboardHeader.tsx`)
  - Extracted from inline dashboard code
  - User profile display with greeting
  - Quick access to document requirements
  - Notification badge with unread count
  - Dropdown menu for secondary actions

- **Collapsible Activity Panel**
  - Smooth height and rotation animations
  - Shows 2 items by default, expands to show all
  - "View Full Activity History" link
  - Accessible with proper ARIA labels

- **Migration Documentation**
  - `MIGRATION_NOTES.md` - Comprehensive migration guide
  - Detailed component changes and usage examples
  - Breaking changes and upgrade paths

### Changed
- **Dashboard Layout** (`app/(tabs)/index.tsx`)
  - Renamed "Overview" section to "My Health Card"
  - Unified health card statistics display
  - Improved subtitle text for better context
  - Vertical stack layout for primary actions
  - Enhanced inline documentation

- **StatCard Component** (`src/components/StatCard.tsx`)
  - Increased minimum height from 120px to 140px
  - Added activeOpacity (0.7) for touch feedback
  - Enhanced touch target with 150px minimum width
  - Improved padding for better content spacing

- **Dashboard Styles** (`assets/styles/tabs-styles/dashboard.ts`)
  - Added primaryActionsContainer styles
  - Added collapsible panel animation styles
  - Enhanced section spacing and visual hierarchy

### Removed
- **ActionButton Component** - Replaced by CTAButton
- **Inline Header Code** - Extracted to DashboardHeader
- **Grid Layout Styles**
  - `quickActionsContainer` style
  - `actionsGrid` style
- **Health Card Status Section** - Integrated into My Health Card

### Fixed
- Touch targets now meet accessibility standards (44px iOS, 48px Android)
- Improved color contrast ratios for WCAG AA compliance
- Better text readability with enhanced typography scale
- Consistent visual hierarchy across all sections

## [1.0.0] - Previous Release

Initial release of the eMediCard application with:
- Basic dashboard functionality
- Health card application process
- Digital QR code display
- User profile management
- Notification system
