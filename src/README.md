# Src Folder Structure

This document describes the organized structure of the `src/` folder after the architectural improvements.

## 📁 Directory Structure

```
src/
├── api/                    # API layer (feature-based modules)
│   ├── forms.api.ts
│   ├── healthCards.api.ts
│   ├── notifications.api.ts
│   ├── users.api.ts
│   └── ...
├── components/             # Reusable UI components
│   ├── application/        # Application-specific components
│   ├── ui/                # Generic UI components
│   ├── feedback/          # Feedback components
│   └── ...
├── config/                # Application configuration
│   ├── app.ts             # App-wide settings
│   ├── env.ts             # Environment settings
│   └── index.ts
├── constants/             # Application constants
│   ├── api.ts             # API-related constants
│   ├── app.ts             # App constants
│   ├── ui.ts              # UI constants
│   └── index.ts
├── contexts/              # React contexts
├── features/              # Feature modules (only healthCards active)
│   └── healthCards/
├── hooks/                 # Custom React hooks
├── layouts/               # Layout components
├── lib/                   # Core utilities and clients
├── provider/              # App providers
├── styles/                # Consolidated styling
│   ├── components/        # Component styles
│   ├── screens/          # Screen styles
│   │   ├── auth/         # Authentication screens
│   │   └── tabs/         # Tab screens
│   ├── theme.ts          # Theme system
│   └── index.ts          # Style exports
├── types/                 # TypeScript type definitions
├── utils/                 # Utility functions
└── index.ts              # Main export file
```

## 🚀 Key Improvements

### ✅ What Was Fixed
- **Removed 18+ empty directories** that created maintenance overhead
- **Consolidated styling** from `assets/styles/` to `src/styles/`
- **Enhanced constants** with proper organization (API, UI, App constants)
- **Added configuration layer** for app-wide settings
- **Updated all import statements** to use new paths
- **Removed duplicate files** (unused fontSizes constants)

### ✅ What Was Kept
- **API folder structure** - Already well-organized with feature-based modules
- **Components organization** - Good categorization with subdirectories
- **Hooks and utilities** - Properly structured with index exports
- **TypeScript types** - Clean type definitions
- **Core lib functionality** - Essential utilities maintained

## 📋 Import Guidelines

### Recommended Import Patterns

```typescript
// Components
import { CustomButton, StatCard } from '@/src/components';
import { ApplicationTypeStep } from '@/src/components/application';

// API Layer
import * as users from '@/src/api/users.api';
import * as forms from '@/src/api/forms.api';

// Styles (new consolidated location)
import { styles } from '@/src/styles/screens/auth/sign-in';
import { theme } from '@/src/styles/theme';

// Configuration
import { APP_CONFIG } from '@/src/config';

// Constants
import { UI_CONSTANTS, APP_CONSTANTS } from '@/src/constants';

// Hooks
import { useDashboard, useDocumentUpload } from '@/src/hooks';

// Types
import { User, Application, JobCategory } from '@/src/types';

// Utils
import { moderateScale, getColor } from '@/src/utils/designSystem';
```

## 🎯 Architecture Benefits

1. **Maintainability** - Clean, organized structure with clear separation of concerns
2. **Scalability** - Feature-based API layer with room for growth  
3. **Developer Experience** - Clear import paths and consolidated exports
4. **Performance** - Removed empty directories and optimized component structure
5. **Type Safety** - Enhanced TypeScript definitions throughout

## 📖 Style Organization

The new styling structure provides:

- **Centralized location** - All styles in `src/styles/`
- **Screen-based organization** - Auth and tab screen styles separated
- **Component styles** - Dedicated folder for component-specific styles
- **Unified exports** - Single import point via `src/styles/index.ts`
- **Theme system** - Maintained existing theme with better organization

## 🔄 Migration Notes

- All `assets/styles/` imports updated to `src/styles/screens/`
- Old empty directories removed (storage/, theme/, test/, ui/)
- Duplicate fontSizes removed from constants
- Features folder cleaned up (only healthCards remains)
- Enhanced constants with proper categorization

This structure provides a solid foundation for continued development while maintaining the excellent work already done in the API and components layers.