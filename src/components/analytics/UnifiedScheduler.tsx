
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Calendar, FileDown, Mail, Trash2, Send, Plus } from 'lucide-react';
import { toast } from 'sonner';

interface ScheduledReport {
  id: string;
  name: string;
  reportType: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  format: string;
  recipients: string[];
  nextRun: string;
  enabled: boolean;
  includeCharts: boolean;
}

const UnifiedScheduler = () => {
  const [reports, setReports] = useState<ScheduledReport[]>([
    {
      id: '1',
      name: 'Weekly Executive Summary',
      reportType: 'overview',
      frequency: 'weekly',
      format: 'pdf',
      recipients: ['management@company.com'],
      nextRun: new Date(Date.now() + 7 * 86400000).toLocaleDateString(),
      enabled: true,
      includeCharts: true,
    },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: '',
    reportType: '',
    frequency: 'weekly' as 'daily' | 'weekly' | 'monthly',
    format: 'pdf',
    recipients: '',
    time: '09:00',
    includeCharts: true,
  });

  const handleAdd = () => {
    if (!form.name || !form.reportType || !form.recipients) {
      toast.error('Please fill in all required fields');
      return;
    }

    const recipients = form.recipients.split(',').map(e => e.trim()).filter(Boolean);
    const nextRun = new Date();
    nextRun.setDate(nextRun.getDate() + (form.frequency === 'daily' ? 1 : form.frequency === 'weekly' ? 7 : 30));

    setReports(prev => [...prev, {
      id: Date.now().toString(),
      name: form.name,
      reportType: form.reportType,
      frequency: form.frequency,
      format: form.format,
      recipients,
      nextRun: nextRun.toLocaleDateString() + ' ' + form.time,
      enabled: true,
      includeCharts: form.includeCharts,
    }]);

    setForm({ name: '', reportType: '', frequency: 'weekly', format: 'pdf', recipients: '', time: '09:00', includeCharts: true });
    setShowForm(false);
    toast.success('Scheduled report created');
  };

  const toggleReport = (id: string) => {
    setReports(prev => prev.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r));
  };

  const deleteReport = (id: string) => {
    setReports(prev => prev.filter(r => r.id !== id));
    toast.success('Schedule removed');
  };

  const sendNow = (report: ScheduledReport) => {
    toast.success(`Generating "${report.name}"...`);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-foreground">Scheduled Reports</h3>
          <p className="text-xs text-muted-foreground">Automated report generation and email delivery</p>
        </div>
        <Button size="sm" onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-1" />
          New Schedule
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardContent className="pt-4 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Report Name</Label>
                <Input
                  placeholder="e.g., Weekly Summary"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Report Type</Label>
                <Select value={form.reportType} onValueChange={(v) => setForm({ ...form, reportType: v })}>
                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="overview">Overview Dashboard</SelectItem>
                    <SelectItem value="customer-summary">Customer Summary</SelectItem>
                    <SelectItem value="ticket-performance">Ticket Performance</SelectItem>
                    <SelectItem value="revenue-forecast">Revenue Forecast</SelectItem>
                    <SelectItem value="sales">Sales Report</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Frequency</Label>
                <Select value={form.frequency} onValueChange={(v: 'daily' | 'weekly' | 'monthly') => setForm({ ...form, frequency: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Format</Label>
                <Select value={form.format} onValueChange={(v) => setForm({ ...form, format: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="excel">Excel</SelectItem>
                    <SelectItem value="csv">CSV</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Time</Label>
                <Input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Recipients (comma-separated)</Label>
              <Input
                placeholder="manager@company.com, team@company.com"
                value={form.recipients}
                onChange={(e) => setForm({ ...form, recipients: e.target.value })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Switch checked={form.includeCharts} onCheckedChange={(v) => setForm({ ...form, includeCharts: v })} />
                <Label className="text-xs">Include Charts</Label>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button size="sm" onClick={handleAdd}>
                  <Calendar className="h-3 w-3 mr-1" />
                  Schedule
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-2">
        {reports.map((report) => (
          <Card key={report.id} className={!report.enabled ? 'opacity-60' : ''}>
            <CardContent className="py-3 px-4">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-medium text-foreground truncate">{report.name}</h4>
                    <Badge variant={report.enabled ? "default" : "secondary"} className="text-[10px] px-1.5 py-0">
                      {report.enabled ? 'Active' : 'Off'}
                    </Badge>
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 capitalize">
                      {report.frequency}
                    </Badge>
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 uppercase">
                      {report.format}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{report.recipients.length} recipient{report.recipients.length !== 1 ? 's' : ''}</span>
                    <span>Next: {report.nextRun}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 ml-3">
                  <Switch checked={report.enabled} onCheckedChange={() => toggleReport(report.id)} />
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => sendNow(report)}>
                    <Send className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteReport(report.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {reports.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Mail className="h-10 w-10 mx-auto mb-3 opacity-40" />
            <p className="text-sm">No scheduled reports yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UnifiedScheduler;
