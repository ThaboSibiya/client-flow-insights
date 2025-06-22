
import React, { useState } from 'react';
import { toast } from 'sonner';
import { SatisfactionSurvey, CustomerInsightsSettings } from './types';
import SurveySettings from './satisfaction/SurveySettings';
import SurveyMetrics from './satisfaction/SurveyMetrics';
import SurveysList from './satisfaction/SurveysList';

interface SatisfactionSurveysProps {
  settings: CustomerInsightsSettings['satisfactionSurveys'];
  onUpdateSettings: (settings: CustomerInsightsSettings['satisfactionSurveys']) => void;
}

const SatisfactionSurveys = ({ settings, onUpdateSettings }: SatisfactionSurveysProps) => {
  const [surveys, setSurveys] = useState<SatisfactionSurvey[]>([
    {
      id: '1',
      customerId: 'cust-1',
      jobId: 'job-001',
      customerName: 'Acme Corporation',
      jobType: 'Installation Service',
      completedAt: '2024-01-20T14:30:00Z',
      surveyStatus: 'completed',
      responses: {
        overallSatisfaction: 5,
        serviceQuality: 5,
        timeliness: 4,
        communication: 5,
        likelihood_to_recommend: 5,
        feedback: 'Excellent service! Very professional team and completed on time.'
      },
      sentAt: '2024-01-20T16:30:00Z',
      remindersSent: 0
    },
    {
      id: '2',
      customerId: 'cust-2',
      jobId: 'job-002',
      customerName: 'Tech Solutions Ltd',
      jobType: 'Maintenance Service',
      completedAt: '2024-01-19T10:15:00Z',
      surveyStatus: 'sent',
      sentAt: '2024-01-19T12:15:00Z',
      remindersSent: 1
    },
    {
      id: '3',
      customerId: 'cust-3',
      jobId: 'job-003',
      customerName: 'Global Industries',
      jobType: 'Repair Service',
      completedAt: '2024-01-18T16:45:00Z',
      surveyStatus: 'pending',
      remindersSent: 0
    }
  ]);

  const sendSurvey = (surveyId: string) => {
    setSurveys(prev =>
      prev.map(survey =>
        survey.id === surveyId
          ? { ...survey, surveyStatus: 'sent' as const, sentAt: new Date().toISOString() }
          : survey
      )
    );
    toast.success('Survey sent successfully');
  };

  const sendReminder = (surveyId: string) => {
    setSurveys(prev =>
      prev.map(survey =>
        survey.id === surveyId
          ? { ...survey, remindersSent: survey.remindersSent + 1 }
          : survey
      )
    );
    toast.success('Reminder sent');
  };

  return (
    <div className="space-y-6">
      <SurveySettings settings={settings} onUpdateSettings={onUpdateSettings} />
      <SurveyMetrics surveys={surveys} />
      <SurveysList 
        surveys={surveys}
        maxReminders={settings.maxReminders}
        onSendSurvey={sendSurvey}
        onSendReminder={sendReminder}
      />
    </div>
  );
};

export default SatisfactionSurveys;
