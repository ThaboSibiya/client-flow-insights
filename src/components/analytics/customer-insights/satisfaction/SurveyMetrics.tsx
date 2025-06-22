
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Star } from 'lucide-react';
import { SatisfactionSurvey } from '../types';

interface SurveyMetricsProps {
  surveys: SatisfactionSurvey[];
}

const SurveyMetrics = ({ surveys }: SurveyMetricsProps) => {
  const renderStars = (rating: number) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const completedSurveys = surveys.filter(s => s.surveyStatus === 'completed');
  const averageRating = completedSurveys.length > 0 
    ? completedSurveys.reduce((sum, s) => sum + (s.responses?.overallSatisfaction || 0), 0) / completedSurveys.length
    : 0;

  return (
    <div className="grid grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-4">
          <div className="text-2xl font-bold text-blue-600">{surveys.length}</div>
          <div className="text-sm text-muted-foreground">Total Surveys</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="text-2xl font-bold text-green-600">{completedSurveys.length}</div>
          <div className="text-sm text-muted-foreground">Completed</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <div className="text-2xl font-bold text-yellow-600">{averageRating.toFixed(1)}</div>
            {renderStars(Math.round(averageRating))}
          </div>
          <div className="text-sm text-muted-foreground">Average Rating</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="text-2xl font-bold text-purple-600">
            {completedSurveys.length > 0 ? Math.round((completedSurveys.length / surveys.length) * 100) : 0}%
          </div>
          <div className="text-sm text-muted-foreground">Response Rate</div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SurveyMetrics;
