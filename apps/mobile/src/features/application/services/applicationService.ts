/**
 * Application Service
 * 
 * Core business logic for application management
 */

import { Id } from '@backend/convex/_generated/dataModel';
import { DocumentRequirement, JobCategory } from '@entities/application';
import { SelectedDocuments, DocumentFile } from '@shared/types';
import { formStorage } from './formStorage';
import { validateApplicationStep, ApplicationFormData as BaseApplicationFormData, ApplicationType, CivilStatus } from '../lib/validation';

export type PaymentMethod = 'Maya' | 'BaranggayHall' | 'CityHall';

// Note: ApplicationType and CivilStatus are re-exported from types.ts
// Don't re-export here to avoid duplicate export errors

// Extend the base form data to include payment fields
export interface ApplicationFormData extends BaseApplicationFormData {
  paymentMethod?: PaymentMethod;
  paymentReference?: string;
}

export interface UploadState {
  uploading: boolean;
  progress: number;
  error: string | null;
  success: boolean;
  queued: boolean;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export interface SubmissionResult {
  success: boolean;
  applicationId?: string;
  paymentId?: string;
  totalAmount?: number;
  paymentMethod?: PaymentMethod;
  referenceNumber?: string;
  requiresOrientation?: boolean;
  message: string;
}

/**
 * Application Service Class
 */
export class ApplicationService {
  /**
   * Validates a specific step of the application
   */
  static validateApplicationStep(
    formData: ApplicationFormData,
    currentStep: number,
    requirementsByJobCategory: DocumentRequirement[],
    selectedDocuments: SelectedDocuments,
    getUploadState: (documentId: string) => UploadState
  ): ValidationResult {
    return validateApplicationStep(
      formData,
      currentStep,
      requirementsByJobCategory,
      selectedDocuments,
      getUploadState
    );
  }

  /**
   * Gets upload state for a specific document
   */
  static getDocumentUploadState(documentId: string): UploadState {
    const operations = formStorage.getUploadOperations();
    const operation = operations[documentId];
    
    if (!operation) {
      return { 
        uploading: false, 
        progress: 0, 
        error: null, 
        success: false,
        queued: false
      };
    }
    
    return {
      uploading: operation.status === 'uploading',
      progress: operation.progress,
      error: operation.status === 'failed' ? (operation.error || 'Upload failed') : null,
      success: operation.status === 'completed',
      queued: operation.status === 'pending'
    };
  }

  /**
   * Validates if all required documents are ready for submission
   */
  static validateRequiredDocuments(
    requirementsByJobCategory: DocumentRequirement[],
    getUploadState: (documentId: string) => UploadState
  ): { isValid: boolean; missingDocuments: DocumentRequirement[]; errorDocuments: string[] } {
    const requiredDocuments = requirementsByJobCategory.filter(doc => doc.required);
    
    const missingRequired = requiredDocuments.filter(doc => {
      const uploadState = getUploadState(doc.fieldName);
      return !uploadState.queued && !uploadState.success;
    });
    
    const errorDocuments = requirementsByJobCategory
      .filter(doc => getUploadState(doc.fieldName)?.error)
      .map(doc => doc.fieldName);
    
    return {
      isValid: missingRequired.length === 0 && errorDocuments.length === 0,
      missingDocuments: missingRequired,
      errorDocuments
    };
  }

