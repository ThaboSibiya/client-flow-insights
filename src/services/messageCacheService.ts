
class MessageCacheService {
  private cache = new Map<string, any[]>();

  getCachedMessages(conversationId: string): any[] | null {
    return this.cache.get(conversationId) || null;
  }

  cacheMessages(conversationId: string, messages: any[]): void {
    this.cache.set(conversationId, messages);
  }

  cacheMessage(conversationId: string, message: any): void {
    const existing = this.cache.get(conversationId) || [];
    this.cache.set(conversationId, [...existing, message]);
  }

  clearCache(conversationId?: string): void {
    if (conversationId) {
      this.cache.delete(conversationId);
    } else {
      this.cache.clear();
    }
  }
}

export const messageCacheService = new MessageCacheService();
