
import DOMPurify from 'isomorphic-dompurify';

// Phone number validation for international formats
export const validatePhoneNumber = (phone: string): boolean => {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Should be between 7 and 15 digits (international standard)
  if (cleaned.length < 7 || cleaned.length > 15) {
    return false;
  }
  
  // Additional format checks
  const phoneRegex = /^[\+]?[\d\s\-\(\)]{7,20}$/;
  return phoneRegex.test(phone);
};

// Email validation with common TLD check
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email) && email.length <= 254;
};

// Sanitize text input
export const sanitizeTextInput = (input: string): string => {
  if (typeof input !== 'string') return '';
  
  // Basic HTML sanitization
  const sanitized = DOMPurify.sanitize(input, { 
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [] 
  });
  
  // Trim and limit length
  return sanitized.trim().substring(0, 1000);
};

// Validate URL format
export const validateUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    return ['http:', 'https:'].includes(urlObj.protocol);
  } catch {
    return false;
  }
};

// Validate template field definition
export const validateFieldDefinition = (field: any): boolean => {
  if (!field || typeof field !== 'object') return false;
  
  const requiredFields = ['name', 'label', 'type', 'required'];
  const validTypes = ['text', 'email', 'tel', 'number', 'textarea', 'select', 'date', 'url'];
  
  // Check required fields
  for (const reqField of requiredFields) {
    if (!(reqField in field)) return false;
  }
  
  // Validate field type
  if (!validTypes.includes(field.type)) return false;
  
  // Validate name format (should be valid identifier)
  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(field.name)) return false;
  
  // Validate options for select type
  if (field.type === 'select') {
    if (!Array.isArray(field.options) || field.options.length === 0) return false;
  }
  
  return true;
};

// Validate complete template structure
export const validateTemplate = (template: any): boolean => {
  if (!template || typeof template !== 'object') return false;
  
  if (!template.field_definitions || typeof template.field_definitions !== 'object') return false;
  
  if (!Array.isArray(template.field_definitions.fields)) return false;
  
  return template.field_definitions.fields.every(validateFieldDefinition);
};
