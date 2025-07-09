
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Messages = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-quikle-charcoal">Messages</h1>
        <p className="text-quikle-slate">Manage customer communications and messaging</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Message Center</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-quikle-slate">Messaging system coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Messages;
