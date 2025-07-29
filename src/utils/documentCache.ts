import { Id } from '../../convex/_generated/dataModel';
import { storage, setObject, getObject, removeItem, getAllKeys } from './storage';

export interface CachedDocument {
  id: string; // Unique identifier for cached document
  formId: string;
  fieldName: string; // e.g., 'validId', 'urinalysis', etc.
  fileName: string;
  fileType: string;
  fileSize: number;
  fileUri: string; // Local file URI
  base64Data: string; // Base64 encoded file data for storage
  uploadedAt: number;
  status: 'cached' | 'uploading' | 'uploaded' | 'failed';
  convexStorageId?: Id<"_storage">; // Set after successful upload to Convex
  error?: string; // Error message if upload failed
  retryCount: number;
}

export interface DocumentCacheState {
  [formId: string]: {
    [fieldName: string]: CachedDocument;
  };
}

const CACHE_KEY_PREFIX = 'cached_documents_';
const GLOBAL_CACHE_KEY = 'document_cache_state';

/**
 * Cache a document in MMKV before upload
 */
export const cacheDocument = async (
  formId: string,
  fieldName: string,
  file: {
    uri: string;
    name: string;
    type: string;
    size: number;
  }
): Promise<CachedDocument> => {
  try {
    // Convert file to base64 for storage
    const response = await fetch(file.uri);
    const blob = await response.blob();
    const base64Data = await blobToBase64(blob);

    const cachedDoc: CachedDocument = {
      id: `${formId}_${fieldName}_${Date.now()}`,
      formId,
      fieldName,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      fileUri: file.uri,
      base64Data,
      uploadedAt: Date.now(),
      status: 'cached',
      retryCount: 0,
    };

    // Store in MMKV
    const cacheKey = `${CACHE_KEY_PREFIX}${formId}_${fieldName}`;
    setObject(cacheKey, cachedDoc);

    // Update global state
    updateGlobalCacheState(formId, fieldName, cachedDoc);

    console.log(`📦 Document cached: ${fieldName} for form ${formId}`);
    return cachedDoc;
  } catch (error) {
    console.error('Failed to cache document:', error);
    throw new Error('Failed to cache document');
  }
};

/**
 * Get cached document by form and field name
 */
export const getCachedDocument = (
  formId: string,
  fieldName: string
): CachedDocument | null => {
  const cacheKey = `${CACHE_KEY_PREFIX}${formId}_${fieldName}`;
  return getObject<CachedDocument>(cacheKey);
};

/**
 * Get all cached documents for a form
 */
export const getCachedDocumentsByForm = (formId: string): CachedDocument[] => {
  const state = getGlobalCacheState();
  const formCache = state[formId];
  
  if (!formCache) return [];
  
  return Object.values(formCache);
};

/**
 * Update cached document status
 */
export const updateCachedDocumentStatus = (
  formId: string,
  fieldName: string,
  updates: Partial<Pick<CachedDocument, 'status' | 'convexStorageId' | 'error' | 'retryCount'>>
): void => {
  const cacheKey = `${CACHE_KEY_PREFIX}${formId}_${fieldName}`;
  const cachedDoc = getObject<CachedDocument>(cacheKey);
  
  if (!cachedDoc) {
    console.warn(`No cached document found for ${fieldName} in form ${formId}`);
    return;
  }

  const updatedDoc = { ...cachedDoc, ...updates };
  setObject(cacheKey, updatedDoc);
  
  // Update global state
  updateGlobalCacheState(formId, fieldName, updatedDoc);
  
  console.log(`📝 Updated cached document status: ${fieldName} -> ${updates.status}`);
};

/**
 * Remove cached document after successful upload
 */
