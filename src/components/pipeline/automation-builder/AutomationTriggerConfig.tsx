
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, X } from "lucide-react";

interface AutomationTriggerConfigProps {
  triggerType: 'simple' | 'advanced';
  automationType: 'customer' | 'ticket';
  simpleTrigger: string;
  setSimpleTrigger: (trigger: string) => void;
  conditionGroups: any[];
  setConditionGroups: (groups: any[]) => void;
}

const AutomationTriggerConfig = ({
  triggerType,
  automationType,
  simpleTrigger,
  setSimpleTrigger,
  conditionGroups,
  setConditionGroups
}: AutomationTriggerConfigProps) => {
  const triggerOptions = [
    'Stage entry',
    'Time in stage',
    'Field change',
    'Manual trigger',
    'External event'
  ];

  const fieldOptions = automationType === 'customer' 
    ? ['status', 'created_at', 'last_contact', 'assigned_to']
    : ['priority', 'status', 'assigned_to', 'created_at'];

  const addConditionGroup = () => {
    const newGroup = {
      id: `group-${Date.now()}`,
      operator: 'AND',
      conditions: [{
        id: `condition-${Date.now()}`,
        field: fieldOptions[0],
        operator: 'equals',
        value: ''
      }]
    };
    setConditionGroups([...conditionGroups, newGroup]);
  };

  const removeConditionGroup = (groupId: string) => {
    setConditionGroups(conditionGroups.filter(g => g.id !== groupId));
  };

  const addConditionToGroup = (groupId: string) => {
    setConditionGroups(conditionGroups.map(group => 
      group.id === groupId 
        ? {
            ...group,
            conditions: [...group.conditions, {
              id: `condition-${Date.now()}`,
              field: fieldOptions[0],
              operator: 'equals',
              value: ''
            }]
          }
        : group
    ));
  };

  const removeConditionFromGroup = (groupId: string, conditionId: string) => {
    setConditionGroups(conditionGroups.map(group => 
      group.id === groupId 
        ? {
            ...group,
            conditions: group.conditions.filter(c => c.id !== conditionId)
          }
        : group
    ));
  };

  const updateCondition = (groupId: string, conditionId: string, field: string, value: any) => {
    setConditionGroups(conditionGroups.map(group => 
      group.id === groupId 
        ? {
            ...group,
            conditions: group.conditions.map(condition =>
              condition.id === conditionId 
                ? { ...condition, [field]: value }
                : condition
            )
          }
        : group
    ));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Trigger Configuration</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {triggerType === 'simple' ? (
          <div>
            <Label>Trigger Event</Label>
            <Select value={simpleTrigger} onValueChange={setSimpleTrigger}>
              <SelectTrigger>
                <SelectValue placeholder="Select trigger..." />
              </SelectTrigger>
              <SelectContent>
                {triggerOptions.map(option => (
                  <SelectItem key={option} value={option}>{option}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label>Advanced Conditions</Label>
              <Button onClick={addConditionGroup} size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-1" />
                Add Group
              </Button>
            </div>

            {conditionGroups.map((group, groupIndex) => (
              <Card key={group.id} className="border border-dashed">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <Badge variant="outline">Group {groupIndex + 1}</Badge>
                    <Button 
                      onClick={() => removeConditionGroup(group.id)}
                      size="sm" 
                      variant="ghost"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {group.conditions.map((condition: any, conditionIndex: number) => (
                    <div key={condition.id} className="flex gap-2 items-center">
                      {conditionIndex > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          {group.operator}
                        </Badge>
                      )}
                      
                      <Select 
                        value={condition.field}
                        onValueChange={(value) => updateCondition(group.id, condition.id, 'field', value)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {fieldOptions.map(field => (
                            <SelectItem key={field} value={field}>{field}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Select 
                        value={condition.operator}
                        onValueChange={(value) => updateCondition(group.id, condition.id, 'operator', value)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="equals">equals</SelectItem>
                          <SelectItem value="not_equals">not equals</SelectItem>
                          <SelectItem value="contains">contains</SelectItem>
                          <SelectItem value="greater_than">greater than</SelectItem>
                          <SelectItem value="less_than">less than</SelectItem>
                        </SelectContent>
                      </Select>

                      <Input
                        value={condition.value}
                        onChange={(e) => updateCondition(group.id, condition.id, 'value', e.target.value)}
                        placeholder="Value..."
                        className="flex-1"
                      />

                      <Button
                        onClick={() => removeConditionFromGroup(group.id, condition.id)}
                        size="sm"
                        variant="ghost"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  
                  <Button 
                    onClick={() => addConditionToGroup(group.id)}
                    size="sm" 
                    variant="outline"
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Condition
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AutomationTriggerConfig;
