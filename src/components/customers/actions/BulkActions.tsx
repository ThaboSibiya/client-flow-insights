
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Trash2, Download, Mail, Users } from 'lucide-react';
import { CustomerStatus } from '@/types/customer';

interface BulkActionsProps {
  selectedCount: number;
  onBulkStatusChange: (status: CustomerStatus) => void;
  onBulkDelete: () => void;
  onBulkExport: () => void;
  onClearSelection: () => void;
}

const BulkActions = ({
  selectedCount,
  onBulkStatusChange,
  onBulkDelete,
  onBulkExport,
  onClearSelection
}: BulkActionsProps) => {
  if (selectedCount === 0) return null;

  return (
    <div className="flex items-center gap-4 p-4 bg-blue-50 border border-blue-200 rounded-lg mb-4">
      <div className="flex items-center gap-2">
        <Users className="h-4 w-4 text-blue-600" />
        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
          {selectedCount} selected
        </Badge>
      </div>

      <div className="flex items-center gap-2 flex-1">
        <Select onValueChange={(value) => onBulkStatusChange(value as CustomerStatus)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Change status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="new">Mark as New</SelectItem>
            <SelectItem value="existing">Mark as Existing</SelectItem>
            <SelectItem value="pending">Mark as Pending</SelectItem>
            <SelectItem value="finalised">Mark as Finalised</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" size="sm" onClick={onBulkExport}>
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>

        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700" onClick={onBulkDelete}>
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </Button>
      </div>

      <Button variant="ghost" size="sm" onClick={onClearSelection}>
        Clear Selection
      </Button>
    </div>
  );
};

export default BulkActions;
