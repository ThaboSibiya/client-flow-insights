
import React from 'react';
import Layout from '@/components/layout/Layout';

const TemplateManagement = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold mb-4">Template Management</h1>
          <p className="text-gray-600">Manage your industry templates and custom fields here.</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-4">Available Templates</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium">Real Estate</h3>
              <p className="text-sm text-gray-600">Property-specific fields</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium">Insurance</h3>
              <p className="text-sm text-gray-600">Policy management fields</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium">Healthcare</h3>
              <p className="text-sm text-gray-600">Medical practice fields</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default TemplateManagement;
