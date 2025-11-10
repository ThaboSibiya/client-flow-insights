import React from 'react';
import FollowUpTracker from '@/components/finance/reminders/FollowUpTracker';

const FollowUpDashboard: React.FC = () => {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-quikle-primary via-quikle-secondary to-quikle-accent bg-clip-text text-transparent drop-shadow-lg">
          Follow-up Dashboard
        </h1>
        <p className="text-quikle-charcoal/70 font-medium">
          Track and manage reminder follow-ups
        </p>
      </div>

      <FollowUpTracker />
    </div>
  );
};

export default FollowUpDashboard;
