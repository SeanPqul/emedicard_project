import { useUser } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from 'convex/react';
import * as DocumentPicker from 'expo-document-picker';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import React, { useEffect, useState, useCallback } from 'react';
import { validateApplicationStep } from '../../src/utils/applicationValidation';
import { pickImageFromCamera, pickDocument, pickImageFromGallery } from '../../src/utils/fileUploadUtils';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View
, Dimensions } from 'react-native';
import { FeedbackSystem, useFeedback } from '../../src/components/feedback/FeedbackSystem';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { styles } from '../../src/styles/screens/tabs-apply-forms';
import { modalStyles } from '../../src/styles/components/modals';
import { Id } from '../../convex/_generated/dataModel';
import { CustomButton, CustomTextInput } from '../../src/components';
import { useDocumentUpload } from '../../src/hooks/useDocumentUpload';
import { getBorderRadius, getColor, getShadow, getSpacing, getTypography } from '../../src/styles/theme';
import { useJobCategories } from '../../src/hooks/useJobCategories';
import { useApplications } from '../../src/hooks/useApplications';
import { useRequirements } from '../../src/hooks/useRequirements';
import { useUsers } from '../../src/hooks/useUsers';
import { JobCategory, User, DocumentRequirement, SelectedDocuments, DocumentFile } from '../../src/types';

type ApplicationType = 'New' | 'Renew';
type CivilStatus = 'Single' | 'Married' | 'Divorced' | 'Widowed';

interface ApplicationFormData {
  applicationType: ApplicationType;
  jobCategory: string;
  position: string;
  organization: string;
  civilStatus: CivilStatus;
}

const STEP_TITLES = [
  'Application Type',
  'Job Category', 
  'Personal Details',
  'Upload Documents',
  'Review & Submit'
];

const CIVIL_STATUS_OPTIONS: CivilStatus[] = ['Single', 'Married', 'Divorced', 'Widowed'];

