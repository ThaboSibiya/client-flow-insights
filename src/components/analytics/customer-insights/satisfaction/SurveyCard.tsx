
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Send, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { SatisfactionSurvey } from '../types';

interface SurveyCardProps {
  survey: SatisfactionSurvey;
  maxReminders: number;
  onSendSurvey: (surveyId: string) => void;
  onSendReminder: (surveyId: string) => void;
}

const SurveyCard = ({ survey, maxReminders, onSendSurvey, onSendReminder }: SurveyCardProps) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'sent': return <Clock className="h-4 w-4 text-blue-600" />;
      case 'pending': return <AlertCircle className="h-4 w-4 text-orange-600" />;
      case 'expired': return <AlertCircle className="h-4 w-4 text-red-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-50 text-green-700 border-green-200';
      case 'sent': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'pending': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'expired': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

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

  return (
    <div className="flex items-center justify-between p-4 border rounded-lg">
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-2">
          <h4 className="font-medium">{survey.customerName}</h4>
          <Badge className={getStatusColor(survey.surveyStatus)}>
            {getStatusIcon(survey.surveyStatus)}
            <span className="ml-1 capitalize">{survey.surveyStatus}</span>
          </Badge>
        </div>
        
        <div className="grid grid-cols-3 gap-4 text-sm text-muted-foreground">
          <div>
            <span className="font-medium">Job:</span> {survey.jobType}
          </div>
          <div>
            <span className="font-medium">Completed:</span> {new Date(survey.completedAt).toLocaleDateString()}
          </div>
          <div>
            <span className="font-medium">Reminders:</span> {survey.remindersSent}
          </div>
        </div>

        {survey.responses && (
          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Overall Satisfaction:</span>
              {renderStars(survey.responses.overallSatisfaction)}
            </div>
            {survey.responses.feedback && (
              <p className="text-sm text-muted-foreground italic">
                "{survey.responses.feedback}"
              </p>
            )}
          </div>
        )}
      </div>
      
      <div className="flex items-center gap-2">
        {survey.surveyStatus === 'pending' && (
          <Button variant="outline" size="sm" onClick={() => onSendSurvey(survey.id)}>
            <Send className="h-4 w-4" />
          </Button>
        )}
        {survey.surveyStatus === 'sent' && survey.remindersSent < maxReminders && (
          <Button variant="outline" size="sm" onClick={() => onSendReminder(survey.id)}>
            Send Reminder
          </Button>
        )}
      </div>
    </div>
  );
};

export default SurveyCard;
