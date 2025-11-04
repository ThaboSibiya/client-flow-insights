import { supabase } from '@/integrations/supabase/client';

const PROJECT_REF = 'oquiaxbnkdnpixqhqdfq';
const FUNCTIONS_URL = `https://${PROJECT_REF}.supabase.co/functions/v1`;

export const financeApiService = {
  /**
   * GET /api/customers/:id/finance-summary
   * Fetch financial summary for a customer
   */
  async getFinanceSummary(customerId: string) {
    const { data, error } = await supabase.functions.invoke('customer-finance-summary', {
      body: {},
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (error) throw error;
    return data;
  },

  /**
   * GET /api/customers/:id/finance-notes
   * Retrieve all finance notes for a customer
   */
  async getFinanceNotes(customerId: string) {
    const { data, error } = await supabase.functions.invoke('customer-finance-notes', {
      body: {},
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (error) throw error;
    return data;
  },

  /**
   * POST /api/customers/:id/finance-notes
   * Add a new finance note
   */
  async addFinanceNote(customerId: string, noteData: {
    note: string;
    tag?: string;
    created_by: string;
  }) {
    const { data, error } = await supabase.functions.invoke('customer-finance-notes', {
      body: {
        customerId,
        ...noteData
      },
      method: 'POST',
    });

    if (error) throw error;
    return data;
  },

  /**
   * GET /api/customers/:id/transactions
   * Fetch all transactions (invoices, payments) for a customer
   */
  async getTransactions(customerId: string, filter?: 'overdue') {
    const queryParams = new URLSearchParams();
    queryParams.append('customerId', customerId);
    if (filter) queryParams.append('filter', filter);

    const { data, error } = await supabase.functions.invoke('customer-transactions', {
      body: {},
      method: 'GET',
    });

    if (error) throw error;
    return data;
  },

  /**
   * GET /api/customers/:id/transactions?filter=overdue
   * Fetch overdue transactions
   */
  async getOverdueTransactions(customerId: string) {
    return this.getTransactions(customerId, 'overdue');
  },

  /**
   * POST /api/customers/:id/add-payment
   * Log a new payment for a customer
   */
  async addPayment(customerId: string, paymentData: {
    amount: number;
    payment_method: string;
    invoice_id?: string;
    reference_number?: string;
    notes?: string;
  }) {
    const { data, error } = await supabase.functions.invoke('customer-add-payment', {
      body: {
        customerId,
        ...paymentData
      },
      method: 'POST',
    });

    if (error) throw error;
    return data;
  },

  /**
   * POST /api/customers/:id/generate-statement
   * Generate a statement for the customer
   */
  async generateStatement(customerId: string, options?: {
    startDate?: string;
    endDate?: string;
  }) {
    const { data, error } = await supabase.functions.invoke('customer-generate-statement', {
      body: {
        customerId,
        ...options
      },
      method: 'POST',
    });

    if (error) throw error;
    return data;
  }
};

// Direct URL-based calls (alternative approach if needed)
export const financeApiDirectService = {
  async callFunction(functionName: string, options: {
    method?: string;
    body?: any;
    queryParams?: Record<string, string>;
  }) {
    const { method = 'GET', body, queryParams } = options;
    
    const url = new URL(`${FUNCTIONS_URL}/${functionName}`);
    if (queryParams) {
      Object.entries(queryParams).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }

    const { data: { session } } = await supabase.auth.getSession();
    
    const response = await fetch(url.toString(), {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session?.access_token}`,
      },
      ...(body && { body: JSON.stringify(body) })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'API request failed');
    }

    return response.json();
  },

  async getFinanceSummary(customerId: string) {
    return this.callFunction('customer-finance-summary', {
      queryParams: { customerId }
    });
  },

  async getFinanceNotes(customerId: string) {
    return this.callFunction('customer-finance-notes', {
      queryParams: { customerId }
    });
  },

  async addFinanceNote(customerId: string, noteData: any) {
    return this.callFunction('customer-finance-notes', {
      method: 'POST',
      body: { customerId, ...noteData }
    });
  },

  async getTransactions(customerId: string, filter?: string) {
    const queryParams: Record<string, string> = { customerId };
    if (filter) queryParams.filter = filter;
    
    return this.callFunction('customer-transactions', {
      queryParams
    });
  },

  async addPayment(customerId: string, paymentData: any) {
    return this.callFunction('customer-add-payment', {
      method: 'POST',
      body: { customerId, ...paymentData }
    });
  },

  async generateStatement(customerId: string, options?: any) {
    return this.callFunction('customer-generate-statement', {
      method: 'POST',
      body: { customerId, ...options }
    });
  }
};
