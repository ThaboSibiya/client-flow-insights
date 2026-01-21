/**
 * Form Data Sanitization and Validation Utility
 * Provides secure handling for form submission data
 */

import { z } from 'zod';
import DOMPurify from 'dompurify';
import { encryptPII } from '@/utils/piiEncryption';
import { logSecureSecurityEvent } from '@/services/secureSecurityService';
import type { Json } from '@/integrations/supabase/types';

// Maximum sizes for form data
const MAX_FIELD_VALUE_LENGTH = 10000;
const MAX_FORM_DATA_SIZE = 100000; // 100KB
const MAX_NESTED_DEPTH = 5;

// Patterns to detect sensitive data
const SENSITIVE_PATTERNS = {
  email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  phone: /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/,
  creditCard: /^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|6(?:011|5[0-9]{2})[0-9]{12})$/,
  ssn: /^\d{3}-?\d{2}-?\d{4}$/,
  passport: /^[A-Z]{1,2}[0-9]{6,9}$/i,
  idNumber: /^\d{6,13}$/,
};

// Field names that typically contain sensitive data
const SENSITIVE_FIELD_NAMES = [
  'email', 'e-mail', 'mail',
  'phone', 'telephone', 'tel', 'mobile', 'cell',
  'ssn', 'social_security', 'social-security',
  'password', 'passwd', 'pwd',
  'credit_card', 'creditcard', 'card_number', 'cardnumber',
  'cvv', 'cvc', 'security_code',
  'id_number', 'idnumber', 'identity', 'passport',
  'bank_account', 'account_number', 'routing',
  'pin', 'secret', 'token', 'api_key', 'apikey',
  'address', 'street', 'home_address',
  'dob', 'date_of_birth', 'birthdate', 'birthday',
  'name', 'full_name', 'fullname', 'first_name', 'last_name',
];

// Form submission validation schema
export const formSubmissionSchema = z.object({
  form_name: z.string()
    .min(1, 'Form name is required')
    .max(100, 'Form name must be less than 100 characters')
    .regex(/^[a-zA-Z0-9_\-\s]+$/, 'Form name contains invalid characters'),
  customer_name: z.string()
    .max(200, 'Customer name must be less than 200 characters')
    .nullable()
    .optional(),
  customer_email: z.string()
    .email('Invalid email format')
    .max(255, 'Email must be less than 255 characters')
    .nullable()
    .optional()
    .or(z.literal(''))
    .or(z.null()),
  customer_phone: z.string()
    .max(50, 'Phone number must be less than 50 characters')
    .nullable()
    .optional(),
  form_data: z.union([
    z.record(z.unknown()),
    z.array(z.unknown()),
    z.string(),
    z.number(),
    z.boolean(),
    z.null()
  ]).optional(),
  source_url: z.string()
    .url('Invalid URL format')
    .max(2000, 'URL must be less than 2000 characters')
    .nullable()
    .optional()
    .or(z.literal(''))
    .or(z.null()),
  processed: z.boolean().optional(),
});

export type ValidatedFormSubmission = z.infer<typeof formSubmissionSchema>;

/**
 * Checks if a field name suggests it contains sensitive data
 */
function isSensitiveFieldName(fieldName: string): boolean {
  const normalizedName = fieldName.toLowerCase().replace(/[-_\s]/g, '');
  return SENSITIVE_FIELD_NAMES.some(pattern => 
    normalizedName.includes(pattern.replace(/[-_\s]/g, ''))
  );
}

/**
 * Checks if a value matches sensitive data patterns
 */
function matchesSensitivePattern(value: string): { isSensitive: boolean; type: string | null } {
  for (const [type, pattern] of Object.entries(SENSITIVE_PATTERNS)) {
    if (pattern.test(value.trim())) {
      return { isSensitive: true, type };
    }
  }
  return { isSensitive: false, type: null };
}

/**
 * Sanitizes a string value to prevent XSS and injection attacks
 */
function sanitizeString(value: string): string {
  if (!value || typeof value !== 'string') return '';
  
  // Truncate overly long values
  const truncated = value.slice(0, MAX_FIELD_VALUE_LENGTH);
  
  // Remove HTML tags and sanitize
  const sanitized = DOMPurify.sanitize(truncated, {
    ALLOWED_TAGS: [], // No HTML tags allowed
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true,
  });
  
  // Remove potential script injections
  return sanitized
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .trim();
}

/**
 * Recursively sanitizes and optionally encrypts form data
 */
