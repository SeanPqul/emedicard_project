import { MMKV, Mode } from 'react-native-mmkv';

/**
 * MMKV instance configuration interface
 */
interface MMKVConfig {
  id: string;
  encryptionKey?: string;
  path?: string;
  mode?: Mode;
  readOnly?: boolean;
}

/**
 * Create an MMKV instance with proper error handling
 * Since native modules are prebuilt, MMKV should initialize successfully
 */
const createMMKVInstance = (config: MMKVConfig): MMKV => {
  try {
    const instance = new MMKV(config);
    console.log(`✅ MMKV instance '${config.id}' initialized successfully`);
    return instance;
  } catch (error) {
    console.error(`❌ Failed to initialize MMKV instance '${config.id}':`, error);
    throw new Error(`MMKV initialization failed for '${config.id}'. Ensure native modules are properly built.`);
  }
};

/**
 * MMKV Storage Instance per project rule
 * 
 * Provides centralized MMKV storage instances with consistent configuration
 * across the application. Supports encryption, multi-process mode, and app group sharing.
 */

/**
 * Default MMKV storage instance for general app data
 */
export const storage = createMMKVInstance({
  id: 'emedicard-storage',
});

/**
 * Main app storage instance as specified in task requirements
 */
export const appStorage = createMMKVInstance({
  id: 'emedicard',
});

/**
 * Encrypted storage instance for sensitive data
 * Uses encryption for storing sensitive information like tokens, user credentials, etc.
 * TODO: In production, use a secure key from Keychain/Keystore
 */
export const secureStorage = createMMKVInstance({
  id: 'emedicard-secure-storage',
  encryptionKey: 'emedicard-secure-key',
});

/**
 * User-specific storage instance factory
 * Creates isolated storage per user for multi-user support
 */
export const createUserStorage = (userId: string): MMKV => {
  return createMMKVInstance({
    id: `emedicard-user-${userId}`,
    // Multi-process mode can be enabled if needed
    // mode: Mode.MULTI_PROCESS,
  });
};

/**
 * Cache storage instance for temporary data
 * Separate instance for caching to avoid affecting main storage performance
 */
export const cacheStorage = createMMKVInstance({
  id: 'emedicard-cache',
});

/**
 * Settings storage instance for app preferences and configuration
 */
export const settingsStorage = createMMKVInstance({
  id: 'emedicard-settings',
});

/**
 * Shared storage configuration for app group sharing (iOS)
 * Uncomment and configure when app group sharing is needed
 */
// export const sharedStorage = createMMKVInstance({
//   id: 'emedicard-shared',
//   // appGroupId: 'group.com.emedicard.app', // Replace with actual app group ID
// });

/**
 * Memory management configuration optimized for eMediCard
 * Handles large medical documents, photos, and application data
 */
const MEMORY_MANAGEMENT = {
  // Main storage - user profiles, settings, small data
  MAIN_TRIM_THRESHOLD: 10 * 1024 * 1024, // 10MB
  
  // Cache storage - documents, images, temporary application data
  CACHE_TRIM_THRESHOLD: 100 * 1024 * 1024, // 100MB - allows 2-3 complete applications
  
  // Secure storage - tokens, sensitive data (smaller threshold)
  SECURE_TRIM_THRESHOLD: 5 * 1024 * 1024, // 5MB
  
  // Settings storage - app preferences (very small)
  SETTINGS_TRIM_THRESHOLD: 2 * 1024 * 1024, // 2MB
  
  // Cache expiration times
  DOCUMENT_CACHE_AGE: 15 * 60 * 1000, // 15 minutes for document cache
  GENERAL_CACHE_AGE: 10 * 60 * 1000, // 10 minutes for general cache
  USER_SESSION_CACHE: 30 * 60 * 1000, // 30 minutes for user session data
} as const;

/**
 * Storage utilities for common operations
 */
