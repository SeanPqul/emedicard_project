import { 
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { hp, verticalScale } from '@/src/shared/utils/responsive';
import { formStorage } from '@/src/features/application/services/formStorage';
import { STEP_TITLES } from '@/src/features/application/constants';
import { FeedbackSystem } from '@/src/shared/components/feedback';

// Components
import { StepIndicator, DocumentSourceModal } from '@/src/features/application/components';
import { 
  ApplicationTypeStep,
  JobCategoryStep,
  PersonalDetailsStep,
  UploadDocumentsStep,
  ReviewStep
} from '@/src/features/application/components/steps';

// Types
import type { ApplicationFormData } from '@/src/features/application/lib/validation';
import type { JobCategory, DocumentRequirement } from '@/src/entities/application';
import type { SelectedDocuments } from '@shared/types';

import { styles } from './ApplyWidget.styles';

// Define UploadState interface
interface UploadState {
  uploading: boolean;
  progress: number;
  error: string | null;
  success: boolean;
  queued: boolean;
}

interface ApplyWidgetProps {
  // State
  currentStep: number;
  formData: ApplicationFormData;
  errors: Record<string, string>;
  selectedDocuments: SelectedDocuments;
  jobCategoriesData: JobCategory[];
  requirementsByJobCategory: DocumentRequirement[];
  isSubmitting: boolean;
  showImagePicker: boolean;
  
  // State setters
  setCurrentStep: (step: number) => void;
  setFormData: (data: ApplicationFormData) => void;
  setShowImagePicker: (show: boolean) => void;
  
  // Handlers
  handleNextStep: () => Promise<void>;
  handlePrevious: () => void;
  handleBackPress: () => void;
  handleCancelApplication: () => void;
  getUploadState: (documentId: string) => UploadState;
  
  // Document handlers
  handleDocumentPicker: (requirementId: string) => void;
  handleRemoveDocument: (requirementId: string) => void;
  pickFromCamera: () => void;
  pickFromGallery: () => void;
  pickDocFile: () => void;
  
  // Requirements
  requirementsLoading: boolean;
  
  // Feedback
  messages: any[];
  dismissFeedback: (id: string) => void;
}

export function ApplyWidget({
  currentStep,
  formData,
  errors,
  selectedDocuments,
  jobCategoriesData,
  requirementsByJobCategory,
  isSubmitting,
  showImagePicker,
  setCurrentStep,
  setFormData,
  setShowImagePicker,
  handleNextStep,
  handlePrevious,
  handleBackPress,
  handleCancelApplication,
  getUploadState,
  handleDocumentPicker,
  handleRemoveDocument,
  pickFromCamera,
  pickFromGallery,
  pickDocFile,
  requirementsLoading,
  messages,
  dismissFeedback,
}: ApplyWidgetProps) {
  const insets = useSafeAreaInsets();

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
            isLoading={requirementsLoading}
            getUploadState={getUploadState}
            onDocumentPicker={handleDocumentPicker}
            onRemoveDocument={handleRemoveDocument}
            requirements={{ isLoading: requirementsLoading }}
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
        behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
        style={styles.keyboardAvoidingView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView 
          style={styles.content} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ 
            paddingBottom: hp(20),
            flexGrow: 1
          }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.contentWrapper}>
            {renderCurrentStep()}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Navigation Buttons */}
      <View style={[styles.navigationButtons, { paddingBottom: insets.bottom || 16 }]}>
        {currentStep > 0 && (
          <TouchableOpacity 
            style={styles.previousButton} 
            onPress={handlePrevious}
          >
            <Text style={styles.previousButtonText}>Previous</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity
          style={[
            styles.nextButton,
            currentStep === 0 && styles.nextButtonFull,
            { 
              backgroundColor: isSubmitting ? '#D1D5DB' : '#2E86AB',
              opacity: isSubmitting ? 0.6 : 1,
            }
          ]}
          onPress={handleNextStep}
          disabled={isSubmitting}
        >
          <Text style={styles.nextButtonText}>
            {isSubmitting ? 'Loading...' : (currentStep === STEP_TITLES.length - 1 ? 'Submit Application' : 'Next')}
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Document Source Modal */}
      <DocumentSourceModal
        visible={showImagePicker}
        onClose={() => setShowImagePicker(false)}
        onPickCamera={pickFromCamera}
        onPickGallery={pickFromGallery}
        onPickDocument={pickDocFile}
      />

      <FeedbackSystem messages={messages} onDismiss={dismissFeedback} position="below-header" />
    </View>
  );
}
