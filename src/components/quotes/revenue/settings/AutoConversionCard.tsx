
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Zap } from "lucide-react";

interface AutoConversionCardProps {
  autoCreateInvoice: boolean;
  dueDays: number;
  onToggleAutoCreate: (checked: boolean) => void;
  onChangeDueDays: (days: number) => void;
}

const AutoConversionCard = ({
  autoCreateInvoice,
  dueDays,
  onToggleAutoCreate,
  onChangeDueDays
}: AutoConversionCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Auto-Conversion
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Auto-create Invoices from Accepted Quotes</Label>
            <p className="text-sm text-muted-foreground">
              Automatically convert accepted quotes to draft invoices
            </p>
          </div>
          <Switch
            checked={autoCreateInvoice}
            onCheckedChange={onToggleAutoCreate}
          />
        </div>

        <div className="space-y-2">
          <Label>Default Invoice Due Days</Label>
          <Select 
            value={dueDays.toString()} 
            onValueChange={(value) => onChangeDueDays(parseInt(value))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select due days" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="15">15 days</SelectItem>
              <SelectItem value="30">30 days</SelectItem>
              <SelectItem value="45">45 days</SelectItem>
              <SelectItem value="60">60 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
};

export default AutoConversionCard;
