
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Download, Users } from 'lucide-react';

interface BulkActionsBarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onExport: () => void;
}

const BulkActionsBar = ({
  selectedCount,
  onClearSelection,
  onExport,
}: BulkActionsBarProps) => {
  return (
    <div className="flex items-center justify-between px-4 py-2.5 bg-quikle-primary/5 border border-quikle-primary/20 rounded-lg">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-quikle-primary" />
          <Badge className="bg-quikle-primary text-white font-medium">
            {selectedCount} selected
          </Badge>
        </div>
        
        <div className="hidden sm:flex items-center gap-2 border-l border-quikle-primary/20 pl-3">
          <Button 
            variant="outline" 
            size="sm"
            onClick={onExport}
            className="h-7 text-xs border-quikle-primary/30 text-quikle-primary hover:bg-quikle-primary/10"
          >
            <Download className="h-3.5 w-3.5 mr-1.5" />
            Export Selected
          </Button>
        </div>
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={onClearSelection}
        className="h-7 text-xs text-quikle-slate hover:text-quikle-charcoal"
      >
        <X className="h-3.5 w-3.5 mr-1" />
        Clear
      </Button>
    </div>
  );
};

export default BulkActionsBar;
