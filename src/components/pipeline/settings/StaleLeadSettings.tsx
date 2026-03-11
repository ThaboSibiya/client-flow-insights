import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Clock, AlertTriangle, Bell } from 'lucide-react';
import { toast } from 'sonner';

const StaleLeadSettings = () => {
  const [enabled, setEnabled] = useState(true);
  const [staleDays, setStaleDays] = useState('7');
  const [staleAction, setStaleAction] = useState('flag');
  const [notifyOwner, setNotifyOwner] = useState(true);
  const [autoReassign, setAutoReassign] = useState(false);

  const handleSave = () => {
    toast.success('Stale lead settings saved');
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-base">
          <Clock className="h-4 w-4 text-amber-500" />
          Stale Lead Detection
        </CardTitle>
        <CardDescription>
          Automatically flag or reassign leads that have been inactive for too long.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-sm font-medium">Enable stale lead detection</Label>
            <p className="text-xs text-muted-foreground">Flag leads with no activity</p>
          </div>
          <Switch checked={enabled} onCheckedChange={setEnabled} />
        </div>

        {enabled && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm">Days until stale</Label>
                <Input
                  type="number"
                  min="1"
                  max="90"
                  value={staleDays}
                  onChange={(e) => setStaleDays(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Action when stale</Label>
                <Select value={staleAction} onValueChange={setStaleAction}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="flag">
                      <span className="flex items-center gap-2">
                        <AlertTriangle className="h-3 w-3" /> Flag only
                      </span>
                    </SelectItem>
                    <SelectItem value="notify">
                      <span className="flex items-center gap-2">
                        <Bell className="h-3 w-3" /> Notify & flag
                      </span>
                    </SelectItem>
                    <SelectItem value="move">Move to lost</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Notify lead owner</Label>
                <p className="text-xs text-muted-foreground">Send alert when lead goes stale</p>
              </div>
              <Switch checked={notifyOwner} onCheckedChange={setNotifyOwner} />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Auto-reassign stale leads</Label>
                <p className="text-xs text-muted-foreground">Round-robin to active team members</p>
              </div>
              <Switch checked={autoReassign} onCheckedChange={setAutoReassign} />
            </div>
          </>
        )}

        <Button onClick={handleSave} size="sm" className="w-full">
          Save Stale Lead Settings
        </Button>
      </CardContent>
    </Card>
  );
};

export default StaleLeadSettings;
