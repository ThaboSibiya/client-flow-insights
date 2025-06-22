
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Star, Send, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { SatisfactionSurvey, CustomerInsightsSettings } from './types';

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

  const updateSettings = (updates: Partial<CustomerInsightsSettings['satisfactionSurveys']>) => {
    onUpdateSettings({ ...settings, ...updates });
  };

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

  const completedSurveys = surveys.filter(s => s.surveyStatus === 'completed');
  const averageRating = completedSurveys.length > 0 
    ? completedSurveys.reduce((sum, s) => sum + (s.responses?.overallSatisfaction || 0), 0) / completedSurveys.length
    : 0;

  return (
    <div className="space-y-6">
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            Survey Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="auto-send">Automatically Send After Job Completion</Label>
            <Switch
              id="auto-send"
              checked={settings.autoSendAfterCompletion}
              onCheckedChange={(checked) => updateSettings({ autoSendAfterCompletion: checked })}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Survey Delay (hours)</Label>
              <Select 
                value={settings.surveyDelay.toString()} 
                onValueChange={(value) => updateSettings({ surveyDelay: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 hour</SelectItem>
                  <SelectItem value="2">2 hours</SelectItem>
                  <SelectItem value="4">4 hours</SelectItem>
                  <SelectItem value="24">24 hours</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Reminder Frequency (days)</Label>
              <Select 
                value={settings.reminderFrequency.toString()} 
                onValueChange={(value) => updateSettings({ reminderFrequency: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Daily</SelectItem>
                  <SelectItem value="3">Every 3 days</SelectItem>
                  <SelectItem value="7">Weekly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Max Reminders</Label>
              <Select 
                value={settings.maxReminders.toString()} 
                onValueChange={(value) => updateSettings({ maxReminders: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1</SelectItem>
                  <SelectItem value="2">2</SelectItem>
                  <SelectItem value="3">3</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

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

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Recent Surveys</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {surveys.map((survey) => (
              <div key={survey.id} className="flex items-center justify-between p-4 border rounded-lg">
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
                    <Button variant="outline" size="sm" onClick={() => sendSurvey(survey.id)}>
                      <Send className="h-4 w-4" />
                    </Button>
                  )}
                  {survey.surveyStatus === 'sent' && survey.remindersSent < settings.maxReminders && (
                    <Button variant="outline" size="sm" onClick={() => sendReminder(survey.id)}>
                      Send Reminder
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SatisfactionSurveys;
