import { CustomerFinanceSummary } from '@/types/finance';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class FinanceCacheService {
  private readonly CACHE_PREFIX = 'finance_cache_';
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

  private getCacheKey(key: string): string {
    return `${this.CACHE_PREFIX}${key}`;
  }

  set<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): void {
    const cacheEntry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl,
    };

    try {
      localStorage.setItem(this.getCacheKey(key), JSON.stringify(cacheEntry));
    } catch (error) {
      console.warn('Failed to cache data:', error);
    }
  }

  get<T>(key: string): T | null {
    try {
      const cached = localStorage.getItem(this.getCacheKey(key));
      if (!cached) return null;

      const cacheEntry: CacheEntry<T> = JSON.parse(cached);
      const isExpired = Date.now() - cacheEntry.timestamp > cacheEntry.ttl;

      if (isExpired) {
        this.delete(key);
        return null;
      }

      return cacheEntry.data;
    } catch (error) {
      console.warn('Failed to retrieve cached data:', error);
      return null;
    }
  }

  delete(key: string): void {
    try {
      localStorage.removeItem(this.getCacheKey(key));
    } catch (error) {
      console.warn('Failed to delete cached data:', error);
    }
  }

  clear(): void {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(this.CACHE_PREFIX)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.warn('Failed to clear cache:', error);
    }
  }

  // Specialized methods for finance data
  setFinanceSummary(customerId: string, summary: CustomerFinanceSummary): void {
    this.set(`summary_${customerId}`, summary, 5 * 60 * 1000); // 5 min TTL
  }

  getFinanceSummary(customerId: string): CustomerFinanceSummary | null {
    return this.get<CustomerFinanceSummary>(`summary_${customerId}`);
  }

  invalidateCustomer(customerId: string): void {
    this.delete(`summary_${customerId}`);
    this.delete(`transactions_${customerId}`);
    this.delete(`notes_${customerId}`);
  }
}

export const financeCacheService = new FinanceCacheService();
