
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Settings } from "lucide-react";

interface UpsellTriggersCardProps {
  enabled: boolean;
  highValueThreshold: number;
  repeatCustomerThreshold: number;
  onToggleEnabled: (checked: boolean) => void;
  onChangeHighValueThreshold: (threshold: number) => void;
  onChangeRepeatCustomerThreshold: (threshold: number) => void;
}

const UpsellTriggersCard = ({
  enabled,
  highValueThreshold,
  repeatCustomerThreshold,
  onToggleEnabled,
  onChangeHighValueThreshold,
  onChangeRepeatCustomerThreshold
}: UpsellTriggersCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Upselling Triggers
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Enable Upselling Triggers</Label>
            <p className="text-sm text-muted-foreground">
              Identify and suggest upselling opportunities
            </p>
          </div>
          <Switch
            checked={enabled}
            onCheckedChange={onToggleEnabled}
          />
        </div>

        <div className="space-y-2">
          <Label>High-Value Customer Threshold (R)</Label>
          <Input
            type="number"
            value={highValueThreshold}
            onChange={(e) => onChangeHighValueThreshold(parseFloat(e.target.value))}
            placeholder="10000"
          />
        </div>

        <div className="space-y-2">
          <Label>Repeat Customer Minimum Orders</Label>
          <Input
            type="number"
            value={repeatCustomerThreshold}
            onChange={(e) => onChangeRepeatCustomerThreshold(parseInt(e.target.value))}
            placeholder="3"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default UpsellTriggersCard;