export default function Apply() {
  const { user } = useUser();
  const insets = useSafeAreaInsets();
  const screenHeight = Dimensions.get('window').height;
  
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
  
  const tabBarHeight = getTabBarHeight();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<ApplicationFormData>({
    applicationType: 'New',
    jobCategory: '',
    position: '',
    organization: '',
    civilStatus: 'Single',
  });
  const [errors, setErrors] = useState<Partial<ApplicationFormData>>({});
  const [loading, setLoading] = useState(false);
  const { messages, showSuccess, showError, showWarning, dismissFeedback } = useFeedback();
  
  // Upload documents state
  const [selectedDocuments, setSelectedDocuments] = useState<SelectedDocuments>({});
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, Id<"_storage">>>({});
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  const [tempFormId, setTempFormId] = useState<string | null>(null);

  // API queries and state management
  const [jobCategoriesData, setJobCategoriesData] = useState<JobCategory[]>([]);
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [requirementsByJobCategory, setRequirementsByJobCategory] = useState<DocumentRequirement[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoadingData(true);
        const [categoriesData, profileData] = await Promise.all([
          jobCategories.getAllJobCategories(),
          users.getCurrentUser()
        ]);
        setJobCategoriesData(categoriesData || []);
        setUserProfile(profileData);
      } catch (error) {
        console.error('Error loading initial data:', error);
        showError('Failed to load application data');
      } finally {
        setLoadingData(false);
      }
    };
    loadData();
  }, []);

  // Load requirements when job category changes
  useEffect(() => {
    if (formData.jobCategory) {
      const loadRequirements = async () => {
        try {
          const reqData = await requirements.getJobCategoryRequirements(formData.jobCategory as Id<'jobCategory'>);
          setRequirementsByJobCategory(reqData || []);
        } catch (error) {
          console.error('Error loading requirements:', error);
          showError('Failed to load document requirements');
        }
      };
      loadRequirements();
    } else {
      setRequirementsByJobCategory([]);
    }
  }, [formData.jobCategory]);
  
  // Document upload hook (only initialize when we have a form ID)
  const documentUploadHook = useDocumentUpload(tempFormId as Id<"forms">);
  const {
    uploadFile,
    replaceFile,
    removeFile,
    retryUpload,
    getUploadState,
  } = tempFormId ? documentUploadHook : {
    uploadFile: () => Promise.reject(new Error('No form ID')),
    replaceFile: () => Promise.reject(new Error('No form ID')),
    removeFile: () => Promise.reject(new Error('No form ID')),
    retryUpload: () => Promise.reject(new Error('No form ID')),
    getUploadState: () => ({ uploading: false, progress: 0, error: null, success: false }),
  };

  // Use extracted validation logic
  const validateCurrentStep = useCallback((): boolean => {
    const { isValid, errors } = validateApplicationStep(
      formData, 
      currentStep, 
      requirementsByJobCategory?.requirements || [], 
      selectedDocuments, 
      getUploadState
    );
    setErrors(errors);
    return isValid;
  }, [formData, currentStep, selectedDocuments, requirementsByJobCategory, getUploadState]);

  const handleNext = async () => {
    if (validateCurrentStep()) {
      if (currentStep < STEP_TITLES.length - 1) {
        // If moving to upload documents step (step 3), create a temporary form
        if (currentStep === 2 && !tempFormId) {
          try {
            setLoading(true);
            const selectedCategory = jobCategoriesData?.find(cat => cat._id === formData.jobCategory);
            if (!selectedCategory) {
              throw new Error('Invalid job category selected');
            }

            const formId = await forms.createForm({
              applicationType: formData.applicationType,
              jobCategory: formData.jobCategory as Id<'jobCategory'>,
              position: formData.position,
              organization: formData.organization,
              civilStatus: formData.civilStatus,
            });
            
            setTempFormId(formId);
            setLoading(false);
          } catch (error) {
            console.error('Error creating temporary form:', error);
            Alert.alert('Error', 'Failed to create form. Please try again.');
            setLoading(false);
            return;
          }
        }

        setCurrentStep(currentStep + 1);
        renderStepIndicator();  // Ensure active step is indicated visually
      } else {
        handleSubmit();
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!validateCurrentStep()) return;
    
    if (!tempFormId) {
      Alert.alert('Error', 'Form not created. Please try again.');
      return;
    }
    
    setLoading(true);
    try {
      // Show payment method selection
      Alert.alert(
        'Payment Method',
        'Please select your payment method for the ₱60 application fee (₱50 + ₱10 service fee):',
        [
          {
            text: 'GCash',
            onPress: () => handlePaymentMethodSelected('Gcash'),
          },
          {
            text: 'Maya',
            onPress: () => handlePaymentMethodSelected('Maya'),
          },
          {
            text: 'Barangay Hall',
            onPress: () => handlePaymentMethodSelected('BaranggayHall'),
          },
          {
            text: 'City Hall',
            onPress: () => handlePaymentMethodSelected('CityHall'),
          },
          {
            text: 'Cancel',
            style: 'cancel',
          },
        ]
      );
    } catch (error) {
      console.error('Error submitting application:', error);
      Alert.alert('Error', 'Failed to submit application. Please try again.');
      setLoading(false);
    }
  };

  const handlePaymentMethodSelected = (paymentMethod: 'Gcash' | 'Maya' | 'BaranggayHall' | 'CityHall') => {
    // For digital payments, show reference number input
    if (paymentMethod === 'Gcash' || paymentMethod === 'Maya') {
      Alert.prompt(
        'Payment Reference',
        `Please enter your ${paymentMethod} reference number:`,
        async (referenceNumber) => {
          if (referenceNumber && referenceNumber.trim()) {
            await submitApplicationWithPayment(paymentMethod, referenceNumber.trim());
          } else {
            Alert.alert('Invalid Reference', 'Please provide a valid reference number.');
            setLoading(false);
          }
        }
      );
    } else {
      // For manual payments, just use a placeholder reference
      const referenceNumber = `MANUAL-${Date.now()}`;
      Alert.alert(
        'Manual Payment',
        `Please proceed to ${paymentMethod === 'BaranggayHall' ? 'Barangay Hall' : 'City Hall'} to complete your payment. Your reference number is: ${referenceNumber}`,
        [
          {
            text: 'OK',
            onPress: () => submitApplicationWithPayment(paymentMethod, referenceNumber),
          },
        ]
      );
    }
  };

  const submitApplicationWithPayment = async (
    paymentMethod: 'Gcash' | 'Maya' | 'BaranggayHall' | 'CityHall',
    referenceNumber: string
  ) => {
    try {
      const result = await forms.submitApplicationForm(
        tempFormId as Id<"forms">,
        paymentMethod,
        referenceNumber
      );

      if (result.success) {
        Alert.alert(
          'Application Submitted Successfully!',
          `Your application has been submitted with payment reference: ${referenceNumber}\n\nTotal Amount: ₱${result.totalAmount}\nPayment Method: ${result.paymentMethod}\n\n${result.requiresOrientation ? '📚 Note: Food safety orientation is required for your health card category.' : ''}\n\nYou will receive notifications about your application status.`,
          [
            {
              text: 'View Applications',
              onPress: () => router.push('/(tabs)/application'),
            },
          ]
        );
      } else {
        throw new Error('Submission failed');
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      Alert.alert(
        'Submission Error',
        error instanceof Error ? error.message : 'Failed to submit application. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Document upload helper functions
  const handleDocumentPicker = async (documentId: string) => {
    setSelectedDocumentId(documentId);
    setShowImagePicker(true);
  };

const pickFromCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Camera permission is required to take photos');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0 && selectedDocumentId) {
      handleDocumentSelected(result.assets[0], selectedDocumentId);
    }
    setShowImagePicker(false);
  };

const pickFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Gallery permission is required to select photos');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0 && selectedDocumentId) {
      handleDocumentSelected(result.assets[0], selectedDocumentId);
    }
    setShowImagePicker(false);
  };

  const pickDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['application/pdf', 'image/*'],
      copyToCacheDirectory: true,
    });

    if (!result.canceled && selectedDocumentId) {
      handleDocumentSelected(result.assets[0], selectedDocumentId);
    }
    setShowImagePicker(false);
  };

