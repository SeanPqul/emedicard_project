import { cacheUtils, setObject, getObject, removeItem, getAllKeys } from '@shared/services/storage/storage';
import { JobCategory } from '@entities/jobCategory';

// JobCategory is now imported from entities to maintain type consistency

interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

/**
 * Mobile Cache Manager
 * 
 * This is a wrapper around the existing cacheUtils to provide compatibility
 * with the useOptimizedDashboard hook while reusing the existing storage infrastructure.
 */
class MobileCacheManager {
  private static readonly CACHE_KEYS = {
    JOB_CATEGORIES: 'cache_job_categories',
    DASHBOARD_STATS: 'cache_dashboard_stats',
    USER_PROFILE: 'cache_user_profile',
  } as const;

  private static readonly CACHE_DURATIONS = {
    JOB_CATEGORIES: 24 * 60 * 60 * 1000, // 24 hours
    DASHBOARD_STATS: 5 * 60 * 1000, // 5 minutes
    USER_PROFILE: 30 * 60 * 1000, // 30 minutes
  } as const;

  /**
   * Cache job categories with expiration
   */
  cacheJobCategories(categories: JobCategory[]): void {
    const cacheItem: CacheItem<JobCategory[]> = {
      data: categories,
      timestamp: Date.now(),
      expiresAt: Date.now() + MobileCacheManager.CACHE_DURATIONS.JOB_CATEGORIES,
    };
    setObject(MobileCacheManager.CACHE_KEYS.JOB_CATEGORIES, cacheItem);
  }

  /**
   * Get cached job categories
   */
  getCachedJobCategories(): JobCategory[] | null {
    const cached = getObject<CacheItem<JobCategory[]>>(MobileCacheManager.CACHE_KEYS.JOB_CATEGORIES);

    if (!cached) return null;

    // Check if expired
    if (Date.now() > cached.expiresAt) {
      removeItem(MobileCacheManager.CACHE_KEYS.JOB_CATEGORIES);
      return null;
    }

    return cached.data;
  }

  /**
   * Check if job categories cache is valid
   */
  isJobCategoriesCacheValid(): boolean {
    const cached = getObject<CacheItem<JobCategory[]>>(MobileCacheManager.CACHE_KEYS.JOB_CATEGORIES);
    return cached ? Date.now() <= cached.expiresAt : false;
  }

  /**
   * Cache dashboard stats
   */
  cacheDashboardStats(stats: any): void {
    const cacheItem: CacheItem<any> = {
      data: stats,
      timestamp: Date.now(),
      expiresAt: Date.now() + MobileCacheManager.CACHE_DURATIONS.DASHBOARD_STATS,
    };
    setObject(MobileCacheManager.CACHE_KEYS.DASHBOARD_STATS, cacheItem);
  }

  /**
   * Get cached dashboard stats
   */
  getCachedDashboardStats(): any | null {
    const cached = getObject<CacheItem<any>>(MobileCacheManager.CACHE_KEYS.DASHBOARD_STATS);

    if (!cached) return null;

    if (Date.now() > cached.expiresAt) {
      removeItem(MobileCacheManager.CACHE_KEYS.DASHBOARD_STATS);
      return null;
    }

    return cached.data;
  }

  /**
   * Invalidate specific cache
   */
  invalidateCache(cacheKey: string): void {
    removeItem(cacheKey);
  }

  /**
   * Invalidate all caches
   */
  invalidateAllCaches(): void {
    Object.values(MobileCacheManager.CACHE_KEYS).forEach(key => {
      removeItem(key);
    });
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): {
    totalCacheItems: number;
    validCacheItems: number;
    expiredCacheItems: number;
    cacheSize: number;
  } {
    const allKeys = getAllKeys();
    const cacheKeys = allKeys.filter(key => key.startsWith('cache_'));

    let validCount = 0;
    let expiredCount = 0;

    cacheKeys.forEach(key => {
      const cached = getObject<CacheItem<any>>(key);
      if (cached) {
        if (Date.now() <= cached.expiresAt) {
          validCount++;
        } else {
          expiredCount++;
        }
      }
    });

    return {
      totalCacheItems: cacheKeys.length,
      validCacheItems: validCount,
      expiredCacheItems: expiredCount,
      cacheSize: cacheKeys.length, // Approximation since MMKV doesn't provide size
    };
  }

  /**
   * Clean expired cache items
   * Delegates to the existing cacheUtils implementation
   */
  cleanExpiredCaches(): number {
    return cacheUtils.clearExpired();
  }
}

// Export singleton instance
export const mobileCacheManager = new MobileCacheManager();
export default mobileCacheManager;
