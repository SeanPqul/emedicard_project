import React from 'react';
import { View, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Features
import { StepIndicator } from '@features/application/components';
import {
  ApplicationTypeStep,
  JobCategoryStep,
  PersonalDetailsStep,
  UploadDocumentsStep,
  ReviewStep
} from '@features/application/components/steps';

// Types
import { ApplicationFormData } from '@features/application/services/applicationService';
import { SelectedDocuments } from '@shared/types';
import { DocumentRequirement, JobCategory } from '@entities/application/model/types';

// Styles
import { styles } from './ApplyWidget.styles';

interface ApplyWidgetProps {
  currentStep: number;
  formData: ApplicationFormData;
  setFormData: (data: ApplicationFormData) => void;
  errors: Record<string, string>;
  selectedDocuments: SelectedDocuments;
  jobCategoriesData: JobCategory[];
  requirementsByJobCategory: DocumentRequirement[];
  isLoading: boolean;
  onDocumentPicker: (documentId: string) => void;
  onRemoveDocument: (documentId: string) => void;
  onSubmit: () => void;
  onNext: () => void;
  onPrevious: () => void;
  getUploadState: (documentId: string) => any;
  requirements: any;
  isSubmitting: boolean;
  stepTitles: string[];
}

export function ApplyWidget({
  currentStep,
  formData,
  setFormData,
  errors,
  selectedDocuments,
  jobCategoriesData,
  requirementsByJobCategory,
  isLoading,
  onDocumentPicker,
  onRemoveDocument,
  onSubmit,
  onNext,
  onPrevious,
  getUploadState,
  requirements,
  isSubmitting,
  stepTitles,
}: ApplyWidgetProps) {
  const insets = useSafeAreaInsets();

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <ApplicationTypeStep
            applicationType={formData.applicationType}
            onSelect={(type) => setFormData({ ...formData, applicationType: type })}
            error={errors.applicationType}
          />
        );
      case 1:
        return (
          <JobCategoryStep
            jobCategories={jobCategoriesData}
            selectedCategory={formData.jobCategory}
            onSelect={(category) => setFormData({ ...formData, jobCategory: category })}
            error={errors.jobCategory}
            isLoading={false}
          />
        );
      case 2:
        return (
          <PersonalDetailsStep
            position={formData.position}
            organization={formData.organization}
            civilStatus={formData.civilStatus}
            onPositionChange={(position) => setFormData({ ...formData, position })}
            onOrganizationChange={(org) => setFormData({ ...formData, organization: org })}
            onCivilStatusChange={(status) => setFormData({ ...formData, civilStatus: status })}
            errors={errors}
            jobCategories={jobCategoriesData}
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
            onDocumentPicker={onDocumentPicker}
            onRemoveDocument={onRemoveDocument}
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
            onEdit={(step: number) => {/* Handle edit */}}
            onSubmit={onSubmit}
            isSubmitting={isSubmitting}
          />
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <StepIndicator
        currentStep={currentStep}
        totalSteps={stepTitles.length}
        stepTitles={stepTitles}
        onNext={onNext}
        onPrevious={onPrevious}
        isValid={!Object.keys(errors).length}
        showSubmit={currentStep === stepTitles.length - 1}
      />
      
      <ScrollView
        style={styles.content}
        contentContainerStyle={[
          styles.contentContainer,
          { paddingBottom: insets.bottom + 20 }
        ]}
        showsVerticalScrollIndicator={false}
      >
        {renderCurrentStep()}
      </ScrollView>
    </View>
  );
}
