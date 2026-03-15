import React, { useCallback } from 'react';
import { Upload, FileSpreadsheet, ArrowLeft, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface FileUploadZoneProps {
  isDragging: boolean;
  onDragging: (v: boolean) => void;
  onDrop: (e: React.DragEvent) => void;
  onFileInput: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBack: () => void;
}

const CRM_GUIDES = [
  { name: 'HubSpot', steps: 'Contacts → Actions → Export → CSV' },
  { name: 'Salesforce', steps: 'Reports → Export → CSV / Data Export' },
  { name: 'Zoho CRM', steps: 'Module → ⋮ → Export → CSV' },
  { name: 'Pipedrive', steps: 'Contacts → Export filter results → CSV' },
  { name: 'Freshsales', steps: 'Contacts → Settings → Export' },
  { name: 'Other', steps: 'Export as CSV or Excel (.xlsx)' },
];

const FileUploadZone = ({ isDragging, onDragging, onDrop, onFileInput, onBack }: FileUploadZoneProps) => {
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    onDragging(true);
  }, [onDragging]);

  return (
    <div className="space-y-4">
      <Alert className="border-muted">
        <HelpCircle className="h-4 w-4" />
        <AlertDescription>
          <p className="font-medium text-foreground mb-2">How to export from your CRM:</p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            {CRM_GUIDES.map(g => (
              <p key={g.name} className="text-xs text-muted-foreground">
                <span className="font-medium text-foreground">{g.name}</span> — {g.steps}
              </p>
            ))}
          </div>
        </AlertDescription>
      </Alert>

      <div
        className={`border-2 border-dashed rounded-xl p-10 text-center transition-all ${
          isDragging
            ? 'border-primary bg-primary/5 scale-[1.01]'
            : 'border-border hover:border-primary/40 hover:bg-muted/30'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={() => onDragging(false)}
        onDrop={onDrop}
      >
        <div className="p-3 rounded-2xl bg-muted/60 w-fit mx-auto mb-3">
          <Upload className="h-8 w-8 text-muted-foreground" />
        </div>
        <p className="text-foreground font-medium">Drop your file here</p>
        <p className="text-sm text-muted-foreground mt-1">CSV, XLS, or XLSX — max 10MB</p>
        <Button variant="outline" size="sm" className="mt-4" asChild>
          <label className="cursor-pointer">
            <FileSpreadsheet className="h-4 w-4 mr-1.5" /> Browse Files
            <input type="file" accept=".csv,.xlsx,.xls" onChange={onFileInput} className="hidden" />
          </label>
        </Button>
      </div>

      <div className="flex justify-start">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </Button>
      </div>
    </div>
  );
};

export default FileUploadZone;
