// Application domain exports
// Export types from model/types.ts
export type {
  Application,
  ApplicationForm,
  JobCategory,
  DocumentRequirement,
  CreateApplicationInput,
  UpdateApplicationInput,
  SubmitApplicationInput,
  ApplicationValidationResult,
  ApplicationWorkflowStep,
  ApplicationWorkflow,
  ApplicationStatus
} from './model/types';

// Export service types from model/service.ts
export type {
  ApplicationFormData,
  ApplicationService,
  UploadState,
  ValidationResult,
  SubmissionResult,
  // Re-export these types from service.ts only
  ApplicationType,
  CivilStatus,
  PaymentMethod
} from './model/service';

// Re-export UI components
export { StepIndicator } from './ui/StepIndicator';
export { DocumentSourceModal } from './ui/DocumentSourceModal';
