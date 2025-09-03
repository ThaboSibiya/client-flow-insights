import { supabase } from '@/integrations/supabase/client';
import { logSecureSecurityEvent } from './secureSecurityService';

export interface ApiKeyConfig {
  provider: string;
  apiKey: string;
  domain?: string;
}

export interface ApiKeyStatus {
  configured: boolean;
  enabled: boolean;
  lastValidated?: string;
}

/**
 * Securely manage API keys using Supabase Edge Functions
 * This service moves API key handling to the server-side for security
 */
export class SecureApiKeyService {
  
  /**
   * Configure an API key securely using Edge Functions
   */
  async setApiKey(config: ApiKeyConfig): Promise<{ success: boolean; error?: string }> {
    try {
      await logSecureSecurityEvent({
        action: 'api_key_configuration_attempt',
        resource_type: 'api_key_management',
        success: true,
        metadata: { provider: config.provider }
      });

      const { data, error } = await supabase.functions.invoke('secure-api-keys', {
        body: {
          action: 'set_key',
          provider: config.provider,
          apiKey: config.apiKey,
          domain: config.domain
        }
      });

      if (error) {
        await logSecureSecurityEvent({
          action: 'api_key_configuration_failed',
          resource_type: 'api_key_management',
          success: false,
          error_message: error.message,
          metadata: { provider: config.provider }
        });
        return { success: false, error: error.message };
      }

      await logSecureSecurityEvent({
        action: 'api_key_configured_successfully',
        resource_type: 'api_key_management',
        success: true,
        metadata: { provider: config.provider }
      });

      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      await logSecureSecurityEvent({
        action: 'api_key_configuration_error',
        resource_type: 'api_key_management',
        success: false,
        error_message: errorMessage,
        metadata: { provider: config.provider }
      });
      
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Test API key connection
   */
  async testConnection(provider: string): Promise<{ valid: boolean; error?: string }> {
    try {
      const { data, error } = await supabase.functions.invoke('secure-api-keys', {
        body: {
          action: 'test_connection',
          provider
        }
      });

      if (error) {
        return { valid: false, error: error.message };
      }

      return { valid: data.valid };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return { valid: false, error: errorMessage };
    }
  }

  /**
   * Get API key status
   */
  async getKeyStatus(provider: string): Promise<ApiKeyStatus> {
    try {
      const { data, error } = await supabase.functions.invoke('secure-api-keys', {
        body: {
          action: 'get_status',
          provider
        }
      });

      if (error) {
        console.error('Failed to get key status:', error);
        return { configured: false, enabled: false };
      }

      return {
        configured: data.configured,
        enabled: data.enabled,
        lastValidated: data.settings?.last_validated
      };
    } catch (error) {
      console.error('Key status error:', error);
      return { configured: false, enabled: false };
    }
  }

  /**
   * Rotate an API key
   */
  async rotateKey(provider: string): Promise<{ success: boolean; error?: string }> {
    try {
      await logSecureSecurityEvent({
        action: 'api_key_rotation_attempt',
        resource_type: 'api_key_management',
        success: true,
        metadata: { provider }
      });

      const { data, error } = await supabase.functions.invoke('secure-api-keys', {
        body: {
          action: 'rotate_key',
          provider
        }
      });

      if (error) {
        await logSecureSecurityEvent({
          action: 'api_key_rotation_failed',
          resource_type: 'api_key_management',
          success: false,
          error_message: error.message,
          metadata: { provider }
        });
        return { success: false, error: error.message };
      }

      await logSecureSecurityEvent({
        action: 'api_key_rotated_successfully',
        resource_type: 'api_key_management',
        success: true,
        metadata: { provider }
      });

      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      await logSecureSecurityEvent({
        action: 'api_key_rotation_error',
        resource_type: 'api_key_management',
        success: false,
        error_message: errorMessage,
        metadata: { provider }
      });
      
      return { success: false, error: errorMessage };
    }
  }
}

// Export singleton instance
export const secureApiKeyService = new SecureApiKeyService();