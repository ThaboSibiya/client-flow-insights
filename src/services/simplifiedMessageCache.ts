
interface CachedMessage {
  data: any;
  timestamp: number;
}

class SimplifiedMessageCache {
  private cache = new Map<string, CachedMessage[]>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  private readonly MAX_CONVERSATIONS = 5; // Reduced from 10

  getCachedMessages(conversationId: string): any[] | null {
    const messages = this.cache.get(conversationId);
    if (!messages) return null;

    const now = Date.now();
    const validMessages = messages.filter(
      msg => now - msg.timestamp < this.CACHE_DURATION
    );

    if (validMessages.length === 0) {
      this.cache.delete(conversationId);
      return null;
    }

    return validMessages.map(msg => msg.data);
  }

  cacheMessages(conversationId: string, messages: any[]): void {
    const now = Date.now();
    const cachedMessages = messages.map(message => ({
      data: message,
      timestamp: now,
    }));

    this.cache.set(conversationId, cachedMessages);
    this.cleanup();
  }

  clearConversationCache(conversationId: string): void {
    this.cache.delete(conversationId);
  }

  private cleanup(): void {
    if (this.cache.size <= this.MAX_CONVERSATIONS) return;

    // Simple LRU: remove oldest entries
    const entries = Array.from(this.cache.entries());
    const toRemove = entries.slice(0, this.cache.size - this.MAX_CONVERSATIONS);
    toRemove.forEach(([conversationId]) => {
      this.cache.delete(conversationId);
    });
  }
}

export const simplifiedMessageCache = new SimplifiedMessageCache();
