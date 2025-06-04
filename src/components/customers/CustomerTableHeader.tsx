
import React from 'react';
import { TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';

interface CustomerTableHeaderProps {
  isAllSelected: boolean;
  isPartiallySelected: boolean;
  onSelectAll: (checked: boolean) => void;
}

const CustomerTableHeader = ({
  isAllSelected,
  isPartiallySelected,
  onSelectAll
}: CustomerTableHeaderProps) => {
  return (
    <TableHeader className="bg-gradient-to-r from-gray-50 to-gray-100">
      <TableRow>
        <TableHead className="w-12">
          <Checkbox
            checked={isAllSelected}
            onCheckedChange={onSelectAll}
            className={isPartiallySelected ? 'data-[state=indeterminate]:bg-primary' : ''}
          />
        </TableHead>
        <TableHead className="font-medium">Name</TableHead>
        <TableHead className="font-medium">Email</TableHead>
        <TableHead className="font-medium">Phone</TableHead>
        <TableHead className="font-medium">Status</TableHead>
        <TableHead className="font-medium">Tickets</TableHead>
        <TableHead className="font-medium">Created</TableHead>
        <TableHead className="font-medium text-right">Actions</TableHead>
      </TableRow>
    </TableHeader>
  );
};

export default CustomerTableHeader;
