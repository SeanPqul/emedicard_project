# FSD Extended Migration Plan

## 🎯 Objective
Evaluate and potentially implement an extended FSD architecture with 8 layers instead of 6, adding `processes/` and `types/` as separate root directories.

## 📊 Current vs Proposed Structure

### Current (Standard FSD - 6 layers)
```
app/        (at root - Expo Router)
src/
├── pages/      
├── widgets/    
├── features/   
├── entities/   
└── shared/     
```

### Proposed (Extended FSD - 8 layers)
```
app/        (at root - Expo Router)
src/
├── pages/      (navigation entry screens)
├── widgets/    (composite UI)
├── features/   (feature-local logic)
├── entities/   (domain models)
├── processes/  (cross-feature workflows) ← NEW
├── shared/     (utilities, components)
├── types/      (generic types only) ← NEW
└── index.ts
```

## 🤔 Analysis: Do We Need Extended Layers?

### Benefits of Adding `processes/`
✅ **Clear separation** of cross-feature business logic
✅ **Better scalability** for complex workflows
✅ **Easier to find** multi-step business processes
✅ **Prevents feature coupling** - features don't import from each other

### Benefits of Adding `types/`
✅ **Clear distinction** between domain types (entities) and utility types
✅ **Easier imports** - know exactly where to look
✅ **Better organization** of generic types
✅ **Prevents shared/ from becoming a dumping ground**

### Current Pain Points
1. **Payment flow** - Currently in features/payment but used across features
2. **Generic types** - Mixed with domain types in shared/types
3. **Cross-feature hooks** - No clear home for multi-feature business logic

## 📋 Migration Tasks

### Phase 1: Assessment
- [ ] Inventory current cross-feature dependencies
- [ ] Identify generic vs domain types
- [ ] Count import references for each file
- [ ] Document migration decisions

### Phase 2: Structure Creation
- [ ] Create src/processes/ directory
- [ ] Create src/types/ directory
- [ ] Update documentation

### Phase 3: Migration - Processes
- [ ] Move payment flow to processes/paymentFlow/
- [ ] Move other cross-feature workflows
- [ ] Create compatibility stubs
- [ ] Update imports

### Phase 4: Migration - Types
- [ ] Move utility types to types/
- [ ] Move navigation types to types/
- [ ] Move design-system types to types/
- [ ] Keep domain types in entities/

### Phase 5: Cleanup
- [ ] Remove compatibility stubs
- [ ] Update path aliases
- [ ] Run type checking
- [ ] Update documentation

## 🚦 Decision Criteria

### When to Use `processes/`
- Business logic that involves **multiple features**
- Multi-step workflows (payment, onboarding, etc.)
- Cross-cutting concerns that aren't utilities
- Import count > 1 feature/page

### When to Use `types/`
- Generic utility types (Maybe<T>, Result<T>, etc.)
- Navigation/routing types
- Design system types
- API response wrappers
- NOT domain types (those stay in entities)

## 🛠️ Implementation Steps

### Step 1: Create Progress Tracker
```json
{
  "migration_version": "v2-extended",
  "last_updated": "2024-09-21T13:00:00Z",
  "current_phase": "assessment",
  "tasks": []
}
```

### Step 2: Run Assessment
```powershell
# Count cross-feature imports
Get-ChildItem -Path src/features -Recurse -Filter "*.ts" | 
  ForEach-Object { 
    $content = Get-Content $_.FullName
    # Check for imports from other features
  }
```

### Step 3: Make Decision
Based on assessment, decide:
- Is payment flow truly cross-feature? → processes/
- Are there other cross-feature workflows? → processes/
- How many generic types do we have? → types/

## 📈 Expected Outcomes

### If We Add Both Layers:
```
src/
├── entities/       (User, Application, Payment entities)
├── features/       (auth, dashboard, profile features)  
├── processes/      (paymentFlow, onboardingFlow)
├── widgets/        (DashboardWidget, FormWidget)
├── pages/          (SignInScreen, DashboardScreen)
├── shared/         (components, hooks, utils)
├── types/          (utility, navigation, api types)
└── index.ts
```

### Benefits:
1. **Clearer mental model** - know exactly where things go
2. **Better scalability** - room for growth
3. **Reduced coupling** - features stay independent
4. **Easier onboarding** - more explicit structure

### Drawbacks:
1. **More directories** to navigate
2. **More decisions** when adding new code
3. **Potential over-engineering** for simple apps

## 🎯 Recommendation

**For eMediCard Project**: Given that you have:
- Complex payment flows used across features
- Multiple user types (applicant, inspector)
- Cross-feature workflows (application → payment → verification)
- Growing codebase with multiple domains

**✅ I recommend adopting the extended 8-layer FSD structure.**

The additional complexity is justified by:
1. Clear need for cross-feature process management
2. Sufficient generic types to warrant separation
3. Project scale and expected growth
4. Better long-term maintainability

## 📝 Next Steps

1. Review this plan and decide
2. If approved, create migration progress tracker
3. Start with assessment phase
4. Migrate incrementally with compatibility stubs
5. Update all documentation

---

**Note**: This migration can be done incrementally without breaking existing code by using compatibility stubs and careful import updates.
