import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useQuery } from 'convex/react';
import { api } from '@backend/convex/_generated/api';
import { Id } from '@backend/convex/_generated/dataModel';
import { BaseScreen } from '@/src/shared/components/core';
import { useApplyForm } from '@/src/features/application/hooks';
import { useApplications } from '@/src/features/application/hooks/useApplications';
import { ApplyWidget } from '@/src/widgets/apply';
import { ApplicationRestrictionModal } from '@/src/features/application/components/ApplicationRestrictionModal';
import { hasUnresolvedApplication } from '@/src/features/application/lib/applicationRestrictions';
import { theme } from '@/src/shared/styles/theme';
import { moderateScale } from '@/src/shared/utils/responsive';

/**
 * ApplyScreen - Thin orchestrator following FSD pattern
 * 
 * This screen only handles:
 * - Loading states
 * - Delegating to ApplyWidget
 * 
 * All business logic is handled by useApplyForm hook
 * All UI rendering is handled by ApplyWidget
 */
export function ApplyScreen() {
  const router = useRouter();
  
  // Detect renewal mode from URL params
  const params = useLocalSearchParams();
  const isRenewalMode = params.action === 'renew';
  const healthCardId = params.healthCardId as string | undefined;
  
  // Fetch previous application data for renewal
  const previousAppData = useQuery(
    api.applications.getPreviousApplicationData.getPreviousApplicationDataQuery,
    isRenewalMode && healthCardId 
      ? { healthCardId: healthCardId as Id<"healthCards"> } 
      : 'skip'
  );
  
  const { data, isLoading: applicationsLoading } = useApplications();
  const applications = data?.userApplications;
  const [showRestrictionModal, setShowRestrictionModal] = useState(false);
  const [unresolvedApp, setUnresolvedApp] = useState<any>(null);
  const [accessChecked, setAccessChecked] = useState(false);

  // Check for unresolved applications on mount only
  // Skip this check for renewal mode - select-card screen already handles eligibility
  useEffect(() => {
    if (!applicationsLoading && !accessChecked) {
      // Skip unresolved check if coming from renewal flow
      if (isRenewalMode) {
        setAccessChecked(true);
        return;
      }
      
      // Applications might be undefined or empty array
      const appList = applications || [];
      const { hasUnresolved, unresolvedApplication } = hasUnresolvedApplication(appList);
      
      if (hasUnresolved && unresolvedApplication) {
        setUnresolvedApp(unresolvedApplication);
        setShowRestrictionModal(true);
      }
      
      setAccessChecked(true);
    }
  }, [applicationsLoading, accessChecked, isRenewalMode]);

  const {
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
    isSubmitting,
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
    showImagePicker,
    setShowImagePicker,
    handleDocumentPicker,
    handleRemoveDocument,
    pickFromCamera,
    pickFromGallery,
    pickDocFile,
    
    // Requirements
    requirementsLoading,
  } = useApplyForm();

  // Pre-populate form data and skip Application Type step for renewal mode
  useEffect(() => {
    if (isRenewalMode && previousAppData && !formData.firstName && healthCardId) {
      // Set form data first
      setFormData({
        ...formData,
        applicationType: 'Renew',
        firstName: previousAppData.application.firstName || '',
        middleName: previousAppData.application.middleName || '',
        lastName: previousAppData.application.lastName || '',
        suffix: previousAppData.application.suffix || '',
        age: previousAppData.application.age || undefined,
        nationality: previousAppData.application.nationality || '',
        gender: previousAppData.application.gender || undefined,
        position: previousAppData.application.position || '',
        organization: previousAppData.application.organization || '',
        civilStatus: (previousAppData.application.civilStatus as any) || 'Single',
        jobCategory: previousAppData.application.jobCategoryId || '',
        previousHealthCardId: healthCardId as Id<"healthCards">,
      });
      
      // Skip Application Type step (step 0) and go directly to Job Category (step 1)
      if (currentStep === 0) {
        setCurrentStep(1);
      }
    }
  }, [isRenewalMode, previousAppData, formData.firstName, healthCardId, currentStep]);

  const handleViewApplication = () => {
    setShowRestrictionModal(false);
    if (unresolvedApp?._id) {
      router.push(`/(tabs)/applications/${unresolvedApp._id}`);
    }
  };

  const handleCloseModal = () => {
    setShowRestrictionModal(false);
    router.back();
  };

  // Wait for application access check to complete
  if (!accessChecked || applicationsLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={theme.colors.primary[500]} />
        <Text style={styles.loadingText}>Checking application status...</Text>
      </View>
    );
  }

  // Show restriction modal if user has unresolved application
  if (showRestrictionModal && unresolvedApp) {
    return (
      <BaseScreen safeArea={false}>
        <ApplicationRestrictionModal
          visible={showRestrictionModal}
          onClose={handleCloseModal}
          onViewApplication={handleViewApplication}
          applicationStatus={unresolvedApp.status}
          applicationId={unresolvedApp._id}
          jobCategory={unresolvedApp.jobCategory}
        />
      </BaseScreen>
    );
  }

  if (loadingData) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={theme.colors.primary[500]} />
        <Text style={styles.loadingText}>Loading application data...</Text>
      </View>
    );
  }

  return (
    <BaseScreen safeArea={false} keyboardAvoiding={false}>
      <ApplyWidget
        // State
        currentStep={currentStep}
        formData={formData}
        errors={errors}
        selectedDocuments={selectedDocuments}
        jobCategoriesData={jobCategoriesData}
        requirementsByJobCategory={requirementsByJobCategory}
        isSubmitting={isSubmitting}
        showImagePicker={showImagePicker}
        termsAccepted={termsAccepted}
        
        // Renewal props
        isRenewalMode={isRenewalMode}
        renewalCardNumber={previousAppData?.healthCard?.registrationNumber}
        
        // State setters
        setCurrentStep={setCurrentStep}
        setFormData={setFormData}
        setShowImagePicker={setShowImagePicker}
        setTermsAccepted={setTermsAccepted}
        
        // Handlers
        handleNextStep={handleNextStep}
        handlePrevious={handlePrevious}
        handleBackPress={handleBackPress}
        handleCancelApplication={handleCancelApplication}
        getUploadState={getUploadState}
        
        // Document handlers
        handleDocumentPicker={handleDocumentPicker}
        handleRemoveDocument={handleRemoveDocument}
        pickFromCamera={pickFromCamera}
        pickFromGallery={pickFromGallery}
        pickDocFile={pickDocFile}
        
        // Requirements
        requirementsLoading={requirementsLoading}
        
        // Feedback
        messages={messages}
        dismissFeedback={dismissFeedback}
      />
    </BaseScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: moderateScale(theme.typography.body.fontSize),
    color: theme.colors.text.secondary,
  },
});
