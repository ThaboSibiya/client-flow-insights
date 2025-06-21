
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Settings, MapPin, Briefcase } from 'lucide-react';
import { useLeadNurturing } from '@/hooks/useLeadNurturing';

interface AssignmentRule {
  id: string;
  name: string;
  enabled: boolean;
  criteria: 'territory' | 'workload' | 'skill' | 'round_robin';
  priority: number;
}

const CustomerAutoAssignment = () => {
  const [autoAssignEnabled, setAutoAssignEnabled] = useState(true);
  const [assignmentRules, setAssignmentRules] = useState<AssignmentRule[]>([
    {
      id: '1',
      name: 'Territory-based Assignment',
      enabled: true,
      criteria: 'territory',
      priority: 1
    },
    {
      id: '2', 
      name: 'Workload Balancing',
      enabled: true,
      criteria: 'workload',
      priority: 2
    },
    {
      id: '3',
      name: 'Skill-based Routing',
      enabled: false,
      criteria: 'skill',
      priority: 3
    }
  ]);

  const toggleRule = (ruleId: string) => {
    setAssignmentRules(prev =>
      prev.map(rule =>
        rule.id === ruleId ? { ...rule, enabled: !rule.enabled } : rule
      )
    );
  };

  const getRuleIcon = (criteria: string) => {
    switch (criteria) {
      case 'territory': return <MapPin className="h-4 w-4" />;
      case 'workload': return <Briefcase className="h-4 w-4" />;
      case 'skill': return <Settings className="h-4 w-4" />;
      default: return <Users className="h-4 w-4" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-blue-500" />
          Auto-Assignment Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Master Toggle */}
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="auto-assign-toggle" className="text-base font-medium">
              Enable Auto-Assignment
            </Label>
            <p className="text-sm text-muted-foreground">
              Automatically assign new leads to sales representatives
            </p>
          </div>
          <Switch
            id="auto-assign-toggle"
            checked={autoAssignEnabled}
            onCheckedChange={setAutoAssignEnabled}
          />
        </div>

        {/* Assignment Rules */}
        {autoAssignEnabled && (
          <div className="space-y-4">
            <h4 className="font-medium">Assignment Rules</h4>
            {assignmentRules.map((rule) => (
              <div key={rule.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getRuleIcon(rule.criteria)}
                  <div>
                    <p className="font-medium">{rule.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Priority: {rule.priority}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={rule.enabled}
                  onCheckedChange={() => toggleRule(rule.id)}
                />
              </div>
            ))}
          </div>
        )}

        {/* Default Assignment Settings */}
        <div className="space-y-4">
          <h4 className="font-medium">Default Settings</h4>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="max-capacity">Max Leads per Rep</Label>
              <Select defaultValue="50">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="25">25 leads</SelectItem>
                  <SelectItem value="50">50 leads</SelectItem>
                  <SelectItem value="75">75 leads</SelectItem>
                  <SelectItem value="100">100 leads</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="reassignment-time">Reassignment After</Label>
              <Select defaultValue="7">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3 days</SelectItem>
                  <SelectItem value="7">7 days</SelectItem>
                  <SelectItem value="14">14 days</SelectItem>
                  <SelectItem value="30">30 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <Button className="w-full">
          Save Assignment Settings
        </Button>
      </CardContent>
    </Card>
  );
};

export default CustomerAutoAssignment;
