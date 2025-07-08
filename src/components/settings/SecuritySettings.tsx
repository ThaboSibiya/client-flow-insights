
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield, Key, Clock, AlertTriangle } from 'lucide-react';

const SecuritySettings = () => {
  return (
    <div className="space-y-6">
      {/* Authentication Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Key className="h-4 w-4" />
            Authentication
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Two-Factor Authentication</Label>
              <p className="text-sm text-quikle-slate">Require 2FA for all user accounts</p>
            </div>
            <Switch />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Single Sign-On (SSO)</Label>
              <p className="text-sm text-quikle-slate">Enable SSO with Google or Microsoft</p>
            </div>
            <Switch />
          </div>
          
          <div className="space-y-2">
            <Label>Password Requirements</Label>
            <Select defaultValue="medium">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Basic (8+ characters)</SelectItem>
                <SelectItem value="medium">Medium (8+ chars, mixed case, numbers)</SelectItem>
                <SelectItem value="high">High (12+ chars, symbols, mixed case)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Session Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Clock className="h-4 w-4" />
            Session Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Session Timeout (minutes)</Label>
            <Input type="number" defaultValue="30" min="5" max="480" />
            <p className="text-sm text-quikle-slate">Automatically log out inactive users</p>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Force Re-authentication</Label>
              <p className="text-sm text-quikle-slate">Require password for sensitive actions</p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>

      {/* Access Control */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Shield className="h-4 w-4" />
            Access Control
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>IP Whitelist</Label>
            <Input placeholder="192.168.1.0/24, 10.0.0.0/8" />
            <p className="text-sm text-quikle-slate">Comma-separated IP addresses or ranges</p>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Audit Logging</Label>
              <p className="text-sm text-quikle-slate">Log all user actions and system events</p>
            </div>
            <Switch defaultChecked />
          </div>
          
          <div className="space-y-2">
            <Label>Failed Login Attempts</Label>
            <Select defaultValue="5">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">3 attempts</SelectItem>
                <SelectItem value="5">5 attempts</SelectItem>
                <SelectItem value="10">10 attempts</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-quikle-slate">Lock account after failed attempts</p>
          </div>
        </CardContent>
      </Card>

      {/* Data Protection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <AlertTriangle className="h-4 w-4" />
            Data Protection
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Data Encryption</Label>
              <p className="text-sm text-quikle-slate">Encrypt sensitive data at rest</p>
            </div>
            <Switch defaultChecked disabled />
          </div>
          
          <div className="space-y-2">
            <Label>Data Retention (days)</Label>
            <Input type="number" defaultValue="365" min="30" />
            <p className="text-sm text-quikle-slate">Automatically delete old records</p>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Export Restrictions</Label>
              <p className="text-sm text-quikle-slate">Require approval for data exports</p>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button>Save Security Settings</Button>
      </div>
    </div>
  );
};

export default SecuritySettings;
