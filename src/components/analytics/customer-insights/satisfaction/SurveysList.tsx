
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SatisfactionSurvey } from '../types';
import SurveyCard from './SurveyCard';

interface SurveysListProps {
  surveys: SatisfactionSurvey[];
  maxReminders: number;
  onSendSurvey: (surveyId: string) => void;
  onSendReminder: (surveyId: string) => void;
}

const SurveysList = ({ surveys, maxReminders, onSendSurvey, onSendReminder }: SurveysListProps) => {
  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle>Recent Surveys</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {surveys.map((survey) => (
            <SurveyCard
              key={survey.id}
              survey={survey}
              maxReminders={maxReminders}
              onSendSurvey={onSendSurvey}
              onSendReminder={onSendReminder}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default SurveysList;
