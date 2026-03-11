import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Users, Shuffle, UserPlus } from 'lucide-react';
import { toast } from 'sonner';

const LeadRoutingSettings = () => {
  const [autoAssign, setAutoAssign] = useState(false);
  const [routingMethod, setRoutingMethod] = useState('round-robin');
  const [maxLeadsPerEmployee, setMaxLeadsPerEmployee] = useState('50');
  const [assignBySource, setAssignBySource] = useState(false);

  const handleSave = () => {
    toast.success('Lead routing settings saved');
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-base">
          <Shuffle className="h-4 w-4 text-blue-500" />
          Lead Routing & Assignment
        </CardTitle>
        <CardDescription>
          Automatically distribute incoming leads to your team members.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-sm font-medium">Auto-assign new leads</Label>
            <p className="text-xs text-muted-foreground">Automatically route leads to employees</p>
          </div>
          <Switch checked={autoAssign} onCheckedChange={setAutoAssign} />
        </div>

        {autoAssign && (
          <>
            <div className="space-y-2">
              <Label className="text-sm">Routing method</Label>
              <Select value={routingMethod} onValueChange={setRoutingMethod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="round-robin">
                    <span className="flex items-center gap-2">
                      <Shuffle className="h-3 w-3" /> Round Robin
                    </span>
                  </SelectItem>
                  <SelectItem value="load-balanced">
                    <span className="flex items-center gap-2">
                      <Users className="h-3 w-3" /> Load Balanced
                    </span>
                  </SelectItem>
                  <SelectItem value="manual">
                    <span className="flex items-center gap-2">
                      <UserPlus className="h-3 w-3" /> Manual Only
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Max leads per employee</Label>
              <Input
                type="number"
                min="1"
                max="500"
                value={maxLeadsPerEmployee}
                onChange={(e) => setMaxLeadsPerEmployee(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                New leads skip employees at capacity
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Route by lead source</Label>
                <p className="text-xs text-muted-foreground">
                  Assign Voice AI leads to specific reps
                </p>
              </div>
              <Switch checked={assignBySource} onCheckedChange={setAssignBySource} />
            </div>
          </>
        )}

        <Button onClick={handleSave} size="sm" className="w-full">
          Save Routing Settings
        </Button>
      </CardContent>
    </Card>
  );
};

export default LeadRoutingSettings;
