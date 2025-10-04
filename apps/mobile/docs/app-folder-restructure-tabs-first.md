# App Folder Restructure Proposal: Tabs-First Architecture

## Current Structure Issues
The current structure has `(protected)` as the parent, which creates deeper nesting and may not align with common Expo Router patterns where tabs are often at a higher level.

## Proposed New Structure

```
app/
├── _layout.tsx                    # Root layout with providers
├── index.tsx                      # Initial routing & auth check
│
├── (auth)/                        # Public auth routes
│   ├── _layout.tsx               
│   ├── sign-in.tsx               
│   ├── sign-up.tsx               
│   ├── reset-password.tsx        
│   └── verification.tsx          
│
├── (tabs)/                        # Main tab navigation (protected)
│   ├── _layout.tsx               # Auth check + Tab layout
│   ├── (applicant)/              # Applicant tabs
│   │   ├── index.tsx             # Dashboard/Home
│   │   ├── apply.tsx             
│   │   ├── applications.tsx      
│   │   └── notifications.tsx     
│   │
│   ├── (inspector)/              # Inspector tabs (if they use tabs)
│   │   └── dashboard.tsx         
│   │
│   └── profile.tsx               # Shared profile tab
│
├── (applicant)/                   # Applicant stack screens
│   ├── _layout.tsx               # Role check for applicants
│   ├── application/              
│   │   └── [id].tsx              
│   ├── payment/                  
│   │   ├── index.tsx             
│   │   ├── success.tsx           
│   │   ├── failed.tsx            
│   │   └── cancelled.tsx         
│   ├── upload-documents.tsx      
│   ├── document-requirements.tsx 
│   ├── health-cards.tsx          
│   ├── qr-code.tsx               
│   └── qr-scanner.tsx            
│
├── (inspector)/                   # Inspector stack screens
│   ├── _layout.tsx               # Role check for inspectors
│   ├── inspection-queue.tsx      
│   ├── review-applications.tsx   
│   └── scanner.tsx               
│
└── (shared)/                      # Shared protected screens
    ├── _layout.tsx               # Auth check only
    ├── activity.tsx              
    ├── orientation.tsx           
    ├── navigation-debug.tsx      
    └── profile/                  
        ├── edit.tsx              
        └── change-password.tsx   
```

## Alternative Structure (Cleaner Separation)

```
app/
├── _layout.tsx                    # Root layout
├── index.tsx                      # Initial routing
│
├── (auth)/                        # Public routes
│   └── ...auth screens           
│
├── (tabs)/                        # Protected tab navigation
│   ├── _layout.tsx               # Auth + Role-based tabs
│   ├── index.tsx                 # Home/Dashboard
│   ├── apply.tsx                 
│   ├── applications.tsx          
│   ├── notifications.tsx         
│   └── profile.tsx               
│
├── application/                   # Application screens
│   └── [id].tsx                  
│
├── payment/                       # Payment flow
│   ├── index.tsx                 
│   ├── success.tsx               
│   ├── failed.tsx                
│   └── cancelled.tsx             
│
├── documents/                     # Document management
│   ├── upload.tsx                
│   └── requirements.tsx          
│
├── health-cards/                  # Health card features
│   └── index.tsx                 
│
├── scanner/                       # QR/Scanner features
│   ├── qr-code.tsx               
│   └── qr-scanner.tsx            
│
├── inspector/                     # Inspector-only screens
│   ├── _layout.tsx               # Role check
│   ├── dashboard.tsx             
│   ├── queue.tsx                 
│   ├── review.tsx                
│   └── scanner.tsx               
│
└── settings/                      # Settings/Profile
    ├── profile.tsx               
    ├── edit.tsx                  
    ├── change-password.tsx       
    ├── activity.tsx              
    └── debug.tsx                 
```

## Key Benefits

### Option 1: Nested Role-Based Tabs
- **Pros**: 
  - Clear role separation within tabs
  - Easy to have different tab configurations per role
  - Maintains grouped organization
- **Cons**: 
  - More complex routing paths
  - Deeper nesting

### Option 2: Flat Structure with Feature Grouping
- **Pros**: 
  - Simpler, flatter structure
  - Feature-based organization
  - Shorter paths
  - Easier navigation
- **Cons**: 
  - Less explicit role separation
  - Need to handle role checks in individual screens

## Recommendation

I recommend **Option 2** (Flat Structure) because:

1. **Simpler Mental Model**: `/payment/success` vs `/(applicant)/payment/success`
2. **Expo Router Best Practices**: Follows common patterns with tabs at top level
3. **Easier Navigation**: Shorter, cleaner paths
4. **Feature-Focused**: Groups by feature rather than role
5. **Flexible**: Role checks can be done in layouts where needed

## Implementation Benefits

1. **Tabs as Entry Point**: `(tabs)` is now the main protected area
2. **Cleaner URLs**: `/application/123` instead of `/protected/applicant/stack/application/123`
3. **Better UX**: More intuitive navigation paths
4. **Easier Maintenance**: Less nesting, clearer structure

Would you like me to implement this new structure?
