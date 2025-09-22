
import { useMemo } from 'react';
import { Customer } from '@/types/customer';
import { useCustomerCustomData } from './useCustomerCustomData';

export interface TableColumn {
  key: string;
  label: string;
  type: 'text' | 'status' | 'date' | 'custom';
  category: 'core' | 'personal' | 'business' | 'equipment';
  priority: number; // Lower number = higher priority
  width?: string;
  isRequired?: boolean;
  sortable: boolean;
}

const CORE_COLUMNS: TableColumn[] = [
  { key: 'name', label: 'Customer Name', type: 'text', category: 'core', priority: 1, isRequired: true, sortable: true },
  { key: 'email', label: 'Email', type: 'text', category: 'core', priority: 2, isRequired: true, sortable: true },
  { key: 'status', label: 'Status', type: 'status', category: 'core', priority: 3, isRequired: true, sortable: true },
  { key: 'phone', label: 'Phone', type: 'text', category: 'core', priority: 4, sortable: false },
  { key: 'createdAt', label: 'Created', type: 'date', category: 'core', priority: 10, sortable: true }
];

export const useDynamicTableColumns = (customers: Customer[], customerId?: string) => {
  // Extract template data from pre-loaded customer data to avoid N+1 queries
  const sampleCustomer = customers[0];
  const templateFields = sampleCustomer?._customData?.map((cd: any) => cd.template_fields).filter(Boolean).flat() || [];
  const equipmentData = sampleCustomer?._equipment || [];

  const columns = useMemo(() => {
    const allColumns: TableColumn[] = [...CORE_COLUMNS];

    // Add template-based columns for personal/business information
    templateFields
      .filter(field => field.category !== 'equipment')
      .forEach((field, index) => {
        allColumns.push({
          key: `custom_${field.field_name}`,
          label: field.field_label,
          type: 'custom',
          category: field.category as 'personal' | 'business',
          priority: field.category === 'personal' ? 5 + index : 7 + index,
          isRequired: field.is_required,
          sortable: false // Custom fields are typically not sortable
        });
      });

    // Add equipment summary columns for equipment-related templates
    if (equipmentData.length > 0) {
      allColumns.push(
        {
          key: 'equipment_count',
          label: 'Equipment Count',
          type: 'text',
          category: 'equipment',
          priority: 8,
          width: '120px',
          sortable: true
        },
        {
          key: 'primary_equipment',
          label: 'Primary Equipment',
          type: 'text',
          category: 'equipment',
          priority: 9,
          width: '200px',
          sortable: false
        }
      );
    }

    return allColumns.sort((a, b) => a.priority - b.priority);
  }, [templateFields, equipmentData]);

  const getVisibleColumns = (screenSize: 'mobile' | 'tablet' | 'desktop') => {
    switch (screenSize) {
      case 'mobile':
        // Show only the most essential columns on mobile
        return columns.filter(col => col.isRequired || col.priority <= 3).slice(0, 3);
      case 'tablet':
        // Show core and important custom columns on tablet
        return columns.filter(col => col.priority <= 7);
      default:
        // Show all columns on desktop
        return columns;
    }
  };

  const getColumnValue = (customer: Customer, columnKey: string) => {
    // Handle core columns
    if (columnKey in customer) {
      return customer[columnKey as keyof Customer];
    }

    // Handle custom fields from pre-loaded data
    if (columnKey.startsWith('custom_')) {
      const fieldName = columnKey.replace('custom_', '');
      const customData = (customer as any)._customData || [];
      const fieldData = customData.find((cd: any) => cd.template_fields?.field_name === fieldName);
      return fieldData?.field_value || '-';
    }

    // Handle equipment columns from per-customer data
    if (columnKey === 'equipment_count') {
      const customerEquipment = (customer as any)._equipment || [];
      return customerEquipment.length;
    }

    if (columnKey === 'primary_equipment') {
      const customerEquipment = (customer as any)._equipment || [];
      const primary = customerEquipment[0];
      return primary ? `${primary.brand || ''} ${primary.model || ''}`.trim() || 'No equipment' : 'No equipment';
    }

    return '';
  };

  return {
    columns,
    getColumnValue,
    getVisibleColumns,
    hasTemplateFields: templateFields.length > 0,
    hasEquipmentData: equipmentData.length > 0
  };
};
