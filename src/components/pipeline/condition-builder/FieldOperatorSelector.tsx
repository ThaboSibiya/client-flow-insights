
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Condition {
  id: string;
  field: string;
  operator: string;
  value: string;
  type: 'text' | 'number' | 'date' | 'boolean';
  error?: string;
}

interface FieldOperatorSelectorProps {
  condition: Condition;
  onUpdate: (updates: Partial<Condition>) => void;
}

const FieldOperatorSelector = ({ condition, onUpdate }: FieldOperatorSelectorProps) => {
  const fieldOptions = [
    { value: 'customer.status', label: 'Customer Status', type: 'text' },
    { value: 'customer.created_date', label: 'Customer Created Date', type: 'date' },
    { value: 'customer.last_activity', label: 'Last Activity', type: 'date' },
    { value: 'customer.priority', label: 'Priority', type: 'text' },
    { value: 'ticket.status', label: 'Ticket Status', type: 'text' },
    { value: 'ticket.priority', label: 'Ticket Priority', type: 'text' },
    { value: 'ticket.created_date', label: 'Ticket Created Date', type: 'date' },
    { value: 'ticket.assigned_to', label: 'Assigned To', type: 'text' },
    { value: 'custom.field_1', label: 'Custom Field 1', type: 'text' },
    { value: 'custom.field_2', label: 'Custom Field 2', type: 'number' }
  ];

  const operatorOptions = {
    text: [
      { value: 'equals', label: 'Equals' },
      { value: 'not_equals', label: 'Not Equals' },
      { value: 'contains', label: 'Contains' },
      { value: 'starts_with', label: 'Starts With' },
      { value: 'ends_with', label: 'Ends With' }
    ],
    number: [
      { value: 'equals', label: 'Equals' },
      { value: 'greater_than', label: 'Greater Than' },
      { value: 'less_than', label: 'Less Than' },
      { value: 'greater_equal', label: 'Greater or Equal' },
      { value: 'less_equal', label: 'Less or Equal' }
    ],
    date: [
      { value: 'equals', label: 'On Date' },
      { value: 'before', label: 'Before' },
      { value: 'after', label: 'After' },
      { value: 'days_ago', label: 'Days Ago' },
      { value: 'days_from_now', label: 'Days From Now' }
    ]
  };

  const getFieldType = (fieldValue: string): 'text' | 'number' | 'date' => {
    const field = fieldOptions.find(f => f.value === fieldValue);
    return field?.type as 'text' | 'number' | 'date' || 'text';
  };

  return (
    <>
      <Select 
        value={condition.field} 
        onValueChange={(value) => {
          const fieldType = getFieldType(value);
          onUpdate({ 
            field: value, 
            type: fieldType,
            operator: '', // Reset operator when field changes
            value: '' // Reset value when field changes
          });
        }}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select field..." />
        </SelectTrigger>
        <SelectContent>
          {fieldOptions.map((field) => (
            <SelectItem key={field.value} value={field.value}>
              {field.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select 
        value={condition.operator} 
        onValueChange={(value) => onUpdate({ operator: value })}
        disabled={!condition.field}
      >
        <SelectTrigger>
          <SelectValue placeholder="Operator..." />
        </SelectTrigger>
        <SelectContent>
          {operatorOptions[condition.type]?.map((op) => (
            <SelectItem key={op.value} value={op.value}>
              {op.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </>
  );
};

export default FieldOperatorSelector;
