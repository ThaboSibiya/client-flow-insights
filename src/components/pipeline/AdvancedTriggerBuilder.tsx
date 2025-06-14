
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Plus, X, Clock, Webhook, Mail, MessageSquare, Zap } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface TriggerCondition {
  id: string;
  field: string;
  operator: string;
  value: string;
  logicOperator?: 'AND' | 'OR';
}

interface TimeTrigger {
  type: 'delay' | 'schedule' | 'recurring';
  delay?: number;
  delayUnit?: 'minutes' | 'hours' | 'days';
  scheduleTime?: string;
  recurringPattern?: string;
  timezone?: string;
}

interface AdvancedTriggerBuilderProps {
  onSave: (trigger: any) => void;
  onCancel: () => void;
}

const AdvancedTriggerBuilder = ({ onSave, onCancel }: AdvancedTriggerBuilderProps) => {
  const [triggerName, setTriggerName] = useState('');
  const [triggerType, setTriggerType] = useState<'event' | 'time' | 'webhook' | 'communication'>('event');
  const [conditions, setConditions] = useState<TriggerCondition[]>([]);
  const [timeTrigger, setTimeTrigger] = useState<TimeTrigger>({ type: 'delay' });
  const [webhookUrl, setWebhookUrl] = useState('');
  const [isActive, setIsActive] = useState(true);

  const fieldOptions = [
    'customer.status', 'customer.stage', 'customer.priority', 'customer.assigned_to',
    'ticket.status', 'ticket.priority', 'ticket.assigned_to', 'ticket.category',
    'conversation.type', 'conversation.unread_count', 'custom_field'
  ];

  const operatorOptions = [
    'equals', 'not_equals', 'contains', 'not_contains', 'greater_than', 
    'less_than', 'is_empty', 'is_not_empty', 'changed_to', 'changed_from'
  ];

  const addCondition = () => {
    const newCondition: TriggerCondition = {
      id: `condition-${Date.now()}`,
      field: '',
      operator: 'equals',
      value: '',
      logicOperator: conditions.length > 0 ? 'AND' : undefined
    };
    setConditions([...conditions, newCondition]);
  };

  const updateCondition = (id: string, updates: Partial<TriggerCondition>) => {
    setConditions(conditions.map(condition => 
      condition.id === id ? { ...condition, ...updates } : condition
    ));
  };

  const removeCondition = (id: string) => {
    setConditions(conditions.filter(condition => condition.id !== id));
  };

  const handleSave = () => {
    const trigger = {
      name: triggerName,
      type: triggerType,
      conditions,
      timeTrigger: triggerType === 'time' ? timeTrigger : undefined,
      webhookUrl: triggerType === 'webhook' ? webhookUrl : undefined,
      isActive,
      createdAt: new Date().toISOString()
    };
    onSave(trigger);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-quikle-accent" />
            Advanced Trigger Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Trigger Name</Label>
              <Input
                value={triggerName}
                onChange={(e) => setTriggerName(e.target.value)}
                placeholder="Enter trigger name..."
              />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <div className="flex items-center space-x-2">
                <Switch checked={isActive} onCheckedChange={setIsActive} />
                <Label>{isActive ? 'Active' : 'Inactive'}</Label>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Trigger Type</Label>
            <Tabs value={triggerType} onValueChange={(value: any) => setTriggerType(value)}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="event" className="flex items-center gap-1">
                  <Zap className="h-4 w-4" />
                  Event
                </TabsTrigger>
                <TabsTrigger value="time" className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  Time
                </TabsTrigger>
                <TabsTrigger value="webhook" className="flex items-center gap-1">
                  <Webhook className="h-4 w-4" />
                  Webhook
                </TabsTrigger>
                <TabsTrigger value="communication" className="flex items-center gap-1">
                  <MessageSquare className="h-4 w-4" />
                  Communication
                </TabsTrigger>
              </TabsList>

              <TabsContent value="event" className="space-y-4">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Label>Conditions ({conditions.length})</Label>
                    <Button onClick={addCondition} size="sm" variant="outline">
                      <Plus className="h-4 w-4 mr-1" />
                      Add Condition
                    </Button>
                  </div>
                  
                  {conditions.map((condition, index) => (
                    <Card key={condition.id} className="p-4">
                      <div className="grid grid-cols-12 gap-2 items-center">
                        {index > 0 && (
                          <div className="col-span-2">
                            <Select 
                              value={condition.logicOperator} 
                              onValueChange={(value: 'AND' | 'OR') => updateCondition(condition.id, { logicOperator: value })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="AND">AND</SelectItem>
                                <SelectItem value="OR">OR</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                        
                        <div className={index === 0 ? "col-span-3" : "col-span-3"}>
                          <Select 
                            value={condition.field} 
                            onValueChange={(value) => updateCondition(condition.id, { field: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select field..." />
                            </SelectTrigger>
                            <SelectContent>
                              {fieldOptions.map(field => (
                                <SelectItem key={field} value={field}>{field}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="col-span-3">
                          <Select 
                            value={condition.operator} 
                            onValueChange={(value) => updateCondition(condition.id, { operator: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {operatorOptions.map(op => (
                                <SelectItem key={op} value={op}>
                                  {op.replace('_', ' ')}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="col-span-3">
                          <Input
                            value={condition.value}
                            onChange={(e) => updateCondition(condition.id, { value: e.target.value })}
                            placeholder="Value..."
                          />
                        </div>
                        
                        <div className="col-span-1">
                          <Button 
                            onClick={() => removeCondition(condition.id)}
                            size="sm" 
                            variant="ghost"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="time" className="space-y-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Time Trigger Type</Label>
                    <Select 
                      value={timeTrigger.type} 
                      onValueChange={(value: 'delay' | 'schedule' | 'recurring') => 
                        setTimeTrigger({ ...timeTrigger, type: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="delay">Delay After Event</SelectItem>
                        <SelectItem value="schedule">Scheduled Time</SelectItem>
                        <SelectItem value="recurring">Recurring Pattern</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {timeTrigger.type === 'delay' && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Delay Amount</Label>
                        <Input
                          type="number"
                          value={timeTrigger.delay || ''}
                          onChange={(e) => setTimeTrigger({ 
                            ...timeTrigger, 
                            delay: parseInt(e.target.value) 
                          })}
                          placeholder="Enter delay..."
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Time Unit</Label>
                        <Select 
                          value={timeTrigger.delayUnit || 'minutes'} 
                          onValueChange={(value: 'minutes' | 'hours' | 'days') => 
                            setTimeTrigger({ ...timeTrigger, delayUnit: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="minutes">Minutes</SelectItem>
                            <SelectItem value="hours">Hours</SelectItem>
                            <SelectItem value="days">Days</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}

                  {timeTrigger.type === 'schedule' && (
                    <div className="space-y-2">
                      <Label>Schedule Time</Label>
                      <Input
                        type="datetime-local"
                        value={timeTrigger.scheduleTime || ''}
                        onChange={(e) => setTimeTrigger({ 
                          ...timeTrigger, 
                          scheduleTime: e.target.value 
                        })}
                      />
                    </div>
                  )}

                  {timeTrigger.type === 'recurring' && (
                    <div className="space-y-2">
                      <Label>Recurring Pattern</Label>
                      <Select 
                        value={timeTrigger.recurringPattern || ''} 
                        onValueChange={(value) => 
                          setTimeTrigger({ ...timeTrigger, recurringPattern: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select pattern..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="custom">Custom Cron</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="webhook" className="space-y-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Webhook URL</Label>
                    <Input
                      value={webhookUrl}
                      onChange={(e) => setWebhookUrl(e.target.value)}
                      placeholder="https://your-api.com/webhook"
                    />
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium mb-2">Webhook Configuration</h4>
                    <p className="text-sm text-muted-foreground">
                      External systems can trigger this automation by sending a POST request to your webhook URL.
                      Include authentication headers and payload validation as needed.
                    </p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="communication" className="space-y-4">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Card className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Mail className="h-4 w-4 text-blue-500" />
                        <Label>Email Triggers</Label>
                      </div>
                      <div className="space-y-2">
                        <label className="flex items-center space-x-2">
                          <input type="checkbox" />
                          <span className="text-sm">New email received</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input type="checkbox" />
                          <span className="text-sm">Email opened</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input type="checkbox" />
                          <span className="text-sm">Link clicked</span>
                        </label>
                      </div>
                    </Card>
                    
                    <Card className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <MessageSquare className="h-4 w-4 text-green-500" />
                        <Label>SMS/Chat Triggers</Label>
                      </div>
                      <div className="space-y-2">
                        <label className="flex items-center space-x-2">
                          <input type="checkbox" />
                          <span className="text-sm">New message received</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input type="checkbox" />
                          <span className="text-sm">Message read</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input type="checkbox" />
                          <span className="text-sm">Response received</span>
                        </label>
                      </div>
                    </Card>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={!triggerName}>
          Save Advanced Trigger
        </Button>
      </div>
    </div>
  );
};

export default AdvancedTriggerBuilder;
