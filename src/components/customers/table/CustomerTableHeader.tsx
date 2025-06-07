
import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { ArrowUpDown } from 'lucide-react';

interface CustomerTableHeaderProps {
  isAllSelected: boolean;
  isIndeterminate: boolean;
  onSelectAll: (checked: boolean) => void;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onSort: (field: string) => void;
}

const CustomerTableHeader = ({
  isAllSelected,
  isIndeterminate,
  onSelectAll,
  sortBy,
  sortOrder,
  onSort,
}: CustomerTableHeaderProps) => {
  return (
    <thead className="bg-gray-50">
      <tr>
        <th className="w-12 px-6 py-3 text-left">
          <Checkbox
            checked={isAllSelected}
            ref={(el) => {
              if (el) el.indeterminate = isIndeterminate;
            }}
            onCheckedChange={onSelectAll}
            aria-label="Select all customers"
          />
        </th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onSort('name')}
            className="h-auto p-0 font-medium text-gray-500 hover:text-gray-700"
          >
            Name
            <ArrowUpDown className="ml-1 h-3 w-3" />
          </Button>
        </th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Contact Info
        </th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onSort('status')}
            className="h-auto p-0 font-medium text-gray-500 hover:text-gray-700"
          >
            Status
            <ArrowUpDown className="ml-1 h-3 w-3" />
          </Button>
        </th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Tickets
        </th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onSort('createdAt')}
            className="h-auto p-0 font-medium text-gray-500 hover:text-gray-700"
          >
            Created
            <ArrowUpDown className="ml-1 h-3 w-3" />
          </Button>
        </th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Actions
        </th>
      </tr>
    </thead>
  );
};

export default CustomerTableHeader;
