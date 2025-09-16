/**
 * Application Entity - Public API
 * 
 * This file defines the public interface for the Application entity.
 * Other parts of the application should import from this file only.
 */

// ===== TYPES & INTERFACES =====
export type {
  Application,
  ApplicationStatus,
  ApplicationType,
  PaymentMethod,
  CreateApplicationInput,
  UpdateApplicationInput,
  SubmitApplicationInput,
} from './model';

// ===== DOMAIN LOGIC =====
export {
  canEditApplication,
  canSubmitApplication,
  isApplicationComplete,
  requiresPayment,
  getNextPossibleStatuses,
  getApplicationProgress,
  getMissingApplicationFields,
  formatApplicationStatus,
  getStatusColor,
  isFinalStatus,
} from './model';

// ===== API HOOKS =====
export {
  useApplicationById,
  useUserApplications,
  useApplications,
  useCreateApplication,
  useUpdateApplication,
  useSubmitApplication,
  useApplicationMutations,
} from './api';

// ===== UTILITY FUNCTIONS =====
export {
  validateApplication,
  validatePaymentInfo,
  formatApplicationType,
  formatApplicationDate,
  getApplicationAge,
  filterApplicationsByStatus,
  filterApplicationsByType,
  searchApplications,
  sortApplicationsByDate,
  sortApplicationsByStatus,
  getApplicationStats,
} from './lib';