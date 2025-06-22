
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, CheckCircle, Clock } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface StatusRule {
  id: string;
  name: string;
  fromStatus: string;
  toStatus: string;
  trigger: string;
  isActive: boolean;
  conditions: string[];
}

const AutoStatusUpdates = () => {
  const [rules, setRules] = useState<StatusRule[]>([
    {
      id: '1',
      name: 'Mark as Completed',
      fromStatus: 'in_progress',
      toStatus: 'completed',
      trigger: 'mobile_team_marks_complete',
      isActive: true,
      conditions: ['GPS location verified', 'Photo evidence uploaded'],
    },
    {
      id: '2',
      name: 'Schedule Follow-up',
      fromStatus: 'completed',
      toStatus: 'followup_scheduled',
      trigger: 'requires_followup_selected',
      isActive: true,
      conditions: ['Follow-up reason provided'],
    },
    {
      id: '3',
      name: 'Move to Invoicing',
      fromStatus: 'completed',
      toStatus: 'ready_for_invoice',
      trigger: 'no_issues_reported',
      isActive: false,
      conditions: ['Customer satisfaction confirmed'],
    },
  ]);

  const [recentUpdates, setRecentUpdates] = useState([
    {
      id: '1',
      customer: 'Sarah Johnson',
      oldStatus: 'In Progress',
      newStatus: 'Completed',
      updatedBy: 'Mike Wilson (Mobile)',
      timestamp: '2024-06-22T14:30:00Z',
      rule: 'Mark as Completed',
    },
    {
      id: '2',
      customer: 'David Chen',
      oldStatus: 'Completed',
      newStatus: 'Follow-up Scheduled',
      updatedBy: 'System',
      timestamp: '2024-06-22T13:45:00Z',
      rule: 'Schedule Follow-up',
    },
  ]);

  const toggleRule = (ruleId: string) => {
    setRules(prev => prev.map(rule => 
      rule.id === ruleId ? { ...rule, isActive: !rule.isActive } : rule
    ));
    toast({
      title: "Rule Updated",
      description: "Automation rule has been toggled.",
    });
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'in_progress': 'bg-blue-100 text-blue-800',
      'completed': 'bg-green-100 text-green-800',
      'followup_scheduled': 'bg-yellow-100 text-yellow-800',
      'ready_for_invoice': 'bg-purple-100 text-purple-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Automation Rules
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {rules.map((rule) => (
              <div key={rule.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold">{rule.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={getStatusColor(rule.fromStatus)}>
                        {rule.fromStatus.replace('_', ' ')}
                      </Badge>
                      <span>→</span>
                      <Badge className={getStatusColor(rule.toStatus)}>
                        {rule.toStatus.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                  <Switch
                    checked={rule.isActive}
                    onCheckedChange={() => toggleRule(rule.id)}
                  />
                </div>

                <div className="text-sm text-muted-foreground mb-2">
                  <strong>Trigger:</strong> {rule.trigger.replace('_', ' ')}
                </div>

                {rule.conditions.length > 0 && (
                  <div className="text-sm">
                    <strong>Conditions:</strong>
                    <ul className="list-disc list-inside mt-1 text-muted-foreground">
                      {rule.conditions.map((condition, index) => (
                        <li key={index}>{condition}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Recent Status Updates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentUpdates.map((update) => (
              <div key={update.id} className="border-l-4 border-quikle-primary pl-4 py-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">{update.customer}</h4>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(update.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  Status changed from <strong>{update.oldStatus}</strong> to <strong>{update.newStatus}</strong>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Updated by {update.updatedBy} • Rule: {update.rule}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AutoStatusUpdates;
