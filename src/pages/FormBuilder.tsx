
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const FormBuilder = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-quikle-charcoal">Form Builder</h1>
        <p className="text-quikle-slate">Create and manage custom forms</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Custom Forms</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-quikle-slate">Form builder coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default FormBuilder;
