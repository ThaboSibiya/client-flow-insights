
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Automations = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-quikle-charcoal">Automations</h1>
        <p className="text-quikle-slate">Configure automated workflows and processes</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Workflow Automation</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-quikle-slate">Automation tools coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Automations;
