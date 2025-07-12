# React Native eMediCard Project Refactoring Prompt

As a Senior React Native Developer, your task is to refactor the eMediCard project to create a clean, robust, scalable, and maintainable codebase that follows React Native best practices and adheres to DRY (Don't Repeat Yourself) principles.

## Current Project Analysis

The eMediCard project is a health card management system built with:
- **Framework**: React Native with Expo Router
- **Backend**: Convex (real-time database)
- **Authentication**: Clerk
- **UI Framework**: React Native with custom components
- **Navigation**: Expo Router with file-based routing
- **State Management**: Convex queries and React hooks

## Project Structure Issues Identified

### 1. **Inconsistent File Organization**
- Mixed file extensions (.js/.ts) in styles folder
- Scattered styling approach (inline styles, separate style files)
- No clear separation of concerns between components, screens, and utilities
- Missing proper barrel exports for better imports

### 2. **Styling Architecture Problems**
- Styles scattered across different folders (`assets/styles/auth-styles/`, `assets/styles/tabs-styles/`)
- Inconsistent styling patterns (some use scaling utils, others don't)
- Mixed file types (dashboard.js vs other .ts files)
- No centralized theme management beyond basic constants

### 3. **Component Architecture Issues**
- Components mixing business logic with presentation
- No clear component categorization (UI, business, layout)
- Missing proper TypeScript interfaces for complex data structures
- Inconsistent prop interfaces and naming conventions

### 4. **Code Duplication and DRY Violations**
- Repeated styling patterns across components
- Similar data fetching patterns in different screens
- Repeated form validation logic
- Duplicate color and spacing values

## Refactoring Goals

### 1. **Implement Clean Architecture**
```
src/
├── components/
│   ├── ui/                    # Pure UI components
│   ├── forms/                 # Form-specific components
│   ├── layout/                # Layout components
│   └── business/              # Business logic components
├── screens/                   # Screen components
├── hooks/                     # Custom hooks
├── services/                  # API and external service integrations
├── utils/                     # Utility functions
├── types/                     # TypeScript type definitions
├── constants/                 # App constants
└── styles/                    # Centralized styling system
```

### 2. **Create Design System**
- Establish consistent spacing, typography, and color systems
- Create reusable styled components
- Implement responsive design patterns
- Standardize animation and interaction patterns

### 3. **Optimize Performance**
- Implement proper memoization strategies
- Optimize list rendering with FlatList
- Lazy load screens and components
- Implement proper image optimization

## Detailed Refactoring Tasks

### Task 1: Restructure Project Architecture

**Create new directory structure:**

```typescript
// src/types/index.ts - Centralized type definitions
export interface User {
  id: string;
  username: string;
  fullname: string;
  email: string;
  image: string;
  clerkId: string;
}

export interface Application {
  id: string;
  userId: string;
  status: 'Submitted' | 'Under Review' | 'Approved' | 'Rejected';
  applicationType: 'New' | 'Renew';
  jobCategory: string;
  createdAt: number;
}

export interface DashboardStats {
  activeApplications: number;
  pendingPayments: number;
  upcomingOrientations: number;
  validHealthCards: number;
  pendingAmount: number;
}
```

### Task 2: Implement Design System

**Create centralized theme system:**

```typescript
// src/styles/theme.ts
export const theme = {
  colors: {
    primary: {
      50: '#F0FDF4',
      500: '#10B981',
      600: '#059669',
      700: '#047857',
    },
    gray: {
      50: '#F9FAFB',
      100: '#F3F4F6',
      500: '#6B7280',
      900: '#111827',
    },
    semantic: {
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      info: '#3B82F6',
    }
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  typography: {
    h1: { fontSize: 32, fontWeight: '700' },
    h2: { fontSize: 24, fontWeight: '600' },
    h3: { fontSize: 20, fontWeight: '600' },
    body: { fontSize: 16, fontWeight: '400' },
    caption: { fontSize: 14, fontWeight: '400' },
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
  }
} as const;
```

### Task 3: Create Reusable UI Components

**Refactor existing components with better abstraction:**

```typescript
// src/components/ui/Button/Button.tsx
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  isDisabled?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children: React.ReactNode;
  onPress: () => void;
}

// src/components/ui/Card/Card.tsx
interface CardProps {
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: keyof typeof theme.spacing;
  children: React.ReactNode;
}

// src/components/ui/Input/Input.tsx
interface InputProps {
  label?: string;
  placeholder?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  type?: 'text' | 'password' | 'email' | 'number';
}
```

### Task 4: Implement Custom Hooks

**Create reusable business logic hooks:**

```typescript
// src/hooks/useAuth.ts
export const useAuth = () => {
  // Centralized auth logic
};

// src/hooks/useApplications.ts
export const useApplications = () => {
  // Application-related queries and mutations
};

// src/hooks/useDashboard.ts
export const useDashboard = () => {
  // Dashboard-specific data aggregation
};

// src/hooks/useForm.ts
export const useForm = <T>() => {
  // Generic form management with validation
};
```

### Task 5: Create Service Layer

**Abstract external dependencies:**

```typescript
// src/services/convex.ts
export class ConvexService {
  static async getUserApplications(userId: string) {
    // Centralized Convex queries
  }
}

// src/services/storage.ts
export class StorageService {
  static async uploadDocument(file: File) {
    // File upload logic
  }
}
```

### Task 6: Implement Screen Components

**Separate screens from business logic:**

```typescript
// src/screens/Dashboard/DashboardScreen.tsx
export const DashboardScreen = () => {
  const { stats, activities, isLoading } = useDashboard();
  
  if (isLoading) return <LoadingSpinner />;
  
  return (
    <DashboardView 
      stats={stats}
      activities={activities}
      onRefresh={handleRefresh}
    />
  );
};

// src/screens/Dashboard/DashboardView.tsx (Pure presentation)
interface DashboardViewProps {
  stats: DashboardStats;
  activities: Activity[];
  onRefresh: () => void;
}
```

### Task 7: Optimize Styling System

**Create styled components:**

```typescript
// src/components/ui/styled.ts
export const Container = styled.View<{ padding?: keyof typeof theme.spacing }>`
  padding: ${({ padding = 'md' }) => theme.spacing[padding]}px;
`;

export const StyledText = styled.Text<{ variant?: keyof typeof theme.typography }>`
  ${({ variant = 'body' }) => theme.typography[variant]}
`;
```

### Task 8: Implement Error Boundaries and Loading States

```typescript
// src/components/layout/ErrorBoundary.tsx
export class ErrorBoundary extends React.Component {
  // Global error handling
}

// src/components/ui/LoadingSpinner.tsx
export const LoadingSpinner = ({ size, color }: LoadingProps) => {
  // Consistent loading states
};
```

### Task 9: Add Performance Optimizations

```typescript
// Implement React.memo for expensive components
export const DashboardStats = React.memo(({ stats }: StatsProps) => {
  // Memoized expensive calculations
});

// Use useMemo for expensive computations
const processedData = useMemo(() => {
  return processLargeDataSet(rawData);
}, [rawData]);

// Implement lazy loading for screens
const DashboardScreen = lazy(() => import('./DashboardScreen'));
```

### Task 10: Create Barrel Exports

```typescript
// src/components/index.ts
export * from './ui';
export * from './forms';
export * from './layout';

// src/hooks/index.ts
export * from './useAuth';
export * from './useApplications';
export * from './useDashboard';
```

## Implementation Priority

### Phase 1 (High Priority)
1. Create new directory structure
2. Implement design system and theme
3. Refactor existing components to use new architecture
4. Consolidate styling system

### Phase 2 (Medium Priority)
1. Create custom hooks for business logic
2. Implement service layer
3. Add proper TypeScript interfaces
4. Create reusable UI components

### Phase 3 (Lower Priority)
1. Add performance optimizations
2. Implement error boundaries
3. Add comprehensive testing
4. Create component documentation

## Code Quality Standards

### 1. TypeScript Best Practices
- Use strict mode
- Define proper interfaces for all props and data structures
- Avoid `any` type usage
- Use generic types where appropriate

### 2. Component Best Practices
- Follow single responsibility principle
- Use composition over inheritance
- Implement proper prop validation
- Use React.memo for performance optimization

### 3. Styling Best Practices
- Use design tokens consistently
- Implement responsive design patterns
- Follow BEM-like naming conventions for styles
- Use theme-based styling

### 4. Performance Best Practices
- Implement proper list virtualization
- Use lazy loading for routes
- Optimize image loading and caching
- Minimize re-renders with proper memoization

## Success Metrics

After refactoring, the codebase should achieve:
- **Maintainability**: Easy to add new features and modify existing ones
- **Scalability**: Architecture supports growth and complexity
- **Performance**: Smooth 60fps interactions and fast load times
- **Developer Experience**: Easy to understand and contribute to
- **Code Reusability**: High component and utility reuse
- **Type Safety**: Comprehensive TypeScript coverage

## Migration Strategy

1. **Incremental refactoring**: Refactor one module at a time
2. **Backwards compatibility**: Ensure existing functionality works during migration
3. **Testing coverage**: Add tests for refactored components
4. **Documentation**: Update documentation as you refactor
5. **Team review**: Conduct code reviews for each refactored module

This refactoring will transform your React Native eMediCard project into a production-ready, scalable application that follows industry best practices and modern React Native patterns.