async function processFormData(
  data: unknown,
  depth: number = 0,
  parentKey: string = ''
): Promise<{ sanitized: unknown; encryptedFields: string[] }> {
  const encryptedFields: string[] = [];
  
  // Prevent deeply nested objects
  if (depth > MAX_NESTED_DEPTH) {
    return { sanitized: '[NESTED_DATA_TRUNCATED]', encryptedFields };
  }
  
  if (data === null || data === undefined) {
    return { sanitized: data, encryptedFields };
  }
  
  if (typeof data === 'string') {
    const sanitizedValue = sanitizeString(data);
    const fieldIsSensitive = isSensitiveFieldName(parentKey);
    const { isSensitive: valueIsSensitive, type } = matchesSensitivePattern(sanitizedValue);
    
    if ((fieldIsSensitive || valueIsSensitive) && sanitizedValue.length > 0) {
      try {
        const encrypted = await encryptPII(sanitizedValue);
        if (encrypted) {
          encryptedFields.push(parentKey || 'value');
          return { sanitized: encrypted, encryptedFields };
        }
      } catch (error) {
        console.error('Failed to encrypt sensitive field:', parentKey);
        // Log but continue - security logging will capture this
      }
    }
    
    return { sanitized: sanitizedValue, encryptedFields };
  }
  
  if (typeof data === 'number' || typeof data === 'boolean') {
    return { sanitized: data, encryptedFields };
  }
  
  if (Array.isArray(data)) {
    const results = await Promise.all(
      data.map((item, index) => 
        processFormData(item, depth + 1, `${parentKey}[${index}]`)
      )
    );
    return {
      sanitized: results.map(r => r.sanitized),
      encryptedFields: results.flatMap(r => r.encryptedFields),
    };
  }
  
  if (typeof data === 'object') {
    const sanitizedObj: Record<string, unknown> = {};
    const allEncryptedFields: string[] = [];
    
    for (const [key, value] of Object.entries(data)) {
      const sanitizedKey = sanitizeString(key).slice(0, 100);
      const fullKey = parentKey ? `${parentKey}.${sanitizedKey}` : sanitizedKey;
      const { sanitized, encryptedFields: fieldEncrypted } = await processFormData(
        value,
        depth + 1,
        fullKey
      );
      sanitizedObj[sanitizedKey] = sanitized;
      allEncryptedFields.push(...fieldEncrypted);
    }
    
    return { sanitized: sanitizedObj, encryptedFields: allEncryptedFields };
  }
  
  // Unknown type - convert to string for safety
  return { sanitized: String(data), encryptedFields };
}

/**
 * Validates and sanitizes form submission data
 * - Validates against schema
 * - Sanitizes all string values
 * - Encrypts detected sensitive data
 * - Enforces size limits
 */
export async function validateAndSanitizeFormSubmission(
  submission: unknown
): Promise<{
  data: ValidatedFormSubmission | null;
  encryptedFields: string[];
  errors: z.ZodError | null;
}> {
  try {
    // First, check overall size
    const jsonSize = JSON.stringify(submission).length;
    if (jsonSize > MAX_FORM_DATA_SIZE) {
      logSecureSecurityEvent({
        action: 'form_submission_rejected',
        resource_type: 'form_submission',
        success: false,
        metadata: { reason: 'size_limit_exceeded', size: jsonSize }
      });
      throw new Error(`Form data exceeds maximum size of ${MAX_FORM_DATA_SIZE} bytes`);
    }
    
    // Validate against schema
    const validationResult = formSubmissionSchema.safeParse(submission);
    
    if (!validationResult.success) {
      logSecureSecurityEvent({
        action: 'form_submission_validation_failed',
        resource_type: 'form_submission',
        success: false,
        metadata: { errors: validationResult.error.errors.map(e => e.message) }
      });
      return { data: null, encryptedFields: [], errors: validationResult.error };
    }
    
    const validData = validationResult.data;
    let allEncryptedFields: string[] = [];
    
    // Process form_data field if present
    if (validData.form_data) {
      const { sanitized, encryptedFields } = await processFormData(validData.form_data);
      validData.form_data = sanitized as Record<string, unknown>;
      allEncryptedFields = encryptedFields;
    }
    
    // Sanitize other string fields
    if (validData.form_name) {
      validData.form_name = sanitizeString(validData.form_name);
    }
    if (validData.source_url) {
      validData.source_url = sanitizeString(validData.source_url);
    }
    
    logSecureSecurityEvent({
      action: 'form_submission_validated',
      resource_type: 'form_submission',
      success: true,
      metadata: { 
        form_name: validData.form_name,
        encrypted_fields_count: allEncryptedFields.length,
        encrypted_fields: allEncryptedFields.slice(0, 10) // Log first 10 for debugging
      }
    });
    
    return { data: validData, encryptedFields: allEncryptedFields, errors: null };
  } catch (error) {
    console.error('Form submission validation error:', error);
    logSecureSecurityEvent({
      action: 'form_submission_processing_error',
      resource_type: 'form_submission',
      success: false,
      metadata: { error: error instanceof Error ? error.message : 'Unknown error' }
    });
    throw error;
  }
}

/**
 * Redacts sensitive data for logging purposes
 */
export function redactFormDataForLogging(data: Record<string, unknown>): Record<string, unknown> {
  const redacted: Record<string, unknown> = {};
  
  for (const [key, value] of Object.entries(data)) {
    if (isSensitiveFieldName(key)) {
      redacted[key] = '[REDACTED]';
    } else if (typeof value === 'string' && matchesSensitivePattern(value).isSensitive) {
      redacted[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      redacted[key] = redactFormDataForLogging(value as Record<string, unknown>);
    } else {
      redacted[key] = value;
    }
  }
  
  return redacted;
}
