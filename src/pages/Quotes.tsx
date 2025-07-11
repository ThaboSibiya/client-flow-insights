
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Quotes = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-quikle-charcoal">Quotes & Invoices</h1>
        <p className="text-quikle-slate">Manage your quotes and invoices</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Quote Management</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-quikle-slate">Quote and invoice management coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Quotes;