const handleDocumentSelected = async (file: any, documentId: string) => {
    if (!tempFormId) {
      Alert.alert('Error', 'Form not created yet. Please try again.');
      return;
    }

    if (!file || !file.uri) {
      console.error('Invalid file object:', file);
      Alert.alert('Error', 'Invalid file selected. Please try again.');
      return;
    }

    try {
      // Convert file to the format expected by the upload hook
      const fileBlob = await fetch(file.uri).then(response => {
        if (!response.ok) {
          throw new Error(`Failed to fetch file: ${response.status}`);
        }
        return response.blob();
      });
      
      // Fix file type detection
      let fileType = file.type || file.mimeType || 'image/jpeg';
      if (fileType === 'image') {
        fileType = 'image/jpeg'; // Default to JPEG for generic image type
      }
      
      const fileExtension = file.fileName?.split('.').pop()?.toLowerCase() || 
                           fileType.split('/')[1] || 'jpg';
      
      const fileName = file.fileName || file.name || `document_${documentId}.${fileExtension}`;
      
      const fileObject = new File([fileBlob], fileName, {
        type: fileType,
      });

      const isReplacing = selectedDocuments[documentId] && uploadedFiles[documentId];
      
      if (isReplacing) {
        // Replace existing file
        const result = await replaceFile(fileObject, documentId);
        setUploadedFiles(prev => ({
          ...prev,
          [documentId]: result.storageId,
        }));
      } else {
        // Upload new file
        const result = await uploadFile(fileObject, documentId);
        setUploadedFiles(prev => ({
          ...prev,
          [documentId]: result.storageId,
        }));
      }

      // Update selected documents for UI
      setSelectedDocuments(prev => ({
        ...prev,
        [documentId]: file,
      }));

      showSuccess('Document Uploaded', 'Your document has been uploaded successfully!');
    } catch (error) {
      console.error('Upload error details:', error);
      showError('Upload Failed', error instanceof Error ? error.message : 'Failed to upload document. Please try again.');
    }
  };

  const handleRemoveDocument = async (documentId: string) => {
    const storageId = uploadedFiles[documentId];
    if (!storageId) {
      // If no uploaded file, just remove from local state
      setSelectedDocuments(prev => {
        const newDocs = { ...prev };
        delete newDocs[documentId];
        return newDocs;
      });
      return;
    }

    Alert.alert(
      'Remove Document',
      'Are you sure you want to remove this document?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: async () => {
            try {
              await removeFile(documentId, storageId);
              
              // Remove from local state
              setSelectedDocuments(prev => {
                const newDocs = { ...prev };
                delete newDocs[documentId];
                return newDocs;
              });
              
              setUploadedFiles(prev => {
                const newFiles = { ...prev };
                delete newFiles[documentId];
                return newFiles;
              });
              
              showSuccess('Document Removed', 'Document has been removed successfully!');
            } catch (error) {
              console.error('Remove error:', error);
              showError('Remove Failed', 'Failed to remove document. Please try again.');
            }
          }
        },
      ]
    );
  };

  const renderStepIndicator = () => {
    return (
      <View style={styles.stepIndicator}>
        {STEP_TITLES.map((title, index) => (
          <View key={index} style={styles.stepItem}>
            <View style={[
              styles.stepCircle,
              index <= currentStep ? styles.stepCircleActive : styles.stepCircleInactive
            ]}>
              {index < currentStep ? (
                <Ionicons name="checkmark" size={16} color="#FFFFFF" />
              ) : (
                <Text style={[
                  styles.stepNumber,
                  index <= currentStep ? styles.stepNumberActive : styles.stepNumberInactive
                ]}>
                  {index + 1}
                </Text>
              )}
            </View>
            <Text style={[
              styles.stepTitle,
              index <= currentStep ? styles.stepTitleActive : styles.stepTitleInactive
            ]}>
              {title}
            </Text>
            {index < STEP_TITLES.length - 1 && (
              <View style={[
                styles.stepLine,
                index < currentStep ? styles.stepLineActive : styles.stepLineInactive
              ]} />
            )}
          </View>
        ))}
      </View>
    );
  };

  const renderApplicationTypeStep = () => {
    return (
      <View style={styles.stepContent}>
        <Text style={styles.stepHeading}>Select Application Type</Text>
        <Text style={styles.stepDescription}>
          Choose whether this is a new application or renewal of an existing health card.
        </Text>
        
        <View style={styles.radioGroup}>
          {(['New', 'Renew'] as ApplicationType[]).map((type) => (
            <TouchableOpacity
              key={type}
              style={styles.radioOption}
              onPress={() => setFormData({ ...formData, applicationType: type })}
            >
              <View style={[
                styles.radioCircle,
                formData.applicationType === type && styles.radioCircleSelected
              ]}>
                {formData.applicationType === type && (
                  <View style={styles.radioInner} />
                )}
              </View>
              <View style={styles.radioContent}>
                <Text style={styles.radioTitle}>{type} Application</Text>
                <Text style={styles.radioSubtitle}>
                  {type === 'New' 
                    ? 'Apply for a new health card' 
                    : 'Renew your existing health card'
                  }
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  const renderJobCategoryStep = () => {
    return (
      <View style={styles.stepContent}>
        <Text style={styles.stepHeading}>Select Job Category</Text>
        <Text style={styles.stepDescription}>
          Choose the category that best describes your job. Yellow for Food Handlers, Green for Non-Food Workers, and Pink for Skin-to-Skin Contact Jobs
        </Text>
        
        <View style={styles.categoryGrid}>
          {jobCategoriesData?.map((category, index) => (
            <TouchableOpacity
              key={category._id}
              style={[
                styles.categoryCard,
                formData.jobCategory === category._id && styles.categoryCardSelected,
                { borderColor: category.colorCode },
                // If it's the third item and there are 3 items total, center it
                jobCategories.length === 3 && index === 2 && styles.categoryCardCentered
              ]}
              onPress={() => setFormData({ ...formData, jobCategory: category._id })}
            >
              <View style={[
                styles.categoryIcon,
                { backgroundColor: category.colorCode + '20' }
              ]}>
                <Ionicons 
                  name={category.name.toLowerCase().includes('food') ? 'restaurant' : 'shield'} 
                  size={24} 
                  color={category.colorCode} 
                />
              </View>
              <Text style={styles.categoryName}>{category.name}</Text>
              {category.requireOrientation === 'Yes' && (
                <Text style={styles.categoryRequirement}>
                  Food Safety Orientation Required
                </Text>
              )}
              {formData.jobCategory === category._id && (
                <View style={styles.categorySelected}>
                  <Ionicons name="checkmark-circle" size={20} color={category.colorCode} />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
        
        {errors.jobCategory && (
          <Text style={styles.errorText}>{errors.jobCategory}</Text>
        )}
      </View>
    );
  };

  const renderPersonalDetailsStep = () => {
    return (
      <View style={styles.stepContent}>
        <Text style={styles.stepHeading}>Personal Details</Text>
        <Text style={styles.stepDescription}>
          Provide your job position, organization, and civil status.
        </Text>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Position/Job Title</Text>
          <CustomTextInput
            value={formData.position}
            onChangeText={(text) => setFormData({ ...formData, position: text })}
            placeholder="e.g., Food Server, Security Guard"
            style={styles.input}
          />
          {errors.position && (
            <Text style={styles.errorText}>{errors.position}</Text>
          )}
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Organization/Company</Text>
          <CustomTextInput
            value={formData.organization}
            onChangeText={(text) => setFormData({ ...formData, organization: text })}
            placeholder="e.g., ABC Restaurant, XYZ Security Agency"
            style={styles.input}
          />
          {errors.organization && (
            <Text style={styles.errorText}>{errors.organization}</Text>
          )}
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Civil Status</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.civilStatusContainer}>
            {CIVIL_STATUS_OPTIONS.map((status) => (
              <TouchableOpacity
                key={status}
                style={[
                  styles.civilStatusOption,
                  formData.civilStatus === status && styles.civilStatusOptionSelected
                ]}
                onPress={() => setFormData({ ...formData, civilStatus: status })}
              >
                <Text style={[
                  styles.civilStatusText,
                  formData.civilStatus === status && styles.civilStatusTextSelected
                ]}>
                  {status}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    );
  };

  const renderUploadDocumentsStep = () => {
    // Get document requirements from job category
    const documentRequirements = requirementsByJobCategory?.requirements || [];
    
    return (
      <View style={styles.stepContent}>
        <Text style={styles.stepHeading}>Upload Documents</Text>
        <Text style={styles.stepDescription}>
          Please upload clear and readable copies of all required medical documents
          to ensure proper processing of your {formData.applicationType?.toLowerCase()} application.
        </Text>
        
        {/* Instructions */}
        <View style={styles.formGroup}>
          <View style={styles.infoCard}>
            <Ionicons name="information-circle-outline" size={24} color={getColor('primary.500')} />
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Document Requirements</Text>
              <Text style={styles.infoText}>⚠️ Note: Documents must be from accredited clinics and laboratories. Accepted formats: JPG, PNG, PDF</Text>
            </View>
          </View>
        </View>
        
        {/* Document List */}
        <View style={styles.formGroupWithMargin}>
          {documentRequirements.map((document, index) => (
            <View key={document.fieldName || `doc-${index}`} style={styles.documentCard}>
              <View style={styles.documentHeader}>
                <View style={styles.documentInfo}>
                  <Text style={styles.documentTitle}>
                    {document.name}
                    {document.required && <Text style={styles.requiredAsterisk}> *</Text>}
                  </Text>
                  <Text style={styles.documentDescription}>{document.description}</Text>
                  <Text style={styles.documentFormats}>
                    Formats: {document.formats ? document.formats.join(', ').toUpperCase() : 'JPG, PNG, PDF'}
                  </Text>
                </View>
                <View style={styles.documentStatus}>
                  {selectedDocuments[document.fieldName] ? (
                    <Ionicons name="checkmark-circle" size={24} color={getColor('semantic.success')} />
                  ) : (
                    <Ionicons name="add-circle-outline" size={24} color={getColor('text.secondary')} />
                  )}
                </View>
              </View>

              {/* Upload Progress */}
              {getUploadState(document.fieldName)?.uploading && (
                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <View style={[
                      styles.progressFill,
                      { width: `${getUploadState(document.fieldName).progress}%` }
                    ]} />
                  </View>
                  <Text style={styles.progressText}>
                    {getUploadState(document.fieldName).progress}%
                  </Text>
                </View>
              )}

              {/* Error State */}
              {getUploadState(document.fieldName)?.error && (
                <View style={styles.errorContainer}>
                  <Ionicons name="alert-circle" size={16} color={getColor('semantic.error')} />
                  <Text style={styles.errorMessage}>
                    {getUploadState(document.fieldName).error}
                  </Text>
                  <TouchableOpacity
                    style={styles.retryButton}
                    onPress={() => selectedDocuments[document.fieldName] && retryUpload(selectedDocuments[document.fieldName], document.fieldName)}
                  >
                    <Text style={styles.retryButtonText}>Retry</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Document Preview */}
              {selectedDocuments[document.fieldName] && !getUploadState(document.fieldName)?.uploading && (
                <View style={styles.documentPreview}>
                  <Image
                    source={{ uri: selectedDocuments[document.fieldName].uri }}
                    style={styles.documentImage}
                  />
                  <TouchableOpacity 
                    style={styles.removeDocumentButton}
                    onPress={() => handleRemoveDocument(document.fieldName)}
                  >
                    <Ionicons name="close-circle" size={20} color={getColor('semantic.error')} />
                  </TouchableOpacity>
                </View>
              )}

              {/* Action Buttons */}
              <View style={styles.uploadButtonContainer}>
                <TouchableOpacity
                  style={styles.uploadButton}
                  onPress={() => handleDocumentPicker(document.fieldName)}
                  disabled={getUploadState(document.fieldName)?.uploading}
                >
                  <Ionicons 
                    name={selectedDocuments[document.fieldName] ? "refresh" : "cloud-upload-outline"} 
                    size={20} 
                    color={getColor('primary.500')} 
                  />
                  <Text style={styles.uploadButtonText}>
                    {selectedDocuments[document.fieldName] ? 'Replace' : 'Upload'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderReviewStep = () => {
    const selectedCategory = jobCategories?.find(cat => cat._id === formData.jobCategory);
    const documentRequirements = requirementsByJobCategory?.requirements || [];
    const uploadedDocuments = documentRequirements.filter(doc => selectedDocuments[doc.fieldName]);
    const missingDocuments = documentRequirements.filter(doc => doc.required && !selectedDocuments[doc.fieldName]);
    const documentsWithErrors = Object.keys(selectedDocuments).filter(docKey => getUploadState(docKey)?.error);
    
    return (
      <ScrollView style={styles.stepContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.stepHeading}>Review & Submit</Text>
        <Text style={styles.stepDescription}>
          Please review your application details and uploaded documents before submitting.
        </Text>
        
        {/* Application Details Section */}
        <View style={styles.reviewCard}>
          <View style={styles.reviewSection}>
            <View style={styles.reviewSectionHeader}>
              <Text style={styles.reviewSectionTitle}>Application Details</Text>
              <TouchableOpacity 
                style={styles.editButton}
                onPress={() => setCurrentStep(0)}
              >
                <Text style={styles.editButtonText}>Edit</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.reviewItem}>
              <Text style={styles.reviewLabel}>Type:</Text>
              <Text style={styles.reviewValue}>{formData.applicationType} Application</Text>
            </View>
            <View style={styles.reviewItem}>
              <Text style={styles.reviewLabel}>Job Category:</Text>
              <View style={styles.reviewItemWithIndicator}>
                <View style={[styles.categoryColorIndicator, { backgroundColor: selectedCategory?.colorCode || '#999' }]} />
                <Text style={styles.reviewValue}>{selectedCategory?.name}</Text>
              </View>
            </View>
            <View style={styles.reviewItem}>
              <Text style={styles.reviewLabel}>Position:</Text>
              <Text style={styles.reviewValue}>{formData.position}</Text>
            </View>
            <View style={styles.reviewItem}>
              <Text style={styles.reviewLabel}>Organization:</Text>
              <Text style={styles.reviewValue}>{formData.organization}</Text>
            </View>
            <View style={styles.reviewItem}>
              <Text style={styles.reviewLabel}>Civil Status:</Text>
              <Text style={styles.reviewValue}>{formData.civilStatus}</Text>
            </View>
          </View>
          
          {/* Document Summary Section */}
          <View style={styles.reviewSection}>
            <View style={styles.reviewSectionHeader}>
              <Text style={styles.reviewSectionTitle}>Document Summary</Text>
              <TouchableOpacity 
                style={styles.editButton}
                onPress={() => setCurrentStep(3)}
              >
                <Text style={styles.editButtonText}>Edit</Text>
              </TouchableOpacity>
            </View>
            
            {/* Document Status Overview */}
            <View style={styles.documentOverview}>
              <View style={styles.overviewItem}>
                <Text style={[styles.overviewNumber, styles.overviewNumberSuccess]}>{uploadedDocuments.length}</Text>
                <Text style={styles.overviewLabel}>Uploaded</Text>
              </View>
              <View style={styles.overviewItem}>
                <Text style={[styles.overviewNumber, styles.overviewNumberError]}>{missingDocuments.length}</Text>
                <Text style={styles.overviewLabel}>Missing</Text>
              </View>
              <View style={styles.overviewItem}>
                <Text style={[styles.overviewNumber, styles.overviewNumberWarning]}>{documentsWithErrors.length}</Text>
                <Text style={styles.overviewLabel}>Errors</Text>
              </View>
            </View>
            
            {/* Individual Document Status */}
            {documentRequirements.map((document, index) => {
              const isUploaded = selectedDocuments[document.fieldName];
              const hasError = getUploadState(document.fieldName)?.error;
              const isUploading = getUploadState(document.fieldName)?.uploading;
              
              return (
                <View key={document.fieldName || `review-doc-${index}`} style={styles.documentStatusItem}>
                  <View style={styles.documentStatusContent}>
                    <Text style={styles.documentStatusTitle}>
                      {document.name}
                      {document.required && <Text style={styles.requiredAsterisk}> *</Text>}
                    </Text>
                    {isUploaded && (
                      <Text style={styles.documentStatusFile}>
                        File: {selectedDocuments[document.fieldName].name || 'uploaded'}
                      </Text>
                    )}
                  </View>
                  
                  {isUploading ? (
                    <View style={styles.documentStatusIndicator}>
                      <Ionicons name="hourglass" size={20} color={getColor('semantic.warning')} />
                      <Text style={[styles.documentStatusText, { color: getColor('semantic.warning') }]}>Uploading...</Text>
                    </View>
                  ) : hasError ? (
                    <View style={styles.documentStatusIndicator}>
                      <Ionicons name="alert-circle" size={20} color={getColor('semantic.error')} />
                      <Text style={[styles.documentStatusText, { color: getColor('semantic.error') }]}>Error</Text>
                    </View>
                  ) : isUploaded ? (
                    <View style={styles.documentStatusIndicator}>
                      <Ionicons name="checkmark-circle" size={20} color={getColor('semantic.success')} />
                      <Text style={[styles.documentStatusText, { color: getColor('semantic.success') }]}>Uploaded</Text>
                    </View>
                  ) : (
                    <View style={styles.documentStatusIndicator}>
                      <Ionicons name="close-circle" size={20} color={getColor('semantic.error')} />
                      <Text style={[styles.documentStatusText, { color: getColor('semantic.error') }]}>Missing</Text>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
          
          {/* Application Fee Section */}
          <View style={styles.reviewSection}>
            <Text style={styles.reviewSectionTitle}>Application Fee</Text>
            <Text style={styles.feeNote}>
              As per eMediCard documentation: ₱10 transaction fee included for processing costs.
            </Text>
            <View style={styles.reviewItem}>
              <Text style={styles.reviewLabel}>Application Fee:</Text>
              <Text style={styles.reviewValue}>₱50.00</Text>
            </View>
            <View style={styles.reviewItem}>
              <Text style={styles.reviewLabel}>Transaction Fee:</Text>
              <Text style={styles.reviewValue}>₱10.00</Text>
            </View>
            <View style={styles.reviewItem}>
              <Text style={styles.reviewLabel}>Total Amount:</Text>
              <Text style={[styles.reviewValue, styles.totalAmount]}>₱60.00</Text>
            </View>
          </View>
          
          {/* Orientation Notice */}
          {selectedCategory?.requireOrientation === 'yes' && (
            <View style={styles.orientationNotice}>
              <Ionicons name="information-circle" size={20} color="#F18F01" />
              <Text style={styles.orientationText}>
                🟡 Yellow Card Requirement: Food handlers must attend mandatory food safety orientation 
                with a sanitary inspector as per eMediCard system requirements.
              </Text>
            </View>
          )}
          
          {/* Validation Warnings */}
          {(missingDocuments.length > 0 || documentsWithErrors.length > 0) && (
            <View style={styles.validationWarning}>
              <View style={styles.validationHeader}>
                <Ionicons name="warning" size={20} color={getColor('semantic.error')} />
                <Text style={styles.validationTitle}>Application Incomplete</Text>
              </View>
              
              {missingDocuments.length > 0 && (
                <Text style={styles.validationMessage}>Missing required documents: {missingDocuments.map(doc => doc.name).join(', ')}</Text>
              )}
              
              {documentsWithErrors.length > 0 && (
                <Text style={styles.validationMessage}>Please fix upload errors before submitting.</Text>
              )}
            </View>
          )}
          
          {/* Terms and Conditions */}
          <View style={styles.termsContainer}>
            <Text style={styles.termsTitle}>Terms & Conditions</Text>
            <Text style={styles.termsText}>By submitting this application, I confirm that all information provided is accurate and complete. I understand that false information may result in the rejection of my application or cancellation of my health card.</Text>
          </View>
        </View>
      </ScrollView>
    );
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return renderApplicationTypeStep();
      case 1:
        return renderJobCategoryStep();
      case 2:
        return renderPersonalDetailsStep();
      case 3:
        return renderUploadDocumentsStep();
      case 4:
        return renderReviewStep();
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
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#212529" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Application</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Step Indicator */}
      {renderStepIndicator()}

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
            paddingBottom: tabBarHeight + 20, // Dynamic space based on tab bar height
            flexGrow: 1 // Ensure content can expand
          }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.contentWrapper}>
            {renderCurrentStep()}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Navigation Buttons - Fixed at bottom */}
      <View style={[styles.navigationButtons, { bottom: Math.max(0, tabBarHeight - 20) }]}>
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
                backgroundColor: loading ? getColor('border.medium') : getColor('accent.medicalBlue'),
                opacity: loading ? 0.6 : 1,
              }
            ]}
            onPress={handleNext}
            disabled={loading}
          >
            <Text style={styles.nextButtonText}>
              {loading ? 'Loading...' : (currentStep === STEP_TITLES.length - 1 ? 'Submit Application' : 'Next')}
            </Text>
          </TouchableOpacity>
          
          {/* Original CustomButton (hidden for debugging) */}
          {false && (
            <CustomButton
              title={currentStep === STEP_TITLES.length - 1 ? 'Submit Application' : 'Next'}
              onPress={handleNext}
              loading={loading}
              style={[styles.nextButton, currentStep === 0 && styles.nextButtonFull]}
            />
          )}
        </View>
        
        {/* Image Picker Modal */}
        <Modal
          visible={showImagePicker}
          transparent
          animationType="slide"
          onRequestClose={() => setShowImagePicker(false)}
        >
          <View style={modalStyles.modalOverlay}>
            <View style={modalStyles.modalContainer}>
              <Text style={modalStyles.modalTitle}>Select Document Source</Text>
              
              <TouchableOpacity style={modalStyles.imagePickerOption} onPress={pickFromCamera}>
                <Ionicons name="camera" size={24} color={getColor('primary.500')} />
                <Text style={modalStyles.imagePickerOptionText}>Take Photo</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={modalStyles.imagePickerOption} onPress={pickFromGallery}>
                <Ionicons name="images" size={24} color={getColor('primary.500')} />
                <Text style={modalStyles.imagePickerOptionText}>Choose from Gallery</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={modalStyles.imagePickerOption} onPress={pickDocument}>
                <Ionicons name="document" size={24} color={getColor('primary.500')} />
                <Text style={modalStyles.imagePickerOptionText}>Select File</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={modalStyles.modalCancelButton}
                onPress={() => setShowImagePicker(false)}
              >
                <Text style={modalStyles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
        <FeedbackSystem messages={messages} onDismiss={dismissFeedback} />
    </View>
  );
}
