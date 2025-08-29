# React Native Apply.tsx Refactor Instructions

You are tasked with refactoring a large, monolithic React Native (Expo) screen named apply.tsx. It currently mixes state, validation, upload queuing, navigation, and full UI for 5 steps in one file. Your goal is to split responsibilities into small, focused components and hooks while preserving behavior, UI, and types.

---

## Project Context (important imports you must preserve)
- Clerk (@clerk/clerk-expo)
- Expo: expo-router, expo-image-picker, expo-document-picker
- Icons: @expo/vector-icons/Ionicons
- Validation: validateApplicationStep from src/shared/validation/form-validation
- Upload queue/storage: formStorage (MMKV-powered, includes deferred queue)
- Hooks (must keep working): useJobCategories, useApplications, useRequirements, useUsers
- Types: JobCategory, DocumentRequirement, SelectedDocuments, DocumentFile, etc.
- Styles: styles (src/styles/screens/tabs-apply-forms), modalStyles (src/styles/components/modals)
- Components: FeedbackSystem, useFeedback, CustomButton, CustomTextInput

---

## Hard Requirements
- Behavior parity: No feature loss or UI changes beyond organization/internal fixes.
- Type safety: No 'any' unless unavoidable.
- Imports must keep working: Fix relative paths if moving code.
- Keep default export `export default function Apply()` as entry screen.
- No hidden global state; use props or dedicated hooks.
- Preserve deferred upload queue behavior.
- Fix local name conflict: rename local `pickDocument` → `pickDocFile`.

---

## Target Structure
src/screens/apply/ApplyScreen.tsx
src/screens/apply/components/StepIndicator.tsx
src/screens/apply/components/DocumentSourceModal.tsx
src/screens/apply/steps/ApplicationTypeStep.tsx
src/screens/apply/steps/JobCategoryStep.tsx
src/screens/apply/steps/PersonalDetailsStep.tsx
src/screens/apply/steps/UploadDocumentsStep.tsx
src/screens/apply/steps/ReviewStep.tsx
src/screens/apply/steps/index.ts
src/hooks/useApplicationForm.ts
src/hooks/useDocumentSelection.ts
src/hooks/useSubmission.ts
src/utils/application/requirementsMapper.ts
src/constants/application.ts

> Keep a tiny apply.tsx that re-exports the new ApplyScreen if needed.

---

## Step-by-Step Plan

### Phase 0 — Safety & Setup
- Run: `npx tsc --noEmit`
- Keep commits small and reversible

### Phase 1 — Extract shared UI components
- StepIndicator.tsx: `{ currentStep: number; stepTitles: string[] }`
- DocumentSourceModal.tsx: `{ visible, onClose, onPickCamera, onPickGallery, onPickDocument }`

### Phase 2 — Extract step screens (UI only)
- ApplicationTypeStep.tsx
- JobCategoryStep.tsx
- PersonalDetailsStep.tsx
- UploadDocumentsStep.tsx
- ReviewStep.tsx
- Use StepProps for props; no internal hooks yet

### Phase 3 — Extract logic into hooks
- useDocumentSelection.ts
- useSubmission.ts
- useApplicationForm.ts
- requirementsMapper.ts

### Phase 4 — Rebuild ApplyScreen orchestrator
- Header, StepIndicator, KeyboardAvoidingView + ScrollView, Bottom nav buttons, DocumentSourceModal, FeedbackSystem
- renderCurrentStep() switches on currentStep and returns step components

### Phase 5 — Fix naming conflict
- Rename local `pickDocument` → `pickDocFile`

### Phase 6 — Validation & compile
- Replace all old inline render/picker functions with hook/step references
- Run `npx tsc --noEmit`
- Run ESLint / test suite if available
- Manual 5-step smoke test

---

## Use Context7 for Best Practices (must follow, don't overengineer)

### Project Conventions
- Feature-based folder structure
- Shared components: src/screens/<feature>/components/
- Hooks: src/hooks/
- Styles: src/styles/screens/ or components/
- Types: src/types/ or alongside feature
- Default exports remain
- No global state outside hooks/props
- Type safety required
- Always run `npx tsc --noEmit`

### MMKV / formStorage
- Persist temporary form data
- Deferred upload queue: queue files → upload on submission
- Queue status: pending / uploading / completed / failed
- Validate file size/type
- Provide feedback via FeedbackSystem

### Hooks & State Management
- useApplicationForm: formData, currentStep, errors, navigation, persistence
- useDocumentSelection: camera/gallery/document picker, queue management, pickDocument → pickDocFile
- useSubmission: final submission, payment selection, queue updates

### Step Components
- Pure UI + props only in Phase 2
- Props: formData, setFormData, errors, selectedDocuments, requirementsByJobCategory, document handlers
- Independent, reusable, identical UI
- No hooks in Phase 2

### Validation & Utilities
- validateApplicationStep as single source of truth
- Map requirements via requirementsMapper
- Preserve fee breakdown, requireOrientation, FeedbackSystem usage

### Refactor Phases & Checklist
- [ ] Phase 0 — Safety & Setup
- [ ] Phase 1 — Extract shared UI components
- [ ] Phase 2 — Extract step screens (UI only)
- [ ] Phase 3 — Extract logic into hooks
- [ ] Phase 4 — Rebuild ApplyScreen orchestrator
- [ ] Phase 5 — Fix naming conflicts
- [ ] Phase 6 — Validation & compile, smoke test

**Status markers for AI agent:**
- ✅ Phase complete
- 🚧 Phase in progress
- ⬜ Not started

---

## Instructions for AI Agent

**THINK HARD:**  
1. List step-by-step refactor plan with phases and file moves.  
2. Review plan against Context7 rules.  
3. Only then generate code.  

**Before generating code:**  
- Query Context7 for patterns, rules, or tools relevant to this phase.  
- Create new files under correct feature folder (e.g., src/screens/apply/components/, src/hooks/).  
- Update imports in ApplyScreen automatically after moving code.  

**Execution Steps:**  
1. Read this prompt and use Context7 best practices.  
2. Follow step-by-step plan and target structure.  
3. Preserve behavior, imports, types, and UI.  
4. Track progress in checklist after each phase.  
5. Generate new component files and hooks per plan.  
6. Summarize changes and list moved functions in final deliverable.  
7. Only proceed to next phase after the previous phase is marked ✅.
