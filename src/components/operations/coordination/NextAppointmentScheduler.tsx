
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface SchedulingRule {
  id: string;
  jobOutcome: string;
  appointmentType: string;
  delayDays: number;
  priority: 'low' | 'medium' | 'high';
  isActive: boolean;
}

interface PendingAppointment {
  id: string;
  customer: string;
  appointmentType: string;
  suggestedDate: string;
  priority: string;
  jobOutcome: string;
  notes: string;
}

const NextAppointmentScheduler = () => {
  const [schedulingRules, setSchedulingRules] = useState<SchedulingRule[]>([
    {
      id: '1',
      jobOutcome: 'installation_complete',
      appointmentType: 'follow_up_inspection',
      delayDays: 7,
      priority: 'medium',
      isActive: true,
    },
    {
      id: '2',
      jobOutcome: 'maintenance_required',
      appointmentType: 'maintenance_visit',
      delayDays: 3,
      priority: 'high',
      isActive: true,
    },
    {
      id: '3',
      jobOutcome: 'warranty_service',
      appointmentType: 'warranty_followup',
      delayDays: 14,
      priority: 'low',
      isActive: true,
    },
  ]);

  const [pendingAppointments, setPendingAppointments] = useState<PendingAppointment[]>([
    {
      id: '1',
      customer: 'Sarah Johnson',
      appointmentType: 'Follow-up Inspection',
      suggestedDate: '2024-06-29T10:00:00Z',
      priority: 'medium',
      jobOutcome: 'Installation Complete',
      notes: 'Check installation quality and customer satisfaction',
    },
    {
      id: '2',
      customer: 'David Chen',
      appointmentType: 'Maintenance Visit',
      suggestedDate: '2024-06-25T14:00:00Z',
      priority: 'high',
      jobOutcome: 'Maintenance Required',
      notes: 'Address reported issue with system performance',
    },
  ]);

  const [newRule, setNewRule] = useState({
    jobOutcome: '',
    appointmentType: '',
    delayDays: 7,
    priority: 'medium' as const,
  });

  const handleScheduleAppointment = (appointmentId: string, action: 'approve' | 'reschedule' | 'cancel') => {
    if (action === 'approve') {
      setPendingAppointments(prev => prev.filter(apt => apt.id !== appointmentId));
      toast({
        title: "Appointment Scheduled",
        description: "The appointment has been added to the calendar.",
      });
    } else if (action === 'cancel') {
      setPendingAppointments(prev => prev.filter(apt => apt.id !== appointmentId));
      toast({
        title: "Appointment Cancelled",
        description: "The suggested appointment has been cancelled.",
      });
    }
  };

  const addSchedulingRule = () => {
    if (!newRule.jobOutcome || !newRule.appointmentType) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const rule: SchedulingRule = {
      id: Date.now().toString(),
      ...newRule,
      isActive: true,
    };

    setSchedulingRules(prev => [...prev, rule]);
    setNewRule({
      jobOutcome: '',
      appointmentType: '',
      delayDays: 7,
      priority: 'medium',
    });

    toast({
      title: "Rule Added",
      description: "New scheduling rule has been created.",
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Scheduling Rules
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <Label>Job Outcome</Label>
              <Input
                placeholder="e.g., installation_complete"
                value={newRule.jobOutcome}
                onChange={(e) => setNewRule(prev => ({ ...prev, jobOutcome: e.target.value }))}
              />
            </div>
            <div>
              <Label>Appointment Type</Label>
              <Input
                placeholder="e.g., follow_up_inspection"
                value={newRule.appointmentType}
                onChange={(e) => setNewRule(prev => ({ ...prev, appointmentType: e.target.value }))}
              />
            </div>
            <div>
              <Label>Delay (Days)</Label>
              <Input
                type="number"
                value={newRule.delayDays}
                onChange={(e) => setNewRule(prev => ({ ...prev, delayDays: parseInt(e.target.value) }))}
              />
            </div>
            <div>
              <Label>Priority</Label>
              <Select value={newRule.priority} onValueChange={(value: any) => setNewRule(prev => ({ ...prev, priority: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={addSchedulingRule} className="w-full">
            Add Scheduling Rule
          </Button>

          <div className="space-y-3">
            {schedulingRules.map((rule) => (
              <div key={rule.id} className="border rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium">{rule.jobOutcome.replace('_', ' ')}</span>
                    <span className="mx-2">→</span>
                    <span>{rule.appointmentType.replace('_', ' ')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getPriorityColor(rule.priority)}>
                      {rule.priority}
                    </Badge>
                    <span className="text-sm text-muted-foreground">{rule.delayDays} days</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Pending Appointments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pendingAppointments.map((appointment) => (
              <div key={appointment.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {appointment.customer}
                    </h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {appointment.appointmentType}
                    </p>
                  </div>
                  <Badge className={getPriorityColor(appointment.priority)}>
                    {appointment.priority}
                  </Badge>
                </div>

                <div className="text-sm space-y-1 mb-3">
                  <div><strong>Suggested Date:</strong> {new Date(appointment.suggestedDate).toLocaleString()}</div>
                  <div><strong>Job Outcome:</strong> {appointment.jobOutcome}</div>
                  <div><strong>Notes:</strong> {appointment.notes}</div>
                </div>

                <div className="flex gap-2">
                  <Button 
                    size="sm"
                    onClick={() => handleScheduleAppointment(appointment.id, 'approve')}
                  >
                    Schedule
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleScheduleAppointment(appointment.id, 'reschedule')}
                  >
                    Reschedule
                  </Button>
                  <Button 
                    size="sm" 
                    variant="destructive"
                    onClick={() => handleScheduleAppointment(appointment.id, 'cancel')}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NextAppointmentScheduler;
