
import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

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
  const getSortIcon = (field: string) => {
    if (sortBy !== field) {
      return <ArrowUpDown className="ml-1 h-3 w-3 opacity-50" />;
    }
    return sortOrder === 'asc' ? (
      <ArrowUp className="ml-1 h-3 w-3" />
    ) : (
      <ArrowDown className="ml-1 h-3 w-3" />
    );
  };

  const handleKeyDown = (event: React.KeyboardEvent, action: () => void) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      action();
    }
  };

  const getSortLabel = (field: string, displayName: string) => {
    const direction = sortBy === field ? (sortOrder === 'asc' ? 'ascending' : 'descending') : 'none';
    return `Sort by ${displayName}, currently ${direction}`;
  };

  const getAriaSortValue = (field: string): "none" | "ascending" | "descending" => {
    if (sortBy !== field) return 'none';
    return sortOrder === 'asc' ? 'ascending' : 'descending';
  };

  return (
    <thead className="bg-gray-50" role="rowgroup">
      <tr role="row">
        <th 
          className="w-12 px-6 py-3 text-left"
          scope="col"
          role="columnheader"
        >
          <Checkbox
            checked={isAllSelected}
            onCheckedChange={onSelectAll}
            aria-label="Select all customers"
            className={`transition-colors ${
              isIndeterminate ? "data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground" : ""
            }`}
          />
        </th>
        <th 
          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
          scope="col"
          role="columnheader"
          aria-sort={getAriaSortValue('name')}
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onSort('name')}
            onKeyDown={(e) => handleKeyDown(e, () => onSort('name'))}
            className="h-auto p-0 font-medium text-gray-500 hover:text-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
            aria-label={getSortLabel('name', 'name')}
          >
            Name
            {getSortIcon('name')}
          </Button>
        </th>
        <th 
          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
          scope="col"
          role="columnheader"
        >
          Contact Info
        </th>
        <th 
          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
          scope="col"
          role="columnheader"
          aria-sort={getAriaSortValue('status')}
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onSort('status')}
            onKeyDown={(e) => handleKeyDown(e, () => onSort('status'))}
            className="h-auto p-0 font-medium text-gray-500 hover:text-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
            aria-label={getSortLabel('status', 'status')}
          >
            Status
            {getSortIcon('status')}
          </Button>
        </th>
        <th 
          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
          scope="col"
          role="columnheader"
        >
          Tickets
        </th>
        <th 
          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
          scope="col"
          role="columnheader"
          aria-sort={getAriaSortValue('createdAt')}
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onSort('createdAt')}
            onKeyDown={(e) => handleKeyDown(e, () => onSort('createdAt'))}
            className="h-auto p-0 font-medium text-gray-500 hover:text-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
            aria-label={getSortLabel('createdAt', 'creation date')}
          >
            Created
            {getSortIcon('createdAt')}
          </Button>
        </th>
        <th 
          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
          scope="col"
          role="columnheader"
        >
          <span className="sr-only">Actions</span>
          Actions
        </th>
      </tr>
    </thead>
  );
};

export default CustomerTableHeader;
