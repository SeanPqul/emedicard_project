// Application domain exports
// Export types from model/types.ts
export type {
  Application,
  ApplicationForm,
  DocumentRequirement,
  CreateApplicationInput,
  UpdateApplicationInput,
  SubmitApplicationInput,
  ApplicationValidationResult,
  ApplicationWorkflowStep,
  ApplicationWorkflow,
  ApplicationStatus
} from './model/types';

// Re-export JobCategory from its proper location
export type { JobCategory } from '@entities/jobCategory';

// Export lib utilities
export * from './lib';
