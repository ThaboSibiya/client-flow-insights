
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { GitBranch, Plus, Trash2, ArrowRight, ArrowDown } from "lucide-react";

interface ConditionalRule {
  id: string;
  type: 'condition' | 'action' | 'branch';
  field?: string;
  operator?: string;
  value?: string;
  action?: string;
  children?: ConditionalRule[];
  logic?: 'AND' | 'OR';
}

interface AdvancedConditionalBuilderProps {
  onRulesChange: (rules: ConditionalRule[]) => void;
  initialRules?: ConditionalRule[];
}

const AdvancedConditionalBuilder = ({ onRulesChange, initialRules = [] }: AdvancedConditionalBuilderProps) => {
  const [rules, setRules] = useState<ConditionalRule[]>(initialRules);

  const addRule = (parentId?: string, type: 'condition' | 'action' | 'branch' = 'condition') => {
    const newRule: ConditionalRule = {
      id: Date.now().toString(),
      type,
      field: type === 'condition' ? '' : undefined,
      operator: type === 'condition' ? '' : undefined,
      value: type === 'condition' ? '' : undefined,
      action: type === 'action' ? '' : undefined,
      children: type === 'branch' ? [] : undefined,
      logic: type === 'branch' ? 'AND' : undefined
    };

    if (parentId) {
      const updateRules = (items: ConditionalRule[]): ConditionalRule[] => {
        return items.map(item => {
          if (item.id === parentId && item.children) {
            return { ...item, children: [...item.children, newRule] };
          }
          if (item.children) {
            return { ...item, children: updateRules(item.children) };
          }
          return item;
        });
      };
      const updated = updateRules(rules);
      setRules(updated);
      onRulesChange(updated);
    } else {
      const updated = [...rules, newRule];
      setRules(updated);
      onRulesChange(updated);
    }
  };

  const updateRule = (ruleId: string, updates: Partial<ConditionalRule>) => {
    const updateRules = (items: ConditionalRule[]): ConditionalRule[] => {
      return items.map(item => {
        if (item.id === ruleId) {
          return { ...item, ...updates };
        }
        if (item.children) {
          return { ...item, children: updateRules(item.children) };
        }
        return item;
      });
    };
    const updated = updateRules(rules);
    setRules(updated);
    onRulesChange(updated);
  };

  const removeRule = (ruleId: string) => {
    const filterRules = (items: ConditionalRule[]): ConditionalRule[] => {
      return items.filter(item => item.id !== ruleId).map(item => ({
        ...item,
        children: item.children ? filterRules(item.children) : undefined
      }));
    };
    const updated = filterRules(rules);
    setRules(updated);
    onRulesChange(updated);
  };

  const renderRule = (rule: ConditionalRule, depth: number = 0) => {
    const indentClass = depth > 0 ? `ml-${depth * 4}` : '';
    
    return (
      <Card key={rule.id} className={`${indentClass}`}>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            {depth > 0 && <ArrowRight className="h-4 w-4 text-muted-foreground" />}
            <Badge variant={rule.type === 'condition' ? 'default' : rule.type === 'action' ? 'secondary' : 'outline'}>
              {rule.type}
            </Badge>
            <Button variant="ghost" size="sm" onClick={() => removeRule(rule.id)}>
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>

          {rule.type === 'condition' && (
            <div className="grid grid-cols-3 gap-2">
              <Select 
                value={rule.field || ''} 
                onValueChange={(value) => updateRule(rule.id, { field: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Field..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="customer.status">Customer Status</SelectItem>
                  <SelectItem value="customer.value">Customer Value</SelectItem>
                  <SelectItem value="ticket.priority">Ticket Priority</SelectItem>
                  <SelectItem value="ticket.age">Ticket Age</SelectItem>
                </SelectContent>
              </Select>
              
              <Select 
                value={rule.operator || ''} 
                onValueChange={(value) => updateRule(rule.id, { operator: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Operator..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="equals">Equals</SelectItem>
                  <SelectItem value="not_equals">Not Equals</SelectItem>
                  <SelectItem value="greater_than">Greater Than</SelectItem>
                  <SelectItem value="less_than">Less Than</SelectItem>
                  <SelectItem value="contains">Contains</SelectItem>
                </SelectContent>
              </Select>
              
              <Input
                value={rule.value || ''}
                onChange={(e) => updateRule(rule.id, { value: e.target.value })}
                placeholder="Value..."
              />
            </div>
          )}

          {rule.type === 'action' && (
            <Select 
              value={rule.action || ''} 
              onValueChange={(value) => updateRule(rule.id, { action: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select action..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="send_email">Send Email</SelectItem>
                <SelectItem value="update_status">Update Status</SelectItem>
                <SelectItem value="assign_user">Assign User</SelectItem>
                <SelectItem value="create_task">Create Task</SelectItem>
                <SelectItem value="send_notification">Send Notification</SelectItem>
              </SelectContent>
            </Select>
          )}

          {rule.type === 'branch' && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Logic:</span>
                <Select 
                  value={rule.logic || 'AND'} 
                  onValueChange={(value: 'AND' | 'OR') => updateRule(rule.id, { logic: value })}
                >
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AND">AND</SelectItem>
                    <SelectItem value="OR">OR</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => addRule(rule.id, 'condition')}>
                  <Plus className="h-3 w-3 mr-1" /> Condition
                </Button>
                <Button size="sm" onClick={() => addRule(rule.id, 'action')}>
                  <Plus className="h-3 w-3 mr-1" /> Action
                </Button>
              </div>
            </div>
          )}

          {rule.children && rule.children.length > 0 && (
            <div className="mt-4 space-y-2">
              {rule.children.map(child => renderRule(child, depth + 1))}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5" />
            Advanced Conditional Logic Builder
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Button onClick={() => addRule(undefined, 'condition')}>
              <Plus className="h-4 w-4 mr-1" /> Add Condition
            </Button>
            <Button onClick={() => addRule(undefined, 'action')}>
              <Plus className="h-4 w-4 mr-1" /> Add Action
            </Button>
            <Button onClick={() => addRule(undefined, 'branch')}>
              <Plus className="h-4 w-4 mr-1" /> Add Branch
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {rules.map(rule => renderRule(rule))}
      </div>

      {rules.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="p-8 text-center text-muted-foreground">
            <GitBranch className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No conditional rules yet</p>
            <p className="text-sm">Add conditions and actions to build your workflow</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdvancedConditionalBuilder;
