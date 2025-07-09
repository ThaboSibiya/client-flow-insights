
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Settings = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-quikle-charcoal">Settings</h1>
        <p className="text-quikle-slate">Configure your application settings</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Application Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-quikle-slate">Settings panel coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
