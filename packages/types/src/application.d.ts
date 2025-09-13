/**
 * Application Domain Types
 *
 * Type definitions for health card application entities and operations
 */
import { GenericId, BaseEntity, Timestamp } from './base';
export type ApplicationStatus = 'Submitted' | 'For Document Verification' | 'For Payment Validation' | 'For Orientation' | 'Approved' | 'Rejected';
export type ApplicationType = 'New' | 'Renew';
export type CivilStatus = 'Single' | 'Married' | 'Divorced' | 'Widowed' | 'Separated';
export interface Application extends BaseEntity {
    _id: GenericId<"forms">;
    userId: GenericId<"users">;
    applicationType: ApplicationType;
    jobCategory: GenericId<"jobCategories">;
    position: string;
    organization: string;
    civilStatus: CivilStatus;
    status: ApplicationStatus;
    submittedAt?: Timestamp;
    reviewedAt?: Timestamp;
    approvedAt?: Timestamp;
    rejectedAt?: Timestamp;
    reviewerId?: GenericId<"users">;
    remarks?: string;
}
export interface ApplicationForm extends BaseEntity {
    _id: GenericId<"forms">;
    userId: GenericId<"users">;
    formId: GenericId<"forms">;
    status: ApplicationStatus;
    approvedAt: Timestamp;
    remarks?: string;
}
export interface JobCategory extends BaseEntity {
    _id: GenericId<"jobCategories">;
    name: string;
    colorCode: string;
    requireOrientation?: boolean | string;
    description?: string;
    requirements?: string[];
    isActive?: boolean;
}
export interface DocumentRequirement extends BaseEntity {
    _id: GenericId<"documentRequirements">;
    jobCategoryId: GenericId<"jobCategories">;
    name: string;
    description: string;
    icon: string;
    required: boolean;
    fieldName: string;
    fileTypes?: string[];
    maxFileSize?: number;
    displayOrder?: number;
}
export interface CreateApplicationInput {
    applicationType: ApplicationType;
    jobCategory: GenericId<'jobCategories'>;
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
    formId: GenericId<'forms'>;
    paymentMethod: 'Gcash' | 'Maya' | 'BaranggayHall' | 'CityHall';
    paymentReferenceNumber: string;
    paymentReceiptId?: GenericId<'_storage'>;
}
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
    applicationId: GenericId<'forms'>;
    currentStep: number;
    steps: ApplicationWorkflowStep[];
    progress: number;
    canSubmit: boolean;
}
//# sourceMappingURL=application.d.ts.map