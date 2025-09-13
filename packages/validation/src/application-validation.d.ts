/**
 * Application-Specific Validation
 *
 * Validation logic specific to health card applications
 */
import { ApplicationType, CivilStatus, DocumentRequirement } from '@emedicard/types';
import { FormValidationResult } from './validators';
export interface ApplicationFormData {
    applicationType: ApplicationType;
    jobCategory: string;
    position: string;
    organization: string;
    civilStatus: CivilStatus;
}
export interface DocumentUploadState {
    uploading?: boolean;
    error?: string | null;
    success?: boolean;
    queued?: boolean;
}
export interface ApplicationValidationOptions {
    documentRequirements?: DocumentRequirement[];
    getUploadState?: (docKey: string) => DocumentUploadState;
}
export declare const validateApplicationForm: (formData: ApplicationFormData) => FormValidationResult<ApplicationFormData>;
export declare const validateApplicationStep: (formData: ApplicationFormData, currentStep: number, options?: ApplicationValidationOptions) => FormValidationResult<ApplicationFormData>;
export declare const validateDocumentUploads: (documentRequirements: DocumentRequirement[], getUploadState: (docKey: string) => DocumentUploadState) => {
    isValid: boolean;
    missingDocuments: DocumentRequirement[];
    errorDocuments: DocumentRequirement[];
    uploadingDocuments: DocumentRequirement[];
};
export interface PaymentFormData {
    method: 'Gcash' | 'Maya' | 'BaranggayHall' | 'CityHall';
    referenceNumber: string;
    amount: number;
}
export declare const validatePaymentForm: (formData: PaymentFormData) => FormValidationResult<PaymentFormData>;
export declare const isApplicationFormComplete: (formData: ApplicationFormData) => boolean;
export declare const getApplicationStepProgress: (formData: ApplicationFormData, currentStep: number, totalSteps?: number) => number;
//# sourceMappingURL=application-validation.d.ts.map