import React, { useCallback } from 'react';
import { Users, Ticket, Receipt, Download, Upload, FileSpreadsheet, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ImportDataType } from './types';

const DATA_TYPES = [
  { type: 'customers' as const, label: 'Customers', desc: 'Contacts, leads & accounts', icon: Users },
  { type: 'tickets' as const, label: 'Tickets', desc: 'Support tickets & cases', icon: Ticket },
  { type: 'invoices' as const, label: 'Invoices', desc: 'Financial records', icon: Receipt },
];

const CRM_GUIDES = [
  { name: 'HubSpot', steps: 'Contacts → Actions → Export → CSV' },
  { name: 'Salesforce', steps: 'Reports → Export → CSV / Data Export' },
  { name: 'Zoho CRM', steps: 'Module → ⋮ → Export → CSV' },
  { name: 'Pipedrive', steps: 'Contacts → Export filter results → CSV' },
];

interface DataTypeSelectorProps {
  dataType: ImportDataType;
  onDataTypeChange: (type: ImportDataType) => void;
  skipDuplicates: boolean;
  onSkipDuplicatesChange: (v: boolean) => void;
  isDragging: boolean;
  onDragging: (v: boolean) => void;
  onDrop: (e: React.DragEvent) => void;
  onFileInput: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDownloadTemplate: () => void;
}

const DataTypeSelector = ({
  dataType, onDataTypeChange, skipDuplicates, onSkipDuplicatesChange,
  isDragging, onDragging, onDrop, onFileInput, onDownloadTemplate,
}: DataTypeSelectorProps) => {
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    onDragging(true);
  }, [onDragging]);

  return (
    <div className="space-y-5">
      {/* Step 1: Data type */}
      <div>
        <p className="text-sm font-medium text-foreground mb-2">What are you importing?</p>
        <div className="grid gap-3 sm:grid-cols-3">
          {DATA_TYPES.map(item => {
            const Icon = item.icon;
            const isSelected = dataType === item.type;
            return (
              <Card
                key={item.type}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  isSelected
                    ? 'border-primary ring-2 ring-primary/20 bg-primary/5'
                    : 'hover:border-primary/40'
                }`}
                onClick={() => onDataTypeChange(item.type)}
              >
                <CardContent className="p-4 flex flex-col items-center text-center gap-1.5">
                  <div className={`p-2 rounded-xl transition-colors ${
                    isSelected ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground'
                  }`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-medium text-foreground text-sm">{item.label}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {dataType === 'customers' && (
        <div className="flex items-center justify-between p-3 rounded-lg border bg-card">
          <div>
            <p className="text-sm font-medium text-foreground">Skip duplicate emails</p>
            <p className="text-xs text-muted-foreground">Existing emails in your workspace will be skipped</p>
          </div>
          <Switch checked={skipDuplicates} onCheckedChange={onSkipDuplicatesChange} />
        </div>
      )}

      {/* Step 2: Upload */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-foreground">Upload your file</p>
          <Button variant="ghost" size="sm" onClick={onDownloadTemplate} className="text-muted-foreground text-xs h-7">
            <Download className="h-3.5 w-3.5 mr-1" /> Template
          </Button>
        </div>

        <div
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
            isDragging
              ? 'border-primary bg-primary/5 scale-[1.01]'
              : 'border-border hover:border-primary/40 hover:bg-muted/30'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={() => onDragging(false)}
          onDrop={onDrop}
        >
          <div className="p-2.5 rounded-2xl bg-muted/60 w-fit mx-auto mb-2">
            <Upload className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-foreground font-medium text-sm">Drop your file here</p>
          <p className="text-xs text-muted-foreground mt-1">CSV or Excel (.xlsx) — max 10MB</p>
          <Button variant="outline" size="sm" className="mt-3" asChild>
            <label className="cursor-pointer">
              <FileSpreadsheet className="h-4 w-4 mr-1.5" /> Browse Files
              <input type="file" accept=".csv,.xlsx,.xls" onChange={onFileInput} className="hidden" />
            </label>
          </Button>
        </div>
      </div>

      {/* CRM Guide */}
      <Alert className="border-muted">
        <HelpCircle className="h-4 w-4" />
        <AlertDescription>
          <p className="font-medium text-foreground mb-1 text-xs">How to export from your CRM:</p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
            {CRM_GUIDES.map(g => (
              <p key={g.name} className="text-xs text-muted-foreground">
                <span className="font-medium text-foreground">{g.name}</span> — {g.steps}
              </p>
            ))}
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default DataTypeSelector;
