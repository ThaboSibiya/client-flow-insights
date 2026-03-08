
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Download, Users, Trash2 } from 'lucide-react';
import { CustomerStatus } from '@/context/CRMContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface BulkActionsBarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onExport: () => void;
  onBulkStatusChange?: (status: CustomerStatus) => void;
  onBulkDelete?: () => void;
}

const BulkActionsBar = ({
  selectedCount,
  onClearSelection,
  onExport,
  onBulkStatusChange,
  onBulkDelete,
}: BulkActionsBarProps) => {
  return (
    <div className="flex items-center justify-between px-4 py-2.5 bg-primary/5 border border-primary/20 rounded-lg">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-primary" />
          <Badge className="bg-primary text-primary-foreground font-medium text-xs">
            {selectedCount} selected
          </Badge>
        </div>
        
        <div className="hidden sm:flex items-center gap-1.5 border-l border-primary/20 pl-3">
          <Button 
            variant="outline" 
            size="sm"
            onClick={onExport}
            className="h-7 text-xs"
          >
            <Download className="h-3.5 w-3.5 mr-1.5" />
            Export
          </Button>

          {onBulkStatusChange && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-7 text-xs">
                  Set Status
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {(['new', 'existing', 'pending', 'finalised'] as CustomerStatus[]).map((s) => (
                  <DropdownMenuItem key={s} onClick={() => onBulkStatusChange(s)} className="text-xs capitalize">
                    {s}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {onBulkDelete && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={onBulkDelete}
              className="h-7 text-xs text-destructive border-destructive/30 hover:bg-destructive/10"
            >
              <Trash2 className="h-3.5 w-3.5 mr-1.5" />
              Delete
            </Button>
          )}
        </div>
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={onClearSelection}
        className="h-7 text-xs text-muted-foreground hover:text-foreground"
      >
        <X className="h-3.5 w-3.5 mr-1" />
        Clear
      </Button>
    </div>
  );
};

export default BulkActionsBar;
