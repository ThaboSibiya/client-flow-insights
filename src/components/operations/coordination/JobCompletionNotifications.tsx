
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Bell, Clock, MapPin } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface JobCompletion {
  id: string;
  customerName: string;
  jobType: string;
  completedBy: string;
  completedAt: string;
  location: string;
  status: 'completed' | 'requires_followup' | 'issue_found';
  nextAction?: string;
}

const JobCompletionNotifications = () => {
  const [notifications, setNotifications] = useState<JobCompletion[]>([
    {
      id: '1',
      customerName: 'Sarah Johnson',
      jobType: 'Installation',
      completedBy: 'Mike Wilson',
      completedAt: '2024-06-22T14:30:00Z',
      location: '123 Oak Street',
      status: 'completed',
    },
    {
      id: '2',
      customerName: 'David Chen',
      jobType: 'Maintenance',
      completedBy: 'Lisa Brown',
      completedAt: '2024-06-22T13:15:00Z',
      location: '456 Pine Avenue',
      status: 'requires_followup',
      nextAction: 'Schedule follow-up inspection',
    },
  ]);

  const [settings, setSettings] = useState({
    autoNotify: true,
    notifyMethods: ['email', 'sms'],
    delayMinutes: 0,
  });

  const handleNotificationAction = (id: string, action: 'acknowledge' | 'schedule_followup') => {
    if (action === 'acknowledge') {
      setNotifications(prev => prev.filter(n => n.id !== id));
      toast({
        title: "Notification Acknowledged",
        description: "Job completion has been processed.",
      });
    } else {
      toast({
        title: "Follow-up Scheduled",
        description: "Next appointment has been scheduled.",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'requires_followup': return 'bg-yellow-100 text-yellow-800';
      case 'issue_found': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="auto-notify">Auto-notify office team</Label>
            <Switch
              id="auto-notify"
              checked={settings.autoNotify}
              onCheckedChange={(checked) => 
                setSettings(prev => ({ ...prev, autoNotify: checked }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label>Notification delay</Label>
            <Select 
              value={settings.delayMinutes.toString()}
              onValueChange={(value) => 
                setSettings(prev => ({ ...prev, delayMinutes: parseInt(value) }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Immediate</SelectItem>
                <SelectItem value="5">5 minutes</SelectItem>
                <SelectItem value="15">15 minutes</SelectItem>
                <SelectItem value="30">30 minutes</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Job Completions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div key={notification.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold">{notification.customerName}</h4>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                      <span>{notification.jobType}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(notification.completedAt).toLocaleTimeString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {notification.location}
                      </span>
                    </div>
                  </div>
                  <Badge className={getStatusColor(notification.status)}>
                    {notification.status.replace('_', ' ')}
                  </Badge>
                </div>

                <div className="text-sm">
                  <span className="text-muted-foreground">Completed by:</span> {notification.completedBy}
                </div>

                {notification.nextAction && (
                  <div className="text-sm bg-yellow-50 p-2 rounded">
                    <strong>Action Required:</strong> {notification.nextAction}
                  </div>
                )}

                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleNotificationAction(notification.id, 'acknowledge')}
                  >
                    Acknowledge
                  </Button>
                  {notification.status === 'requires_followup' && (
                    <Button 
                      size="sm"
                      onClick={() => handleNotificationAction(notification.id, 'schedule_followup')}
                    >
                      Schedule Follow-up
                    </Button>
                  )}
                </div>
              </div>
            ))}

            {notifications.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No pending job completion notifications</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default JobCompletionNotifications;
