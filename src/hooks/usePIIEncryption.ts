/**
 * React hook for PII encryption/decryption
 * Provides easy-to-use hooks for handling encrypted PII in components
 */

import { useState, useCallback, useEffect } from 'react';
import { encryptPII, decryptPII, maskPII } from '@/utils/piiEncryption';

/**
 * Hook for encrypting PII data
 */
export function useEncryptPII() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const encrypt = useCallback(async (plaintext: string | null | undefined): Promise<string | null> => {
    setLoading(true);
    setError(null);
    try {
      const encrypted = await encryptPII(plaintext);
      return encrypted;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Encryption failed');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return { encrypt, loading, error };
}

/**
 * Hook for decrypting PII data
 */
export function useDecryptPII() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const decrypt = useCallback(async (encrypted: string | null | undefined): Promise<string | null> => {
    setLoading(true);
    setError(null);
    try {
      const decrypted = await decryptPII(encrypted);
      return decrypted;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Decryption failed');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return { decrypt, loading, error };
}

/**
 * Hook for automatic decryption of encrypted value
 */
export function useDecryptedValue(encryptedValue: string | null | undefined) {
  const [decryptedValue, setDecryptedValue] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!encryptedValue) {
      setDecryptedValue(null);
      return;
    }

    let isMounted = true;
    setLoading(true);

    decryptPII(encryptedValue)
      .then((decrypted) => {
        if (isMounted) {
          setDecryptedValue(decrypted);
          setError(null);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('Decryption failed'));
          setDecryptedValue(null);
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [encryptedValue]);

  return { decryptedValue, loading, error };
}

/**
 * Hook for masking PII display
 */
export function useMaskedPII(value: string | null | undefined, type: 'email' | 'phone' | 'name') {
  return maskPII(value, type);
}
