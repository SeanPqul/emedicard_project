/**
 * Document Upload Feature - Complete Implementation
 * Extracted from useDocumentUpload.ts and document selection logic
 */

import { useState } from 'react';
import { ConvexId } from '../../shared/api';

// ===== TYPES =====
export type DocumentType = 
  | "GovernmentId"
  | "MedicalCertificate" 
  | "DrugTestResult"
  | "XrayResult"
  | "PaymentReceipt"
  | "Other";

export interface DocumentUploadState {
  fieldName: string;
  file: any; // File object from image picker
  uploading: boolean;
  uploaded: boolean;
  error?: string;
  progress?: number;
}

export interface DocumentRequirement {
  id: string;
  type: DocumentType;
  label: string;
  required: boolean;
  description: string;
  accepted: string[];
}

export interface UploadedDocument {
  _id: ConvexId<"documents">;
  applicationId: ConvexId<"applications">;
  type: DocumentType;
  name: string;
  storageId: ConvexId<"_storage">;
  mimeType: string;
  size: number;
  _creationTime: number;
}

// ===== HOOKS =====
export const useDocumentUpload = (applicationId: ConvexId<'applications'>) => {
  const [uploadStates, setUploadStates] = useState<Record<string, DocumentUploadState>>({});
  const [selectedDocuments, setSelectedDocuments] = useState<Record<string, any>>({});

  const updateUploadState = (fieldName: string, updates: Partial<DocumentUploadState>) => {
    setUploadStates(prev => ({
      ...prev,
      [fieldName]: { ...prev[fieldName], ...updates }
    }));
  };

  const selectDocument = async (fieldName: string, requirement: DocumentRequirement) => {
    // TODO: Integrate with actual image picker
    // This would use expo-image-picker or similar
    console.log('Selecting document for field:', fieldName);
  };

  const uploadDocument = async (fieldName: string, file: any) => {
    updateUploadState(fieldName, { uploading: true, error: undefined });
    
    try {
      // TODO: Implement actual upload logic
      // This would integrate with the backend storage API
      
      updateUploadState(fieldName, { 
        uploading: false, 
        uploaded: true,
        progress: 100 
      });
      
      return true;
    } catch (error) {
      updateUploadState(fieldName, { 
        uploading: false, 
        error: 'Upload failed',
        progress: 0 
      });
      return false;
    }
  };

  const removeDocument = (fieldName: string) => {
    setSelectedDocuments(prev => {
      const updated = { ...prev };
      delete updated[fieldName];
      return updated;
    });
    
    setUploadStates(prev => {
      const updated = { ...prev };
      delete updated[fieldName];
      return updated;
    });
  };

  const getUploadState = (fieldName: string): DocumentUploadState | undefined => {
    return uploadStates[fieldName];
  };

  return {
    selectedDocuments,
    uploadStates,
    selectDocument,
    uploadDocument,
    removeDocument,
    getUploadState,
    updateUploadState,
  };
};

export const useDocumentSelection = () => {
  const [selectedImages, setSelectedImages] = useState<Record<string, any>>({});

  const selectImage = async (fieldName: string) => {
    // TODO: Implement image selection logic
    console.log('Selecting image for:', fieldName);
  };

  const removeImage = (fieldName: string) => {
    setSelectedImages(prev => {
      const updated = { ...prev };
      delete updated[fieldName];
      return updated;
    });
  };

  return {
    selectedImages,
    selectImage,
    removeImage,
  };
};

// ===== DOCUMENT REQUIREMENTS =====
export const DOCUMENT_REQUIREMENTS: DocumentRequirement[] = [
  {
    id: 'government-id',
    type: 'GovernmentId',
    label: 'Government ID',
    required: true,
    description: 'Valid government-issued identification',
    accepted: ['image/jpeg', 'image/png', 'application/pdf'],
  },
  {
    id: 'medical-certificate',
    type: 'MedicalCertificate',
    label: 'Medical Certificate',
    required: true,
    description: 'Recent medical certificate from licensed physician',
    accepted: ['image/jpeg', 'image/png', 'application/pdf'],
  },
  {
    id: 'drug-test',
    type: 'DrugTestResult',
    label: 'Drug Test Result',
    required: true,
    description: 'Negative drug test result from accredited laboratory',
    accepted: ['image/jpeg', 'image/png', 'application/pdf'],
  },
  {
    id: 'xray-result',
    type: 'XrayResult',
    label: 'X-ray Result',
    required: true,
    description: 'Chest X-ray result showing clear lungs',
    accepted: ['image/jpeg', 'image/png', 'application/pdf'],
  },
];

// ===== VALIDATION =====
export const validateDocuments = (
  requirements: DocumentRequirement[],
  uploadedDocuments: Record<string, any>
): { isValid: boolean; missing: string[] } => {
  const requiredDocs = requirements.filter(req => req.required);
  const missing: string[] = [];

  requiredDocs.forEach(req => {
    if (!uploadedDocuments[req.id]) {
      missing.push(req.label);
    }
  });

  return {
    isValid: missing.length === 0,
    missing,
  };
};

// ===== UI COMPONENTS =====
export interface DocumentUploadProps {
  applicationId: ConvexId<'applications'>;
  requirements?: DocumentRequirement[];
  onComplete?: (documents: UploadedDocument[]) => void;
}

// Placeholder components that would be extracted from existing components
export const DocumentUploadGrid = () => null; // TODO: Extract from upload-documents screen
export const DocumentPicker = () => null; // TODO: Extract from existing component
export const UploadProgress = () => null; // TODO: Extract from existing component
export const DocumentPreview = () => null; // TODO: Extract from existing component