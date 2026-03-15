import React from 'react';
import { Users, Ticket, Receipt, Download, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { ImportDataType } from './types';

const DATA_TYPES = [
  { type: 'customers' as const, label: 'Customers', desc: 'Contacts, leads & accounts', icon: Users },
  { type: 'tickets' as const, label: 'Tickets', desc: 'Support tickets & cases', icon: Ticket },
  { type: 'invoices' as const, label: 'Invoices', desc: 'Financial records', icon: Receipt },
];

interface DataTypeSelectorProps {
  dataType: ImportDataType;
  onDataTypeChange: (type: ImportDataType) => void;
  skipDuplicates: boolean;
  onSkipDuplicatesChange: (v: boolean) => void;
  onContinue: () => void;
  onDownloadTemplate: () => void;
}

const DataTypeSelector = ({
  dataType, onDataTypeChange, skipDuplicates, onSkipDuplicatesChange,
  onContinue, onDownloadTemplate,
}: DataTypeSelectorProps) => (
  <div className="space-y-5">
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
            <CardContent className="p-5 flex flex-col items-center text-center gap-2">
              <div className={`p-2.5 rounded-xl transition-colors ${
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

    {dataType === 'customers' && (
      <div className="flex items-center justify-between p-3 rounded-lg border bg-card">
        <div>
          <p className="text-sm font-medium text-foreground">Skip duplicate emails</p>
          <p className="text-xs text-muted-foreground">Existing emails in your workspace will be skipped</p>
        </div>
        <Switch checked={skipDuplicates} onCheckedChange={onSkipDuplicatesChange} />
      </div>
    )}

    <div className="flex items-center justify-between pt-1">
      <Button variant="ghost" size="sm" onClick={onDownloadTemplate} className="text-muted-foreground">
        <Download className="h-4 w-4 mr-1.5" /> Download Template
      </Button>
      <Button onClick={onContinue} size="sm">
        Continue <ArrowRight className="h-4 w-4 ml-1.5" />
      </Button>
    </div>
  </div>
);

export default DataTypeSelector;
