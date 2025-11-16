import { useEffect, useState, useRef, useMemo } from 'react';
import { useUser } from '@clerk/clerk-expo';
import { useJobCategories } from '@/src/features/jobCategory/hooks/useJobCategories';
import { useApplications } from './useApplications';
import { useRequirements } from '@/src/features/upload/hooks/useRequirements';
import { useUsers } from '@/src/features/profile/hooks/useUsers';
import { useApplicationForm } from './useApplicationForm';
import { useDocumentSelection } from './useDocumentSelection';
import { useSubmission } from './useSubmission';
import { useFeedback } from '@/src/shared/components/feedback';
import { transformRequirements } from '@entities/application';
import { STEP_TITLES } from '@/src/features/application/constants';
import { DocumentRequirement } from '@/src/entities/application/model/types';
import { JobCategory } from '@/src/entities/jobCategory/model/types';
import { User } from '@/src/entities/user/model/types';

/**
 * Application Orchestrator Hook
 * 
 * This hook orchestrates all the business logic for the application form:
 * - Manages form state and validation
 * - Handles document selection and uploads
 * - Manages API calls for job categories, users, and requirements
 * - Handles form submission
 * 
 * This is the single source of truth for all application form logic,
 * keeping the screen layer thin and the widget layer focused on UI.
 */
export function useApplyForm() {
  const { user } = useUser();
  const { messages, showSuccess, showError, showWarning, dismissFeedback } = useFeedback();

  // API hooks
  const applications = useApplications();
  const jobCategories = useJobCategories();
  const users = useUsers();

  // Main application form hook
  const applicationForm = useApplicationForm({ showSuccess, showError });
  const { 
    currentStep,
    setCurrentStep,
    formData,
    setFormData,
    errors,
    selectedDocuments,
    setSelectedDocuments,
    getUploadState,
    validateCurrentStep,
    handleNext,
    handlePrevious,
    handleBackPress,
    handleCancelApplication,
    initializeForm,
    resetForm
  } = applicationForm;

  // Get requirements for current job category
  const requirements = useRequirements(formData.jobCategory);

  // Document selection hook
  const documentSelection = useDocumentSelection({
    selectedDocuments,
    setSelectedDocuments,
    formData,
    currentStep,
    showSuccess,
    showError,
  });

  // Local state
  const [jobCategoriesData, setJobCategoriesData] = useState<JobCategory[]>([]);
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [requirementsByJobCategory, setRequirementsByJobCategory] = useState<DocumentRequirement[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [termsAccepted, setTermsAccepted] = useState(false);
  
  // Track if initialization has happened
  const hasInitialized = useRef(false);

  // Use jobCategories directly from hook - memoize to prevent infinite loops
  const activeJobCategories = useMemo(() => jobCategories.jobCategories || [], [jobCategories.jobCategories]);
  const currentUser = useMemo(() => users.data.currentUser || null, [users.data.currentUser]);
  const currentRequirements = useMemo(() => requirements.data.jobCategoryRequirements || [], [requirements.data.jobCategoryRequirements]);

  // Submission hook
  const submission = useSubmission({
    formData,
    requirementsByJobCategory,
    jobCategoriesData: activeJobCategories,
    applications,
    requirements,
    validateCurrentStep: () => validateCurrentStep(requirementsByJobCategory),
    showSuccess,
    showError,
    resetForm,
  });

  // Load initial data
  useEffect(() => {
    if (jobCategories.isLoading) {
      setLoadingData(true);
      return;
    }
    
    // Only initialize once
    if (hasInitialized.current) {
      // Just update the data without re-initializing
      setJobCategoriesData(activeJobCategories);
      setUserProfile(currentUser);
      setLoadingData(false);
      return;
    }
    
    try {
      setJobCategoriesData(activeJobCategories);
      setUserProfile(currentUser);
      initializeForm(activeJobCategories, currentUser);
      hasInitialized.current = true;
      setLoadingData(false);
    } catch (error) {
      console.error('Error loading initial data:', error);
      showError('Failed to load application data');
      setLoadingData(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobCategories.isLoading, activeJobCategories.length, currentUser]);

  // Load requirements when job category changes
  useEffect(() => {
    if (formData.jobCategory && currentRequirements.length > 0) {
      try {
        const transformedReqs = transformRequirements(currentRequirements, formData.jobCategory);
        
        // Filter Non-Food optional docs based on Security Guard flag
        const selectedCategory = activeJobCategories.find(cat => cat._id === formData.jobCategory);
        const isNonFood = (selectedCategory?.name || '').toLowerCase().includes('non-food');
        let filtered = transformedReqs;
        if (isNonFood) {
          // Use ONLY the checkbox value, not the position text
          // This allows users to be "Security" position without extra docs unless they explicitly check the box
          const isSecurityGuard = !!formData.securityGuard;
          if (!isSecurityGuard) {
            filtered = transformedReqs.filter(r => !(r.fieldName === 'drugTestId' || r.fieldName === 'neuroExamId' || /drug\s*test/i.test(r.name) || /neuro/i.test(r.name)));
          }
        }
        setRequirementsByJobCategory(filtered);
      } catch (error) {
        console.error('Error loading requirements:', error);
        showError('Failed to load document requirements');
      }
    } else {
      setRequirementsByJobCategory([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.jobCategory, formData.securityGuard, formData.position, currentRequirements.length, activeJobCategories.length]);

  const handleNextStep = async () => {
    const success = await handleNext(requirementsByJobCategory, STEP_TITLES);
    if (success && currentStep === STEP_TITLES.length - 1) {
      submission.handleSubmit();
    }
  };

  return {
    // State
    currentStep,
    setCurrentStep,
    formData,
    setFormData,
    errors,
    selectedDocuments,
    setSelectedDocuments,
    jobCategoriesData,
    userProfile,
    requirementsByJobCategory,
    loadingData,
    isSubmitting: submission.loading,
    termsAccepted,
    setTermsAccepted,
    
    // Feedback
    messages,
    dismissFeedback,
    
    // Handlers
    handleNextStep,
    handlePrevious,
    handleBackPress,
    handleCancelApplication,
    getUploadState,
    
    // Document selection
    showImagePicker: documentSelection.showImagePicker,
    setShowImagePicker: documentSelection.setShowImagePicker,
    handleDocumentPicker: documentSelection.handleDocumentPicker,
    handleRemoveDocument: documentSelection.handleRemoveDocument,
    pickFromCamera: documentSelection.pickFromCamera,
    pickFromGallery: documentSelection.pickFromGallery,
    pickDocFile: documentSelection.pickDocFile,
    
    // Requirements
    requirementsLoading: requirements.isLoading,
  };
}
