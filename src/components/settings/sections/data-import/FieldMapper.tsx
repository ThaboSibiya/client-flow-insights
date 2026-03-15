import React from 'react';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ImportDataType, FieldMapping, ParsedRow, CRM_FIELDS } from './types';

interface FieldMapperProps {
  dataType: ImportDataType;
  fileName: string;
  rowCount: number;
  fieldMappings: FieldMapping[];
  headerCount: number;
  sampleRow: ParsedRow | undefined;
  missingRequired: string[];
  onUpdateMapping: (csvColumn: string, crmField: string) => void;
  onBack: () => void;
  onContinue: () => void;
}

const FieldMapper = ({
  dataType, fileName, rowCount, fieldMappings, headerCount,
  sampleRow, missingRequired, onUpdateMapping, onBack, onContinue,
}: FieldMapperProps) => {
  const mappedCount = fieldMappings.filter(m => m.crmField !== '_skip').length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium text-foreground">Map Your Columns</h3>
          <p className="text-xs text-muted-foreground">
            {fileName} • {rowCount} rows • {mappedCount}/{headerCount} mapped
          </p>
        </div>
        {missingRequired.length > 0 && (
          <Badge variant="destructive" className="text-xs">
            {missingRequired.length} required unmapped
          </Badge>
        )}
      </div>

      <div className="space-y-1.5 max-h-[380px] overflow-y-auto pr-1">
        {fieldMappings.map(mapping => {
          const isSkipped = mapping.crmField === '_skip';
          return (
            <div
              key={mapping.csvColumn}
              className={`flex items-center gap-3 p-2.5 rounded-lg transition-colors ${
                isSkipped ? 'bg-muted/30' : 'bg-muted/60'
              }`}
            >
              <div className="flex-1 min-w-0">
                <span className="text-sm font-mono truncate block text-foreground">{mapping.csvColumn}</span>
                <span className="text-xs text-muted-foreground truncate block">
                  {sampleRow?.[mapping.csvColumn]?.slice(0, 50) || '—'}
                </span>
              </div>
              <ArrowRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <Select value={mapping.crmField} onValueChange={(v) => onUpdateMapping(mapping.csvColumn, v)}>
                <SelectTrigger className={`w-44 text-xs ${isSkipped ? 'text-muted-foreground' : ''}`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_skip">⏭ Skip</SelectItem>
                  {CRM_FIELDS[dataType].map(f => (
                    <SelectItem key={f.field} value={f.field}>
                      {f.label} {f.required && <span className="text-destructive">*</span>}
                    </SelectItem>
                  ))}
                  {dataType === 'customers' && <SelectItem value="_merge_name">↪ Merge into Name</SelectItem>}
                </SelectContent>
              </Select>
            </div>
          );
        })}
      </div>

      <div className="flex justify-between pt-1">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </Button>
        <Button size="sm" onClick={onContinue} disabled={missingRequired.length > 0}>
          Preview <ArrowRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
};

export default FieldMapper;
