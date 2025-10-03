/**
 * PII Encryption Utility
 * Provides client-side encryption for Personally Identifiable Information (PII)
 * Uses Web Crypto API for secure encryption/decryption
 */

import { logSecureSecurityEvent } from '@/services/secureSecurityService';

// Encryption configuration
const ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256;
const IV_LENGTH = 12; // 96 bits for GCM
const SALT_LENGTH = 16;

/**
 * Derives an encryption key from a passphrase using PBKDF2
 */
async function deriveKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const passphraseKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(passphrase),
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    passphraseKey,
    { name: ALGORITHM, length: KEY_LENGTH },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Gets the encryption passphrase from environment or generates a secure one
 */
function getEncryptionPassphrase(): string {
  // In production, this should come from a secure environment variable
  // For now, we'll use a derived key from the Supabase URL (available in client)
  const baseKey = import.meta.env.VITE_SUPABASE_URL || 'https://oquiaxbnkdnpixqhqdfq.supabase.co';
  return baseKey + '-pii-encryption-key-v1';
}

/**
 * Encrypts PII data
 * @param plaintext - The data to encrypt
 * @returns Base64 encoded encrypted data with salt and IV
 */
export async function encryptPII(plaintext: string | null | undefined): Promise<string | null> {
  if (!plaintext || plaintext.trim() === '') {
    return null;
  }

  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(plaintext);
    
    // Generate random salt and IV
    const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
    const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
    
    // Derive encryption key
    const key = await deriveKey(getEncryptionPassphrase(), salt);
    
    // Encrypt the data
    const encryptedData = await crypto.subtle.encrypt(
      {
        name: ALGORITHM,
        iv: iv,
      },
      key,
      data
    );
    
    // Combine salt + IV + encrypted data
    const combined = new Uint8Array(salt.length + iv.length + encryptedData.byteLength);
    combined.set(salt, 0);
    combined.set(iv, salt.length);
    combined.set(new Uint8Array(encryptedData), salt.length + iv.length);
    
    // Convert to base64
    const base64 = btoa(String.fromCharCode(...combined));
    
    logSecureSecurityEvent({
      action: 'pii_encrypted',
      resource_type: 'pii_data',
      success: true,
      metadata: { data_length: plaintext.length }
    });
    
    return base64;
  } catch (error) {
    console.error('PII encryption error:', error);
    logSecureSecurityEvent({
      action: 'pii_encryption_failed',
      resource_type: 'pii_data',
      success: false,
      metadata: { error: error instanceof Error ? error.message : 'Unknown error' }
    });
    throw new Error('Failed to encrypt PII data');
  }
}

/**
 * Decrypts PII data
 * @param encryptedBase64 - Base64 encoded encrypted data
 * @returns Decrypted plaintext
 */
export async function decryptPII(encryptedBase64: string | null | undefined): Promise<string | null> {
  if (!encryptedBase64 || encryptedBase64.trim() === '') {
    return null;
  }

  try {
    // Decode from base64
    const combined = Uint8Array.from(atob(encryptedBase64), c => c.charCodeAt(0));
    
    // Extract salt, IV, and encrypted data
    const salt = combined.slice(0, SALT_LENGTH);
    const iv = combined.slice(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
    const encryptedData = combined.slice(SALT_LENGTH + IV_LENGTH);
    
    // Derive decryption key
    const key = await deriveKey(getEncryptionPassphrase(), salt);
    
    // Decrypt the data
    const decryptedData = await crypto.subtle.decrypt(
      {
        name: ALGORITHM,
        iv: iv,
      },
      key,
      encryptedData
    );
    
    // Convert to string
    const decoder = new TextDecoder();
    const plaintext = decoder.decode(decryptedData);
    
    logSecureSecurityEvent({
      action: 'pii_decrypted',
      resource_type: 'pii_data',
      success: true
    });
    
    return plaintext;
  } catch (error) {
    console.error('PII decryption error:', error);
    logSecureSecurityEvent({
      action: 'pii_decryption_failed',
      resource_type: 'pii_data',
      success: false,
      metadata: { error: error instanceof Error ? error.message : 'Unknown error' }
    });
    // Return null instead of throwing to handle corrupted data gracefully
    return null;
  }
}

/**
 * Encrypts multiple PII fields in an object
 */
export async function encryptPIIFields<T extends Record<string, any>>(
  data: T,
  fields: (keyof T)[]
): Promise<T> {
  const encrypted = { ...data };
  
  for (const field of fields) {
    if (typeof data[field] === 'string') {
      encrypted[field] = await encryptPII(data[field] as string) as any;
    }
  }
  
  return encrypted;
}

/**
 * Decrypts multiple PII fields in an object
 */
export async function decryptPIIFields<T extends Record<string, any>>(
  data: T,
  fields: (keyof T)[]
): Promise<T> {
  const decrypted = { ...data };
  
  for (const field of fields) {
    if (typeof data[field] === 'string') {
      decrypted[field] = await decryptPII(data[field] as string) as any;
    }
  }
  
  return decrypted;
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
