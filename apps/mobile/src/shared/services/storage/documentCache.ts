import { Id } from 'backend/convex/_generated/dataModel';
import { setObject, getObject, removeItem, getAllKeys } from './storage';

export interface CachedDocument {
  id: string; // Unique identifier for cached document
  applicationId: string;
  fieldName: string; // e.g., 'validId', 'urinalysis', etc.
  fileName: string;
  fileType: string;
  fileSize: number;
  fileUri: string; // Local file URI - this is our file reference
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
const TEMP_UPLOAD_QUEUE_KEY = 'temp_upload_queue';

// Memory management thresholds specific to document cache
export const DOCUMENT_MEMORY_LIMITS = {
  MAX_CACHED_DOCUMENTS: 50, // Maximum number of documents to cache
  MAX_CACHE_SIZE: 100 * 1024 * 1024, // 100MB max cache size
  BULK_UPLOAD_LIMIT: 10, // Maximum documents in a single bulk upload
  CLEANUP_INTERVAL: 5 * 60 * 1000, // 5 minutes cleanup interval
} as const;

/**
 * Cache a document in MMKV before upload (stores file reference only, not base64)
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
    const cachedDoc: CachedDocument = {
      id: `${applicationId}_${fieldName}_${Date.now()}`,
      applicationId,
      fieldName,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      fileUri: file.uri, // Just store the URI reference, not base64 data
      uploadedAt: Date.now(),
      status: 'cached',
      retryCount: 0,
    };

    // Store in MMKV
    const cacheKey = `${CACHE_KEY_PREFIX}${applicationId}_${fieldName}`;
    setObject(cacheKey, cachedDoc);

    // Update global state
    updateGlobalCacheState(applicationId, fieldName, cachedDoc);

    console.log(`?? Document cached: ${fieldName} for application ${applicationId} (file reference only)`);
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
    
    console.log(`?? Updated cached document status: ${fieldName} -> ${updates.status}`);
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
  
  console.log(`??? Removed cached document: ${fieldName} from form ${formId}`);
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
  
  console.log(`?? Cleared all cached documents for form ${formId}`);
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
    console.log(`?? Cleaned up ${cleanedCount} old cached documents`);
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
  updates: {
    formId: string;
    fieldName: string;
    updates: Partial<Pick<CachedDocument, 'status' | 'convexStorageId' | 'error' | 'retryCount'>>;
  }[]
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
 * Smart cache cleanup with size-based optimization and file accessibility check
 */
export const smartCacheCleanup = async (): Promise<{
  removedCount: number;
  freedSize: number;
  inaccessibleFiles: number;
}> => {
  let removedCount = 0;
  let freedSize = 0;
  let inaccessibleFiles = 0;
  
  // Clean up failed uploads older than 24 hours
  const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
  
  const state = getGlobalCacheState();
  
  for (const formId of Object.keys(state)) {
    const docs = getCachedDocumentsByForm(formId);
    
    for (const doc of docs) {
      let shouldRemove = false;
      
      // Check time-based cleanup conditions
      if (doc.status === 'failed' && doc.uploadedAt < oneDayAgo) {
        shouldRemove = true;
      } else if (doc.status === 'uploaded' && doc.uploadedAt < (Date.now() - (7 * 24 * 60 * 60 * 1000))) {
        shouldRemove = true;
      }
      
      // Check file accessibility for non-uploaded files
      if (!shouldRemove && doc.status !== 'uploaded') {
        const isAccessible = await checkFileAccessibility(doc.fileUri);
        if (!isAccessible) {
          shouldRemove = true;
          inaccessibleFiles++;
        }
      }
      
      if (shouldRemove) {
        freedSize += doc.fileSize;
        removeCachedDocumentReactive(formId, doc.fieldName);
        removedCount++;
      }
    }
  }
  
  console.log(`Smart cleanup: removed ${removedCount} documents, freed ${freedSize} bytes, ${inaccessibleFiles} inaccessible files`);
  return { removedCount, freedSize, inaccessibleFiles };
};

// Helper functions

/**
 * Helper function to check if a file URI is still accessible
 */
export const checkFileAccessibility = async (fileUri: string): Promise<boolean> => {
  try {
    const response = await fetch(fileUri);
    return response.ok;
  } catch {
    console.warn(`File URI no longer accessible: ${fileUri}`);
    return false;
  }
};

/**
 * TEMP_UPLOAD_QUEUE management functions
 */

interface UploadQueueItem {
  applicationId: string;
  fieldName: string;
  priority: number; // Higher number = higher priority
  queuedAt: number;
}

/**
 * Add documents to the temp upload queue
 */
export const addToUploadQueue = (items: Omit<UploadQueueItem, 'queuedAt'>[]): void => {
  const queue = getObject<UploadQueueItem[]>(TEMP_UPLOAD_QUEUE_KEY) || [];
  
  const newItems = items.map(item => ({
    ...item,
    queuedAt: Date.now(),
  }));
  
  queue.push(...newItems);
  
  // Sort by priority (higher first) then by queued time (older first)
  queue.sort((a, b) => {
    if (a.priority !== b.priority) return b.priority - a.priority;
    return a.queuedAt - b.queuedAt;
  });
  
  setObject(TEMP_UPLOAD_QUEUE_KEY, queue);
  console.log(`Added ${newItems.length} items to upload queue`);
};

/**
 * Get next batch of documents from upload queue
 */
export const getNextUploadBatch = (batchSize: number = DOCUMENT_MEMORY_LIMITS.BULK_UPLOAD_LIMIT): UploadQueueItem[] => {
  const queue = getObject<UploadQueueItem[]>(TEMP_UPLOAD_QUEUE_KEY) || [];
  
  if (queue.length === 0) return [];
  
  const batch = queue.splice(0, Math.min(batchSize, queue.length));
  setObject(TEMP_UPLOAD_QUEUE_KEY, queue);
  
  console.log(`Retrieved batch of ${batch.length} items from upload queue`);
  return batch;
};

/**
 * Remove specific items from upload queue
 */
export const removeFromUploadQueue = (items: { applicationId: string; fieldName: string }[]): void => {
  const queue = getObject<UploadQueueItem[]>(TEMP_UPLOAD_QUEUE_KEY) || [];
  
  const updatedQueue = queue.filter(queueItem => {
    return !items.some(item => 
      queueItem.applicationId === item.applicationId && 
      queueItem.fieldName === item.fieldName
    );
  });
  
  setObject(TEMP_UPLOAD_QUEUE_KEY, updatedQueue);
  console.log(`Removed ${queue.length - updatedQueue.length} items from upload queue`);
};

/**
 * Clear the entire upload queue
 */
export const clearUploadQueue = (): void => {
  removeItem(TEMP_UPLOAD_QUEUE_KEY);
  console.log('Upload queue cleared');
};

/**
 * Get upload queue statistics
 */
export const getUploadQueueStats = (): {
  totalItems: number;
  priorityDistribution: Record<number, number>;
  oldestItem: number | undefined;
  averageWaitTime: number;
} => {
  const queue = getObject<UploadQueueItem[]>(TEMP_UPLOAD_QUEUE_KEY) || [];
  const now = Date.now();
  
  const priorityDistribution: Record<number, number> = {};
  let totalWaitTime = 0;
  let oldestItem: number | undefined;
  
  queue.forEach(item => {
    priorityDistribution[item.priority] = (priorityDistribution[item.priority] || 0) + 1;
    totalWaitTime += (now - item.queuedAt);
    
    if (!oldestItem || item.queuedAt < oldestItem) {
      oldestItem = item.queuedAt;
    }
  });
  
  return {
    totalItems: queue.length,
    priorityDistribution,
    oldestItem,
    averageWaitTime: queue.length > 0 ? totalWaitTime / queue.length : 0,
  };
};

/**
 * Enhanced memory management with size tracking
 */
export const checkMemoryLimits = (): {
  exceedsLimits: boolean;
  totalDocuments: number;
  totalSize: number;
  recommendations: string[];
} => {
  const stats = getCacheStats();
  const recommendations: string[] = [];
  let exceedsLimits = false;
  
  if (stats.totalDocuments > DOCUMENT_MEMORY_LIMITS.MAX_CACHED_DOCUMENTS) {
    exceedsLimits = true;
    recommendations.push(`Too many cached documents (${stats.totalDocuments}/${DOCUMENT_MEMORY_LIMITS.MAX_CACHED_DOCUMENTS})`);
  }
  
  if (stats.totalSize > DOCUMENT_MEMORY_LIMITS.MAX_CACHE_SIZE) {
    exceedsLimits = true;
    const sizeMB = (stats.totalSize / (1024 * 1024)).toFixed(2);
    const limitMB = (DOCUMENT_MEMORY_LIMITS.MAX_CACHE_SIZE / (1024 * 1024)).toFixed(0);
    recommendations.push(`Cache size too large (${sizeMB}MB/${limitMB}MB)`);
  }
  
  // Check for failed documents that should be cleaned up
  const failedCount = stats.byStatus.failed;
  if (failedCount > 5) {
    recommendations.push(`Many failed uploads (${failedCount}), consider retry or cleanup`);
  }
  
  return {
    exceedsLimits,
    totalDocuments: stats.totalDocuments,
    totalSize: stats.totalSize,
    recommendations,
  };
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