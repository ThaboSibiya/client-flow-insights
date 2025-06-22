
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Clock, Calendar, Repeat, Trash2, Play, Pause } from "lucide-react";
import { toast } from "sonner";

interface TimeBasedTrigger {
  id: string;
  name: string;
  automationId: string;
  type: 'once' | 'recurring' | 'cron';
  scheduleTime?: string;
  scheduleDate?: string;
  recurring?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    interval: number;
    daysOfWeek?: number[];
    dayOfMonth?: number;
  };
  cronExpression?: string;
  isActive: boolean;
  nextRun?: string;
  lastRun?: string;
}

const TimeBasedTriggerManager = () => {
  const [triggers, setTriggers] = useState<TimeBasedTrigger[]>([
    {
      id: '1',
      name: 'Daily Customer Follow-up',
      automationId: 'follow-up',
      type: 'recurring',
      scheduleTime: '09:00',
      recurring: {
        frequency: 'daily',
        interval: 1
      },
      isActive: true,
      nextRun: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      lastRun: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    }
  ]);

  const [newTrigger, setNewTrigger] = useState<Partial<TimeBasedTrigger>>({
    type: 'once',
    recurring: {
      frequency: 'daily',
      interval: 1
    }
  });

  const createTrigger = () => {
    if (!newTrigger.name || !newTrigger.automationId) {
      toast.error('Please fill in required fields');
      return;
    }

    const trigger: TimeBasedTrigger = {
      id: Date.now().toString(),
      name: newTrigger.name,
      automationId: newTrigger.automationId,
      type: newTrigger.type || 'once',
      scheduleTime: newTrigger.scheduleTime,
      scheduleDate: newTrigger.scheduleDate,
      recurring: newTrigger.recurring,
      cronExpression: newTrigger.cronExpression,
      isActive: true,
      nextRun: calculateNextRun(newTrigger as TimeBasedTrigger)
    };

    setTriggers(prev => [trigger, ...prev]);
    setNewTrigger({ type: 'once', recurring: { frequency: 'daily', interval: 1 } });
    toast.success('Time-based trigger created');
  };

  const calculateNextRun = (trigger: TimeBasedTrigger): string => {
    const now = new Date();
    
    if (trigger.type === 'once' && trigger.scheduleDate && trigger.scheduleTime) {
      const [hours, minutes] = trigger.scheduleTime.split(':').map(Number);
      const scheduledDate = new Date(trigger.scheduleDate);
      scheduledDate.setHours(hours, minutes, 0, 0);
      return scheduledDate.toISOString();
    }
    
    if (trigger.type === 'recurring' && trigger.recurring && trigger.scheduleTime) {
      const [hours, minutes] = trigger.scheduleTime.split(':').map(Number);
      const nextRun = new Date();
      nextRun.setHours(hours, minutes, 0, 0);
      
      if (nextRun <= now) {
        nextRun.setDate(nextRun.getDate() + 1);
      }
      
      return nextRun.toISOString();
    }
    
    return new Date(now.getTime() + 60 * 60 * 1000).toISOString(); // Default to 1 hour from now
  };

  const toggleTrigger = (triggerId: string) => {
    setTriggers(prev => prev.map(trigger => 
      trigger.id === triggerId 
        ? { ...trigger, isActive: !trigger.isActive }
        : trigger
    ));
  };

  const deleteTrigger = (triggerId: string) => {
    setTriggers(prev => prev.filter(trigger => trigger.id !== triggerId));
    toast.success('Trigger deleted');
  };

  const formatNextRun = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'once': return <Calendar className="h-4 w-4" />;
      case 'recurring': return <Repeat className="h-4 w-4" />;
      case 'cron': return <Clock className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Time-Based Trigger Manager
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Trigger Name</label>
              <Input
                value={newTrigger.name || ''}
                onChange={(e) => setNewTrigger(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Daily reminder..."
              />
            </div>
            <div>
              <label className="text-sm font-medium">Automation</label>
              <Select 
                value={newTrigger.automationId || ''} 
                onValueChange={(value) => setNewTrigger(prev => ({ ...prev, automationId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select automation..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="welcome-customers">Welcome New Customers</SelectItem>
                  <SelectItem value="follow-up">Follow-up Reminder</SelectItem>
                  <SelectItem value="priority-alert">High Priority Alert</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Trigger Type</label>
              <Select 
                value={newTrigger.type || 'once'} 
                onValueChange={(value: 'once' | 'recurring' | 'cron') => 
                  setNewTrigger(prev => ({ ...prev, type: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="once">One-time</SelectItem>
                  <SelectItem value="recurring">Recurring</SelectItem>
                  <SelectItem value="cron">Cron Expression</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Time</label>
              <Input
                type="time"
                value={newTrigger.scheduleTime || ''}
                onChange={(e) => setNewTrigger(prev => ({ ...prev, scheduleTime: e.target.value }))}
              />
            </div>
          </div>

          {newTrigger.type === 'once' && (
            <div>
              <label className="text-sm font-medium">Date</label>
              <Input
                type="date"
                value={newTrigger.scheduleDate || ''}
                onChange={(e) => setNewTrigger(prev => ({ ...prev, scheduleDate: e.target.value }))}
              />
            </div>
          )}

          {newTrigger.type === 'recurring' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Frequency</label>
                <Select 
                  value={newTrigger.recurring?.frequency || 'daily'} 
                  onValueChange={(value: 'daily' | 'weekly' | 'monthly') => 
                    setNewTrigger(prev => ({ 
                      ...prev, 
                      recurring: { ...prev.recurring!, frequency: value }
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Interval</label>
                <Input
                  type="number"
                  min="1"
                  value={newTrigger.recurring?.interval || 1}
                  onChange={(e) => setNewTrigger(prev => ({ 
                    ...prev, 
                    recurring: { ...prev.recurring!, interval: parseInt(e.target.value) }
                  }))}
                />
              </div>
            </div>
          )}

          {newTrigger.type === 'cron' && (
            <div>
              <label className="text-sm font-medium">Cron Expression</label>
              <Input
                value={newTrigger.cronExpression || ''}
                onChange={(e) => setNewTrigger(prev => ({ ...prev, cronExpression: e.target.value }))}
                placeholder="0 9 * * 1-5 (9 AM weekdays)"
              />
            </div>
          )}

          <Button onClick={createTrigger} className="w-full md:w-auto">
            Create Time-Based Trigger
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {triggers.map((trigger) => (
          <Card key={trigger.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getTypeIcon(trigger.type)}
                  <h3 className="font-medium">{trigger.name}</h3>
                  <Badge variant="outline">{trigger.type}</Badge>
                  {trigger.isActive ? (
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                  ) : (
                    <Badge variant="secondary">Inactive</Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={trigger.isActive}
                    onCheckedChange={() => toggleTrigger(trigger.id)}
                  />
                  <Button variant="ghost" size="sm" onClick={() => deleteTrigger(trigger.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                {trigger.scheduleTime && (
                  <div>
                    <strong>Time:</strong> {trigger.scheduleTime}
                  </div>
                )}
                {trigger.nextRun && (
                  <div>
                    <strong>Next Run:</strong> {formatNextRun(trigger.nextRun)}
                  </div>
                )}
                {trigger.lastRun && (
                  <div>
                    <strong>Last Run:</strong> {formatNextRun(trigger.lastRun)}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default TimeBasedTriggerManager;
