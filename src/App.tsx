
import React from 'react';

function App() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">CRM Dashboard</h1>
      <div className="space-y-4">
        <div className="p-4 bg-gray-100 rounded">
          <h2 className="text-xl font-semibold">Dashboard</h2>
          <p>Welcome to your CRM system</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-blue-100 rounded cursor-pointer hover:bg-blue-200">
            <h3 className="font-medium">Customers</h3>
          </div>
          <div className="p-4 bg-green-100 rounded cursor-pointer hover:bg-green-200">
            <h3 className="font-medium">Conversations</h3>
          </div>
          <div className="p-4 bg-yellow-100 rounded cursor-pointer hover:bg-yellow-200">
            <h3 className="font-medium">Employees</h3>
          </div>
          <div className="p-4 bg-purple-100 rounded cursor-pointer hover:bg-purple-200">
            <h3 className="font-medium">Pipeline</h3>
          </div>
          <div className="p-4 bg-red-100 rounded cursor-pointer hover:bg-red-200">
            <h3 className="font-medium">Quotes</h3>
          </div>
          <div className="p-4 bg-indigo-100 rounded cursor-pointer hover:bg-indigo-200">
            <h3 className="font-medium">Analytics</h3>
          </div>
          <div className="p-4 bg-pink-100 rounded cursor-pointer hover:bg-pink-200">
            <h3 className="font-medium">Onboarding</h3>
          </div>
          <div className="p-4 bg-gray-100 rounded cursor-pointer hover:bg-gray-200">
            <h3 className="font-medium">Settings</h3>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
