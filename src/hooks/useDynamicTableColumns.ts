
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
}

const CORE_COLUMNS: TableColumn[] = [
  { key: 'name', label: 'Customer Name', type: 'text', category: 'core', priority: 1, isRequired: true },
  { key: 'email', label: 'Email', type: 'text', category: 'core', priority: 2, isRequired: true },
  { key: 'status', label: 'Status', type: 'status', category: 'core', priority: 3, isRequired: true },
  { key: 'phone', label: 'Phone', type: 'text', category: 'core', priority: 4 },
  { key: 'createdAt', label: 'Created', type: 'date', category: 'core', priority: 10 }
];

export const useDynamicTableColumns = (customers: Customer[], customerId?: string) => {
  // Use the first customer's data to determine available template fields
  const sampleCustomerId = customerId || customers[0]?.id || '';
  const { templateFields, customData, equipmentData } = useCustomerCustomData(sampleCustomerId);

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
          isRequired: field.is_required
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
          width: '120px'
        },
        {
          key: 'primary_equipment',
          label: 'Primary Equipment',
          type: 'text',
          category: 'equipment',
          priority: 9,
          width: '200px'
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

    // Handle custom fields
    if (columnKey.startsWith('custom_')) {
      const fieldName = columnKey.replace('custom_', '');
      // This would need to be enriched with actual custom data per customer
      return 'Custom data'; // Placeholder - would need per-customer data
    }

    // Handle equipment columns
    if (columnKey === 'equipment_count') {
      return equipmentData.length;
    }

    if (columnKey === 'primary_equipment') {
      const primary = equipmentData[0];
      return primary ? `${primary.brand} ${primary.model}` : 'No equipment';
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
