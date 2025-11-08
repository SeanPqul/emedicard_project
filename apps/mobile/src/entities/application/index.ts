// Application domain exports
// Export types from model/types.ts
export type {
  Application,
  ApplicationForm,
  ApplicationStatus,
  ApplicationType,
  CivilStatus,
  PaymentMethod,
  DocumentRequirement,
  CreateApplicationInput,
  UpdateApplicationInput,
  SubmitApplicationInput,
  ApplicationValidationResult,
  ApplicationWorkflowStep,
  ApplicationWorkflow,
  // Composite types for UI display
  ApplicationWithDetails,
  ApplicationDetails,
  ApplicationFormDetails,
  JobCategoryDetails,
  PaymentDetails
} from './model/types';

// Re-export JobCategory from its proper location
export type { JobCategory } from '@entities/jobCategory';

// Export constants (NEW - Phase 4 Migration)
export * from './model/constants';

// Export lib utilities directly from source file for EAS build compatibility
export * from './lib/requirementsMapper';
