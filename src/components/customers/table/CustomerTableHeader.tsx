
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
    <TableHeader>
      <TableRow className="bg-gray-50/50 hover:bg-gray-50/80">
        <TableHead className="w-12">
          <Checkbox
            checked={isAllSelected}
            indeterminate={isPartiallySelected}
            onCheckedChange={onSelectAll}
            aria-label="Select all customers"
          />
        </TableHead>
        <TableHead className="font-semibold">Customer</TableHead>
        <TableHead className="font-semibold">Contact</TableHead>
        <TableHead className="font-semibold">Status</TableHead>
        <TableHead className="font-semibold">Tickets</TableHead>
        <TableHead className="font-semibold">Created</TableHead>
        <TableHead className="font-semibold">Last Updated</TableHead>
        <TableHead className="w-32 font-semibold">Actions</TableHead>
      </TableRow>
    </TableHeader>
  );
};

export default CustomerTableHeader;
