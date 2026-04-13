/**
 * PII Encryption Utility
 * Delegates encryption/decryption to server-side Edge Functions
 * so the encryption key never leaves the server.
 */

import { supabase } from '@/integrations/supabase/client';
import { logSecureSecurityEvent } from '@/services/secureSecurityService';

/**
 * Encrypts PII data via server-side Edge Function
 */
export async function encryptPII(plaintext: string | null | undefined): Promise<string | null> {
  if (!plaintext || plaintext.trim() === '') {
    return null;
  }

  try {
    const { data, error } = await supabase.functions.invoke('encrypt-pii', {
      body: { values: [plaintext] },
    });

    if (error) throw error;

    logSecureSecurityEvent({
      action: 'pii_encrypted',
      resource_type: 'pii_data',
      success: true,
      metadata: { data_length: plaintext.length },
    });

    return data?.encrypted?.[0] ?? null;
  } catch (error) {
    console.error('PII encryption error:', error);
    logSecureSecurityEvent({
      action: 'pii_encryption_failed',
      resource_type: 'pii_data',
      success: false,
      metadata: { error: error instanceof Error ? error.message : 'Unknown error' },
    });
    throw new Error('Failed to encrypt PII data');
  }
}

/**
 * Decrypts PII data via server-side Edge Function
 */
export async function decryptPII(encryptedBase64: string | null | undefined): Promise<string | null> {
  if (!encryptedBase64 || encryptedBase64.trim() === '') {
    return null;
  }

  try {
    const { data, error } = await supabase.functions.invoke('decrypt-pii', {
      body: { values: [encryptedBase64] },
    });

    if (error) throw error;

    logSecureSecurityEvent({
      action: 'pii_decrypted',
      resource_type: 'pii_data',
      success: true,
    });

    return data?.decrypted?.[0] ?? null;
  } catch (error) {
    console.error('PII decryption error:', error);
    logSecureSecurityEvent({
      action: 'pii_decryption_failed',
      resource_type: 'pii_data',
      success: false,
      metadata: { error: error instanceof Error ? error.message : 'Unknown error' },
    });
    return null;
  }
}

/**
 * Encrypts multiple PII fields in an object (batch call)
 */
export async function encryptPIIFields<T extends Record<string, any>>(
  data: T,
  fields: (keyof T)[]
): Promise<T> {
  const values: (string | null)[] = fields.map(f =>
    typeof data[f] === 'string' ? (data[f] as string) : null
  );

  // Skip if nothing to encrypt
  if (values.every(v => !v)) return data;

  try {
    const { data: result, error } = await supabase.functions.invoke('encrypt-pii', {
      body: { values },
    });

    if (error) throw error;

    const encrypted = { ...data };
    const encryptedValues = result?.encrypted || [];
    fields.forEach((field, i) => {
      if (encryptedValues[i] !== null && encryptedValues[i] !== undefined) {
        encrypted[field] = encryptedValues[i] as any;
      }
    });

    return encrypted;
  } catch (error) {
    console.error('Batch PII encryption error:', error);
    throw new Error('Failed to encrypt PII fields');
  }
}

/**
 * Decrypts multiple PII fields in an object (batch call)
 */
export async function decryptPIIFields<T extends Record<string, any>>(
  data: T,
  fields: (keyof T)[]
): Promise<T> {
  const values: (string | null)[] = fields.map(f =>
    typeof data[f] === 'string' ? (data[f] as string) : null
  );

  if (values.every(v => !v)) return data;

  try {
    const { data: result, error } = await supabase.functions.invoke('decrypt-pii', {
      body: { values },
    });

    if (error) throw error;

    const decrypted = { ...data };
    const decryptedValues = result?.decrypted || [];
    fields.forEach((field, i) => {
      if (decryptedValues[i] !== null && decryptedValues[i] !== undefined) {
        decrypted[field] = decryptedValues[i] as any;
      }
    });

    return decrypted;
  } catch (error) {
    console.error('Batch PII decryption error:', error);
    return data; // Graceful fallback
  }
}

/**
 * Masks PII for display purposes (e.g., email -> j***@example.com)
 */
export function maskPII(value: string | null | undefined, type: 'email' | 'phone' | 'name'): string {
  if (!value) return '';

  switch (type) {
    case 'email': {
      const [local, domain] = value.split('@');
      if (!domain) return value;
      const maskedLocal = local.charAt(0) + '***';
      return `${maskedLocal}@${domain}`;
    }
    case 'phone': {
      if (value.length < 4) return '***';
      return '***' + value.slice(-4);
    }
    case 'name': {
      if (value.length < 2) return '***';
      return value.charAt(0) + '***';
    }
    default:
      return '***';
  }
}
