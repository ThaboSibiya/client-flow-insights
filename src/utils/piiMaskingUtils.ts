/**
 * PII Masking Utilities for Enhanced Security
 * Masks personally identifiable information based on user privileges
 */

export const maskEmail = (email: string): string => {
  if (!email || !email.includes('@')) return email;
  
  const [username, domain] = email.split('@');
  if (username.length <= 2) return `**@${domain}`;
  
  const visibleChars = 2;
  const masked = username.substring(0, visibleChars) + '*'.repeat(username.length - visibleChars);
  return `${masked}@${domain}`;
};

export const maskPhone = (phone: string): string => {
  if (!phone) return phone;
  
  // Remove all non-digit characters for processing
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 4) return '****';
  
  // Show last 4 digits only
  const lastFour = digits.slice(-4);
  const maskedLength = digits.length - 4;
  return '*'.repeat(maskedLength) + lastFour;
};

export const maskPII = (value: string, type: 'email' | 'phone' | 'text'): string => {
  if (!value) return value;
  
  switch (type) {
    case 'email':
      return maskEmail(value);
    case 'phone':
      return maskPhone(value);
    case 'text':
      // For general text, mask middle portion
      if (value.length <= 4) return '****';
      const start = value.substring(0, 2);
      const end = value.substring(value.length - 2);
      return `${start}${'*'.repeat(value.length - 4)}${end}`;
    default:
      return value;
  }
};

export const shouldMaskPII = (hasPrivilege: boolean): boolean => {
  return !hasPrivilege;
};
