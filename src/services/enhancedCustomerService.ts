
import { supabase } from '@/integrations/supabase/client';
import { Customer } from '@/types/customer';
import { CustomDataService } from './customDataService';
import { EnhancedCustomer } from '@/types/customData';

export class EnhancedCustomerService {
  // Create customer with optional template application
  static async createCustomerWithTemplate(
    customerData: Omit<Customer, 'id' | 'createdAt' | 'updatedAt' | 'activeTickets' | 'ticketCount'>,
    userId: string,
    templateId?: string
  ): Promise<EnhancedCustomer> {
    try {
      // Create the customer first
      const { data: customer, error: customerError } = await supabase
        .from('customers')
        .insert({
          user_id: userId,
          name: customerData.name,
          email: customerData.email,
          phone: customerData.phone,
          address: customerData.address,
          contact_person: customerData.contact_person,
          company_address: customerData.company_address,
          status: customerData.status,
          notes: customerData.notes,
        })
        .select()
        .single();

      if (customerError) throw customerError;

      // Apply template if provided
      if (templateId) {
        await CustomDataService.applyTemplateToCustomer(customer.id, templateId, userId);
      }

      // Return enhanced customer data
      const enhancedCustomer = await CustomDataService.getEnhancedCustomer(customer.id, userId);
      return enhancedCustomer || {
        ...customer,
        custom_fields: [],
        applied_templates: []
      };
    } catch (error) {
      console.error('Error creating customer with template:', error);
      throw error;
    }
  }

  // Get customer with all custom data
  static async getEnhancedCustomer(customerId: string, userId: string): Promise<EnhancedCustomer | null> {
    return await CustomDataService.getEnhancedCustomer(customerId, userId);
  }

  // Update customer and optionally manage templates
  static async updateCustomer(
    customerId: string,
    updates: Partial<Customer>,
    userId: string
  ): Promise<void> {
    const { error } = await supabase
      .from('customers')
      .update(updates)
      .eq('id', customerId)
      .eq('user_id', userId);

    if (error) throw error;
  }
}