  /**
   * Initializes form data from storage or defaults
   */
  static initializeFormData(
    jobCategories: JobCategory[],
    user?: any,
    wasRestarted?: boolean
  ): {
    formData: ApplicationFormData;
    selectedDocuments: SelectedDocuments;
    currentStep: number;
    restored: boolean;
  } {
    try {
      // Check for app restart and clear old data
      const appWasRestarted = formStorage.handleAppRestart();
      
      if (appWasRestarted || wasRestarted) {
        return {
          formData: this.getDefaultFormData(),
          selectedDocuments: {},
          currentStep: 0,
          restored: false
        };
      }

      // Check for existing temp application in MMKV
      const tempApp = formStorage.getTempApplication();
      if (tempApp && !formStorage.isTempApplicationExpired()) {
        const stats = formStorage.getQueueStats();
        
        // If the queue is in a failed state, start fresh
        if (stats.queueStatus === 'failed') {
          formStorage.clearTempApplication();
          return {
            formData: this.getDefaultFormData(),
            selectedDocuments: {},
            currentStep: 0,
            restored: false
          };
        }
        
        // Restore from temp storage
        return {
          formData: tempApp.formData,
          selectedDocuments: tempApp.selectedDocuments,
          currentStep: tempApp.currentStep,
          restored: true
        };
      } else if (tempApp && formStorage.isTempApplicationExpired()) {
        // Clear expired temp data
        formStorage.clearTempApplication();
      }
      
      // Return default data
      return {
        formData: this.getDefaultFormData(),
        selectedDocuments: {},
        currentStep: 0,
        restored: false
      };
    } catch (error) {
      return {
        formData: this.getDefaultFormData(),
        selectedDocuments: {},
        currentStep: 0,
        restored: false
      };
    }
  }

  /**
   * Gets default form data
   */
  static getDefaultFormData(): ApplicationFormData {
    return {
      applicationType: 'New',
      jobCategory: '',
      position: '',
      organization: '',
      civilStatus: undefined,
      middleName: '',
      suffix: '',
      age: 0,
      nationality: '',
    };
  }

  /**
   * Saves form progress to temporary storage
   */
  static saveFormProgress(
    formData: ApplicationFormData,
    selectedDocuments: SelectedDocuments,
    currentStep: number
  ): boolean {
    try {
      formStorage.saveTempApplication(formData, selectedDocuments, currentStep);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Adds a document to the upload queue
   */
  static addDocumentToQueue(documentId: string, documentFile: any): boolean {
    try {
      return formStorage.addDocumentToQueue(documentId, documentFile);
    } catch (error) {
      return false;
    }
  }

  /**
   * Removes a document from the upload queue
   */
  static removeDocumentFromQueue(documentId: string): boolean {
    try {
      return formStorage.removeDocumentFromQueue(documentId);
    } catch (error) {
      return false;
    }
  }

  /**
   * Gets queue statistics
   */
  static getQueueStats() {
    return formStorage.getQueueStats();
  }

  /**
   * Clears all temporary application data
   */
  static clearTempApplication(): void {
    formStorage.clearTempApplication();
  }

  /**
   * Cancels the current application
   */
  static cancelApplication(): void {
    formStorage.cancelApplication();
  }

  /**
   * Checks if there's a temporary application in storage
   */
  static hasTempApplication(): boolean {
    return formStorage.hasTempApplication();
  }

  /**
   * Gets the current application ID if available
   */
  static getApplicationId(): string | null {
    return formStorage.getApplicationId();
  }

  /**
   * Sets the application ID in storage
   */
  static setApplicationId(applicationId: string): void {
    formStorage.setApplicationId(applicationId);
  }

  /**
   * Calculates payment amounts based on method
   */
  static calculatePaymentAmounts(paymentMethod?: PaymentMethod) {
    const APPLICATION_FEE = 50;
    const PROCESSING_FEE = 10;
    const TOTAL_FEE = APPLICATION_FEE + PROCESSING_FEE;
    
    return {
      applicationFee: APPLICATION_FEE,
      processingFee: PROCESSING_FEE,
      totalFee: TOTAL_FEE,
      currency: 'PHP'
    };
  }

  /**
   * Validates payment reference for digital payment methods
   */
  static validatePaymentReference(paymentMethod: PaymentMethod, reference?: string): boolean {
    if (paymentMethod === 'Maya') {
      return !!(reference && reference.trim().length >= 6);
    }
    // Manual payments don't require user-provided references
    return true;
  }

  /**
   * Generates reference number for manual payments
   */
  static generateManualPaymentReference(): string {
    return `MANUAL-${Date.now()}`;
  }

  /**
   * Formats payment method display name
   */
  static formatPaymentMethodName(method: PaymentMethod): string {
    switch (method) {
      case 'Maya':
        return 'Maya';
      case 'BaranggayHall':
        return 'Barangay Hall';
      case 'CityHall':
        return 'Sangunian Hall';
      default:
        return method;
    }
  }
}

export default ApplicationService;
