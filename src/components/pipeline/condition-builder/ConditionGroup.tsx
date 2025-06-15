
import React from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, X, Move } from "lucide-react";
import ConditionRow from './ConditionRow';

interface Condition {
  id: string;
  field: string;
  operator: string;
  value: string;
  type: 'text' | 'number' | 'date' | 'boolean';
  error?: string;
}

interface ConditionGroup {
  id: string;
  logic: 'AND' | 'OR';
  conditions: Condition[];
}

interface ConditionGroupProps {
  group: ConditionGroup;
  groupIndex: number;
  onUpdateGroup: (groupId: string, updates: Partial<ConditionGroup>) => void;
  onRemoveGroup: (groupId: string) => void;
  onAddCondition: (groupId: string) => void;
  onUpdateCondition: (groupId: string, conditionId: string, updates: Partial<Condition>) => void;
  onRemoveCondition: (groupId: string, conditionId: string) => void;
  canRemoveGroup: boolean;
}

const ConditionGroupComponent = ({
  group,
  groupIndex,
  onUpdateGroup,
  onRemoveGroup,
  onAddCondition,
  onUpdateCondition,
  onRemoveCondition,
  canRemoveGroup
}: ConditionGroupProps) => {
  const validateCondition = (condition: Condition): string | undefined => {
    if (condition.type === 'number' && condition.value && isNaN(Number(condition.value))) {
      return 'Value must be a valid number.';
    }
    // Future validation for other types can be added here.
    return undefined;
  };

  const handleUpdateCondition = (conditionId: string, updates: Partial<Condition>) => {
    const condition = group.conditions.find(c => c.id === conditionId);
    if (!condition) return;

    const updatedCondition = { ...condition, ...updates };
    const error = validateCondition(updatedCondition);
    
    onUpdateCondition(group.id, conditionId, { ...updates, error });
  };
  
  return (
    <Card className="border-dashed border-2">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Move className="h-4 w-4 text-muted-foreground cursor-move" />
            <Label className="text-sm font-medium">Group {groupIndex + 1}</Label>
            <Select 
              value={group.logic} 
              onValueChange={(value: 'AND' | 'OR') => onUpdateGroup(group.id, { logic: value })}
            >
              <SelectTrigger className="w-20 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="AND">AND</SelectItem>
                <SelectItem value="OR">OR</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {canRemoveGroup && (
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={() => onRemoveGroup(group.id)}
              className="text-red-500 hover:text-red-700"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {group.conditions.map((condition) => (
          <div key={condition.id}>
            <ConditionRow
              condition={condition}
              onUpdate={(updates) => handleUpdateCondition(condition.id, updates)}
              onRemove={() => onRemoveCondition(group.id, condition.id)}
            />
            {condition.error && (
              <p className="text-xs text-red-500 mt-1 px-1">{condition.error}</p>
            )}
          </div>
        ))}
        
        <Button 
          size="sm" 
          variant="outline" 
          onClick={() => onAddCondition(group.id)}
          className="w-full"
        >
          <Plus className="h-3 w-3 mr-1" />
          Add Condition
        </Button>
      </CardContent>
    </Card>
  );
};

export default ConditionGroupComponent;
