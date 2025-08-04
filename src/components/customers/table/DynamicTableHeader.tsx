
import React from 'react';
import { TableHead, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowUpDown } from 'lucide-react';
import { TableColumn } from '@/hooks/useDynamicTableColumns';

interface DynamicTableHeaderProps {
  columns: TableColumn[];
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onSort: (field: string) => void;
  isAllSelected: boolean;
  onSelectAll: (checked: boolean) => void;
  screenSize?: 'mobile' | 'tablet' | 'desktop';
}

const DynamicTableHeader = ({
  columns,
  sortBy,
  sortOrder,
  onSort,
  isAllSelected,
  onSelectAll,
  screenSize = 'desktop'
}: DynamicTableHeaderProps) => {
  const getSortIcon = (field: string) => {
    if (sortBy !== field) return <ArrowUpDown className="h-4 w-4 text-quikle-neutral/50" />;
    return (
      <ArrowUpDown 
        className={`h-4 w-4 text-quikle-primary transition-transform ${
          sortOrder === 'desc' ? 'rotate-180' : ''
        }`} 
      />
    );
  };

  const getVisibleColumns = () => {
    switch (screenSize) {
      case 'mobile':
        return columns.filter(col => col.isRequired || col.priority <= 3).slice(0, 2);
      case 'tablet':
        return columns.filter(col => col.priority <= 7);
      default:
        return columns;
    }
  };

  const visibleColumns = getVisibleColumns();

  return (
    <TableRow className="bg-quikle-crystal/30 hover:bg-quikle-crystal/30 border-b border-quikle-silver/30">
      <TableHead className="w-12 px-4 py-3">
        <Checkbox
          checked={isAllSelected}
          onCheckedChange={onSelectAll}
          className="border-quikle-silver data-[state=checked]:bg-quikle-primary"
        />
      </TableHead>
      
      {visibleColumns.map((column) => (
        <TableHead key={column.key} className="px-4 py-3">
          {column.sortable ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onSort(column.key)}
              className="h-auto p-0 hover:bg-transparent font-medium text-quikle-charcoal hover:text-quikle-primary"
            >
              {column.label}
              <span className="ml-1">{getSortIcon(column.key)}</span>
            </Button>
          ) : (
            <span className="font-medium text-quikle-charcoal">{column.label}</span>
          )}
        </TableHead>
      ))}
      
      <TableHead className="w-16 px-4 py-3">
        <span className="sr-only">Actions</span>
      </TableHead>
    </TableRow>
  );
};

export default DynamicTableHeader;
