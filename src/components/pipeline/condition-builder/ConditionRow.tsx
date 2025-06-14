
import React from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import FieldOperatorSelector from './FieldOperatorSelector';

interface Condition {
  id: string;
  field: string;
  operator: string;
  value: string;
  type: 'text' | 'number' | 'date' | 'boolean';
}

interface ConditionRowProps {
  condition: Condition;
  onUpdate: (updates: Partial<Condition>) => void;
  onRemove: () => void;
}

const ConditionRow = ({ condition, onUpdate, onRemove }: ConditionRowProps) => {
  return (
    <div className="flex items-center gap-2 p-2 border rounded bg-muted/30">
      <div className="flex-1 grid grid-cols-3 gap-2">
        <FieldOperatorSelector
          condition={condition}
          onUpdate={onUpdate}
        />

        <Input
          placeholder="Value..."
          value={condition.value}
          onChange={(e) => onUpdate({ value: e.target.value })}
          disabled={!condition.operator}
          type={condition.type === 'number' ? 'number' : 'text'}
        />
      </div>
      <Button 
        size="sm" 
        variant="ghost" 
        onClick={onRemove}
        className="text-red-500 hover:text-red-700"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default ConditionRow;
