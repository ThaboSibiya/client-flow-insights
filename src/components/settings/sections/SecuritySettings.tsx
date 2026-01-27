
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Key, History, Users, Lock, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';

const SecuritySettings = () => {
  const [twoFactorEnabled, setTwoFactorEnabled] = React.useState(false);
  const [sessionTimeout, setSessionTimeout] = React.useState(true);

  return (
    <div className="space-y-6">
      {/* Security Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-quikle-primary" />
            Security Overview
          </CardTitle>
          <CardDescription>
            Manage your account security and access controls
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Two-Factor Authentication */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-quikle-crystal/50 rounded-lg">
                <Key className="h-4 w-4 text-quikle-primary" />
              </div>
              <div>
                <Label className="font-medium">Two-Factor Authentication</Label>
                <p className="text-sm text-quikle-slate/70">
                  Add an extra layer of security to your account
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant={twoFactorEnabled ? "default" : "secondary"}>
                {twoFactorEnabled ? 'Enabled' : 'Disabled'}
              </Badge>
              <Switch
                checked={twoFactorEnabled}
                onCheckedChange={setTwoFactorEnabled}
              />
            </div>
          </div>

          <Separator />

          {/* Session Timeout */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-quikle-crystal/50 rounded-lg">
                <Lock className="h-4 w-4 text-quikle-primary" />
              </div>
              <div>
                <Label className="font-medium">Auto Session Timeout</Label>
                <p className="text-sm text-quikle-slate/70">
                  Automatically log out after 30 minutes of inactivity
                </p>
              </div>
            </div>
            <Switch
              checked={sessionTimeout}
              onCheckedChange={setSessionTimeout}
            />
          </div>

          <Separator />

          {/* Password Change */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-quikle-crystal/50 rounded-lg">
                <Key className="h-4 w-4 text-quikle-primary" />
              </div>
              <div>
                <Label className="font-medium">Password</Label>
                <p className="text-sm text-quikle-slate/70">
                  Last changed 30 days ago
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm">
              Change Password
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Audit & Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5 text-quikle-primary" />
            Audit & Activity
          </CardTitle>
          <CardDescription>
            Monitor account activity and access logs
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-quikle-crystal/30 rounded-lg">
            <div className="flex items-center gap-3">
              <History className="h-5 w-5 text-quikle-primary" />
              <div>
                <p className="font-medium text-quikle-charcoal">Audit Log</p>
                <p className="text-sm text-quikle-slate/70">
                  View detailed activity logs and security events
                </p>
              </div>
            </div>
            <Button variant="outline" asChild>
              <Link to="/audit-log">View Logs</Link>
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 bg-quikle-crystal/30 rounded-lg">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-quikle-primary" />
              <div>
                <p className="font-medium text-quikle-charcoal">Active Sessions</p>
                <p className="text-sm text-quikle-slate/70">
                  Manage devices logged into your account
                </p>
              </div>
            </div>
            <Button variant="outline">Manage Sessions</Button>
          </div>
        </CardContent>
      </Card>

      {/* Security Recommendations */}
      <Card className="border-amber-200 bg-amber-50/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-800">
            <AlertTriangle className="h-5 w-5" />
            Security Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-amber-800">
            {!twoFactorEnabled && (
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-amber-600 rounded-full" />
                Enable two-factor authentication for better security
              </li>
            )}
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-amber-600 rounded-full" />
              Review your active sessions regularly
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-amber-600 rounded-full" />
              Use a strong, unique password
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecuritySettings;
