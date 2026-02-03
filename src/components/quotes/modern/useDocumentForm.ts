import { useState, useCallback, useMemo } from 'react';
import { QuoteInvoice, QuoteInvoiceInsert, QuoteInvoiceType, QuoteInvoiceStatus } from '@/types/quote';
import { useCRM } from '@/context/CRMContext';

interface DocumentItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

interface DocumentFormData {
  documentNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  issueDate: string;
  dueDate: string;
  validUntil: string;
  subject: string;
  notes: string;
  terms: string;
  taxRate: number;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  status: QuoteInvoiceStatus;
}

interface UseDocumentFormOptions {
  type: QuoteInvoiceType;
  initialData?: QuoteInvoice | null;
}

export const useDocumentForm = ({ type, initialData }: UseDocumentFormOptions) => {
  const { customers } = useCRM();
  
  const defaultTerms = type === 'quote' 
    ? 'Payment due within 30 days'
    : 'Payment due within 30 days. Late payments may incur additional charges.';

  const getInitialFormData = useCallback((): DocumentFormData => {
    if (initialData) {
      const taxBase = initialData.subtotal - initialData.discount;
      const taxRate = taxBase > 0 ? (initialData.tax * 100) / taxBase : 15;

      return {
        documentNumber: initialData.number,
        customerId: initialData.customer_id || '',
        customerName: initialData.customer_name || '',
        customerEmail: initialData.customer_email || '',
        customerPhone: '',
        issueDate: new Date(initialData.issue_date).toISOString().split('T')[0],
        dueDate: initialData.due_date ? new Date(initialData.due_date).toISOString().split('T')[0] : '',
        validUntil: initialData.valid_until ? new Date(initialData.valid_until).toISOString().split('T')[0] : '',
        subject: initialData.subject || '',
        notes: initialData.notes || '',
        terms: initialData.terms || defaultTerms,
        taxRate,
        discountType: 'fixed',
        discountValue: initialData.discount || 0,
        status: initialData.status,
      };
    }

    const prefix = type === 'quote' ? 'QUO' : 'INV';
    const thirtyDaysLater = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    return {
      documentNumber: `${prefix}-${Date.now()}`,
      customerId: '',
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: thirtyDaysLater,
      validUntil: thirtyDaysLater,
      subject: '',
      notes: '',
      terms: defaultTerms,
      taxRate: 15,
      discountType: 'percentage',
      discountValue: 0,
      status: 'draft',
    };
  }, [initialData, type, defaultTerms]);

  const getInitialItems = useCallback((): DocumentItem[] => {
    if (initialData?.quote_invoice_items?.length) {
      return initialData.quote_invoice_items.map(item => ({
        id: item.id,
        description: item.description,
        quantity: item.quantity,
        rate: item.rate,
        amount: item.quantity * item.rate,
      }));
    }
    return [{ id: '1', description: '', quantity: 1, rate: 0, amount: 0 }];
  }, [initialData]);

  const [formData, setFormData] = useState<DocumentFormData>(getInitialFormData);
  const [items, setItems] = useState<DocumentItem[]>(getInitialItems);

  // Reset form when initialData changes
  const resetForm = useCallback(() => {
    setFormData(getInitialFormData());
    setItems(getInitialItems());
  }, [getInitialFormData, getInitialItems]);

  const handleCustomerSelect = useCallback((customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    if (customer) {
      setFormData(prev => ({
        ...prev,
        customerId,
        customerName: customer.name,
        customerEmail: customer.email,
        customerPhone: customer.phone || ''
      }));
    }
  }, [customers]);

  const updateFormField = useCallback(<K extends keyof DocumentFormData>(
    field: K,
    value: DocumentFormData[K]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const addItem = useCallback(() => {
    const newItem: DocumentItem = {
      id: Date.now().toString(),
      description: '',
      quantity: 1,
      rate: 0,
      amount: 0
    };
    setItems(prev => [...prev, newItem]);
  }, []);

  const updateItem = useCallback((id: string, field: keyof DocumentItem, value: string | number) => {
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        if (field === 'quantity' || field === 'rate') {
          updated.amount = updated.quantity * updated.rate;
        }
        return updated;
      }
      return item;
    }));
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems(prev => {
      if (prev.length <= 1) return prev;
      return prev.filter(item => item.id !== id);
    });
  }, []);

  // Calculations
  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => sum + item.amount, 0);
  }, [items]);

  const discount = useMemo(() => {
    if (formData.discountType === 'percentage') {
      return (subtotal * formData.discountValue) / 100;
    }
    return formData.discountValue;
  }, [subtotal, formData.discountType, formData.discountValue]);

  const tax = useMemo(() => {
    return ((subtotal - discount) * formData.taxRate) / 100;
  }, [subtotal, discount, formData.taxRate]);

  const total = useMemo(() => {
    return subtotal - discount + tax;
  }, [subtotal, discount, tax]);

  // Validation
  const isValid = useMemo(() => {
    return (
      formData.customerName.trim() !== '' &&
      formData.subject.trim() !== '' &&
      items.every(item => item.description.trim() !== '')
    );
  }, [formData.customerName, formData.subject, items]);

  // Build insert object
  const buildInsertData = useCallback((): QuoteInvoiceInsert => {
    return {
      number: formData.documentNumber,
      customer_id: formData.customerId || null,
      customer_name: formData.customerName,
      customer_email: formData.customerEmail,
      issue_date: new Date(formData.issueDate).toISOString(),
      due_date: type === 'invoice' ? new Date(formData.dueDate).toISOString() : undefined,
      valid_until: type === 'quote' ? new Date(formData.validUntil).toISOString() : undefined,
      subject: formData.subject,
      notes: formData.notes,
      terms: formData.terms,
      subtotal,
      discount,
      tax,
      total,
      type,
      status: formData.status,
      items: items.map(item => ({
        description: item.description,
        quantity: item.quantity,
        rate: item.rate
      }))
    };
  }, [formData, items, type, subtotal, discount, tax, total]);

  return {
    formData,
    items,
    customers,
    // Actions
    handleCustomerSelect,
    updateFormField,
    addItem,
    updateItem,
    removeItem,
    resetForm,
    // Calculations
    subtotal,
    discount,
    tax,
    total,
    // Validation
    isValid,
    // Build data
    buildInsertData,
  };
};
