
export interface ValidationError {
  field: string;
  message: string;
  type: 'error' | 'warning';
}

export const validateQuoteForm = (formData: any, items: any[]): ValidationError[] => {
  const errors: ValidationError[] = [];

  // Required field validations
  if (!formData.customerName?.trim()) {
    errors.push({
      field: 'customerName',
      message: 'Customer name is required',
      type: 'error'
    });
  }

  if (!formData.customerEmail?.trim()) {
    errors.push({
      field: 'customerEmail',
      message: 'Customer email is required',
      type: 'error'
    });
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.customerEmail)) {
    errors.push({
      field: 'customerEmail',
      message: 'Please enter a valid email address',
      type: 'error'
    });
  }

  if (!formData.issueDate) {
    errors.push({
      field: 'issueDate',
      message: 'Issue date is required',
      type: 'error'
    });
  }

  // Items validation
  if (!items || items.length === 0) {
    errors.push({
      field: 'items',
      message: 'At least one item is required',
      type: 'error'
    });
  } else {
    items.forEach((item, index) => {
      if (!item.description?.trim()) {
        errors.push({
          field: `items[${index}].description`,
          message: `Item ${index + 1} description is required`,
          type: 'error'
        });
      }
      
      if (!item.quantity || item.quantity <= 0) {
        errors.push({
          field: `items[${index}].quantity`,
          message: `Item ${index + 1} quantity must be greater than 0`,
          type: 'error'
        });
      }
      
      if (!item.rate || item.rate < 0) {
        errors.push({
          field: `items[${index}].rate`,
          message: `Item ${index + 1} rate cannot be negative`,
          type: 'error'
        });
      }
    });
  }

  // Warning validations
  if (formData.taxRate > 25) {
    errors.push({
      field: 'taxRate',
      message: 'Tax rate seems unusually high',
      type: 'warning'
    });
  }

  if (formData.discountValue > 50) {
    errors.push({
      field: 'discountValue',
      message: 'Discount seems unusually high',
      type: 'warning'
    });
  }

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

  if (discount > subtotal) {
    errors.push({
      field: 'discount',
      message: 'Discount cannot exceed subtotal',
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

  return errors;
};
