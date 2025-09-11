/**
 * Application Domain Types
 * 
 * Type definitions for health card application entities and operations
 */

import { Id } from '../../../../../backend/convex/_generated/dataModel';

// ===== APPLICATION STATUS TYPES =====
export type ApplicationStatus = 'Submitted' | 'Under Review' | 'Approved' | 'Rejected';
export type ApplicationType = 'New' | 'Renew';
export type CivilStatus = 'Single' | 'Married' | 'Divorced' | 'Widowed' | 'Separated';

// ===== APPLICATION ENTITY TYPES =====
export interface Application {
  _id: Id<"forms">;
  userId: Id<"users">;
  applicationType: ApplicationType;
  jobCategory: Id<"jobCategories">;
  position: string;
  organization: string;
  civilStatus: CivilStatus;
  status: ApplicationStatus;
  createdAt?: number;
  updatedAt?: number;
  submittedAt?: number;
  reviewedAt?: number;
  approvedAt?: number;
  rejectedAt?: number;
  reviewerId?: Id<"users">;
  remarks?: string;
}

export interface ApplicationForm {
  _id: Id<"forms">;
  userId: Id<"users">;
  formId: Id<"forms">;
  status: ApplicationStatus;
  approvedAt: number;
  remarks?: string;
}

// ===== JOB CATEGORY TYPES =====
export interface JobCategory {
  _id: Id<"jobCategories">;
  name: string;
  colorCode: string;
  requireOrientation?: boolean | string;
  description?: string;
  requirements?: string[];
  isActive?: boolean;
  createdAt?: number;
  updatedAt?: number;
}

// ===== DOCUMENT REQUIREMENT TYPES =====
export interface DocumentRequirement {
  _id: Id<"documentRequirements">;
  jobCategoryId: Id<"jobCategories">;
  name: string;
  description: string;
  icon: string;
  required: boolean;
  fieldName: string;
  fileTypes?: string[];
  maxFileSize?: number;
  displayOrder?: number;
}

// ===== APPLICATION OPERATION TYPES =====
export interface CreateApplicationInput {
  applicationType: ApplicationType;
  jobCategory: Id<'jobCategories'>;
  position: string;
  organization: string;
  civilStatus: CivilStatus;
}

export interface UpdateApplicationInput {
  position?: string;
  organization?: string;
  civilStatus?: CivilStatus;
  status?: ApplicationStatus;
  remarks?: string;
}

export interface SubmitApplicationInput {
  formId: Id<'forms'>;
  paymentMethod: 'Gcash' | 'Maya' | 'BaranggayHall' | 'CityHall';
  paymentReferenceNumber: string;
  paymentReceiptId?: Id<'_storage'>;
}

// ===== APPLICATION VALIDATION TYPES =====
export interface ApplicationValidationResult {
  isValid: boolean;
  errors: {
    personalDetails?: string[];
    jobCategory?: string[];
    documents?: string[];
    payment?: string[];
  };
  warnings: string[];
  completionPercentage: number;
}

// ===== APPLICATION WORKFLOW TYPES =====
export interface ApplicationWorkflowStep {
  id: string;
  name: string;
  description: string;
  isRequired: boolean;
  isCompleted: boolean;
  canAccess: boolean;
  order: number;
}

export interface ApplicationWorkflow {
  applicationId: Id<'forms'>;
  currentStep: number;
  steps: ApplicationWorkflowStep[];
  progress: number;
  canSubmit: boolean;
}
