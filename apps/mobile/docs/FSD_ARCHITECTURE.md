# Feature-Sliced Design (FSD) Architecture

This project follows the **Feature-Sliced Design (FSD)** architectural methodology, which provides a standardized approach to organizing code in layers and slices for better scalability and maintainability.

## 📁 Directory Structure

```
apps/mobile/
├── app/          # Expo Router - routing and navigation (FSD app layer)
└── src/
    ├── screens/      # Complete screen components that compose all layers
    ├── widgets/      # Complex UI blocks composed from features
    ├── features/     # User-facing functionality and business logic
    ├── processes/    # Cross-feature workflows and business processes
    ├── entities/     # Business entities and domain types
    ├── shared/       # Reusable utilities, UI components, and lib re-exports
    └── types/        # Generic type definitions (non-domain)
```

**Note**: This is an Extended FSD structure with 8 layers. The `app/` directory at the project root serves as the FSD app layer, containing routing logic via Expo Router.

## 🎯 Layer Responsibilities

### 1. **App Layer** (`app/` at project root)
- **Purpose**: Routing and navigation via Expo Router
- **Contains**: 
  - Route definitions
  - Layout components
  - Navigation guards
  - Route-specific providers
- **Can import from**: All layers in src/

### 2. **Screens Layer** (`src/screens/`)
- **Purpose**: Complete screen components that users navigate to
- **Contains**: 
  - Full screen components
  - Screen-specific layouts
  - Route compositions
- **Examples**: 
  - `DashboardScreen`
  - `SignInScreen`
  - `ProfileScreen`
- **Can import from**: widgets, features, entities, shared
- **Cannot import from**: app (except types)

### 3. **Widgets Layer** (`src/widgets/`)
- **Purpose**: Complex, reusable UI blocks that compose multiple features
- **Contains**: 
  - Composite components that combine features
  - Complex UI sections used across pages
- **Examples**: 
  - `DashboardWidget` - Composes multiple dashboard features
  - `ApplicationFormWidget` - Multi-step form composition
- **Can import from**: features, entities, shared
- **Cannot import from**: screens, app

### 4. **Features Layer** (`src/features/`)
- **Purpose**: User-facing functionality and business logic
- **Contains**: 
  - Feature-specific components (UI)
  - Business logic hooks
  - API services
  - Feature-specific types (that aren't entities)
- **Structure**:
  ```
  features/
  └── auth/
      ├── components/    # Feature UI components
      ├── hooks/         # Business logic hooks
      ├── services/      # API calls and data fetching
      ├── types.ts       # Feature-specific types
      └── index.ts       # Public API
  ```
- **Can import from**: processes, entities, shared
- **Cannot import from**: screens, widgets, app

### 5. **Processes Layer** (`src/processes/`)
- **Purpose**: Cross-feature workflows and business processes
- **Contains**: 
  - Multi-step business flows
  - Cross-feature orchestration
  - Complex state machines
  - Process-specific services
- **Examples**: 
  - `paymentFlow` - Payment submission process
  - `applicationFlow` - Application submission workflow
  - `verificationFlow` - Document verification process
- **Can import from**: entities, shared, types
- **Cannot import from**: screens, widgets, features, app

### 6. **Entities Layer** (`src/entities/`)
- **Purpose**: Core business entities and domain models
- **Contains**: 
  - Business entity type definitions
  - Domain models
  - Entity-specific utilities
- **Structure**:
  ```
  entities/
  └── user/
      ├── model/        # Type definitions
      ├── api/          # Entity-specific API (optional)
      └── index.ts      # Public API
  ```
- **Examples**: 
  - `User`, `AuthUser`
  - `Application`, `JobCategory`
  - `DashboardStats`
- **Can import from**: shared, types only
- **Cannot import from**: screens, widgets, features, processes, app

### 7. **Shared Layer** (`src/shared/`)
- **Purpose**: Reusable code shared across the application
- **Contains**: 
  - UI kit components
  - Utility functions
  - Constants and configs
  - External library re-exports
  - Common hooks
- **Can import from**: types, external packages
- **Cannot import from**: Any other internal layers

### 8. **Types Layer** (`src/types/`)
- **Purpose**: Generic type definitions not tied to domain
- **Contains**: 
  - Utility types (Maybe<T>, Result<T>)
  - Framework types (navigation, routing)
  - Design system types
  - API response wrappers
- **Examples**: 
  - `utility.ts` - Generic utility types
  - `navigation.ts` - Route and navigation types
  - `design-system.ts` - UI component types
- **Can import from**: External packages only
- **Cannot import from**: Any internal layers

## 📋 Rules and Guidelines

### Import Rules
1. **One-way imports**: Higher layers can import from lower layers, but not vice versa
2. **No circular dependencies**: Layers cannot import from each other circularly
3. **Public API only**: Import only from layer's index files (barrel exports)

### Component Organization
1. Each feature/widget/entity should have an `index.ts` file that exports its public API
2. Keep internal implementation details private
3. Group related functionality together

### Type Management
1. **Business entities** go in `entities/*/model/types.ts`
2. **Feature-specific types** stay in `features/*/types.ts`
3. **Generic utility types** go in `types/`
4. **Cross-feature types** go in `processes/*/types.ts`
5. **Component prop types** stay with their components

### Example: Adding a New Feature

```typescript
// 1. Define entity types (if new)
// src/entities/payment/model/types.ts
export interface Payment {
  id: string;
  amount: number;
  status: PaymentStatus;
}

// 2. Create feature structure
// src/features/payment/
├── components/
│   └── PaymentForm/
│       ├── PaymentForm.tsx
│       └── index.ts
├── hooks/
│   └── usePayment.ts
├── services/
│   └── paymentService.ts
├── types.ts
└── index.ts

// 3. Create widget if needed
// src/widgets/checkout/CheckoutWidget.tsx
import { PaymentForm } from '@features/payment';

// 4. Use in screen
// src/screens/checkout/CheckoutScreen.tsx
import { CheckoutWidget } from '@widgets/checkout';
```

## 🚀 Benefits

1. **Scalability**: Easy to add new features without affecting existing code
2. **Maintainability**: Clear boundaries and responsibilities
3. **Testability**: Isolated layers are easier to test
4. **Team collaboration**: Clear structure reduces conflicts
5. **Reusability**: Lower layers can be reused across features

## 📖 Resources

- [Official FSD Documentation](https://feature-sliced.design/)
- [FSD Best Practices](https://feature-sliced.design/docs/get-started/tutorial)
