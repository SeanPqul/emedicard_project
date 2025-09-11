import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { router } from 'expo-router';
import { validateApplicationStep } from '../shared/validation/form-validation';
import { formStorage } from '../utils/formStorage';
import { SelectedDocuments } from '../types';
import { DocumentRequirement } from '../types/domain/application';

type ApplicationType = 'New' | 'Renew';
type CivilStatus = 'Single' | 'Married' | 'Divorced' | 'Widowed' | 'Separated';

interface ApplicationFormData {
  applicationType: ApplicationType;
  jobCategory: string;
  position: string;
  organization: string;
  civilStatus: CivilStatus;
  paymentMethod?: 'Gcash' | 'Maya' | 'BaranggayHall' | 'CityHall' | '';
  paymentReference?: string;
}

interface UseApplicationFormProps {
  showSuccess: (title: string, message: string) => void;
  showError: (title: string, message?: string) => void;
}

export const useApplicationForm = ({ showSuccess, showError }: UseApplicationFormProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<ApplicationFormData>({
    applicationType: 'New',
    jobCategory: '',
    position: '',
    organization: '',
    civilStatus: 'Single',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedDocuments, setSelectedDocuments] = useState<SelectedDocuments>({});

  // Real upload state functions using MMKV queue
  const getUploadState = useCallback((documentId: string) => {
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
  }, [selectedDocuments]);

  // Use extracted validation logic
  const validateCurrentStep = useCallback((requirementsByJobCategory: DocumentRequirement[]): boolean => {
    const { isValid, errors } = validateApplicationStep(
      formData, 
      currentStep, 
      requirementsByJobCategory || [], 
      selectedDocuments, 
      getUploadState
    );
    setErrors(errors);
    return isValid;
  }, [formData, currentStep, selectedDocuments, getUploadState]);

  const handleNext = useCallback(async (requirementsByJobCategory: DocumentRequirement[], stepTitles: string[]) => {
    // Validate current step with enhanced queue checking
    if (!validateCurrentStep(requirementsByJobCategory)) {
      return;
    }
    
    // For document upload step, ensure all required documents are properly queued
    if (currentStep === 3) {
      const requiredDocuments = requirementsByJobCategory.filter(doc => doc.required);
      const missingRequired = requiredDocuments.filter(doc => {
        const uploadState = getUploadState(doc.fieldName);
        return !uploadState.queued && !uploadState.success;
      });
      
      if (missingRequired.length > 0) {
        showError(
          'Missing Required Documents',
          `Please upload all required documents: ${missingRequired.map(doc => doc.name).join(', ')}`
        );
        return;
      }
      
      // Check for failed uploads that need retry
      const failedUploads = requirementsByJobCategory.filter(doc => {
        const uploadState = getUploadState(doc.fieldName);
        return uploadState.error;
      });
      
      if (failedUploads.length > 0) {
        showError(
          'Upload Errors',
          'Please fix all upload errors before proceeding to review.'
        );
        return;
      }
    }
    
    if (currentStep < stepTitles.length - 1) {
      const nextStep = currentStep + 1;
      // Save form data to deferred queue before moving to next step
      formStorage.saveTempApplication(formData, selectedDocuments, nextStep);
      setCurrentStep(nextStep);
    }
    
    return true; // Indicate successful validation
  }, [currentStep, formData, selectedDocuments, validateCurrentStep, getUploadState, showError]);

  const handlePrevious = useCallback(() => {
    if (currentStep > 0) {
      const prevStep = currentStep - 1;
      // Save form data when going back
      formStorage.saveTempApplication(formData, selectedDocuments, prevStep);
      setCurrentStep(prevStep);
    }
  }, [currentStep, formData, selectedDocuments]);

  const handleBackPress = useCallback(() => {
    const hasUnsavedData = currentStep > 0 || Object.keys(selectedDocuments).length > 0;
    
    if (hasUnsavedData) {
      Alert.alert(
        'Unsaved Changes',
        'You have unsaved application data. What would you like to do?',
        [
          {
            text: 'Save & Exit',
            onPress: () => {
              formStorage.saveTempApplication(formData, selectedDocuments, currentStep);
              router.back();
            },
          },
          {
            text: 'Discard Changes',
            style: 'destructive',
            onPress: () => {
              formStorage.cancelApplication();
              router.back();
            },
          },
          {
            text: 'Continue Working',
            style: 'cancel',
          },
        ]
      );
    } else {
      router.back();
    }
  }, [currentStep, formData, selectedDocuments]);

  const handleCancelApplication = useCallback(() => {
    const stats = formStorage.getQueueStats();
    
    Alert.alert(
      'Cancel Application',
      `Are you sure you want to cancel this application?\n\n• ${stats.totalOperations} documents selected\n• All progress will be lost\n\nThis action cannot be undone.`,
      [
        { text: 'Keep Working', style: 'cancel' },
        {
          text: 'Cancel Application',
          style: 'destructive',
          onPress: () => {
            // Cancel application and clear all data
            formStorage.cancelApplication();
            
            // Reset component state
            setFormData({
              applicationType: 'New',
              jobCategory: '',
              position: '',
              organization: '',
              civilStatus: 'Single',
            });
            setSelectedDocuments({});
            setCurrentStep(0);
            
            // Show confirmation
            showSuccess('Application Cancelled', 'Your application has been cancelled and all data cleared.');
          },
        },
      ]
    );
  }, [showSuccess]);

  // Load initial data and check for existing temp application
  const initializeForm = useCallback((jobCategories: any[], user: any) => {
    try {
      // Check for app restart and clear old data
      const wasRestarted = formStorage.handleAppRestart();
      if (wasRestarted) {
        console.log('App was restarted, starting fresh application');
      }

      // Check for existing temp application in MMKV (only if not restarted)
      const tempApp = formStorage.getTempApplication();
      if (tempApp && !formStorage.isTempApplicationExpired() && !wasRestarted) {
        // Log queue stats for debugging
        const stats = formStorage.getQueueStats();
        console.log('Restored deferred queue:', stats);
        
        // If the queue is in a failed state, ask user if they want to continue or start fresh
        if (stats.queueStatus === 'failed') {
          console.log('Previous application was in failed state, clearing and starting fresh');
          formStorage.clearTempApplication();
          showError('Previous Application Failed', 'Your previous application had errors and has been cleared. Please start a new application.');
        } else {
          // Restore form data from deferred queue
          setFormData(tempApp.formData);
          setSelectedDocuments(tempApp.selectedDocuments);
          setCurrentStep(tempApp.currentStep);
          
          // Show user that we restored their previous work
          showSuccess('Previous Application Restored', 'We restored your previous application progress.');
        }
      } else if (tempApp && formStorage.isTempApplicationExpired()) {
        // Clear expired temp data
        formStorage.clearTempApplication();
        console.log('Cleared expired application data');
      }
    } catch (error) {
      console.error('Error loading initial data:', error);
      showError('Failed to load application data');
    }
  }, [showSuccess, showError]);

  // Save form data only when stepping forward
  const saveFormData = useCallback(() => {
    const hasData = currentStep > 0 || Object.keys(selectedDocuments).length > 0;
    if (hasData && formStorage.hasTempApplication()) {
      formStorage.saveTempApplication(formData, selectedDocuments, currentStep);
      console.log('Saved form data at step', currentStep);
    }
  }, [formData, selectedDocuments, currentStep]);

  const resetForm = useCallback(() => {
    // Reset form data to initial state
    setFormData({
      applicationType: 'New',
      jobCategory: '',
      position: '',
      organization: '',
      civilStatus: 'Single',
    });
    
    // Reset selected documents
    setSelectedDocuments({});
    
    // Reset current step
    setCurrentStep(0);
    
    // Reset errors
    setErrors({});
    
    // Clear temp application data
    formStorage.clearTempApplication();
  }, []);

  return {
    currentStep,
    setCurrentStep,
    formData,
    setFormData,
    errors,
    setErrors,
    selectedDocuments,
    setSelectedDocuments,
    getUploadState,
    validateCurrentStep,
    handleNext,
    handlePrevious,
    handleBackPress,
    handleCancelApplication,
    initializeForm,
    resetForm,
  };
};