
import React from 'react';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ReportField, CustomReport } from '../CustomReportBuilder';

interface FieldSelectorProps {
  availableFields: ReportField[];
  selectedFields: ReportField[];
  onFieldToggle: (fieldId: string) => void;
}

const FieldSelector = ({ availableFields, selectedFields, onFieldToggle }: FieldSelectorProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium">Select Fields</h4>
        <Badge variant="secondary">{selectedFields.length} selected</Badge>
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        {availableFields.map((field) => (
          <div key={field.id} className="flex items-center space-x-2">
            <Checkbox
              id={field.id}
              checked={selectedFields.some(f => f.id === field.id)}
              onCheckedChange={() => onFieldToggle(field.id)}
            />
            <Label htmlFor={field.id} className="text-sm">{field.name}</Label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FieldSelector;
