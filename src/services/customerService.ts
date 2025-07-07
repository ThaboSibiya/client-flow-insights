
import { supabase } from '@/integrations/supabase/client';
import { Customer, CustomerEquipment, CustomerStatus } from '@/types/customer';

export const createCustomerWithEquipment = async (
  customerData: Omit<Customer, 'id' | 'createdAt' | 'updatedAt' | 'activeTickets' | 'ticketCount'>,
  userId: string,
  equipmentData?: Omit<CustomerEquipment, 'id' | 'customer_id' | 'user_id' | 'created_at' | 'updated_at'>
) => {
  try {
    // Create customer
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

    // Create equipment if provided
    let equipment = null;
    if (equipmentData && customer) {
      const { data: equipmentRecord, error: equipmentError } = await supabase
        .from('customer_equipment')
        .insert({
          customer_id: customer.id,
          user_id: userId,
          equipment_type: equipmentData.equipment_type,
          brand: equipmentData.brand,
          model: equipmentData.model,
          serial_number: equipmentData.serial_number,
          purchase_date: equipmentData.purchase_date?.toISOString().split('T')[0],
          warranty_expiry: equipmentData.warranty_expiry?.toISOString().split('T')[0],
          notes: equipmentData.notes,
        })
        .select()
        .single();

      if (equipmentError) {
        console.error('Equipment creation error:', equipmentError);
        // Don't fail the whole operation if equipment creation fails
      } else {
        equipment = equipmentRecord;
      }
    }

    // Create initial ticket if equipment was added
    if (equipment && customer) {
      const ticketSubject = `New ${equipmentData?.equipment_type} Setup - ${equipmentData?.brand} ${equipmentData?.model}`;
      const ticketDescription = `
Customer: ${customer.name}
Contact: ${customer.contact_person || 'N/A'}
Equipment: ${equipmentData?.brand} ${equipmentData?.model}
Serial Number: ${equipmentData?.serial_number || 'N/A'}
Purchase Date: ${equipmentData?.purchase_date || 'N/A'}

This ticket was automatically created during customer onboarding for equipment setup and configuration.
      `.trim();

      const { error: ticketError } = await supabase
        .from('tickets')
        .insert({
          user_id: userId,
          customer_id: customer.id,
          ticket_number: `TKT-${Date.now().toString().slice(-6)}`,
          subject: ticketSubject,
          description: ticketDescription,
          status: 'open',
          priority: 'medium',
        });

      if (ticketError) {
        console.error('Ticket creation error:', ticketError);
      }
    }

    return {
      ...customer,
      address: customer.address || '',
      contact_person: customer.contact_person || '',
      company_address: customer.company_address || '',
      equipment: equipment ? [equipment] : [],
      activeTickets: [],
      ticketCount: equipment ? 1 : 0,
      createdAt: new Date(customer.created_at),
      updatedAt: new Date(customer.updated_at),
    };
  } catch (error) {
    console.error('Error creating customer with equipment:', error);
    throw error;
  }
};

export const getCustomerWithEquipment = async (customerId: string, userId: string) => {
  try {
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('*')
      .eq('id', customerId)
      .eq('user_id', userId)
      .single();

    if (customerError) throw customerError;

    const { data: equipment, error: equipmentError } = await supabase
      .from('customer_equipment')
      .select('*')
      .eq('customer_id', customerId)
      .eq('user_id', userId);

    if (equipmentError) {
      console.error('Equipment fetch error:', equipmentError);
    }

    return {
      ...customer,
      equipment: equipment || [],
      createdAt: new Date(customer.created_at),
      updatedAt: new Date(customer.updated_at),
    };
  } catch (error) {
    console.error('Error fetching customer with equipment:', error);
    throw error;
  }
};

export const addCustomer = async (
  customerData: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>,
  userId: string
): Promise<Customer> => {
  const { data, error } = await supabase
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

  if (error) throw error;

  return {
    ...data,
    address: data.address || '',
    contact_person: data.contact_person || '',
    company_address: data.company_address || '',
    status: data.status as CustomerStatus,
    equipment: [],
    activeTickets: [],
    ticketCount: 0,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  };
};

export const updateCustomerStatus = async (
  customerId: string,
  status: CustomerStatus,
  userId: string
) => {
  const { error } = await supabase
    .from('customers')
    .update({ status })
    .eq('id', customerId)
    .eq('user_id', userId);

  if (error) throw error;
};

export const updateCustomer = async (
  customerId: string,
  customerData: Partial<Customer>,
  userId: string
) => {
  const { error } = await supabase
    .from('customers')
    .update(customerData)
    .eq('id', customerId)
    .eq('user_id', userId);

  if (error) throw error;
};

export const deleteCustomer = async (customerId: string, userId: string) => {
  const { error } = await supabase
    .from('customers')
    .delete()
    .eq('id', customerId)
    .eq('user_id', userId);

  if (error) throw error;
};
