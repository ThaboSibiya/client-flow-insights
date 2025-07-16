
import React from 'react';
import { useParams } from 'react-router-dom';
import Layout from '@/components/layout/Layout';

const CustomerDetails = () => {
  const { customerId } = useParams<{ customerId: string }>();

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-quikle-silver/20 p-6">
          <h1 className="text-2xl font-bold text-quikle-charcoal mb-6">Customer Details</h1>
          <div className="text-quikle-neutral">
            <p>Customer ID: {customerId}</p>
            <p>This page will show detailed customer information.</p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CustomerDetails;
