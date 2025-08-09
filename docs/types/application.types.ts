/**
 * Application Service Type Definitions
 * This file contains all types related to the Application/Form service.
 */

// Note: Import Id type from Convex when implementing services
// import { Id } from '../../convex/_generated/dataModel';

// Application Types
export type ApplicationType = 'New' | 'Renew';
export type ApplicationStatus = 'Submitted' | 'Under Review' | 'Approved' | 'Rejected';
export type DocumentStatus = 'Pending' | 'Approved' | 'Rejected';

/**
 * Application Interface
 * Represents a health card application form
 */
export interface Application {
  _id: string;
  userId: string;
  applicationType: ApplicationType;
  jobCategory: string; // Job category ID
  position: string;
  organization: string;
  civilStatus: string;
  status: ApplicationStatus;
  approvedAt?: number;
  remarks?: string;
  createdAt?: number;
  updatedAt?: number;
}

/**
 * Form Document Interface
 * Represents uploaded documents for an application
 */
export interface FormDocument {
  _id: string;
  formId: string;
  documentRequirementId: string;
  fileName: string;
  fileId: string; // Convex storage ID
  uploadedAt: number;
  status: DocumentStatus;
  remarks?: string;
  reviewBy?: string; // User ID of reviewer
  reviewAt?: number;
}

/**
 * Job Category Interface
 * Represents a job category that determines health card requirements
 */
export interface JobCategory {
  _id: string;
  name: string;
  colorCode: string;
  requireOrientation: boolean | string;
}

/**
 * Document Requirement Interface
 * Represents a document requirement for a job category
 */
export interface DocumentRequirement {
  _id: string;
  name: string;
  description: string;
  icon: string;
  required: boolean;
  fieldName: string;
}

/**
 * Job Category Requirement Interface
 * Links job categories to their required documents
 */
export interface JobCategoryRequirement {
  _id: string;
  jobCategoryId: string;
  documentRequirementId: string;
  required: boolean;
}

/**
 * Application Create Data
 * Used when creating a new application
 */
export interface ApplicationCreateData {
  userId: string;
  applicationType: ApplicationType;
  jobCategory: string;
  position: string;
  organization: string;
  civilStatus: string;
}

/**
 * Application Update Data
 * Used when updating an application
 */
export interface ApplicationUpdateData {
  status?: ApplicationStatus;
  remarks?: string;
  approvedAt?: number;
}

/**
 * Form Submission Data
 * Complete form data including documents
 */
export interface FormSubmissionData {
  application: ApplicationCreateData;
  documents: { [key: string]: File | string };
  paymentMethod?: string;
  paymentReference?: string;
}

/**
 * Application Service Interface
 * Defines methods for working with applications
 */
export interface ApplicationService {
  createApplication(data: ApplicationCreateData): Promise<Application>;
  updateApplication(applicationId: string, data: ApplicationUpdateData): Promise<Application>;
  getApplicationById(applicationId: string): Promise<Application | null>;
  getUserApplications(userId: string): Promise<Application[]>;
  submitApplicationForm(data: FormSubmissionData): Promise<Application>;
  getFormDocuments(formId: string): Promise<FormDocument[]>;
  uploadDocument(formId: string, requirementId: string, file: File): Promise<FormDocument>;
}
