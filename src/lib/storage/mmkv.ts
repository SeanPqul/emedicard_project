import { MMKV } from 'react-native-mmkv';

/**
 * MMKV Storage Instance per project rule
 * 
 * Provides centralized MMKV storage instances with consistent configuration
 * across the application. Supports encryption, multi-process mode, and app group sharing.
 */

/**
 * Default MMKV storage instance for general app data
 */
export const storage = new MMKV({
  id: 'emedicard-storage',
  // Add other options as needed
});

/**
 * Main app storage instance as specified in task requirements
 */
export const appStorage = new MMKV({ id: "emedicard", encryptionKey: undefined });

/**
 * Encrypted storage instance for sensitive data
 * Uses encryption for storing sensitive information like tokens, user credentials, etc.
 */
export const secureStorage = new MMKV({
  id: 'emedicard-secure-storage',
  encryptionKey: 'emedicard-secure-key', // In production, use a secure key from Keychain/Keystore
});

/**
 * User-specific storage instance factory
 * Creates isolated storage per user for multi-user support
 */
export const createUserStorage = (userId: string): MMKV => {
  return new MMKV({
    id: `emedicard-user-${userId}`,
    // Multi-process mode can be enabled if needed
    // multiProcess: true,
  });
};

/**
 * Cache storage instance for temporary data
 * Separate instance for caching to avoid affecting main storage performance
 */
export const cacheStorage = new MMKV({
  id: 'emedicard-cache',
});

/**
 * Settings storage instance for app preferences and configuration
 */
export const settingsStorage = new MMKV({
  id: 'emedicard-settings',
});

/**
 * Shared storage configuration for app group sharing (iOS)
 * Uncomment and configure when app group sharing is needed
 */
// export const sharedStorage = new MMKV({
//   id: 'emedicard-shared',
//   appGroupId: 'group.com.emedicard.app', // Replace with actual app group ID
// });

/**
 * Storage utilities for common operations
 */
export const storageUtils = {
  /**
   * Get storage size (approximate)
   */
  getStorageSize: (instance: MMKV = storage): number => {
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
        storageUtils.safeSet(key, value, instance);
      });
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
      
      keysToMigrate.forEach(key => {
        const value = fromInstance.getString(key);
        if (value !== undefined) {
          toInstance.set(key, value);
        }
      });
      
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
      instance.getAllKeys().forEach(key => {
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
        storageUtils.safeSet(key, value, instance);
      });
      return true;
    } catch (error) {
      console.error('Storage import failed:', error);
      return false;
    }
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
  setCachedData: <T>(key: string, data: T, expirationMs = 5 * 60 * 1000) => {
    const cacheItem = {
      data,
      expiration: Date.now() + expirationMs,
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
};

// Export default storage instance for backward compatibility
export default storage;
