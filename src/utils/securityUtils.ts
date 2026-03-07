
import DOMPurify from 'dompurify';

// Enhanced input sanitization with length limits
export const sanitizeInput = (input: string, maxLength: number = 1000): string => {
  if (!input) return '';
  
  // Remove any potential XSS vectors
  const sanitized = DOMPurify.sanitize(input, { 
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: []
  });
  
  // Trim whitespace and limit length
  return sanitized.trim().substring(0, maxLength);
};

// HTML content sanitization for display - hardened against phishing/XSS
export const sanitizeHtmlContent = (html: string): string => {
  if (!html) return '';

  // Reject oversized content
  if (html.length > 500000) {
    return '<p>Email content too large to display safely.</p>';
  }
  
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'ul', 'ol', 'li', 'span', 'blockquote', 'code', 'pre', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'div'],
    ALLOWED_ATTR: ['class'],
    ALLOW_DATA_ATTR: false,
    FORBID_TAGS: ['style', 'script', 'iframe', 'object', 'embed', 'form', 'input', 'textarea', 'select', 'button', 'a'],
    FORBID_ATTR: ['style', 'onclick', 'onerror', 'onload', 'onmouseover', 'onfocus', 'href', 'target', 'src', 'action']
  });
};

// Email validation with comprehensive regex
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email) && email.length <= 254;
};

// Phone number validation (international format) - Updated to be more flexible
export const validatePhone = (phone: string): boolean => {
  if (!phone || phone.trim() === '') return false;
  
  // Remove common formatting characters
  const cleanPhone = phone.replace(/[\s\-\(\)\.]/g, '');
  
  // More flexible validation - allow numbers starting with 0 (common in many countries)
  const phoneRegex = /^[\+]?[0-9]{7,15}$/;
  
  return phoneRegex.test(cleanPhone);
};

// Generate CSRF token
export const generateCSRFToken = (): string => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

// Validate CSRF token
export const validateCSRFToken = (token: string, sessionToken: string): boolean => {
  return token === sessionToken && token.length === 64;
};

// REMOVED: Client-side rate limiting was insecure.
// Use server-side rate limiting with the useSecureRateLimit hook instead.
// This stub exists only for backwards compatibility — always returns true.
export const checkRateLimit = async (
  _identifier: string, 
  _resource: string, 
  _maxAttempts: number, 
  _windowMs: number
): Promise<boolean> => {
  console.warn('Client-side rate limiting is removed. Use useSecureRateLimit hook with server-side check_rate_limit RPC.');
  return true;
};

// Log security events for monitoring
export const logSecurityEvent = (event: string, details: any = {}) => {
  console.warn(`Security Event: ${event}`, details);
  
  // In production, this would send to a security monitoring service
  if (process.env.NODE_ENV === 'production') {
    // Send to security monitoring service
  }
};
