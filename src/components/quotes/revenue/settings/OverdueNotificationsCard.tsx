
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Mail } from "lucide-react";

interface OverdueNotificationsCardProps {
  enabled: boolean;
  financeEmail: string;
  onToggleEnabled: (checked: boolean) => void;
  onChangeFinanceEmail: (email: string) => void;
}

const OverdueNotificationsCard = ({
  enabled,
  financeEmail,
  onToggleEnabled,
  onChangeFinanceEmail
}: OverdueNotificationsCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Overdue Notifications
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Finance Team Notifications</Label>
            <p className="text-sm text-muted-foreground">
              Notify finance team about overdue accounts
            </p>
          </div>
          <Switch
            checked={enabled}
            onCheckedChange={onToggleEnabled}
          />
        </div>

        <div className="space-y-2">
          <Label>Finance Team Email</Label>
          <Input
            value={financeEmail}
            onChange={(e) => onChangeFinanceEmail(e.target.value)}
            placeholder="finance@company.com"
            type="email"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default OverdueNotificationsCard;
