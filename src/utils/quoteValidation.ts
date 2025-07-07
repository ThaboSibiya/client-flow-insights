
export interface ValidationError {
  field: string;
  message: string;
  type: 'error' | 'warning';
}

export interface QuoteItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface QuoteFormData {
  quoteNumber: string;
  customerName: string;
  customerEmail: string;
  issueDate: string;
  validUntil?: string;
  subject: string;
  taxRate: number;
  discountValue: number;
  discountType: 'percentage' | 'fixed';
}

export const validateQuoteForm = (formData: QuoteFormData, items: QuoteItem[]): ValidationError[] => {
  const errors: ValidationError[] = [];

  // Required field validations
  if (!formData.customerName?.trim()) {
    errors.push({
      field: 'customerName',
      message: 'Customer name is required',
      type: 'error'
    });
  }

  if (!formData.subject?.trim()) {
    errors.push({
      field: 'subject',
      message: 'Subject is required',
      type: 'error'
    });
  }

  if (!formData.quoteNumber?.trim()) {
    errors.push({
      field: 'quoteNumber',
      message: 'Quote number is required',
      type: 'error'
    });
  }

  // Email validation
  if (formData.customerEmail && !isValidEmail(formData.customerEmail)) {
    errors.push({
      field: 'customerEmail',
      message: 'Please enter a valid email address',
      type: 'error'
    });
  }

  // Date validations
  if (!formData.issueDate) {
    errors.push({
      field: 'issueDate',
      message: 'Issue date is required',
      type: 'error'
    });
  }

  if (formData.validUntil && new Date(formData.validUntil) <= new Date(formData.issueDate)) {
    errors.push({
      field: 'validUntil',
      message: 'Valid until date must be after issue date',
      type: 'error'
    });
  }

  // Tax rate validation
  if (formData.taxRate < 0 || formData.taxRate > 100) {
    errors.push({
      field: 'taxRate',
      message: 'Tax rate must be between 0% and 100%',
      type: 'error'
    });
  }

  // Discount validation
  if (formData.discountValue < 0) {
    errors.push({
      field: 'discountValue',
      message: 'Discount cannot be negative',
      type: 'error'
    });
  }

  if (formData.discountType === 'percentage' && formData.discountValue > 100) {
    errors.push({
      field: 'discountValue',
      message: 'Percentage discount cannot exceed 100%',
      type: 'error'
    });
  }

  // Items validation
  if (items.length === 0) {
    errors.push({
      field: 'items',
      message: 'At least one item is required',
      type: 'error'
    });
  }

  items.forEach((item, index) => {
    if (!item.description?.trim()) {
      errors.push({
        field: `items[${index}].description`,
        message: `Item ${index + 1}: Description is required`,
        type: 'error'
      });
    }

    if (item.quantity <= 0) {
      errors.push({
        field: `items[${index}].quantity`,
        message: `Item ${index + 1}: Quantity must be greater than 0`,
        type: 'error'
      });
    }

    if (item.rate < 0) {
      errors.push({
        field: `items[${index}].rate`,
        message: `Item ${index + 1}: Rate cannot be negative`,
        type: 'error'
      });
    }

    // Warnings for unusual values
    if (item.rate > 10000) {
      errors.push({
        field: `items[${index}].rate`,
        message: `Item ${index + 1}: Rate seems unusually high (R${item.rate.toFixed(2)})`,
        type: 'warning'
      });
    }

    if (item.quantity > 1000) {
      errors.push({
        field: `items[${index}].quantity`,
        message: `Item ${index + 1}: Quantity seems unusually high (${item.quantity})`,
        type: 'warning'
      });
    }
  });

  return errors;
};

export const validateCalculations = (
  subtotal: number,
  discount: number,
  tax: number,
  total: number
): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (subtotal < 0) {
    errors.push({
      field: 'subtotal',
      message: 'Subtotal cannot be negative',
      type: 'error'
    });
  }

  if (discount < 0) {
    errors.push({
      field: 'discount',
      message: 'Discount cannot be negative',
      type: 'error'
    });
  }

  if (discount > subtotal) {
    errors.push({
      field: 'discount',
      message: 'Discount cannot be greater than subtotal',
      type: 'error'
    });
  }

  if (tax < 0) {
    errors.push({
      field: 'tax',
      message: 'Tax cannot be negative',
      type: 'error'
    });
  }

  if (total <= 0) {
    errors.push({
      field: 'total',
      message: 'Total amount must be greater than zero',
      type: 'error'
    });
  }

  // Warnings for unusual amounts
  if (total > 100000) {
    errors.push({
      field: 'total',
      message: `Total amount is very high (R${total.toFixed(2)}). Please verify calculations.`,
      type: 'warning'
    });
  }

  if (discount > subtotal * 0.5) {
    errors.push({
      field: 'discount',
      message: 'Discount is more than 50% of subtotal. Please verify.',
      type: 'warning'
    });
  }

  return errors;
};

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const formatCurrency = (amount: number): string => {
  return `R${amount.toFixed(2)}`;
};

export const sanitizeNumber = (value: string | number): number => {
  if (typeof value === 'number') return isNaN(value) ? 0 : value;
  const num = parseFloat(value.toString().replace(/[^\d.-]/g, ''));
  return isNaN(num) ? 0 : num;
};
