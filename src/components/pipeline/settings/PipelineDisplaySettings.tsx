import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { LayoutGrid, List, Table, Eye } from 'lucide-react';
import { toast } from 'sonner';

const PipelineDisplaySettings = () => {
  const [defaultView, setDefaultView] = useState('kanban');
  const [showMetrics, setShowMetrics] = useState(true);
  const [compactCards, setCompactCards] = useState(false);
  const [showCardSource, setShowCardSource] = useState(true);
  const [showCardValue, setShowCardValue] = useState(false);
  const [showStageCount, setShowStageCount] = useState(true);

  const handleSave = () => {
    toast.success('Display preferences saved');
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-base">
          <Eye className="h-4 w-4 text-violet-500" />
          Display Preferences
        </CardTitle>
        <CardDescription>
          Customize how your pipeline board looks and what information is shown.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-2">
          <Label className="text-sm">Default view</Label>
          <Select value={defaultView} onValueChange={setDefaultView}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="kanban">
                <span className="flex items-center gap-2">
                  <LayoutGrid className="h-3 w-3" /> Kanban Board
                </span>
              </SelectItem>
              <SelectItem value="list">
                <span className="flex items-center gap-2">
                  <List className="h-3 w-3" /> List View
                </span>
              </SelectItem>
              <SelectItem value="table">
                <span className="flex items-center gap-2">
                  <Table className="h-3 w-3" /> Table View
                </span>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          <Label className="text-sm font-medium">Card fields</Label>
          
          <div className="flex items-center justify-between">
            <Label className="text-sm text-muted-foreground">Show lead source</Label>
            <Switch checked={showCardSource} onCheckedChange={setShowCardSource} />
          </div>

          <div className="flex items-center justify-between">
            <Label className="text-sm text-muted-foreground">Show deal value</Label>
            <Switch checked={showCardValue} onCheckedChange={setShowCardValue} />
          </div>

          <div className="flex items-center justify-between">
            <Label className="text-sm text-muted-foreground">Show stage count badges</Label>
            <Switch checked={showStageCount} onCheckedChange={setShowStageCount} />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label className="text-sm font-medium">Show stage metrics</Label>
            <p className="text-xs text-muted-foreground">Conversion rates and targets</p>
          </div>
          <Switch checked={showMetrics} onCheckedChange={setShowMetrics} />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label className="text-sm font-medium">Compact card mode</Label>
            <p className="text-xs text-muted-foreground">Show less detail per card</p>
          </div>
          <Switch checked={compactCards} onCheckedChange={setCompactCards} />
        </div>

        <Button onClick={handleSave} size="sm" className="w-full">
          Save Display Preferences
        </Button>
      </CardContent>
    </Card>
  );
};

export default PipelineDisplaySettings;
