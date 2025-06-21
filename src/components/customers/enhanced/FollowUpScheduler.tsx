
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';

interface FollowUpSchedule {
  id: string;
  name: string;
  days: number;
  priority: 'low' | 'medium' | 'high';
  enabled: boolean;
  description: string;
}

const FollowUpScheduler = () => {
  const [schedules, setSchedules] = useState<FollowUpSchedule[]>([
    {
      id: '1',
      name: 'Initial Follow-up',
      days: 3,
      priority: 'medium',
      enabled: true,
      description: 'First follow-up contact after lead creation'
    },
    {
      id: '2',
      name: 'Second Touch',
      days: 7,
      priority: 'high',
      enabled: true,
      description: 'Second follow-up if no response'
    },
    {
      id: '3',
      name: 'Final Attempt',
      days: 14,
      priority: 'high',
      enabled: true,
      description: 'Last attempt before marking as cold lead'
    }
  ]);

  const toggleSchedule = (scheduleId: string) => {
    setSchedules(prev =>
      prev.map(schedule =>
        schedule.id === scheduleId 
          ? { ...schedule, enabled: !schedule.enabled }
          : schedule
      )
    );
  };

  const updateScheduleDays = (scheduleId: string, days: number) => {
    setSchedules(prev =>
      prev.map(schedule =>
        schedule.id === scheduleId 
          ? { ...schedule, days }
          : schedule
      )
    );
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-green-500" />
          Follow-up Scheduler
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {schedules.map((schedule, index) => (
          <div key={schedule.id} className="border rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  {schedule.enabled ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-gray-400" />
                  )}
                  <span className="font-medium">{schedule.name}</span>
                </div>
                <Badge className={getPriorityColor(schedule.priority)}>
                  {schedule.priority}
                </Badge>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => toggleSchedule(schedule.id)}
              >
                {schedule.enabled ? 'Disable' : 'Enable'}
              </Button>
            </div>

            <p className="text-sm text-muted-foreground">
              {schedule.description}
            </p>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-500" />
                <Label htmlFor={`days-${schedule.id}`} className="text-sm">
                  Days after last contact:
                </Label>
              </div>
              <Input
                id={`days-${schedule.id}`}
                type="number"
                value={schedule.days}
                onChange={(e) => updateScheduleDays(schedule.id, parseInt(e.target.value) || 0)}
                className="w-20"
                min="1"
                max="365"
              />
            </div>

            {index < schedules.length - 1 && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="h-px bg-border flex-1" />
                <span>then</span>
                <div className="h-px bg-border flex-1" />
              </div>
            )}
          </div>
        ))}

        <div className="pt-4 border-t">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span>{schedules.filter(s => s.enabled).length} active schedules</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-500" />
              <span>Max {Math.max(...schedules.map(s => s.days))} days follow-up</span>
            </div>
          </div>
        </div>

        <Button className="w-full">
          Save Follow-up Schedule
        </Button>
      </CardContent>
    </Card>
  );
};

export default FollowUpScheduler;
