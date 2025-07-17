
import React from 'react';
import { useParams } from 'react-router-dom';

const CustomerDetails = () => {
  const { customerId } = useParams<{ customerId: string }>();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Customer Details</h1>
      <p className="text-gray-600">Customer ID: {customerId}</p>
      <div className="mt-8">
        <p className="text-gray-500">Customer details functionality coming soon...</p>
      </div>
    </div>
  );
};

export default CustomerDetails;
