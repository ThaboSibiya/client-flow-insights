
import React from 'react';

const RealtimeActivityFeed = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">Live Activity Feed</h3>
      <div className="space-y-3">
        <div className="p-3 bg-blue-50 rounded border-l-4 border-blue-500">
          <p className="text-sm text-blue-700">New customer registered</p>
          <p className="text-xs text-blue-600">2 minutes ago</p>
        </div>
        <div className="p-3 bg-green-50 rounded border-l-4 border-green-500">
          <p className="text-sm text-green-700">Quote approved</p>
          <p className="text-xs text-green-600">5 minutes ago</p>
        </div>
      </div>
    </div>
  );
};

export default RealtimeActivityFeed;
