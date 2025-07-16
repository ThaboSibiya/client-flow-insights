
import { useState } from 'react';

interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  email?: boolean;
  phone?: boolean;
}

interface ValidationRules {
  [key: string]: ValidationRule;
}

export const useFormValidation = (rules: ValidationRules) => {
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());

  const validateField = (name: string, value: any): string | null => {
    const rule = rules[name];
    if (!rule) return null;

    if (rule.required && (!value || value.toString().trim() === '')) {
      return `${name} is required`;
    }

    if (rule.minLength && value && value.length < rule.minLength) {
      return `${name} must be at least ${rule.minLength} characters`;
    }

    if (rule.maxLength && value && value.length > rule.maxLength) {
      return `${name} must be no more than ${rule.maxLength} characters`;
    }

    if (rule.email && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return 'Please enter a valid email address';
    }

    if (rule.phone && value && !/^[\d\s\-\+\(\)]+$/.test(value)) {
      return 'Please enter a valid phone number';
    }

    return null;
  };

  const validateSingleField = (name: string, value: any) => {
    const error = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: error || ''
    }));
    return !error;
  };

  const validateForm = (formData: any) => {
    const newErrors: { [key: string]: string } = {};
    let isValid = true;

    Object.keys(rules).forEach(fieldName => {
      const error = validateField(fieldName, formData[fieldName]);
      if (error) {
        newErrors[fieldName] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const markFieldTouched = (fieldName: string) => {
    setTouchedFields(prev => new Set(prev).add(fieldName));
  };

  const getFieldError = (fieldName: string) => {
    return touchedFields.has(fieldName) ? errors[fieldName] : '';
  };

  const hasErrors = Object.values(errors).some(error => error !== '');

  const clearErrors = () => {
    setErrors({});
    setTouchedFields(new Set());
  };

  return {
    validateForm,
    validateSingleField,
    markFieldTouched,
    getFieldError,
    hasErrors,
    clearErrors,
  };
};
