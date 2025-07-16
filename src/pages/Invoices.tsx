
import React from 'react';
import Layout from '@/components/layout/Layout';

const Invoices = () => {
  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-quikle-silver/20 p-6">
          <h1 className="text-2xl font-bold text-quikle-charcoal mb-6">Invoices</h1>
          <div className="text-quikle-neutral">
            <p>This page will show invoice management functionality.</p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Invoices;
