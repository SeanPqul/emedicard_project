import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BaseScreen } from '@/src/shared/components/core';
import { useApplyForm } from '@/src/features/application/hooks';
import { ApplyWidget } from '@/src/widgets/apply';
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

  if (loadingData) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
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
