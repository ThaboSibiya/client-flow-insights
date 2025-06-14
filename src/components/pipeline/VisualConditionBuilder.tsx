
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, X, Move, Settings } from "lucide-react";

interface Condition {
  id: string;
  field: string;
  operator: string;
  value: string;
  type: 'text' | 'number' | 'date' | 'boolean';
}

interface ConditionGroup {
  id: string;
  logic: 'AND' | 'OR';
  conditions: Condition[];
}

interface VisualConditionBuilderProps {
  onConditionsChange: (groups: ConditionGroup[]) => void;
  initialConditions?: ConditionGroup[];
}

const VisualConditionBuilder = ({ onConditionsChange, initialConditions = [] }: VisualConditionBuilderProps) => {
  const [conditionGroups, setConditionGroups] = useState<ConditionGroup[]>(
    initialConditions.length > 0 ? initialConditions : [
      { id: '1', logic: 'AND', conditions: [] }
    ]
  );

  const fieldOptions = [
    { value: 'customer.status', label: 'Customer Status', type: 'text' },
    { value: 'customer.created_date', label: 'Customer Created Date', type: 'date' },
    { value: 'customer.last_activity', label: 'Last Activity', type: 'date' },
    { value: 'customer.priority', label: 'Priority', type: 'text' },
    { value: 'ticket.status', label: 'Ticket Status', type: 'text' },
    { value: 'ticket.priority', label: 'Ticket Priority', type: 'text' },
    { value: 'ticket.created_date', label: 'Ticket Created Date', type: 'date' },
    { value: 'ticket.assigned_to', label: 'Assigned To', type: 'text' },
    { value: 'custom.field_1', label: 'Custom Field 1', type: 'text' },
    { value: 'custom.field_2', label: 'Custom Field 2', type: 'number' }
  ];

  const operatorOptions = {
    text: [
      { value: 'equals', label: 'Equals' },
      { value: 'not_equals', label: 'Not Equals' },
      { value: 'contains', label: 'Contains' },
      { value: 'starts_with', label: 'Starts With' },
      { value: 'ends_with', label: 'Ends With' }
    ],
    number: [
      { value: 'equals', label: 'Equals' },
      { value: 'greater_than', label: 'Greater Than' },
      { value: 'less_than', label: 'Less Than' },
      { value: 'greater_equal', label: 'Greater or Equal' },
      { value: 'less_equal', label: 'Less or Equal' }
    ],
    date: [
      { value: 'equals', label: 'On Date' },
      { value: 'before', label: 'Before' },
      { value: 'after', label: 'After' },
      { value: 'days_ago', label: 'Days Ago' },
      { value: 'days_from_now', label: 'Days From Now' }
    ]
  };

  const addConditionGroup = () => {
    const newGroup: ConditionGroup = {
      id: Date.now().toString(),
      logic: 'AND',
      conditions: []
    };
    const updated = [...conditionGroups, newGroup];
    setConditionGroups(updated);
    onConditionsChange(updated);
  };

  const removeConditionGroup = (groupId: string) => {
    const updated = conditionGroups.filter(group => group.id !== groupId);
    setConditionGroups(updated);
    onConditionsChange(updated);
  };

  const updateGroupLogic = (groupId: string, logic: 'AND' | 'OR') => {
    const updated = conditionGroups.map(group =>
      group.id === groupId ? { ...group, logic } : group
    );
    setConditionGroups(updated);
    onConditionsChange(updated);
  };

  const addCondition = (groupId: string) => {
    const newCondition: Condition = {
      id: Date.now().toString(),
      field: '',
      operator: '',
      value: '',
      type: 'text'
    };
    
    const updated = conditionGroups.map(group =>
      group.id === groupId 
        ? { ...group, conditions: [...group.conditions, newCondition] }
        : group
    );
    setConditionGroups(updated);
    onConditionsChange(updated);
  };

  const removeCondition = (groupId: string, conditionId: string) => {
    const updated = conditionGroups.map(group =>
      group.id === groupId
        ? { ...group, conditions: group.conditions.filter(c => c.id !== conditionId) }
        : group
    );
    setConditionGroups(updated);
    onConditionsChange(updated);
  };

  const updateCondition = (groupId: string, conditionId: string, updates: Partial<Condition>) => {
    const updated = conditionGroups.map(group =>
      group.id === groupId
        ? {
            ...group,
            conditions: group.conditions.map(condition =>
              condition.id === conditionId ? { ...condition, ...updates } : condition
            )
          }
        : group
    );
    setConditionGroups(updated);
    onConditionsChange(updated);
  };

  const getFieldType = (fieldValue: string): 'text' | 'number' | 'date' => {
    const field = fieldOptions.find(f => f.value === fieldValue);
    return field?.type as 'text' | 'number' | 'date' || 'text';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium">Condition Groups</h4>
        <Button size="sm" onClick={addConditionGroup} className="flex items-center gap-1">
          <Plus className="h-3 w-3" />
          Add Group
        </Button>
      </div>

      {conditionGroups.map((group, groupIndex) => (
        <Card key={group.id} className="border-dashed border-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Move className="h-4 w-4 text-muted-foreground cursor-move" />
                <Label className="text-sm font-medium">Group {groupIndex + 1}</Label>
                <Select value={group.logic} onValueChange={(value: 'AND' | 'OR') => updateGroupLogic(group.id, value)}>
                  <SelectTrigger className="w-20 h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AND">AND</SelectItem>
                    <SelectItem value="OR">OR</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {conditionGroups.length > 1 && (
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => removeConditionGroup(group.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {group.conditions.map((condition, conditionIndex) => (
              <div key={condition.id} className="flex items-center gap-2 p-2 border rounded bg-muted/30">
                <div className="flex-1 grid grid-cols-3 gap-2">
                  <Select 
                    value={condition.field} 
                    onValueChange={(value) => {
                      const fieldType = getFieldType(value);
                      updateCondition(group.id, condition.id, { 
                        field: value, 
                        type: fieldType,
                        operator: '', // Reset operator when field changes
                        value: '' // Reset value when field changes
                      });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select field..." />
                    </SelectTrigger>
                    <SelectContent>
                      {fieldOptions.map((field) => (
                        <SelectItem key={field.value} value={field.value}>
                          {field.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select 
                    value={condition.operator} 
                    onValueChange={(value) => updateCondition(group.id, condition.id, { operator: value })}
                    disabled={!condition.field}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Operator..." />
                    </SelectTrigger>
                    <SelectContent>
                      {operatorOptions[condition.type]?.map((op) => (
                        <SelectItem key={op.value} value={op.value}>
                          {op.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Input
                    placeholder="Value..."
                    value={condition.value}
                    onChange={(e) => updateCondition(group.id, condition.id, { value: e.target.value })}
                    disabled={!condition.operator}
                    type={condition.type === 'number' ? 'number' : 'text'}
                  />
                </div>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => removeCondition(group.id, condition.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => addCondition(group.id)}
              className="w-full"
            >
              <Plus className="h-3 w-3 mr-1" />
              Add Condition
            </Button>
          </CardContent>
        </Card>
      ))}

      {conditionGroups.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <Settings className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>No condition groups defined</p>
          <Button size="sm" onClick={addConditionGroup} className="mt-2">
            Add Your First Group
          </Button>
        </div>
      )}
    </div>
  );
};

export default VisualConditionBuilder;
