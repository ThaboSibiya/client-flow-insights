import { useState, useCallback, useRef } from 'react';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiry: number;
}

interface ApiCacheOptions {
  ttl?: number; // Time to live in milliseconds
  maxSize?: number; // Maximum cache size
  staleWhileRevalidate?: boolean; // Return stale data while revalidating
}

export const useApiCache = <T>(defaultOptions: ApiCacheOptions = {}) => {
  const {
    ttl = 5 * 60 * 1000, // 5 minutes default
    maxSize = 50,
    staleWhileRevalidate = true,
  } = defaultOptions;

  const cache = useRef(new Map<string, CacheEntry<T>>());
  const [loading, setLoading] = useState<Set<string>>(new Set());
  const [errors, setErrors] = useState<Map<string, Error>>(new Map());

  // Clean up expired entries
  const cleanup = useCallback(() => {
    const now = Date.now();
    const entries = Array.from(cache.current.entries());
    
    // Remove expired entries
    entries.forEach(([key, entry]) => {
      if (now > entry.expiry) {
        cache.current.delete(key);
      }
    });

    // Remove oldest entries if cache is too large
    if (cache.current.size > maxSize) {
      const sortedEntries = entries
        .filter(([, entry]) => now <= entry.expiry)
        .sort((a, b) => a[1].timestamp - b[1].timestamp);
      
      const toRemove = sortedEntries.slice(0, cache.current.size - maxSize);
      toRemove.forEach(([key]) => cache.current.delete(key));
    }
  }, [maxSize]);

  // Check if data is stale
  const isStale = useCallback((entry: CacheEntry<T>): boolean => {
    return Date.now() > entry.expiry;
  }, []);

  // Get cached data
  const getCached = useCallback((key: string): T | null => {
    const entry = cache.current.get(key);
    if (!entry) return null;

    if (isStale(entry)) {
      if (!staleWhileRevalidate) {
        cache.current.delete(key);
        return null;
      }
      // Return stale data but mark for revalidation
      return entry.data;
    }

    return entry.data;
  }, [isStale, staleWhileRevalidate]);

  // Set cache data
  const setCached = useCallback((key: string, data: T, customTtl?: number) => {
    const now = Date.now();
    const entry: CacheEntry<T> = {
      data,
      timestamp: now,
      expiry: now + (customTtl || ttl),
    };

    cache.current.set(key, entry);
    cleanup();
  }, [ttl, cleanup]);

  // Fetch with cache
  const fetchWithCache = useCallback(async (
    key: string,
    fetcher: () => Promise<T>,
    options?: { ttl?: number; forceRefresh?: boolean }
  ): Promise<T> => {
    const { ttl: customTtl, forceRefresh = false } = options || {};

    // Check cache first
    if (!forceRefresh) {
      const cached = getCached(key);
      if (cached !== null && !isStale(cache.current.get(key)!)) {
        return cached;
      }
    }

    // Check if already loading
    if (loading.has(key)) {
      // Wait for existing request to complete
      return new Promise((resolve, reject) => {
        const checkCompletion = () => {
          if (!loading.has(key)) {
            const cached = getCached(key);
            if (cached !== null) {
              resolve(cached);
            } else {
              const error = errors.get(key);
              reject(error || new Error('Request failed'));
            }
          } else {
            setTimeout(checkCompletion, 50);
          }
        };
        checkCompletion();
      });
    }

    // Set loading state
    setLoading(prev => new Set(prev).add(key));
    setErrors(prev => {
      const newErrors = new Map(prev);
      newErrors.delete(key);
      return newErrors;
    });

    try {
      const data = await fetcher();
      setCached(key, data, customTtl);
      return data;
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Unknown error');
      setErrors(prev => new Map(prev).set(key, err));
      
      // Return stale data if available and staleWhileRevalidate is enabled
      if (staleWhileRevalidate) {
        const staleData = cache.current.get(key)?.data;
        if (staleData !== undefined) {
          return staleData;
        }
      }
      
      throw err;
    } finally {
      setLoading(prev => {
        const newLoading = new Set(prev);
        newLoading.delete(key);
        return newLoading;
      });
    }
  }, [getCached, isStale, setCached, staleWhileRevalidate, loading, errors]);

  // Invalidate cache entry
  const invalidate = useCallback((key: string) => {
    cache.current.delete(key);
    setErrors(prev => {
      const newErrors = new Map(prev);
      newErrors.delete(key);
      return newErrors;
    });
  }, []);

  // Clear all cache
  const clearCache = useCallback(() => {
    cache.current.clear();
    setLoading(new Set());
    setErrors(new Map());
  }, []);

  // Get cache stats
  const getCacheStats = useCallback(() => {
    const now = Date.now();
    const entries = Array.from(cache.current.values());
    const total = entries.length;
    const expired = entries.filter(entry => now > entry.expiry).length;
    const fresh = total - expired;

    return {
      total,
      fresh,
      expired,
      size: cache.current.size,
      hitRate: total > 0 ? fresh / total : 0,
    };
  }, []);

  // Prefetch data
  const prefetch = useCallback((key: string, fetcher: () => Promise<T>) => {
    // Only prefetch if not already cached or loading
    if (!cache.current.has(key) && !loading.has(key)) {
      fetchWithCache(key, fetcher).catch(() => {
        // Ignore prefetch errors
      });
    }
  }, [fetchWithCache, loading]);

  return {
    fetchWithCache,
    getCached,
    setCached,
    invalidate,
    clearCache,
    getCacheStats,
    prefetch,
    isLoading: (key: string) => loading.has(key),
    getError: (key: string) => errors.get(key) || null,
  };
};