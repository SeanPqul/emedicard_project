# App Folder Reorganization Proposal

## Current Issues
1. **Mixed concerns in (screens) folder**: Contains shared screens, role-specific screens, and feature screens all at the same level
2. **Unclear hierarchy**: It's not immediately clear which screens belong to which user flow
3. **Inconsistent grouping**: Some folders are role-based (inspector), some are feature-based (payment), and some are generic (shared)
4. **Navigation complexity**: The current structure makes it harder to understand the navigation flow

## Proposed New Structure

```
app/
├── _layout.tsx                    # Root layout with providers
├── index.tsx                      # Initial routing logic
│
├── (auth)/                        # Public auth routes (no auth required)
│   ├── _layout.tsx               
│   ├── sign-in.tsx               
│   ├── sign-up.tsx               
│   ├── reset-password.tsx        
│   └── verification.tsx          
│
├── (protected)/                   # All authenticated routes
│   ├── _layout.tsx               # Auth check wrapper
│   │
│   ├── (applicant)/              # Applicant-specific routes
│   │   ├── _layout.tsx           
│   │   ├── (tabs)/               # Tab navigation for applicants
│   │   │   ├── _layout.tsx       
│   │   │   ├── index.tsx         # Dashboard/Home
│   │   │   ├── apply.tsx         
│   │   │   ├── applications.tsx  # Renamed from 'application'
│   │   │   ├── notifications.tsx # Renamed from 'notification'
│   │   │   └── profile.tsx       
│   │   │
│   │   └── (stack)/              # Stack navigation screens
│   │       ├── _layout.tsx       
│   │       ├── application/      
│   │       │   └── [id].tsx      # Application detail
│   │       ├── upload-documents.tsx
│   │       ├── document-requirements.tsx
│   │       ├── health-cards.tsx  
│   │       ├── payment/          
│   │       │   ├── index.tsx     # Payment screen
│   │       │   ├── success.tsx   
│   │       │   ├── failed.tsx    
│   │       │   └── cancelled.tsx 
│   │       ├── qr-code.tsx       
│   │       └── qr-scanner.tsx    
│   │
│   ├── (inspector)/              # Inspector-specific routes
│   │   ├── _layout.tsx           
│   │   ├── dashboard.tsx         # Main inspector dashboard
│   │   ├── inspection-queue.tsx  
│   │   ├── review-applications.tsx
│   │   └── scanner.tsx           
│   │
│   └── (common)/                 # Shared authenticated screens
│       ├── _layout.tsx           
│       ├── profile/              
│       │   ├── index.tsx         # Profile view
│       │   ├── edit.tsx          
│       │   └── change-password.tsx
│       ├── activity.tsx          
│       ├── orientation.tsx       
│       └── navigation-debug.tsx  
│
└── providers/                    # App-wide providers
    ├── index.ts
    ├── ClerkAndConvexProvider.tsx
    └── ToastProvider.tsx
```

## Key Benefits of This Structure

### 1. **Clear Authentication Boundary**
- `(auth)` group: Unauthenticated routes
- `(protected)` group: All authenticated routes with auth check in layout

### 2. **Role-Based Organization**
- `(applicant)`: All applicant-specific features
- `(inspector)`: All inspector-specific features  
- `(common)`: Shared features accessible by all authenticated users

### 3. **Navigation Pattern Clarity**
- `(tabs)`: Clearly indicates tab-based navigation
- `(stack)`: Stack navigation for detail screens and flows
- Separates primary navigation (tabs) from secondary screens (stack)

### 4. **Feature Grouping**
- Related screens are grouped together (e.g., all payment screens in payment/)
- Profile-related screens grouped under profile/

### 5. **Scalability**
- Easy to add new roles: just add `(newrole)` folder
- Easy to add new features: add to appropriate role folder
- Clear where to place new screens

## Migration Steps

### Phase 1: Create New Structure
1. Create the new folder structure alongside existing
2. Copy layouts and configure proper redirects
3. Test authentication flow

### Phase 2: Move Auth Routes
1. Keep auth routes in current location (already well-organized)
2. Update imports if needed

### Phase 3: Reorganize Protected Routes
1. Create `(protected)` group with auth check
2. Move applicant screens to `(applicant)`
3. Move inspector screens (already grouped)
4. Extract common screens to `(common)`

### Phase 4: Update Navigation
1. Update tab configuration for clearer names
2. Update all navigation references
3. Test all navigation flows

### Phase 5: Cleanup
1. Remove old `(screens)` folder
2. Update all imports
3. Run type checking

## Alternative Considerations

### Option B: Feature-First Organization
Instead of role-based, organize by feature:
```
(protected)/
  ├── (dashboard)/
  ├── (applications)/
  ├── (payments)/
  ├── (profile)/
  └── (admin)/
```

**Pros**: More domain-driven
**Cons**: Harder to manage role-specific variations

### Option C: Hybrid Approach
Keep current structure but reorganize (screens):
```
(screens)/
  ├── (applicant)/
  │   ├── (features)/
  │   └── (navigation)/
  ├── (inspector)/
  └── (shared)/
```

**Pros**: Less migration work
**Cons**: Still has nested complexity

## Recommendation

I recommend **Option A** (the main proposal) because:
1. It provides the clearest mental model
2. Follows Expo Router conventions
3. Scales well with new features and roles
4. Makes navigation patterns explicit
5. Improves developer experience

The structure makes it immediately clear:
- What requires authentication
- Which screens belong to which user type
- How navigation is structured
- Where to add new features
