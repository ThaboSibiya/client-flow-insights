
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

// HTML content sanitization for display
export const sanitizeHtmlContent = (html: string): string => {
  if (!html) return '';
  
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'a', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: ['href', 'target'],
    ALLOW_DATA_ATTR: false
  });
};

// Email validation with comprehensive regex
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email) && email.length <= 254;
};

// Phone number validation (international format)
export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
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

// Rate limiting functionality
export const checkRateLimit = async (
  identifier: string, 
  resource: string, 
  maxAttempts: number, 
  windowMs: number
): Promise<boolean> => {
  const key = `rate_limit_${identifier}_${resource}`;
  const now = Date.now();
  
  const stored = localStorage.getItem(key);
  if (!stored) {
    localStorage.setItem(key, JSON.stringify({ count: 1, firstAttempt: now }));
    return true;
  }
  
  const data = JSON.parse(stored);
  
  // Reset if window has expired
  if (now - data.firstAttempt > windowMs) {
    localStorage.setItem(key, JSON.stringify({ count: 1, firstAttempt: now }));
    return true;
  }
  
  // Check if limit exceeded
  if (data.count >= maxAttempts) {
    return false;
  }
  
  // Increment count
  data.count++;
  localStorage.setItem(key, JSON.stringify(data));
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
