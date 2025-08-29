import { Id } from '../../convex/_generated/dataModel';
import { storage, setObject, getObject, removeItem, getAllKeys } from './storage';

export interface CachedDocument {
  id: string; // Unique identifier for cached document
  applicationId: string;
  fieldName: string; // e.g., 'validId', 'urinalysis', etc.
  fileName: string;
  fileType: string;
  fileSize: number;
  fileUri: string; // Local file URI
  base64Data: string; // Base64 encoded file data for storage
  uploadedAt: number;
  status: 'cached' | 'uploading' | 'uploaded' | 'failed';
  convexStorageId?: Id<"_storage">; // Set after successful upload to Convex
  error?: string | null; // Error message if upload failed
  retryCount: number;
}

export interface DocumentCacheState {
  [applicationId: string]: {
    [fieldName: string]: CachedDocument;
  };
}

const CACHE_KEY_PREFIX = 'cached_documents_';
const GLOBAL_CACHE_KEY = 'document_cache_state';

/**
 * Cache a document in MMKV before upload
 */
export const cacheDocument = async (
  applicationId: string,
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
      id: `${applicationId}_${fieldName}_${Date.now()}`,
      applicationId,
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
    const cacheKey = `${CACHE_KEY_PREFIX}${applicationId}_${fieldName}`;
    setObject(cacheKey, cachedDoc);

    // Update global state
    updateGlobalCacheState(applicationId, fieldName, cachedDoc);

    console.log(`📦 Document cached: ${fieldName} for application ${applicationId}`);
    return cachedDoc;
  } catch (error) {
    console.error('Failed to cache document:', error);
    throw new Error('Failed to cache document');
  }
};

/**
 * Get cached document by form and field name with enhanced error handling
 */
export const getCachedDocument = (
  formId: string,
  fieldName: string
): CachedDocument | null => {
  try {
    const cacheKey = `${CACHE_KEY_PREFIX}${formId}_${fieldName}`;
    const doc = getObject<CachedDocument>(cacheKey);
    
    // Validate document structure
    if (doc && (!doc.id || !doc.applicationId || !doc.fieldName)) {
      console.warn(`Invalid cached document structure for ${fieldName}, removing from cache`);
      removeItem(cacheKey);
      return null;
    }
    
    return doc;
  } catch (error) {
    console.error(`Error retrieving cached document ${fieldName}:`, error);
    return null;
  }
};

/**
 * Get all cached documents for a form with performance optimization
 */
export const getCachedDocumentsByForm = (formId: string): CachedDocument[] => {
  try {
    // Use direct key matching for better performance
    const allKeys = getAllKeys();
    const formKeys = allKeys.filter(key => 
      key.startsWith(CACHE_KEY_PREFIX) && key.includes(`${formId}_`)
    );
    
    const documents: CachedDocument[] = [];
    
    for (const key of formKeys) {
      const doc = getObject<CachedDocument>(key);
      if (doc && doc.applicationId === formId) {
        // Validate document integrity
        if (doc.id && doc.fieldName && doc.status) {
          documents.push(doc);
        } else {
          // Clean up corrupted documents
          console.warn(`Removing corrupted document cache: ${key}`);
          removeItem(key);
        }
      }
    }
    
    return documents.sort((a, b) => b.uploadedAt - a.uploadedAt);
  } catch (error) {
    console.error(`Error retrieving cached documents for form ${formId}:`, error);
    return [];
  }
};

/**
 * Update cached document status with atomic operations and validation
 */
export const updateCachedDocumentStatus = (
  formId: string,
  fieldName: string,
  updates: Partial<Pick<CachedDocument, 'status' | 'convexStorageId' | 'error' | 'retryCount'>>
): boolean => {
  try {
    const cacheKey = `${CACHE_KEY_PREFIX}${formId}_${fieldName}`;
    const cachedDoc = getObject<CachedDocument>(cacheKey);
    
    if (!cachedDoc) {
      console.warn(`No cached document found for ${fieldName} in form ${formId}`);
      return false;
    }

    // Validate updates
    if (updates.status && !['cached', 'uploading', 'uploaded', 'failed'].includes(updates.status)) {
      console.error(`Invalid status update: ${updates.status}`);
      return false;
    }

    const updatedDoc: CachedDocument = {
      ...cachedDoc,
      ...updates,
      // Always update timestamp on status change
      uploadedAt: updates.status ? Date.now() : cachedDoc.uploadedAt
    };
    
    setObject(cacheKey, updatedDoc);
    
    // Update global state with better error handling
    try {
      updateGlobalCacheState(formId, fieldName, updatedDoc);
    } catch (globalStateError) {
      console.warn('Failed to update global cache state, but document was cached:', globalStateError);
    }
    
    console.log(`📝 Updated cached document status: ${fieldName} -> ${updates.status}`);
    return true;
  } catch (error) {
    console.error(`Error updating cached document status for ${fieldName}:`, error);
    return false;
  }
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
    if (formCache) {
      Object.keys(formCache).forEach(fieldName => {
        const doc = formCache[fieldName];
        if (doc && doc.uploadedAt < sevenDaysAgo) {
          removeCachedDocument(formId, fieldName);
          cleanedCount++;
        }
      });
    }
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
    if (formCache) {
      const formDocCount = Object.keys(formCache).length;
      stats.byForm[formId] = formDocCount;
      
      Object.values(formCache).forEach(doc => {
        if (doc) {
          stats.totalDocuments++;
          stats.totalSize += doc.fileSize;
          stats.byStatus[doc.status]++;
        }
      });
    }
  });
  
  return stats;
};