export const removeCachedDocument = (formId: string, fieldName: string): void => {
  const cacheKey = `${CACHE_KEY_PREFIX}${formId}_${fieldName}`;
  removeItem(cacheKey);
  
  // Update global state
  const state = getGlobalCacheState();
  if (state[formId] && state[formId][fieldName]) {
    delete state[formId][fieldName];
    
    // Remove form if no documents left
    if (Object.keys(state[formId]).length === 0) {
      delete state[formId];
    }
    
    setObject(GLOBAL_CACHE_KEY, state);
  }
  
  console.log(`🗑️ Removed cached document: ${fieldName} from form ${formId}`);
};

/**
 * Clear all cached documents for a form (after successful submission)
 */
export const clearFormCache = (formId: string): void => {
  const state = getGlobalCacheState();
  const formCache = state[formId];
  
  if (!formCache) return;
  
  // Remove individual cache entries
  Object.keys(formCache).forEach(fieldName => {
    const cacheKey = `${CACHE_KEY_PREFIX}${formId}_${fieldName}`;
    removeItem(cacheKey);
  });
  
  // Update global state
  delete state[formId];
  setObject(GLOBAL_CACHE_KEY, state);
  
  console.log(`🧹 Cleared all cached documents for form ${formId}`);
};

/**
 * Get all cached documents across all forms (for debugging)
 */
export const getAllCachedDocuments = (): DocumentCacheState => {
  return getGlobalCacheState();
};

/**
 * Get cached documents that failed to upload for retry
 */
export const getFailedDocuments = (): CachedDocument[] => {
  const state = getGlobalCacheState();
  const failedDocs: CachedDocument[] = [];
  
  Object.values(state).forEach(formCache => {
    Object.values(formCache).forEach(doc => {
      if (doc.status === 'failed') {
        failedDocs.push(doc);
      }
    });
  });
  
  return failedDocs;
};

/**
 * Clean up old cached documents (older than 7 days)
 */
export const cleanupOldCache = (): void => {
  const state = getGlobalCacheState();
  const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
  let cleanedCount = 0;
  
  Object.keys(state).forEach(formId => {
    const formCache = state[formId];
    Object.keys(formCache).forEach(fieldName => {
      const doc = formCache[fieldName];
      if (doc.uploadedAt < sevenDaysAgo) {
        removeCachedDocument(formId, fieldName);
        cleanedCount++;
      }
    });
  });
  
  if (cleanedCount > 0) {
    console.log(`🧹 Cleaned up ${cleanedCount} old cached documents`);
  }
};

/**
 * Get cache statistics
 */
export const getCacheStats = (): {
  totalDocuments: number;
  totalSize: number;
  byStatus: Record<CachedDocument['status'], number>;
  byForm: Record<string, number>;
} => {
  const state = getGlobalCacheState();
  const stats = {
    totalDocuments: 0,
    totalSize: 0,
    byStatus: { cached: 0, uploading: 0, uploaded: 0, failed: 0 },
    byForm: {} as Record<string, number>,
  };
  
  Object.keys(state).forEach(formId => {
    const formCache = state[formId];
    const formDocCount = Object.keys(formCache).length;
    stats.byForm[formId] = formDocCount;
    
    Object.values(formCache).forEach(doc => {
      stats.totalDocuments++;
      stats.totalSize += doc.fileSize;
      stats.byStatus[doc.status]++;
    });
  });
  
  return stats;
};

// Helper functions

/**
 * Convert blob to base64 string
 */
const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      // Remove data URL prefix (e.g., "data:image/jpeg;base64,")
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

/**
 * Convert base64 string back to blob
 */
export const base64ToBlob = (base64: string, mimeType: string): Blob => {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
};

/**
 * Get global cache state
 */
const getGlobalCacheState = (): DocumentCacheState => {
  return getObject<DocumentCacheState>(GLOBAL_CACHE_KEY) || {};
};

/**
 * Update global cache state
 */
const updateGlobalCacheState = (
  formId: string,
  fieldName: string,
  document: CachedDocument
): void => {
  const state = getGlobalCacheState();
  
  if (!state[formId]) {
    state[formId] = {};
  }
  
  state[formId][fieldName] = document;
  setObject(GLOBAL_CACHE_KEY, state);
};
