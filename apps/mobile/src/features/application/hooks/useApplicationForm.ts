import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { router } from 'expo-router';
import { validateApplicationStep } from '../lib/validation';
import type { ApplicationFormData } from '../services/applicationService';
import { formStorage } from '../services/formStorage';
import { SelectedDocuments } from '@shared/types';
import { DocumentRequirement } from '@/src/entities/application/model/types';

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
    civilStatus: undefined,
    firstName: '',
    middleName: '',
    lastName: '',
    age: 0,
    nationality: '',
    gender: undefined,
    securityGuard: false,
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
    const validation = validateApplicationStep(
      formData, 
      currentStep, 
      requirementsByJobCategory || [], 
      selectedDocuments, 
      getUploadState
    );
    
    setErrors(validation.errors);
    
    if (!validation.isValid) {
      // Show specific error messages based on the current step
      if (currentStep === 1 && validation.errors.jobCategory) {
        showError('Job Category Required', 'Please select a job category to continue with your application.');
        return;
      }
      
      if (currentStep === 2) {
        const missingFields = [];
        if (validation.errors.firstName) missingFields.push('• First Name');
        // Middle name is optional, so no error for it
        if (validation.errors.lastName) missingFields.push('• Last Name');
        if (validation.errors.age) missingFields.push('• Age');
        if (validation.errors.nationality) missingFields.push('• Nationality');
        if (validation.errors.position) missingFields.push('• Position/Job Title');
        if (validation.errors.organization) missingFields.push('• Organization/Company');
        if (validation.errors.gender) missingFields.push('• Gender');
        if (validation.errors.civilStatus) missingFields.push('• Civil Status');
        
        if (missingFields.length > 0) {
          showError(
            'Required Information Missing',
            `Please provide the following information:\n\n${missingFields.join('\n')}`
          );
          return;
        }
      }
      
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
              // Clear storage first
              formStorage.cancelApplication();
              
              // Reset component state to prevent re-saving
              setFormData({
                applicationType: 'New',
                jobCategory: '',
                position: '',
                organization: '',
                civilStatus: undefined,
                firstName: '',
                middleName: '',
                lastName: '',
                age: 0,
                nationality: '',
                gender: undefined,
                securityGuard: false,
              });
              setSelectedDocuments({});
              setCurrentStep(0);
              setErrors({});
              
              // Navigate to apply tab without renewal params to clear renewal mode
              // This prevents the renewal state from persisting after discard
              router.replace('/(tabs)/apply');
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
              civilStatus: undefined,
              firstName: '',
              lastName: '',
              gender: undefined,
              securityGuard: false,
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
      }

      // Check for existing temp application in MMKV (only if not restarted)
      const tempApp = formStorage.getTempApplication();
      if (tempApp && !formStorage.isTempApplicationExpired() && !wasRestarted) {
        // Log queue stats for debugging
        const stats = formStorage.getQueueStats();
        
        // If the queue is in a failed state, ask user if they want to continue or start fresh
        if (stats.queueStatus === 'failed') {
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
      }
    } catch (error) {
      showError('Failed to load application data');
    }
  }, [showSuccess, showError]);

  // Save form data only when stepping forward
  const saveFormData = useCallback(() => {
    const hasData = currentStep > 0 || Object.keys(selectedDocuments).length > 0;
    if (hasData && formStorage.hasTempApplication()) {
      formStorage.saveTempApplication(formData, selectedDocuments, currentStep);
    }
  }, [formData, selectedDocuments, currentStep]);

  const resetForm = useCallback(() => {
    // Reset form data to initial state
    setFormData({
      applicationType: 'New',
      jobCategory: '',
      position: '',
      organization: '',
      civilStatus: undefined,
      firstName: '',
      lastName: '',
      gender: undefined,
      securityGuard: false,
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