
interface CachedMessage {
  data: any;
  timestamp: number;
  expiresAt: number;
}

interface CachedConversation {
  messages: Map<string, CachedMessage>;
  lastAccessed: number;
}

class MessageCacheService {
  private cache = new Map<string, CachedConversation>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  private readonly MAX_CONVERSATIONS = 10;
  private readonly MAX_MESSAGES_PER_CONVERSATION = 100;

  /**
   * Get cached messages for a conversation
   */
  getCachedMessages(conversationId: string): any[] | null {
    const conversation = this.cache.get(conversationId);
    if (!conversation) return null;

    conversation.lastAccessed = Date.now();
    
    const messages: any[] = [];
    const now = Date.now();

    for (const [messageId, cachedMessage] of conversation.messages) {
      if (now < cachedMessage.expiresAt) {
        messages.push(cachedMessage.data);
      } else {
        // Remove expired message
        conversation.messages.delete(messageId);
      }
    }

    return messages.length > 0 ? messages.sort((a, b) => 
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    ) : null;
  }

  /**
   * Cache messages for a conversation
   */
  cacheMessages(conversationId: string, messages: any[]): void {
    let conversation = this.cache.get(conversationId);
    
    if (!conversation) {
      conversation = {
        messages: new Map(),
        lastAccessed: Date.now(),
      };
      this.cache.set(conversationId, conversation);
    }

    const now = Date.now();
    const expiresAt = now + this.CACHE_DURATION;

    // Add messages to cache
    messages.forEach(message => {
      if (conversation!.messages.size < this.MAX_MESSAGES_PER_CONVERSATION) {
        conversation!.messages.set(message.id, {
          data: message,
          timestamp: now,
          expiresAt,
        });
      }
    });

    conversation.lastAccessed = now;
    this.cleanup();
  }

  /**
   * Cache a single message (for optimistic updates)
   */
  cacheMessage(conversationId: string, message: any): void {
    this.cacheMessages(conversationId, [message]);
  }

  /**
   * Remove a message from cache
   */
  removeCachedMessage(conversationId: string, messageId: string): void {
    const conversation = this.cache.get(conversationId);
    if (conversation) {
      conversation.messages.delete(messageId);
    }
  }

  /**
   * Update a cached message
   */
  updateCachedMessage(conversationId: string, messageId: string, updatedMessage: any): void {
    const conversation = this.cache.get(conversationId);
    if (conversation && conversation.messages.has(messageId)) {
      const cached = conversation.messages.get(messageId)!;
      cached.data = updatedMessage;
      cached.timestamp = Date.now();
    }
  }

  /**
   * Clear cache for a conversation
   */
  clearConversationCache(conversationId: string): void {
    this.cache.delete(conversationId);
  }

  /**
   * Clear all cache
   */
  clearAllCache(): void {
    this.cache.clear();
  }

  /**
   * Cleanup expired cache entries
   */
  private cleanup(): void {
    const now = Date.now();

    // Remove conversations that exceed the maximum limit
    if (this.cache.size > this.MAX_CONVERSATIONS) {
      const conversations = Array.from(this.cache.entries())
        .sort(([, a], [, b]) => a.lastAccessed - b.lastAccessed);
      
      const toRemove = conversations.slice(0, this.cache.size - this.MAX_CONVERSATIONS);
      toRemove.forEach(([conversationId]) => {
        this.cache.delete(conversationId);
      });
    }

    // Clean up expired messages
    for (const [conversationId, conversation] of this.cache) {
      for (const [messageId, cachedMessage] of conversation.messages) {
        if (now >= cachedMessage.expiresAt) {
          conversation.messages.delete(messageId);
        }
      }

      // Remove empty conversations
      if (conversation.messages.size === 0) {
        this.cache.delete(conversationId);
      }
    }
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    const conversations = Array.from(this.cache.values());
    const totalMessages = conversations.reduce((sum, conv) => sum + conv.messages.size, 0);

    return {
      conversationsCount: this.cache.size,
      totalMessages,
      memoryUsage: `${this.cache.size} conversations, ${totalMessages} messages`,
    };
  }
}

export const messageCacheService = new MessageCacheService();
