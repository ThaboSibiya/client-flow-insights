import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const CancellationPolicySummary = () => {
  const navigate = useNavigate();

  return (
    <Card className="border-amber-200/50 bg-amber-50/20 dark:bg-amber-950/10">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="font-medium text-sm text-amber-800 dark:text-amber-300">
              Cancellation Policy Summary
            </p>
            <ul className="text-xs text-amber-700 dark:text-amber-400 mt-1.5 space-y-1">
              <li>• Access continues until end of billing period — no partial refunds</li>
              <li>• Data retained for 30 days, then permanently deleted</li>
              <li>• Automations, webhooks & employee accounts are paused immediately</li>
              <li>• Quikle is not liable for data loss after the retention period</li>
            </ul>
            <Button
              variant="link"
              size="sm"
              className="text-amber-700 dark:text-amber-400 p-0 h-auto mt-2 text-xs"
              onClick={() => navigate('/cancellation-policy')}
            >
              Read full cancellation policy
              <ExternalLink className="h-3 w-3 ml-1" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CancellationPolicySummary;
