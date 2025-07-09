
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Tickets = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-quikle-charcoal">Tickets</h1>
        <p className="text-quikle-slate">Manage support tickets and customer issues</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Support Tickets</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-quikle-slate">Ticket management system coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Tickets;
