
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Mail, Download, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface ScheduledReport {
  id: string;
  name: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  time: string;
  recipients: string[];
  reportType: string;
  isActive: boolean;
  nextRun: string;
}

const ReportScheduler = () => {
  const [scheduledReports, setScheduledReports] = useState<ScheduledReport[]>([
    {
      id: '1',
      name: 'Executive Dashboard',
      frequency: 'weekly',
      time: '08:00',
      recipients: ['executive@company.com', 'manager@company.com'],
      reportType: 'Executive Summary',
      isActive: true,
      nextRun: '2024-01-15T08:00:00',
    },
    {
      id: '2',
      name: 'Customer Analytics',
      frequency: 'monthly',
      time: '09:00',
      recipients: ['analytics@company.com'],
      reportType: 'Customer Insights',
      isActive: false,
      nextRun: '2024-02-01T09:00:00',
    },
  ]);

  const [newReport, setNewReport] = useState({
    name: '',
    frequency: 'weekly' as const,
    time: '08:00',
    recipients: '',
    reportType: 'Executive Summary',
  });

  const handleCreateReport = () => {
    if (!newReport.name || !newReport.recipients) {
      toast.error('Please fill in all required fields');
      return;
    }

    const report: ScheduledReport = {
      id: Date.now().toString(),
      name: newReport.name,
      frequency: newReport.frequency,
      time: newReport.time,
      recipients: newReport.recipients.split(',').map(email => email.trim()),
      reportType: newReport.reportType,
      isActive: true,
      nextRun: calculateNextRun(newReport.frequency, newReport.time),
    };

    setScheduledReports(prev => [...prev, report]);
    setNewReport({
      name: '',
      frequency: 'weekly',
      time: '08:00',
      recipients: '',
      reportType: 'Executive Summary',
    });
    toast.success('Report scheduled successfully!');
  };

  const calculateNextRun = (frequency: string, time: string) => {
    const now = new Date();
    const [hours, minutes] = time.split(':').map(Number);
    
    let nextRun = new Date();
    nextRun.setHours(hours, minutes, 0, 0);
    
    if (frequency === 'daily') {
      if (nextRun <= now) {
        nextRun.setDate(nextRun.getDate() + 1);
      }
    } else if (frequency === 'weekly') {
      nextRun.setDate(nextRun.getDate() + (7 - nextRun.getDay()));
    } else if (frequency === 'monthly') {
      nextRun.setMonth(nextRun.getMonth() + 1, 1);
    }
    
    return nextRun.toISOString();
  };

  const toggleReportStatus = (id: string) => {
    setScheduledReports(prev =>
      prev.map(report =>
        report.id === id ? { ...report, isActive: !report.isActive } : report
      )
    );
  };

  const deleteReport = (id: string) => {
    setScheduledReports(prev => prev.filter(report => report.id !== id));
    toast.success('Report deleted successfully');
  };

  const formatNextRun = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      {/* Create New Scheduled Report */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-green-600" />
            Schedule New Report
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="reportName">Report Name</Label>
              <Input
                id="reportName"
                placeholder="e.g., Weekly Customer Report"
                value={newReport.name}
                onChange={(e) => setNewReport(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="reportType">Report Type</Label>
              <Select value={newReport.reportType} onValueChange={(value) => 
                setNewReport(prev => ({ ...prev, reportType: value }))
              }>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Executive Summary">Executive Summary</SelectItem>
                  <SelectItem value="Customer Insights">Customer Insights</SelectItem>
                  <SelectItem value="Sales Performance">Sales Performance</SelectItem>
                  <SelectItem value="Ticket Analytics">Ticket Analytics</SelectItem>
                  <SelectItem value="Revenue Report">Revenue Report</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="frequency">Frequency</Label>
              <Select value={newReport.frequency} onValueChange={(value: any) => 
                setNewReport(prev => ({ ...prev, frequency: value }))
              }>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">Time</Label>
              <Input
                id="time"
                type="time"
                value={newReport.time}
                onChange={(e) => setNewReport(prev => ({ ...prev, time: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="recipients">Email Recipients</Label>
            <Input
              id="recipients"
              placeholder="email1@company.com, email2@company.com"
              value={newReport.recipients}
              onChange={(e) => setNewReport(prev => ({ ...prev, recipients: e.target.value }))}
            />
            <p className="text-xs text-muted-foreground">
              Separate multiple email addresses with commas
            </p>
          </div>

          <Button onClick={handleCreateReport} className="w-full md:w-auto">
            <Calendar className="h-4 w-4 mr-2" />
            Schedule Report
          </Button>
        </CardContent>
      </Card>

      {/* Scheduled Reports List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-600" />
            Scheduled Reports ({scheduledReports.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {scheduledReports.map((report) => (
              <div key={report.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-medium">{report.name}</h4>
                    <p className="text-sm text-muted-foreground">{report.reportType}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={report.isActive ? "default" : "secondary"}>
                      {report.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteReport(report.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{report.frequency} at {report.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Next: {formatNextRun(report.nextRun)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{report.recipients.length} recipient(s)</span>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`active-${report.id}`}
                      checked={report.isActive}
                      onCheckedChange={() => toggleReportStatus(report.id)}
                    />
                    <Label htmlFor={`active-${report.id}`} className="text-sm">
                      Active
                    </Label>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-1" />
                      Run Now
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            {scheduledReports.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No scheduled reports yet. Create your first scheduled report above.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportScheduler;
