import { useUser } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { 
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  Dimensions
} from 'react-native';
import { hp } from '../../src/utils/responsive';
import { FeedbackSystem, useFeedback } from '../../src/components/';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { styles } from '../../src/styles/screens/tabs-apply-forms';
import { useJobCategories } from '../../src/hooks/useJobCategories';
import { useApplications } from '../../src/hooks/useApplications';
import { useRequirements } from '../../src/hooks/useRequirements';
import { useUsers } from '../../src/hooks/useUsers';
import { JobCategory, DocumentRequirement } from '../../src/types/domain/application';
import { User } from '../../src/types/domain/user';
import { formStorage } from '../../src/utils/formStorage';
import { getColor } from '../../src/styles/theme';
import { transformRequirements } from '../../src/utils/application/requirementsMapper';
import { STEP_TITLES } from '../../src/constants/application';

// Import extracted components
import { StepIndicator } from '../../src/screens/apply/components/StepIndicator';
import { DocumentSourceModal } from '../../src/screens/apply/components/DocumentSourceModal';
import { 
  ApplicationTypeStep,
  JobCategoryStep,
  PersonalDetailsStep,
  UploadDocumentsStep,
  ReviewStep
} from '../../src/screens/apply/steps';

// Import extracted hooks
import { useApplicationForm } from '../../src/hooks/useApplicationForm';
import { useDocumentSelection } from '../../src/hooks/useDocumentSelection';
import { useSubmission } from '../../src/hooks/useSubmission';

