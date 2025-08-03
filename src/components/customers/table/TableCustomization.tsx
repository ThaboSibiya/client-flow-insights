
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Settings, Eye, EyeOff } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface TableColumn {
  key: string;
  label: string;
  type: string;
  sortable: boolean;
  priority: 'high' | 'medium' | 'low';
  visible?: boolean;
}

interface TableCustomizationProps {
  columns: TableColumn[];
  onColumnVisibilityChange: (columnKey: string, visible: boolean) => void;
  onSavePreset?: (preset: any) => void;
}

const TableCustomization = ({ 
  columns, 
  onColumnVisibilityChange,
  onSavePreset 
}: TableCustomizationProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggleColumn = (columnKey: string, checked: boolean) => {
    onColumnVisibilityChange(columnKey, checked);
  };

  const getVisibleCount = () => {
    return columns.filter(col => col.visible !== false).length;
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="border-quikle-silver/50 text-quikle-slate hover:bg-quikle-crystal"
        >
          <Settings className="h-4 w-4 mr-2" />
          Customize ({getVisibleCount()}/{columns.length})
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 bg-white border-quikle-silver/30 shadow-lg" align="end">
        <Card className="border-0 shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-quikle-charcoal">
              Table Columns
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            {columns.map((column) => (
              <div key={column.key} className="flex items-center space-x-3">
                <Checkbox
                  id={column.key}
                  checked={column.visible !== false}
                  onCheckedChange={(checked) => handleToggleColumn(column.key, checked as boolean)}
                  className="border-quikle-silver data-[state=checked]:bg-quikle-primary"
                />
                <label
                  htmlFor={column.key}
                  className="text-sm text-quikle-charcoal cursor-pointer flex-1 flex items-center justify-between"
                >
                  <span>{column.label}</span>
                  <div className="flex items-center gap-1">
                    {column.priority === 'high' && (
                      <span className="text-xs px-1.5 py-0.5 bg-quikle-primary/10 text-quikle-primary rounded">
                        Essential
                      </span>
                    )}
                    {column.visible !== false ? (
                      <Eye className="h-3 w-3 text-quikle-primary" />
                    ) : (
                      <EyeOff className="h-3 w-3 text-quikle-neutral" />
                    )}
                  </div>
                </label>
              </div>
            ))}
            
            <div className="pt-3 border-t border-quikle-silver/20">
              <Button 
                size="sm" 
                className="w-full bg-quikle-primary hover:bg-quikle-secondary text-white"
                onClick={() => {
                  // Save current column configuration as user preference
                  if (onSavePreset) {
                    const preset = {
                      columns: columns.map(col => ({
                        key: col.key,
                        visible: col.visible !== false
                      }))
                    };
                    onSavePreset(preset);
                  }
                  setIsOpen(false);
                }}
              >
                Save Layout
              </Button>
            </div>
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
};

export default TableCustomization;
