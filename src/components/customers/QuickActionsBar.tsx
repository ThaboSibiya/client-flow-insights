
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
    <div className="flex items-center justify-between p-3 bg-gray-50 border rounded-lg mb-4">
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-gray-700">Quick Actions:</span>
        
        <Button variant="outline" size="sm" onClick={onExportCSV}>
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
        
        <Button variant="outline" size="sm" onClick={onExportJSON}>
          <FileText className="h-4 w-4 mr-2" />
          Export JSON
        </Button>
        
        <Button variant="outline" size="sm" onClick={onExportExcel}>
          <Settings className="h-4 w-4 mr-2" />
          Export Excel
        </Button>
      </div>

      <Dialog>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm">
            <Keyboard className="h-4 w-4 mr-2" />
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