export default function ApplyScreen() {
  const { user } = useUser();
  const insets = useSafeAreaInsets();
  const screenHeight = Dimensions.get('window').height;
  const { messages, showSuccess, showError, showWarning, dismissFeedback } = useFeedback();

  // Calculate responsive tab bar height
  const getTabBarHeight = () => {
    // Standard tab bar heights for different devices
    const baseTabBarHeight = Platform.OS === 'ios' ? 83 : 60;
    
    // For devices with safe area insets (like iPhone X and newer)
    if (insets.bottom > 0) {
      return baseTabBarHeight;
    }
    
    // For older devices without safe area insets
    return baseTabBarHeight - 20;
  };
  
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

  // API queries and state management
  const [jobCategoriesData, setJobCategoriesData] = useState<JobCategory[]>([]);
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [requirementsByJobCategory, setRequirementsByJobCategory] = useState<DocumentRequirement[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Use jobCategories directly from hook to avoid timing issues
  const activeJobCategories = jobCategories.jobCategories || [];

  // Submission hook
  const submission = useSubmission({
    formData,
    requirementsByJobCategory,
    jobCategoriesData: activeJobCategories, // Use live data instead of state
    applications,
    requirements,
    validateCurrentStep: () => validateCurrentStep(requirementsByJobCategory),
    showSuccess,
    showError,
    resetForm,
  });


  // Load initial data
  useEffect(() => {
    // Wait for job categories to load before setting loading to false
    if (jobCategories.isLoading) {
      setLoadingData(true);
      return;
    }
    
    try {
      // Data is now available from hooks
      const categories = jobCategories.jobCategories || [];
      setJobCategoriesData(categories);
      setUserProfile(users.data.currentUser || null);
      
      // Initialize form with data
      initializeForm(categories, users.data.currentUser);
      
      setLoadingData(false);
    } catch (error) {
      console.error('Error loading initial data:', error);
      showError('Failed to load application data');
      setLoadingData(false);
    }
  }, [jobCategories.jobCategories, jobCategories.isLoading, users.data.currentUser, initializeForm, showError]);

  // Load requirements when job category changes
  useEffect(() => {
    if (formData.jobCategory && requirements.data.jobCategoryRequirements) {
      try {
        // Use requirements data from hook and transform them
        const reqs = requirements.data.jobCategoryRequirements || [];
        const transformedReqs = transformRequirements(reqs, formData.jobCategory);
        setRequirementsByJobCategory(transformedReqs);
      } catch (error) {
        console.error('Error loading requirements:', error);
        showError('Failed to load document requirements');
      }
    } else {
      setRequirementsByJobCategory([]);
    }
  }, [formData.jobCategory, requirements.data.jobCategoryRequirements, showError]);

  const handleNextStep = async () => {
    const success = await handleNext(requirementsByJobCategory, STEP_TITLES);
    if (success && currentStep === STEP_TITLES.length - 1) {
      // This is the final step, handle submission
      submission.handleSubmit();
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <ApplicationTypeStep
            formData={formData}
            setFormData={setFormData}
            errors={errors}
          />
        );
      case 1:
        return (
          <JobCategoryStep
            formData={formData}
            setFormData={setFormData}
            errors={errors}
            jobCategoriesData={jobCategoriesData}
          />
        );
      case 2:
        return (
          <PersonalDetailsStep
            formData={formData}
            setFormData={setFormData}
            errors={errors}
            jobCategoriesData={jobCategoriesData}
          />
        );
      case 3:
        return (
          <UploadDocumentsStep
            formData={formData}
            requirementsByJobCategory={requirementsByJobCategory}
            selectedDocuments={selectedDocuments}
            isLoading={requirements.isLoading}
            getUploadState={getUploadState}
            onDocumentPicker={documentSelection.handleDocumentPicker}
            onRemoveDocument={documentSelection.handleRemoveDocument}
            requirements={requirements}
          />
        );
      case 4:
        return (
          <ReviewStep
            formData={formData}
            jobCategoriesData={jobCategoriesData}
            requirementsByJobCategory={requirementsByJobCategory}
            selectedDocuments={selectedDocuments}
            getUploadState={getUploadState}
            onEditStep={setCurrentStep}
          />
        );
      default:
        return null;
    }
  };

  if (loadingData) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text>Loading application data...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress}>
          <Ionicons name="arrow-back" size={24} color="#212529" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Application</Text>
        <View style={styles.headerRight}>
          {formStorage.hasTempApplication() && (
            <TouchableOpacity onPress={handleCancelApplication} style={styles.cancelButton}>
              <Ionicons name="close-circle-outline" size={24} color="#dc3545" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Step Indicator */}
      <StepIndicator currentStep={currentStep} stepTitles={STEP_TITLES} />

      {/* Content with Keyboard Avoiding */}
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <ScrollView 
          style={styles.content} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ 
            paddingBottom: hp(10), // Responsive padding: navigation buttons (8%) + tab bar (8%) + buffer (3%)
            flexGrow: 1 // Ensure content can expand
          }}
          keyboardShouldPersistTaps="handled"
        >
          
          <View style={styles.contentWrapper}>
            {renderCurrentStep()}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Navigation Buttons - Responsive positioning */}
      <View style={styles.navigationButtons}>
          {currentStep > 0 && (
            <TouchableOpacity 
              style={styles.previousButton} 
              onPress={handlePrevious}
            >
              <Text style={styles.previousButtonText}>Previous</Text>
            </TouchableOpacity>
          )}
          
          {/* Navigation Button with proper validation */}
          <TouchableOpacity
            style={[
              styles.nextButton,
              currentStep === 0 && styles.nextButtonFull,
              { 
                backgroundColor: submission.loading ? getColor('border.medium') : getColor('accent.medicalBlue'),
                opacity: submission.loading ? 0.6 : 1,
              }
            ]}
            onPress={handleNextStep}
            disabled={submission.loading}
          >
            <Text style={styles.nextButtonText}>
              {submission.loading ? 'Loading...' : (currentStep === STEP_TITLES.length - 1 ? 'Submit Application' : 'Next')}
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* Document Source Modal */}
        <DocumentSourceModal
          visible={documentSelection.showImagePicker}
          onClose={() => documentSelection.setShowImagePicker(false)}
          onPickCamera={documentSelection.pickFromCamera}
          onPickGallery={documentSelection.pickFromGallery}
          onPickDocument={documentSelection.pickDocFile}
        />


        <FeedbackSystem messages={messages} onDismiss={dismissFeedback} position="below-header" />
    </View>
  );
}
