
import { supabase } from '@/integrations/supabase/client';
import { sanitizeString, validateEmail, validatePhone, validateRequired } from '@/utils/securityUtils';

export interface SecureFormData {
  [key: string]: any;
}

export interface ValidationRule {
  field: string;
  required?: boolean;
  type?: 'email' | 'phone' | 'string' | 'number';
  maxLength?: number;
  minLength?: number;
  pattern?: RegExp;
}

export const enhancedSecurityService = {
  // Enhanced form validation with security checks
  validateFormData: (data: SecureFormData, rules: ValidationRule[]): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    for (const rule of rules) {
      const value = data[rule.field];

      // Check required fields
      if (rule.required && !validateRequired(value)) {
        errors.push(`${rule.field} is required`);
        continue;
      }

      // Skip validation for empty optional fields
      if (!rule.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
        continue;
      }

      const stringValue = String(value);

      // Type-specific validation
      switch (rule.type) {
        case 'email':
          if (!validateEmail(stringValue)) {
            errors.push(`${rule.field} must be a valid email address`);
          }
          break;
        case 'phone':
          if (!validatePhone(stringValue)) {
            errors.push(`${rule.field} must be a valid phone number`);
          }
          break;
        case 'number':
          if (isNaN(Number(stringValue))) {
            errors.push(`${rule.field} must be a valid number`);
          }
          break;
      }

      // Length validation
      if (rule.maxLength && stringValue.length > rule.maxLength) {
        errors.push(`${rule.field} must be no more than ${rule.maxLength} characters`);
      }
      if (rule.minLength && stringValue.length < rule.minLength) {
        errors.push(`${rule.field} must be at least ${rule.minLength} characters`);
      }

      // Pattern validation
      if (rule.pattern && !rule.pattern.test(stringValue)) {
        errors.push(`${rule.field} format is invalid`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  // Sanitize form data to prevent XSS
  sanitizeFormData: (data: SecureFormData): SecureFormData => {
    const sanitized: SecureFormData = {};
    
    for (const [key, value] of Object.entries(data)) {
      if (typeof value === 'string') {
        sanitized[key] = sanitizeString(value);
      } else {
        sanitized[key] = value;
      }
    }
    
    return sanitized;
  },

  // Enhanced customer creation with security validation
  createSecureCustomer: async (customerData: any, userId: string) => {
    // Validation rules for customer data
    const rules: ValidationRule[] = [
      { field: 'name', required: true, type: 'string', maxLength: 255, minLength: 1 },
      { field: 'email', required: true, type: 'email', maxLength: 254 },
      { field: 'phone', required: false, type: 'phone', maxLength: 20 },
      { field: 'address', required: false, type: 'string', maxLength: 500 },
      { field: 'notes', required: false, type: 'string', maxLength: 1000 }
    ];

    // Validate input
    const validation = enhancedSecurityService.validateFormData(customerData, rules);
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }

    // Sanitize input
    const sanitizedData = enhancedSecurityService.sanitizeFormData(customerData);

    // Insert with proper user ownership
    const { data, error } = await supabase
      .from('customers')
      .insert({
        ...sanitizedData,
        user_id: userId
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Enhanced template field validation
  validateTemplateField: (field: any): { isValid: boolean; errors: string[] } => {
    const rules: ValidationRule[] = [
      { field: 'field_name', required: true, type: 'string', maxLength: 100, pattern: /^[a-zA-Z_][a-zA-Z0-9_]*$/ },
      { field: 'field_label', required: true, type: 'string', maxLength: 255 },
      { field: 'field_type', required: true, type: 'string', maxLength: 50 }
    ];

    return enhancedSecurityService.validateFormData(field, rules);
  },

  // Secure file upload validation
  validateFileUpload: (file: File, allowedTypes: string[], maxSize: number): { isValid: boolean; error?: string } => {
    // Check file type
    if (!allowedTypes.includes(file.type)) {
      return { isValid: false, error: 'File type not allowed' };
    }

    // Check file size
    if (file.size > maxSize) {
      return { isValid: false, error: `File size exceeds ${maxSize / 1024 / 1024}MB limit` };
    }

    // Check for suspicious file extensions in name
    const suspiciousExtensions = ['.exe', '.bat', '.cmd', '.scr', '.pif', '.com', '.js', '.vbs'];
    const fileName = file.name.toLowerCase();
    
    for (const ext of suspiciousExtensions) {
      if (fileName.includes(ext)) {
        return { isValid: false, error: 'File type not allowed for security reasons' };
      }
    }

    return { isValid: true };
  }
};
