import { cacheStorage, StorageKeys, typedStorage } from '../storage/mmkv';

/**
 * Mobile Cache Manager
 * 
 * Manages caching of stable data like job categories using MMKV.
 * Implements version-based cache invalidation for mobile optimization.
 */

interface CacheItem<T> {
  data: T;
  version: string;
  timestamp: number;
  expirationMs: number;
}

interface JobCategory {
  _id: string;
  name: string;
  colorCode: string;
  requireOrientation?: boolean | string;
}

const CACHE_KEYS = {
  JOB_CATEGORIES: 'cache_job_categories',
  CACHE_VERSION: 'cache_version',
  LAST_NETWORK_CHECK: 'last_network_check',
} as const;

// Cache configurations
const CACHE_CONFIG = {
  JOB_CATEGORIES: {
    defaultExpirationMs: 24 * 60 * 60 * 1000, // 24 hours
    version: '1.0.0', // Bump this to invalidate cache
  },
  NETWORK_CHECK_INTERVAL: 5 * 60 * 1000, // 5 minutes
} as const;

class MobileCacheManager {
  
  /**
   * Get cached job categories
   */
  getCachedJobCategories(): JobCategory[] | null {
    return this.getCachedData<JobCategory[]>(
      CACHE_KEYS.JOB_CATEGORIES,
      CACHE_CONFIG.JOB_CATEGORIES.version
    );
  }
  
  /**
   * Cache job categories with version control
   */
  cacheJobCategories(categories: JobCategory[], expirationMs?: number): void {
    this.setCachedData(
      CACHE_KEYS.JOB_CATEGORIES,
      categories,
      CACHE_CONFIG.JOB_CATEGORIES.version,
      expirationMs || CACHE_CONFIG.JOB_CATEGORIES.defaultExpirationMs
    );
  }
  
  /**
   * Check if job categories cache is valid
   */
  isJobCategoriesCacheValid(): boolean {
    return this.isCacheValid(
      CACHE_KEYS.JOB_CATEGORIES,
      CACHE_CONFIG.JOB_CATEGORIES.version
    );
  }
  
  /**
   * Generic method to get cached data with version control
   */
  private getCachedData<T>(key: string, expectedVersion: string): T | null {
    try {
      const cacheItem = cacheStorage.getString(key);
      if (!cacheItem) return null;
      
      const parsed: CacheItem<T> = JSON.parse(cacheItem);
      
      // Check version compatibility
      if (parsed.version !== expectedVersion) {
        this.invalidateCache(key);
        return null;
      }
      
      // Check expiration
      if (Date.now() > parsed.timestamp + parsed.expirationMs) {
        this.invalidateCache(key);
        return null;
      }
      
      return parsed.data;
    } catch (error) {
      console.warn(`Failed to get cached data for key "${key}":`, error);
      return null;
    }
  }
  
  /**
   * Generic method to set cached data with version control
   */
  private setCachedData<T>(
    key: string,
    data: T,
    version: string,
    expirationMs: number
  ): void {
    try {
      const cacheItem: CacheItem<T> = {
        data,
        version,
        timestamp: Date.now(),
        expirationMs,
      };
      
      cacheStorage.set(key, JSON.stringify(cacheItem));
    } catch (error) {
      console.error(`Failed to cache data for key "${key}":`, error);
    }
  }
  
  /**
   * Check if cache is valid (not expired and version matches)
   */
  private isCacheValid(key: string, expectedVersion: string): boolean {
    try {
      const cacheItem = cacheStorage.getString(key);
      if (!cacheItem) return false;
      
      const parsed: CacheItem<any> = JSON.parse(cacheItem);
      
      return (
        parsed.version === expectedVersion &&
        Date.now() <= parsed.timestamp + parsed.expirationMs
      );
    } catch (error) {
      return false;
    }
  }
  
  /**
   * Invalidate specific cache entry
   */
  invalidateCache(key: string): void {
    try {
      cacheStorage.delete(key);
    } catch (error) {
      console.warn(`Failed to invalidate cache for key "${key}":`, error);
    }
  }
  
  /**
   * Invalidate all caches (useful for app updates)
   */
  invalidateAllCaches(): void {
    try {
      Object.values(CACHE_KEYS).forEach(key => {
        cacheStorage.delete(key);
      });
    } catch (error) {
      console.error('Failed to invalidate all caches:', error);
    }
  }
  
  /**
   * Get cache statistics for debugging
   */
  getCacheStats() {
    const stats = {
      totalKeys: 0,
      validCaches: 0,
      expiredCaches: 0,
      invalidVersionCaches: 0,
      cacheSize: 0,
    };
    
    try {
      const allKeys = cacheStorage.getAllKeys();
      stats.totalKeys = allKeys.length;
      
      allKeys.forEach(key => {
        const value = cacheStorage.getString(key);
        if (value) {
          stats.cacheSize += value.length;
          
          try {
            const parsed: CacheItem<any> = JSON.parse(value);
            
            // Determine cache status for specific tracked keys
            if (Object.values(CACHE_KEYS).includes(key as any)) {
              const expectedVersion = this.getExpectedVersion(key);
              
              if (parsed.version !== expectedVersion) {
                stats.invalidVersionCaches++;
              } else if (Date.now() > parsed.timestamp + parsed.expirationMs) {
                stats.expiredCaches++;
              } else {
                stats.validCaches++;
              }
            }
          } catch {
            // Invalid cache entry
          }
        }
      });
    } catch (error) {
      console.warn('Failed to get cache stats:', error);
    }
    
    return stats;
  }
  
  /**
   * Get expected version for a cache key
   */
  private getExpectedVersion(key: string): string {
    switch (key) {
      case CACHE_KEYS.JOB_CATEGORIES:
        return CACHE_CONFIG.JOB_CATEGORIES.version;
      default:
        return '1.0.0';
    }
  }
  
  /**
   * Check if we should fetch fresh data based on network conditions
   */
  shouldFetchFreshData(key: string): boolean {
    const lastCheck = cacheStorage.getNumber(CACHE_KEYS.LAST_NETWORK_CHECK) || 0;
    const now = Date.now();
    
    // If we haven't checked recently, allow fresh data fetch
    if (now - lastCheck > CACHE_CONFIG.NETWORK_CHECK_INTERVAL) {
      cacheStorage.set(CACHE_KEYS.LAST_NETWORK_CHECK, now);
      return true;
    }
    
    // If cache doesn't exist or is invalid, always fetch
    const expectedVersion = this.getExpectedVersion(key);
    return !this.isCacheValid(key, expectedVersion);
  }
  
  /**
   * Update cache version (useful for app updates)
   */
  updateCacheVersion(newVersion: string): void {
    // This would invalidate all caches and set new version
    this.invalidateAllCaches();
    cacheStorage.set(CACHE_KEYS.CACHE_VERSION, newVersion);
  }
}

// Export singleton instance
export const mobileCacheManager = new MobileCacheManager();

// Export types and constants
export type { JobCategory };
export { CACHE_KEYS, CACHE_CONFIG };