export const storageUtils = {
  /**
   * Get storage size in bytes (MMKV 3.1.0 feature)
   */
  getStorageSize: (instance: MMKV = storage): number => {
    return instance.size;
  },

  /**
   * Get number of keys in storage
   */
  getKeyCount: (instance: MMKV = storage): number => {
    return instance.getAllKeys().length;
  },

  /**
   * Clear all data from a storage instance
   */
  clearStorage: (instance: MMKV = storage): void => {
    instance.clearAll();
  },

  /**
   * Check if a key exists in storage
   */
  hasKey: (key: string, instance: MMKV = storage): boolean => {
    return instance.contains(key);
  },

  /**
   * Get all keys from storage
   */
  getAllKeys: (instance: MMKV = storage): string[] => {
    return instance.getAllKeys();
  },

  /**
   * Remove a key from storage
   */
  removeKey: (key: string, instance: MMKV = storage): void => {
    instance.delete(key);
  },

  /**
   * Optimize storage by trimming unused memory with instance-specific thresholds
   */
  optimizeStorage: (instance: MMKV = storage): void => {
    const size = instance.size;
    let threshold: number;
    
    // Determine appropriate threshold based on storage instance
    if (instance === cacheStorage) {
      threshold = MEMORY_MANAGEMENT.CACHE_TRIM_THRESHOLD;
    } else if (instance === secureStorage) {
      threshold = MEMORY_MANAGEMENT.SECURE_TRIM_THRESHOLD;
    } else if (instance === settingsStorage) {
      threshold = MEMORY_MANAGEMENT.SETTINGS_TRIM_THRESHOLD;
    } else {
      threshold = MEMORY_MANAGEMENT.MAIN_TRIM_THRESHOLD;
    }
    
    if (size >= threshold) {
      const sizeMB = (size / (1024 * 1024)).toFixed(2);
      const thresholdMB = (threshold / (1024 * 1024)).toFixed(0);
      console.log(`🧹 Trimming MMKV storage: ${sizeMB}MB (threshold: ${thresholdMB}MB)`);
      instance.trim();
    }
  },

  /**
   * Safely get a value from storage with fallback
   */
  safeGet: <T>(
    key: string, 
    fallback: T, 
    instance: MMKV = storage,
    parser?: (value: string) => T
  ): T => {
    try {
      const value = instance.getString(key);
      if (value === undefined) {
        return fallback;
      }
      
      if (parser) {
        return parser(value);
      }
      
      // Try to parse as JSON first
      try {
        return JSON.parse(value);
      } catch {
        // If JSON parsing fails, return the raw value
        return value as T;
      }
    } catch (error) {
      console.warn(`Failed to get value for key "${key}":`, error);
      return fallback;
    }
  },

  /**
   * Safely set a value in storage
   */
  safeSet: (
    key: string, 
    value: any, 
    instance: MMKV = storage
  ): boolean => {
    try {
      if (typeof value === 'string') {
        instance.set(key, value);
      } else {
        instance.set(key, JSON.stringify(value));
      }
      
      // Auto-optimize storage if needed
      storageUtils.optimizeStorage(instance);
      
      return true;
    } catch (error) {
      console.error(`Failed to set value for key "${key}":`, error);
      return false;
    }
  },

  /**
   * Batch operations for better performance
   */
  batchSet: (
    items: Array<{ key: string; value: any }>, 
    instance: MMKV = storage
  ): boolean => {
    try {
      items.forEach(({ key, value }) => {
        if (typeof value === 'string') {
          instance.set(key, value);
        } else {
          instance.set(key, JSON.stringify(value));
        }
      });
      
      // Optimize after batch operation
      storageUtils.optimizeStorage(instance);
      
      return true;
    } catch (error) {
      console.error('Batch set operation failed:', error);
      return false;
    }
  },

  /**
   * Migrate data between storage instances
   */
  migrate: (fromInstance: MMKV, toInstance: MMKV, keys?: string[]): boolean => {
    try {
      const keysToMigrate = keys || fromInstance.getAllKeys();
      
      keysToMigrate.forEach((key: string) => {
        const value = fromInstance.getString(key);
        if (value !== undefined) {
          toInstance.set(key, value);
        }
      });
      
      // Optimize both instances after migration
      storageUtils.optimizeStorage(fromInstance);
      storageUtils.optimizeStorage(toInstance);
      
      return true;
    } catch (error) {
      console.error('Storage migration failed:', error);
      return false;
    }
  },

  /**
   * Export storage data for backup/debugging
   */
  export: (instance: MMKV = storage): Record<string, any> => {
    const data: Record<string, any> = {};
    
    try {
      instance.getAllKeys().forEach((key: string) => {
        const value = instance.getString(key);
        if (value !== undefined) {
          try {
            data[key] = JSON.parse(value);
          } catch {
            data[key] = value;
          }
        }
      });
    } catch (error) {
      console.error('Storage export failed:', error);
    }
    
    return data;
  },

  /**
   * Import storage data from backup
   */
  import: (data: Record<string, any>, instance: MMKV = storage): boolean => {
    try {
      Object.entries(data).forEach(([key, value]) => {
        if (typeof value === 'string') {
          instance.set(key, value);
        } else {
          instance.set(key, JSON.stringify(value));
        }
      });
      
      // Optimize after import
      storageUtils.optimizeStorage(instance);
      
      return true;
    } catch (error) {
      console.error('Storage import failed:', error);
      return false;
    }
  },

  /**
   * Get comprehensive storage info and statistics for eMediCard
   */
  getStorageInfo: (instance: MMKV = storage) => {
    const size = instance.size;
    const keyCount = instance.getAllKeys().length;
    const sizeMB = (size / (1024 * 1024)).toFixed(2);
    
    // Determine threshold and instance type
    let threshold: number;
    let instanceType: string;
    
    if (instance === cacheStorage) {
      threshold = MEMORY_MANAGEMENT.CACHE_TRIM_THRESHOLD;
      instanceType = 'cache';
    } else if (instance === secureStorage) {
      threshold = MEMORY_MANAGEMENT.SECURE_TRIM_THRESHOLD;
      instanceType = 'secure';
    } else if (instance === settingsStorage) {
      threshold = MEMORY_MANAGEMENT.SETTINGS_TRIM_THRESHOLD;
      instanceType = 'settings';
    } else {
      threshold = MEMORY_MANAGEMENT.MAIN_TRIM_THRESHOLD;
      instanceType = 'main';
    }
    
    const thresholdMB = (threshold / (1024 * 1024)).toFixed(0);
    const utilizationPercent = ((size / threshold) * 100).toFixed(1);
    
    return {
      size,
      sizeMB,
      keyCount,
      instanceType,
      threshold,
      thresholdMB,
      utilizationPercent: parseFloat(utilizationPercent),
      needsTrimming: size >= threshold,
      id: (instance as any).id || 'unknown',
    };
  },
  
  /**
   * Get overall storage health summary for all instances
   */
  getStorageHealthSummary: () => {
    const instances = [
      { name: 'Main Storage', instance: storage },
      { name: 'Cache Storage', instance: cacheStorage },
      { name: 'Secure Storage', instance: secureStorage },
      { name: 'Settings Storage', instance: settingsStorage },
    ];
    
    const summary = instances.map(({ name, instance }) => ({
      name,
      ...storageUtils.getStorageInfo(instance),
    }));
    
    const totalSize = summary.reduce((sum, info) => sum + info.size, 0);
    const totalSizeMB = (totalSize / (1024 * 1024)).toFixed(2);
    const needsAttention = summary.some(info => info.needsTrimming);
    
    return {
      instances: summary,
      totalSize,
      totalSizeMB,
      needsAttention,
    };
  },
};

