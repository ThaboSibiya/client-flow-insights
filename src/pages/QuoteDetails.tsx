
import React from 'react';
import { useParams } from 'react-router-dom';

const QuoteDetails = () => {
  const { quoteId } = useParams<{ quoteId: string }>();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Quote Details</h1>
      <p className="text-gray-600">Quote ID: {quoteId}</p>
      <div className="mt-8">
        <p className="text-gray-500">Quote details functionality coming soon...</p>
      </div>
    </div>
  );
};

export default QuoteDetails;
