import { Customer } from '@/types/customer';
import { ValidationError, FormValidationResult } from '@/types/events';

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Phone validation regex (supports various formats)
const PHONE_REGEX = /^[\+]?[1-9][\d]{0,15}$/;

export const validateCustomerData = (customer: Partial<Customer>): FormValidationResult => {
  const errors: ValidationError[] = [];

  // Required field validations
  if (!customer.name || customer.name.trim().length === 0) {
    errors.push({
      field: 'name',
      message: 'Customer name is required',
      code: 'REQUIRED_FIELD'
    });
  } else if (customer.name.trim().length < 2) {
    errors.push({
      field: 'name',
      message: 'Customer name must be at least 2 characters long',
      code: 'MIN_LENGTH'
    });
  }

  if (!customer.email || customer.email.trim().length === 0) {
    errors.push({
      field: 'email',
      message: 'Email address is required',
      code: 'REQUIRED_FIELD'
    });
  } else if (!EMAIL_REGEX.test(customer.email)) {
    errors.push({
      field: 'email',
      message: 'Please enter a valid email address',
      code: 'INVALID_FORMAT'
    });
  }

  // Phone validation (optional but must be valid if provided)
  if (customer.phone && customer.phone.trim().length > 0) {
    const cleanPhone = customer.phone.replace(/[\s\-\(\)]/g, '');
    if (!PHONE_REGEX.test(cleanPhone)) {
      errors.push({
        field: 'phone',
        message: 'Please enter a valid phone number',
        code: 'INVALID_FORMAT'
      });
    }
  }

  // Status validation
  const validStatuses = ['new', 'existing', 'pending', 'finalised'];
  if (customer.status && !validStatuses.includes(customer.status)) {
    errors.push({
      field: 'status',
      message: 'Invalid customer status',
      code: 'INVALID_VALUE'
    });
  }

  // Notes length validation
  if (customer.notes && customer.notes.length > 1000) {
    errors.push({
      field: 'notes',
      message: 'Notes must not exceed 1000 characters',
      code: 'MAX_LENGTH'
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const sanitizeCustomerInput = (customer: Partial<Customer>): Partial<Customer> => {
  return {
    ...customer,
    name: customer.name?.trim(),
    email: customer.email?.trim().toLowerCase(),
    phone: customer.phone?.trim(),
    notes: customer.notes?.trim(),
    address: customer.address?.trim(),
    contact_person: customer.contact_person?.trim(),
    company_address: customer.company_address?.trim(),
  };
};

export const formatCustomerForDisplay = (customer: Customer): Customer => {
  return {
    ...customer,
    // Ensure dates are properly formatted
    createdAt: new Date(customer.createdAt),
    updatedAt: new Date(customer.updatedAt),
    lastTicketDate: customer.lastTicketDate ? new Date(customer.lastTicketDate) : undefined,
    // Ensure arrays are defined
    activeTickets: customer.activeTickets || [],
    // Ensure numbers are defined
    ticketCount: customer.ticketCount || 0,
  };
};