/**
 * Storage keys constants for type safety and consistency
 */
export const StorageKeys = {
  // User preferences
  USER_PREFERENCES: 'user_preferences',
  THEME: 'theme',
  LANGUAGE: 'language',
  NOTIFICATIONS_ENABLED: 'notifications_enabled',
  
  // App state
  ONBOARDING_COMPLETED: 'onboarding_completed',
  FIRST_LAUNCH: 'first_launch',
  APP_VERSION: 'app_version',
  
  // Cache keys
  CACHE_FORMS: 'cache_forms',
  CACHE_HEALTH_CARDS: 'cache_health_cards',
  CACHE_NOTIFICATIONS: 'cache_notifications',
  CACHE_USER_PROFILE: 'cache_user_profile',
  
  // Settings
  BIOMETRIC_ENABLED: 'biometric_enabled',
  AUTO_SYNC: 'auto_sync',
  OFFLINE_MODE: 'offline_mode',
  
  // Temporary data
  TEMP_FORM_DATA: 'temp_form_data',
  TEMP_UPLOAD_QUEUE: 'temp_upload_queue',
  LAST_SYNC_TIME: 'last_sync_time',
} as const;

/**
 * Type-safe storage helpers
 */
export const typedStorage = {
  /**
   * Store and retrieve user preferences
   */
  getUserPreferences: () => {
    return storageUtils.safeGet(StorageKeys.USER_PREFERENCES, {}, settingsStorage);
  },
  
  setUserPreferences: (preferences: Record<string, any>) => {
    return storageUtils.safeSet(StorageKeys.USER_PREFERENCES, preferences, settingsStorage);
  },
  
  /**
   * Store and retrieve theme preference
   */
  getTheme: (): 'light' | 'dark' | 'system' => {
    return storageUtils.safeGet(StorageKeys.THEME, 'system', settingsStorage);
  },
  
  setTheme: (theme: 'light' | 'dark' | 'system') => {
    return storageUtils.safeSet(StorageKeys.THEME, theme, settingsStorage);
  },
  
  /**
   * Check if onboarding is completed
   */
  isOnboardingCompleted: (): boolean => {
    return storageUtils.safeGet(StorageKeys.ONBOARDING_COMPLETED, false, storage);
  },
  
  setOnboardingCompleted: (completed: boolean = true) => {
    return storageUtils.safeSet(StorageKeys.ONBOARDING_COMPLETED, completed, storage);
  },
  
  /**
   * Store and retrieve cached data with expiration
   */
  setCachedData: <T>(key: string, data: T, expirationMs: number = MEMORY_MANAGEMENT.GENERAL_CACHE_AGE) => {
    const cacheItem = {
      data,
      expiration: Date.now() + expirationMs,
    };
    return storageUtils.safeSet(key, cacheItem, cacheStorage);
  },
  
  /**
   * Store document cache with longer expiration for eMediCard documents
   */
  setCachedDocument: <T>(key: string, data: T) => {
    const cacheItem = {
      data,
      expiration: Date.now() + MEMORY_MANAGEMENT.DOCUMENT_CACHE_AGE,
      type: 'document',
    };
    return storageUtils.safeSet(key, cacheItem, cacheStorage);
  },
  
  /**
   * Store user session data with extended expiration
   */
  setCachedUserSession: <T>(key: string, data: T) => {
    const cacheItem = {
      data,
      expiration: Date.now() + MEMORY_MANAGEMENT.USER_SESSION_CACHE,
      type: 'session',
    };
    return storageUtils.safeSet(key, cacheItem, cacheStorage);
  },
  
  getCachedData: <T>(key: string): T | null => {
    const cacheItem = storageUtils.safeGet<{ data: T; expiration: number } | null>(
      key, 
      null, 
      cacheStorage
    );
    
    if (!cacheItem) {
      return null;
    }
    
    if (Date.now() > cacheItem.expiration) {
      storageUtils.removeKey(key, cacheStorage);
      return null;
    }
    
    return cacheItem.data;
  },

  /**
   * Clean expired cache entries with detailed logging
   */
  cleanExpiredCache: () => {
    const keys = cacheStorage.getAllKeys();
    let cleanedCount = 0;
    let documentCount = 0;
    let sessionCount = 0;
    let generalCount = 0;
    
    keys.forEach(key => {
      const item = storageUtils.safeGet<{ expiration: number; type?: string } | null>(key, null, cacheStorage);
      if (item && Date.now() > item.expiration) {
        // Count by type for better monitoring
        switch (item.type) {
          case 'document':
            documentCount++;
            break;
          case 'session':
            sessionCount++;
            break;
          default:
            generalCount++;
        }
        
        cacheStorage.delete(key);
        cleanedCount++;
      }
    });
    
    if (cleanedCount > 0) {
      console.log(`🧹 Cleaned ${cleanedCount} expired cache entries:`);
      console.log(`  - Documents: ${documentCount}`);
      console.log(`  - Sessions: ${sessionCount}`);
      console.log(`  - General: ${generalCount}`);
      storageUtils.optimizeStorage(cacheStorage);
    }
    
    return { cleanedCount, documentCount, sessionCount, generalCount };
  },
  
  /**
   * Force clean all document cache (useful before large operations)
   */
  cleanDocumentCache: () => {
    const keys = cacheStorage.getAllKeys();
    let cleanedCount = 0;
    
    keys.forEach(key => {
      const item = storageUtils.safeGet<{ type?: string } | null>(key, null, cacheStorage);
      if (item && item.type === 'document') {
        cacheStorage.delete(key);
        cleanedCount++;
      }
    });
    
    if (cleanedCount > 0) {
      console.log(`🧹 Force cleaned ${cleanedCount} document cache entries`);
      storageUtils.optimizeStorage(cacheStorage);
    }
    
    return cleanedCount;
  },
};

/**
 * Export all storage instances and utilities
 */
export {
  MMKV,
  Mode,
  createMMKVInstance,
  MEMORY_MANAGEMENT,
};

/**
 * Utility function to initialize optimal cache cleaning interval for eMediCard
 * Call this once during app startup
 */
export const initializeStorageOptimization = () => {
  // Clean expired cache every 5 minutes
  const cleanupInterval = setInterval(() => {
    typedStorage.cleanExpiredCache();
  }, 5 * 60 * 1000);
  
  // Log storage health every 10 minutes in development
  if (__DEV__) {
    setInterval(() => {
      const health = storageUtils.getStorageHealthSummary();
      if (health.needsAttention) {
        console.log('⚠️ Storage Health Alert:', health);
      }
    }, 10 * 60 * 1000);
  }
  
  return cleanupInterval;
};

// Export default storage instance for backward compatibility
export default storage;
