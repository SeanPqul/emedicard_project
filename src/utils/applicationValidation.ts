import { Alert } from 'react-native';

export type ApplicationType = 'New' | 'Renew';
export type CivilStatus = 'Single' | 'Married' | 'Divorced' | 'Widowed';

export interface FormData {
  applicationType: ApplicationType;
  jobCategory: string;
  position: string;
  organization: string;
  civilStatus: CivilStatus;
}

/**
 * Validates the current step of the application form
 * @param formData - The form data to validate
 * @param currentStep - The current step being validated
 * @param documentRequirements - Document requirements for the job category
 * @param selectedDocuments - Currently selected documents
 * @param getUploadState - Function to get upload state of documents
 * @returns Object containing validation result and errors
 */
export const validateApplicationStep = (
  formData: FormData,
  currentStep: number,
  documentRequirements: any[] = [],
  selectedDocuments: Record<string, any> = {},
  getUploadState?: (docKey: string) => { uploading?: boolean; error?: string | null }
): { isValid: boolean; errors: Partial<FormData> } => {
  const newErrors: Partial<FormData> = {};
  
  switch (currentStep) {
    case 0:
      // Application type is always valid (radio button)
      break;
      
    case 1:
      if (!formData.jobCategory) {
        newErrors.jobCategory = 'Please select a job category';
      }
      break;
      
    case 2:
      if (!formData.position.trim()) {
        newErrors.position = 'Position is required';
      }
      if (!formData.organization.trim()) {
        newErrors.organization = 'Organization is required';
      }
      break;
      
    case 3:
      // Upload Documents step - validate required documents
      const requiredDocuments = documentRequirements.filter(doc => doc.required);
      const missingDocuments = requiredDocuments.filter(doc => !selectedDocuments[doc.fieldName]);
      
      if (missingDocuments.length > 0) {
        Alert.alert(
          'Missing Required Documents',
          `Please upload the following required documents: ${missingDocuments.map(doc => doc.name).join(', ')}`,
          [{ text: 'OK' }]
        );
        return { isValid: false, errors: newErrors };
      }
      
      // Check for any upload errors
      if (getUploadState) {
        const documentsWithErrors = Object.keys(selectedDocuments).filter(docKey => 
          getUploadState(docKey)?.error
        );
        
        if (documentsWithErrors.length > 0) {
          Alert.alert(
            'Upload Errors',
            'Please fix the upload errors before proceeding.',
            [{ text: 'OK' }]
          );
          return { isValid: false, errors: newErrors };
        }
      }
      break;
      
    case 4:
      // Review step - comprehensive validation before submission
      const docRequirements = documentRequirements || [];
      const requiredDocs = docRequirements.filter(doc => doc.required);
      const missingDocs = requiredDocs.filter(doc => !selectedDocuments[doc.fieldName]);
      
      if (getUploadState) {
        const docsWithErrors = Object.keys(selectedDocuments).filter(docKey => getUploadState(docKey)?.error);
        const uploading = Object.keys(selectedDocuments).some(docKey => getUploadState(docKey)?.uploading);
        
        if (missingDocs.length > 0) {
          Alert.alert(
            'Missing Required Documents',
            `Please upload the following required documents: ${missingDocs.map(doc => doc.name).join(', ')}`,
            [{ text: 'OK' }]
          );
          return { isValid: false, errors: newErrors };
        }
        
        if (docsWithErrors.length > 0) {
          Alert.alert(
            'Upload Errors',
            'Please fix the upload errors before submitting.',
            [{ text: 'OK' }]
          );
          return { isValid: false, errors: newErrors };
        }
        
        if (uploading) {
          Alert.alert(
            'Upload in Progress',
            'Please wait for all documents to finish uploading before submitting.',
            [{ text: 'OK' }]
          );
          return { isValid: false, errors: newErrors };
        }
      }
      
      // Validate all previous steps data
      if (!formData.jobCategory || !formData.position.trim() || !formData.organization.trim()) {
        Alert.alert(
          'Incomplete Application',
          'Please ensure all required fields are completed.',
          [{ text: 'OK' }]
        );
        return { isValid: false, errors: newErrors };
      }
      break;
  }
  
  return { isValid: Object.keys(newErrors).length === 0, errors: newErrors };
};

/**
 * Validates form data completeness
 */
export const validateFormData = (formData: FormData): boolean => {
  return !!(
    formData.applicationType &&
    formData.jobCategory &&
    formData.position.trim() &&
    formData.organization.trim() &&
    formData.civilStatus
  );
};
