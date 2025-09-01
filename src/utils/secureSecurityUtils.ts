
import DOMPurify from 'dompurify';
import { logSecureSecurityEvent } from '@/services/secureSecurityService';

// Enhanced input sanitization with security logging
export const secureInputSanitization = (input: string, maxLength: number = 1000, context?: string): string => {
  if (!input) return '';
  
  const originalLength = input.length;
  
  // Remove any potential XSS vectors
  const sanitized = DOMPurify.sanitize(input, { 
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: []
  });
  
  // Trim whitespace and limit length
  const result = sanitized.trim().substring(0, maxLength);
  
  // Log suspicious input patterns
  if (originalLength !== result.length || input !== result) {
    logSecureSecurityEvent({
      action: 'input_sanitized',
      resource_type: 'input_validation',
      success: true,
      metadata: {
        context,
        original_length: originalLength,
        sanitized_length: result.length,
        was_modified: input !== result
      }
    });
  }
  
  return result;
};

// Secure HTML content sanitization for display with security logging
export const secureHtmlSanitization = (html: string, context?: string): string => {
  if (!html) return '';
  
  const originalHtml = html;
  
  const sanitized = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'a', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: ['href'],
    ALLOW_DATA_ATTR: false,
    ADD_ATTR: ['rel'], // Add rel attribute for security
    FORBID_ATTR: ['target'], // Remove target attribute to prevent reverse tabnabbing
  });
  
  // Add rel="noopener noreferrer" to all links for security
  const secureHtml = sanitized.replace(/<a\s+href/gi, '<a rel="noopener noreferrer" href');
  
  // Log HTML sanitization events
  if (originalHtml !== secureHtml) {
    logSecureSecurityEvent({
      action: 'html_sanitized',
      resource_type: 'content_security',
      success: true,
      metadata: {
        context,
        original_length: originalHtml.length,
        sanitized_length: secureHtml.length,
        links_secured: (secureHtml.match(/rel="noopener noreferrer"/g) || []).length
      }
    });
  }
  
  return secureHtml;
};

// Enhanced email validation with security logging
export const secureEmailValidation = (email: string): boolean => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const isValid = emailRegex.test(email) && email.length <= 254;
  
  if (!isValid) {
    logSecureSecurityEvent({
      action: 'invalid_email_attempted',
      resource_type: 'input_validation',
      success: false,
      metadata: { email_length: email.length }
    });
  }
  
  return isValid;
};

// Enhanced phone validation with security logging
export const securePhoneValidation = (phone: string): boolean => {
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  const isValid = phoneRegex.test(cleanPhone);
  
  if (!isValid) {
    logSecureSecurityEvent({
      action: 'invalid_phone_attempted',
      resource_type: 'input_validation',
      success: false,
      metadata: { phone_length: cleanPhone.length }
    });
  }
  
  return isValid;
};

// Generate cryptographically secure CSRF token
export const generateSecureCSRFToken = (): string => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  const token = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  
  logSecureSecurityEvent({
    action: 'csrf_token_generated',
    resource_type: 'security_token',
    success: true
  });
  
  return token;
};

// Validate CSRF token with security logging
export const validateSecureCSRFToken = (token: string, sessionToken: string): boolean => {
  const isValid = token === sessionToken && token.length === 64;
  
  logSecureSecurityEvent({
    action: 'csrf_token_validated',
    resource_type: 'security_token',
    success: isValid,
    error_message: !isValid ? 'CSRF token validation failed' : undefined
  });
  
  return isValid;
};

// Secure logging utility
export const logSecureEvent = (event: string, details: any = {}) => {
  // Enhanced logging for security events
  console.warn(`[SECURITY] ${event}`, {
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    url: window.location.href,
    ...details
  });
  
  // Log to secure audit system
  logSecureSecurityEvent({
    action: event,
    resource_type: 'security_monitoring',
    success: true,
    metadata: details
  });
};
