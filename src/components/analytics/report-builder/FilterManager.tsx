
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, X } from 'lucide-react';
import { ReportFilter, ReportField } from '../CustomReportBuilder';

interface FilterManagerProps {
  filters: ReportFilter[];
  availableFields: ReportField[];
  onAddFilter: () => void;
  onUpdateFilter: (filterId: string, updates: Partial<ReportFilter>) => void;
  onRemoveFilter: (filterId: string) => void;
}

const FilterManager = ({ 
  filters, 
  availableFields, 
  onAddFilter, 
  onUpdateFilter, 
  onRemoveFilter 
}: FilterManagerProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium">Filters</h4>
        <Button variant="outline" size="sm" onClick={onAddFilter}>
          <Plus className="h-4 w-4 mr-1" />
          Add Filter
        </Button>
      </div>
      
      {filters.map((filter) => (
        <div key={filter.id} className="flex items-center gap-2">
          <Select 
            value={filter.field} 
            onValueChange={(value) => onUpdateFilter(filter.id, { field: value })}
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Field" />
            </SelectTrigger>
            <SelectContent>
              {availableFields.map((field) => (
                <SelectItem key={field.id} value={field.name.toLowerCase()}>
                  {field.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select 
            value={filter.operator} 
            onValueChange={(value) => onUpdateFilter(filter.id, { operator: value })}
          >
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="equals">Equals</SelectItem>
              <SelectItem value="contains">Contains</SelectItem>
              <SelectItem value="greater">Greater</SelectItem>
              <SelectItem value="less">Less</SelectItem>
            </SelectContent>
          </Select>
          
          <Input
            placeholder="Value"
            value={filter.value}
            onChange={(e) => onUpdateFilter(filter.id, { value: e.target.value })}
            className="flex-1"
          />
          
          <Button variant="outline" size="sm" onClick={() => onRemoveFilter(filter.id)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  );
};

export default FilterManager;
