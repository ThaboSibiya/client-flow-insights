
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import ConditionGroupComponent from './condition-builder/ConditionGroup';
import EmptyState from './condition-builder/EmptyState';

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

  const updateConditionGroup = (groupId: string, updates: Partial<ConditionGroup>) => {
    const updated = conditionGroups.map(group =>
      group.id === groupId ? { ...group, ...updates } : group
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
        <ConditionGroupComponent
          key={group.id}
          group={group}
          groupIndex={groupIndex}
          onUpdateGroup={updateConditionGroup}
          onRemoveGroup={removeConditionGroup}
          onAddCondition={addCondition}
          onUpdateCondition={updateCondition}
          onRemoveCondition={removeCondition}
          canRemoveGroup={conditionGroups.length > 1}
        />
      ))}

      {conditionGroups.length === 0 && (
        <EmptyState onAddGroup={addConditionGroup} />
      )}
    </div>
  );
};

export default VisualConditionBuilder;
