
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, FileText, Users, Phone } from 'lucide-react';

const QuickActions = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
      <div className="space-y-3">
        <Button className="w-full justify-start" variant="outline">
          <Users size={16} className="mr-2" />
          Add Customer
        </Button>
        <Button className="w-full justify-start" variant="outline">
          <FileText size={16} className="mr-2" />
          Create Quote
        </Button>
        <Button className="w-full justify-start" variant="outline">
          <Phone size={16} className="mr-2" />
          Schedule Call
        </Button>
      </div>
    </div>
  );
};

export default QuickActions;
