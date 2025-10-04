# App Routing Reorganization Plan

## Current Structure Analysis

### Current Route Groups:
1. `(auth)` - Authentication screens ✅ Well organized
2. `(tabs)` - Tab navigation for main app ✅ Good organization
3. `(screens)` - Stack navigation with subgroups:
   - `(inspector)` - Inspector-specific screens ✅ Well organized
   - `(shared)` - Shared utility screens ✅ Good organization

### Unorganized Routes (Root Level):
1. `application/[id].tsx` - Application detail screen
2. `payment/` - Payment flow screens (cancelled, failed, success)

## Problems Identified:

1. **Inconsistent Organization**: Some routes are in groups, others at root level
2. **Missing Context**: Payment routes should be grouped contextually
3. **Application Route Isolation**: Single application route at root level
4. **Deep Link Handling**: Payment routes handle deep links but aren't grouped

## Recommended Reorganization:

### Option A: Business Flow Groups (Recommended)
```
app/
├── (auth)/                    # Authentication flow ✅
├── (tabs)/                    # Main app navigation ✅
├── (screens)/
│   ├── (inspector)/          # Inspector workflows ✅
│   ├── (shared)/             # Shared utilities ✅
│   ├── (application)/        # Application workflows 🆕
│   │   ├── _layout.tsx
│   │   └── [id].tsx         # from app/application/[id].tsx
│   └── (payment)/            # Payment workflows 🆕
│       ├── _layout.tsx
│       ├── cancelled.tsx    # from app/payment/cancelled.tsx
│       ├── failed.tsx       # from app/payment/failed.tsx
│       └── success.tsx      # from app/payment/success.tsx
├── _layout.tsx              # Root layout ✅
├── index.tsx                # App entry ✅
└── providers/               # Providers ✅
```

### Option B: Feature-Based Groups
```
app/
├── (auth)/                   # Authentication ✅
├── (tabs)/                   # Main navigation ✅  
├── (screens)/
│   ├── (inspector)/         # Inspector features ✅
│   ├── (shared)/            # Shared screens ✅
│   └── (workflows)/         # Business workflows 🆕
│       ├── application/
│       │   └── [id].tsx
│       └── payment/
│           ├── cancelled.tsx
│           ├── failed.tsx
│           └── success.tsx
├── _layout.tsx              # Root layout ✅
├── index.tsx                # App entry ✅
└── providers/               # Providers ✅
```

## Recommended Approach: Option A

**Reasoning:**
1. **Clear Business Context**: Each group represents a distinct user flow
2. **Deep Link Compatibility**: Payment routes maintain their current deep link structure
3. **Scalability**: Easy to add more application or payment related screens
4. **Consistency**: Follows the existing pattern with (inspector) and (shared) groups

## Migration Benefits:

1. **Better Organization**: Logical grouping by business functionality
2. **Easier Navigation**: Developers can quickly find related screens
3. **Scalability**: Easy to add new screens to existing flows
4. **Maintainability**: Related functionality stays together
5. **Deep Link Preservation**: Payment deep links continue to work

## Deep Link Impact:

- Current: `emedicardproject://payment/cancelled`
- After: `emedicardproject://(screens)/(payment)/cancelled`
- **Solution**: We can maintain backward compatibility with route aliases

## Implementation Steps:

1. Create new route group directories
2. Move files to appropriate groups
3. Create _layout.tsx files for new groups
4. Update any internal navigation references
5. Test deep link functionality
6. Update documentation
