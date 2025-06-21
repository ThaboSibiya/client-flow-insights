
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Clock, Users, CheckCircle2 } from 'lucide-react';
import { useTicketRouting } from '@/hooks/useTicketRouting';

const TicketRoutingSettings = () => {
  const { routingStats, checkOverdueTickets, autoCloseResolvedTickets, isProcessing } = useTicketRouting();
  const [settings, setSettings] = useState({
    enableAutoAssignment: true,
    enableSkillBasedRouting: true,
    enableEscalation: true,
    enableAutoClose: true,
    urgentEscalationHours: 1,
    highEscalationHours: 4,
    mediumEscalationHours: 24,
    lowEscalationHours: 72,
    autoCloseHours: 72,
  });

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const saveSettings = () => {
    // In a real app, save to database
    localStorage.setItem('ticketRoutingSettings', JSON.stringify(settings));
    console.log('Ticket routing settings saved:', settings);
  };

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center p-4">
            <Users className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <p className="text-2xl font-bold">{routingStats.assignedCount}</p>
              <p className="text-xs text-muted-foreground">Auto-Assigned</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-4">
            <AlertTriangle className="h-8 w-8 text-orange-600 mr-3" />
            <div>
              <p className="text-2xl font-bold">{routingStats.escalatedCount}</p>
              <p className="text-xs text-muted-foreground">Escalated</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-4">
            <CheckCircle2 className="h-8 w-8 text-green-600 mr-3" />
            <div>
              <p className="text-2xl font-bold">{routingStats.autoClosedCount}</p>
              <p className="text-xs text-muted-foreground">Auto-Closed</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-4">
            <Clock className="h-8 w-8 text-purple-600 mr-3" />
            <div>
              <p className="text-2xl font-bold">{routingStats.totalProcessed}</p>
              <p className="text-xs text-muted-foreground">Total Processed</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Routing Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Intelligent Ticket Routing Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Auto Assignment */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-base font-medium">Auto Assignment</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically assign tickets based on priority and agent availability
                </p>
              </div>
              <Switch
                checked={settings.enableAutoAssignment}
                onCheckedChange={(checked) => handleSettingChange('enableAutoAssignment', checked)}
              />
            </div>
            
            {settings.enableAutoAssignment && (
              <div className="pl-4 space-y-2">
                <Badge variant="outline">Priority Rules</Badge>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Urgent tickets → Assigned to managers</li>
                  <li>• High/Medium/Low tickets → Assigned to available agents by workload</li>
                </ul>
              </div>
            )}
          </div>

          <Separator />

          {/* Skill-Based Routing */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-base font-medium">Skill-Based Routing</Label>
                <p className="text-sm text-muted-foreground">
                  Route tickets based on agent skills and ticket category
                </p>
              </div>
              <Switch
                checked={settings.enableSkillBasedRouting}
                onCheckedChange={(checked) => handleSettingChange('enableSkillBasedRouting', checked)}
              />
            </div>
            
            {settings.enableSkillBasedRouting && (
              <div className="pl-4 space-y-2">
                <Badge variant="outline">Category Mapping</Badge>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Technical → Technical Support Team</li>
                  <li>• Billing → Billing Department</li>
                  <li>• Sales → Sales Team</li>
                  <li>• General → Customer Service</li>
                </ul>
              </div>
            )}
          </div>

          <Separator />

          {/* Escalation Settings */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-base font-medium">Auto Escalation</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically escalate overdue tickets to managers
                </p>
              </div>
              <Switch
                checked={settings.enableEscalation}
                onCheckedChange={(checked) => handleSettingChange('enableEscalation', checked)}
              />
            </div>
            
            {settings.enableEscalation && (
              <div className="pl-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <Label className="text-xs">Urgent (hours)</Label>
                  <Input
                    type="number"
                    value={settings.urgentEscalationHours}
                    onChange={(e) => handleSettingChange('urgentEscalationHours', parseInt(e.target.value))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs">High (hours)</Label>
                  <Input
                    type="number"
                    value={settings.highEscalationHours}
                    onChange={(e) => handleSettingChange('highEscalationHours', parseInt(e.target.value))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs">Medium (hours)</Label>
                  <Input
                    type="number"
                    value={settings.mediumEscalationHours}
                    onChange={(e) => handleSettingChange('mediumEscalationHours', parseInt(e.target.value))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs">Low (hours)</Label>
                  <Input
                    type="number"
                    value={settings.lowEscalationHours}
                    onChange={(e) => handleSettingChange('lowEscalationHours', parseInt(e.target.value))}
                    className="mt-1"
                  />
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Auto Close Settings */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-base font-medium">Auto Close Resolved Tickets</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically close resolved tickets after customer confirmation timeout
                </p>
              </div>
              <Switch
                checked={settings.enableAutoClose}
                onCheckedChange={(checked) => handleSettingChange('enableAutoClose', checked)}
              />
            </div>
            
            {settings.enableAutoClose && (
              <div className="pl-4">
                <Label className="text-sm">Auto-close after (hours)</Label>
                <Input
                  type="number"
                  value={settings.autoCloseHours}
                  onChange={(e) => handleSettingChange('autoCloseHours', parseInt(e.target.value))}
                  className="mt-1 w-32"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Default: 72 hours (3 days)
                </p>
              </div>
            )}
          </div>

          <Separator />

          {/* Manual Actions */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Manual Actions</Label>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={checkOverdueTickets}
                disabled={isProcessing}
              >
                <Clock className="h-4 w-4 mr-2" />
                Check Overdue Tickets
              </Button>
              <Button
                variant="outline"
                onClick={autoCloseResolvedTickets}
                disabled={isProcessing}
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Auto-Close Resolved
              </Button>
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={saveSettings}>
              Save Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TicketRoutingSettings;