// ====== ENHANCED CACHE MANAGEMENT (2024 BEST PRACTICES) ======

/**
 * Reactive cache listener for real-time updates
 * Based on MMKV 2024 patterns
 */
export interface CacheListener {
  onDocumentCached: (formId: string, fieldName: string, doc: CachedDocument) => void;
  onDocumentUpdated: (formId: string, fieldName: string, doc: CachedDocument) => void;
  onDocumentRemoved: (formId: string, fieldName: string) => void;
}

const cacheListeners = new Set<CacheListener>();

/**
 * Add cache listener for reactive updates
 */
export const addCacheListener = (listener: CacheListener): () => void => {
  cacheListeners.add(listener);
  
  // Return cleanup function
  return () => {
    cacheListeners.delete(listener);
  };
};

/**
 * Notify all listeners of cache changes
 */
const notifyListeners = (
  type: keyof CacheListener,
  formId: string,
  fieldName: string,
  doc?: CachedDocument
) => {
  cacheListeners.forEach(listener => {
    try {
      if (type === 'onDocumentRemoved') {
        listener.onDocumentRemoved(formId, fieldName);
      } else if (doc) {
        listener[type](formId, fieldName, doc);
      }
    } catch (error) {
      console.error('Error in cache listener:', error);
    }
  });
};

/**
 * Enhanced cache document with reactive notifications
 */
export const cacheDocumentReactive = async (
  applicationId: string,
  fieldName: string,
  file: {
    uri: string;
    name: string;
    type: string;
    size: number;
  }
): Promise<CachedDocument> => {
  const doc = await cacheDocument(applicationId, fieldName, file);
  
  // Notify listeners
  notifyListeners('onDocumentCached', applicationId, fieldName, doc);
  
  return doc;
};

/**
 * Enhanced update with reactive notifications
 */
export const updateCachedDocumentStatusReactive = (
  formId: string,
  fieldName: string,
  updates: Partial<Pick<CachedDocument, 'status' | 'convexStorageId' | 'error' | 'retryCount'>>
): boolean => {
  const success = updateCachedDocumentStatus(formId, fieldName, updates);
  
  if (success) {
    const updatedDoc = getCachedDocument(formId, fieldName);
    if (updatedDoc) {
      notifyListeners('onDocumentUpdated', formId, fieldName, updatedDoc);
    }
  }
  
  return success;
};

/**
 * Enhanced remove with reactive notifications
 */
export const removeCachedDocumentReactive = (formId: string, fieldName: string): void => {
  removeCachedDocument(formId, fieldName);
  notifyListeners('onDocumentRemoved', formId, fieldName);
};

/**
 * Batch operations for better performance
 */
export const batchUpdateDocumentStatus = (
  updates: Array<{
    formId: string;
    fieldName: string;
    updates: Partial<Pick<CachedDocument, 'status' | 'convexStorageId' | 'error' | 'retryCount'>>;
  }>
): { success: number; failed: number } => {
  let success = 0;
  let failed = 0;
  
  updates.forEach(({ formId, fieldName, updates: docUpdates }) => {
    if (updateCachedDocumentStatusReactive(formId, fieldName, docUpdates)) {
      success++;
    } else {
      failed++;
    }
  });
  
  console.log(`Batch update completed: ${success} success, ${failed} failed`);
  return { success, failed };
};

/**
 * Smart cache cleanup with size-based optimization
 */
export const smartCacheCleanup = (): {
  removedCount: number;
  freedSize: number;
} => {
  const stats = getCacheStats();
  let removedCount = 0;
  let freedSize = 0;
  
  // Clean up failed uploads older than 24 hours
  const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
  
  Object.keys(getGlobalCacheState()).forEach(formId => {
    const docs = getCachedDocumentsByForm(formId);
    
    docs.forEach(doc => {
      const shouldRemove = 
        (doc.status === 'failed' && doc.uploadedAt < oneDayAgo) ||
        (doc.status === 'uploaded' && doc.uploadedAt < (Date.now() - (7 * 24 * 60 * 60 * 1000)));
      
      if (shouldRemove) {
        freedSize += doc.fileSize;
        removeCachedDocumentReactive(formId, doc.fieldName);
        removedCount++;
      }
    });
  });
  
  console.log(`Smart cleanup: removed ${removedCount} documents, freed ${freedSize} bytes`);
  return { removedCount, freedSize };
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
      if (base64) {
        resolve(base64);
      } else {
        reject(new Error('Failed to convert blob to base64'));
      }
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
