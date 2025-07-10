
class SimplifiedMessageCache {
  private cache = new Map<string, any[]>();

  getCachedMessages(conversationId: string): any[] | null {
    return this.cache.get(conversationId) || null;
  }

  cacheMessages(conversationId: string, messages: any[]): void {
    this.cache.set(conversationId, messages);
  }

  clearCache(conversationId?: string): void {
    if (conversationId) {
      this.cache.delete(conversationId);
    } else {
      this.cache.clear();
    }
  }
}

export const simplifiedMessageCache = new SimplifiedMessageCache();
