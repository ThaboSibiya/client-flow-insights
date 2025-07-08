
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Palette, Monitor, Smartphone, Layout } from 'lucide-react';

const AppearanceSettings = () => {
  return (
    <div className="space-y-6">
      {/* Theme Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Palette className="h-4 w-4" />
            Theme
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Color Theme</Label>
            <Select defaultValue="light">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="auto">System</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>Accent Color</Label>
            <div className="flex gap-2">
              {['blue', 'green', 'purple', 'orange', 'red'].map((color) => (
                <button
                  key={color}
                  className={`w-8 h-8 rounded-full border-2 ${
                    color === 'blue' ? 'border-quikle-primary bg-quikle-primary' : `bg-${color}-500 border-${color}-500`
                  }`}
                />
              ))}
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>High Contrast Mode</Label>
              <p className="text-sm text-quikle-slate">Improve accessibility with high contrast</p>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>

      {/* Layout Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Layout className="h-4 w-4" />
            Layout
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Sidebar Position</Label>
            <Select defaultValue="left">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="left">Left</SelectItem>
                <SelectItem value="right">Right</SelectItem>
                <SelectItem value="collapsed">Collapsed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>Content Density</Label>
            <Select defaultValue="comfortable">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="compact">Compact</SelectItem>
                <SelectItem value="comfortable">Comfortable</SelectItem>
                <SelectItem value="spacious">Spacious</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Show Grid Lines</Label>
              <p className="text-sm text-quikle-slate">Display grid lines in tables</p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>

      {/* Display Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Monitor className="h-4 w-4" />
            Display
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Font Size</Label>
            <Select defaultValue="medium">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small">Small</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="large">Large</SelectItem>
                <SelectItem value="extra-large">Extra Large</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>Language</Label>
            <Select defaultValue="en">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Spanish</SelectItem>
                <SelectItem value="fr">French</SelectItem>
                <SelectItem value="de">German</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>Date Format</Label>
            <Select defaultValue="mdy">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mdy">MM/DD/YYYY</SelectItem>
                <SelectItem value="dmy">DD/MM/YYYY</SelectItem>
                <SelectItem value="ymd">YYYY-MM-DD</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Mobile Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Smartphone className="h-4 w-4" />
            Mobile Experience
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Touch-Friendly Mode</Label>
              <p className="text-sm text-quikle-slate">Larger buttons and touch targets</p>
            </div>
            <Switch defaultChecked />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Swipe Gestures</Label>
              <p className="text-sm text-quikle-slate">Enable swipe navigation</p>
            </div>
            <Switch defaultChecked />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Auto-rotate Screen</Label>
              <p className="text-sm text-quikle-slate">Follow device orientation</p>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button>Save Appearance Settings</Button>
      </div>
    </div>
  );
};

export default AppearanceSettings;
