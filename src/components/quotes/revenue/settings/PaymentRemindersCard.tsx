
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Clock } from "lucide-react";

interface PaymentRemindersCardProps {
  enabled: boolean;
  reminderDays: number[];
  template: string;
  onToggleEnabled: (checked: boolean) => void;
  onChangeReminderDays: (days: number[]) => void;
  onChangeTemplate: (template: string) => void;
}

const PaymentRemindersCard = ({
  enabled,
  reminderDays,
  template,
  onToggleEnabled,
  onChangeReminderDays,
  onChangeTemplate
}: PaymentRemindersCardProps) => {
  const handleDayToggle = (day: number, checked: boolean) => {
    if (checked) {
      onChangeReminderDays([...reminderDays, day]);
    } else {
      onChangeReminderDays(reminderDays.filter(d => d !== day));
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Payment Reminders
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Enable Payment Reminders</Label>
            <p className="text-sm text-muted-foreground">
              Send automated payment reminders before due dates
            </p>
          </div>
          <Switch
            checked={enabled}
            onCheckedChange={onToggleEnabled}
          />
        </div>

        <div className="space-y-2">
          <Label>Reminder Schedule (Days Before Due)</Label>
          <div className="grid grid-cols-4 gap-2">
            {[3, 7, 14, 30].map((day) => (
              <div key={day} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={`day-${day}`}
                  checked={reminderDays.includes(day)}
                  onChange={(e) => handleDayToggle(day, e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor={`day-${day}`} className="text-sm">{day}d</Label>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Reminder Template</Label>
          <Textarea
            value={template}
            onChange={(e) => onChangeTemplate(e.target.value)}
            placeholder="Payment reminder message template..."
            rows={3}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentRemindersCard;
