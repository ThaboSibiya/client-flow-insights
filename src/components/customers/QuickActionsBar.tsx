
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Keyboard, Download, FileText, Settings } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface QuickActionsBarProps {
  onExportCSV: () => void;
  onExportJSON: () => void;
  onExportExcel: () => void;
  shortcuts: Array<{ key: string; description: string; ctrlKey?: boolean; shiftKey?: boolean }>;
}

const QuickActionsBar = ({ 
  onExportCSV, 
  onExportJSON, 
  onExportExcel,
  shortcuts 
}: QuickActionsBarProps) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 bg-gray-50 border rounded-lg mb-4 gap-3">
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
        <span className="text-sm font-medium text-gray-700">Quick Actions:</span>
        
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={onExportCSV} className="text-xs sm:text-sm">
            <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5" />
            <span className="hidden xs:inline">Export</span> CSV
          </Button>
          
          <Button variant="outline" size="sm" onClick={onExportJSON} className="text-xs sm:text-sm">
            <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5" />
            <span className="hidden xs:inline">Export</span> JSON
          </Button>
          
          <Button variant="outline" size="sm" onClick={onExportExcel} className="text-xs sm:text-sm">
            <Settings className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5" />
            <span className="hidden xs:inline">Export</span> Excel
          </Button>
        </div>
      </div>

      <Dialog>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm" className="self-start sm:self-auto text-xs sm:text-sm">
            <Keyboard className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5" />
            Shortcuts
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Keyboard Shortcuts</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {shortcuts.map((shortcut, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-700">{shortcut.description}</span>
                <div className="flex items-center gap-1">
                  {shortcut.ctrlKey && <Badge variant="outline" className="text-xs">Ctrl</Badge>}
                  {shortcut.shiftKey && <Badge variant="outline" className="text-xs">Shift</Badge>}
                  <Badge variant="outline" className="text-xs">{shortcut.key.toUpperCase()}</Badge>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default QuickActionsBar;
