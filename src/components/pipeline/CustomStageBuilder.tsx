
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Plus, X, Settings, Zap, Clock, Target } from "lucide-react";

interface StageCondition {
  id: string;
  field: string;
  operator: string;
  value: string;
  type: 'customer' | 'ticket' | 'time' | 'action';
}

interface StageAction {
  id: string;
  type: string;
  target: string;
  value: string;
  delay?: number;
}

interface CustomStage {
  id: string;
  name: string;
  color: string;
  description?: string;
  position: number;
  isRequired: boolean;
  autoProgression: {
    enabled: boolean;
    conditions: StageCondition[];
    actions: StageAction[];
    timeLimit?: number;
  };
  notifications: {
    onEntry: boolean;
    onExit: boolean;
    onTimeout: boolean;
    recipients: string[];
  };
  target?: number;
  tags: string[];
}

interface CustomStageBuilderProps {
  stage?: CustomStage;
  onSave: (stage: CustomStage) => void;
  onCancel: () => void;
  type: 'customer' | 'ticket';
}

const CustomStageBuilder = ({ stage, onSave, onCancel, type }: CustomStageBuilderProps) => {
  const [stageName, setStageName] = useState(stage?.name || '');
  const [stageColor, setStageColor] = useState(stage?.color || '#6B7280');
  const [description, setDescription] = useState(stage?.description || '');
  const [isRequired, setIsRequired] = useState(stage?.isRequired || false);
  const [target, setTarget] = useState(stage?.target?.toString() || '');
  const [tags, setTags] = useState<string[]>(stage?.tags || []);
  const [newTag, setNewTag] = useState('');

  // Auto-progression settings
  const [autoProgression, setAutoProgression] = useState(stage?.autoProgression?.enabled || false);
  const [conditions, setConditions] = useState<StageCondition[]>(stage?.autoProgression?.conditions || []);
  const [actions, setActions] = useState<StageAction[]>(stage?.autoProgression?.actions || []);
  const [timeLimit, setTimeLimit] = useState(stage?.autoProgression?.timeLimit?.toString() || '');

  // Notification settings
  const [notifications, setNotifications] = useState({
    onEntry: stage?.notifications?.onEntry || false,
    onExit: stage?.notifications?.onExit || false,
    onTimeout: stage?.notifications?.onTimeout || false,
    recipients: stage?.notifications?.recipients || []
  });

  const colorOptions = [
    { name: 'Gray', value: '#6B7280' },
    { name: 'Red', value: '#DC2626' },
    { name: 'Orange', value: '#EA580C' },
    { name: 'Yellow', value: '#CA8A04' },
    { name: 'Green', value: '#059669' },
    { name: 'Blue', value: '#2563EB' },
    { name: 'Purple', value: '#7C3AED' },
    { name: 'Pink', value: '#DB2777' }
  ];

  const conditionFields = type === 'customer' 
    ? ['status', 'created_at', 'ticket_count', 'last_contact', 'assigned_to']
    : ['priority', 'status', 'created_at', 'assigned_to', 'time_spent', 'customer_response'];

  const operators = ['equals', 'not_equals', 'greater_than', 'less_than', 'contains', 'is_empty', 'is_not_empty'];

  const actionTypes = ['move_to_stage', 'assign_to', 'send_email', 'create_task', 'update_field', 'send_notification'];

  const addCondition = () => {
    const newCondition: StageCondition = {
      id: `condition-${Date.now()}`,
      field: conditionFields[0],
      operator: 'equals',
      value: '',
      type: type
    };
    setConditions([...conditions, newCondition]);
  };

  const removeCondition = (id: string) => {
    setConditions(conditions.filter(c => c.id !== id));
  };

  const updateCondition = (id: string, updates: Partial<StageCondition>) => {
    setConditions(conditions.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const addAction = () => {
    const newAction: StageAction = {
      id: `action-${Date.now()}`,
      type: actionTypes[0],
      target: '',
      value: ''
    };
    setActions([...actions, newAction]);
  };

  const removeAction = (id: string) => {
    setActions(actions.filter(a => a.id !== id));
  };

  const updateAction = (id: string, updates: Partial<StageAction>) => {
    setActions(actions.map(a => a.id === id ? { ...a, ...updates } : a));
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSave = () => {
    const customStage: CustomStage = {
      id: stage?.id || `stage-${Date.now()}`,
      name: stageName,
      color: stageColor,
      description,
      position: stage?.position || 0,
      isRequired,
      autoProgression: {
        enabled: autoProgression,
        conditions,
        actions,
        timeLimit: timeLimit ? parseInt(timeLimit) : undefined
      },
      notifications,
      target: target ? parseInt(target) : undefined,
      tags
    };

    onSave(customStage);
  };

  const isValid = stageName.trim().length > 0;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          {stage ? 'Edit Stage' : 'Create Custom Stage'}
        </h3>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!isValid}>
            Save Stage
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Basic Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="stage-name">Stage Name</Label>
              <Input
                id="stage-name"
                value={stageName}
                onChange={(e) => setStageName(e.target.value)}
                placeholder="Enter stage name..."
              />
            </div>

            <div>
              <Label htmlFor="stage-description">Description</Label>
              <Textarea
                id="stage-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe this stage..."
                rows={3}
              />
            </div>

            <div>
              <Label>Stage Color</Label>
              <div className="grid grid-cols-4 gap-2 mt-2">
                {colorOptions.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => setStageColor(color.value)}
                    className={`w-12 h-12 rounded-lg border-2 transition-all ${
                      stageColor === color.value 
                        ? 'border-quikle-primary shadow-lg scale-105' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="target">Target Count</Label>
              <Input
                id="target"
                type="number"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                placeholder="Optional target count..."
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="required"
                checked={isRequired}
                onCheckedChange={setIsRequired}
              />
              <Label htmlFor="required">Required stage (cannot be deleted)</Label>
            </div>

            <div>
              <Label>Tags</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1">
                    {tag}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => removeTag(tag)} />
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2 mt-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add tag..."
                  onKeyPress={(e) => e.key === 'Enter' && addTag()}
                />
                <Button onClick={addTag} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Auto-Progression */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Auto-Progression Rules
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="auto-progression"
                checked={autoProgression}
                onCheckedChange={setAutoProgression}
              />
              <Label htmlFor="auto-progression">Enable automatic progression</Label>
            </div>

            {autoProgression && (
              <>
                <div>
                  <Label htmlFor="time-limit">Time Limit (hours)</Label>
                  <Input
                    id="time-limit"
                    type="number"
                    value={timeLimit}
                    onChange={(e) => setTimeLimit(e.target.value)}
                    placeholder="Auto-progress after X hours..."
                  />
                </div>

                <Separator />

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Conditions</Label>
                    <Button onClick={addCondition} size="sm" variant="outline">
                      <Plus className="h-4 w-4 mr-1" />
                      Add Condition
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    {conditions.map((condition) => (
                      <div key={condition.id} className="flex gap-2 items-center p-2 border rounded">
                        <Select value={condition.field} onValueChange={(value) => updateCondition(condition.id, { field: value })}>
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {conditionFields.map((field) => (
                              <SelectItem key={field} value={field}>{field}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <Select value={condition.operator} onValueChange={(value) => updateCondition(condition.id, { operator: value })}>
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {operators.map((op) => (
                              <SelectItem key={op} value={op}>{op.replace('_', ' ')}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <Input
                          value={condition.value}
                          onChange={(e) => updateCondition(condition.id, { value: e.target.value })}
                          placeholder="Value..."
                          className="flex-1"
                        />

                        <Button
                          onClick={() => removeCondition(condition.id)}
                          size="sm"
                          variant="outline"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Actions</Label>
                    <Button onClick={addAction} size="sm" variant="outline">
                      <Plus className="h-4 w-4 mr-1" />
                      Add Action
                    </Button>
                  </div>

                  <div className="space-y-2">
                    {actions.map((action) => (
                      <div key={action.id} className="flex gap-2 items-center p-2 border rounded">
                        <Select value={action.type} onValueChange={(value) => updateAction(action.id, { type: value })}>
                          <SelectTrigger className="w-40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {actionTypes.map((type) => (
                              <SelectItem key={type} value={type}>{type.replace('_', ' ')}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <Input
                          value={action.target}
                          onChange={(e) => updateAction(action.id, { target: e.target.value })}
                          placeholder="Target..."
                          className="flex-1"
                        />

                        <Input
                          value={action.value}
                          onChange={(e) => updateAction(action.id, { value: e.target.value })}
                          placeholder="Value..."
                          className="flex-1"
                        />

                        <Button
                          onClick={() => removeAction(action.id)}
                          size="sm"
                          variant="outline"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Notifications Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Notification Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="notify-entry"
                checked={notifications.onEntry}
                onCheckedChange={(checked) => setNotifications({ ...notifications, onEntry: checked })}
              />
              <Label htmlFor="notify-entry">Notify on entry</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="notify-exit"
                checked={notifications.onExit}
                onCheckedChange={(checked) => setNotifications({ ...notifications, onExit: checked })}
              />
              <Label htmlFor="notify-exit">Notify on exit</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="notify-timeout"
                checked={notifications.onTimeout}
                onCheckedChange={(checked) => setNotifications({ ...notifications, onTimeout: checked })}
              />
              <Label htmlFor="notify-timeout">Notify on timeout</Label>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomStageBuilder;
