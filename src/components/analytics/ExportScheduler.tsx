
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Calendar, Clock, FileDown, Mail, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface ScheduledExport {
  id: string;
  name: string;
  reportType: string;
  frequency: string;
  format: string;
  recipients: string[];
  nextRun: string;
  enabled: boolean;
}

const ExportScheduler = () => {
  const [scheduledExports, setScheduledExports] = useState<ScheduledExport[]>([
    {
      id: '1',
      name: 'Weekly Customer Report',
      reportType: 'customer-summary',
      frequency: 'weekly',
      format: 'pdf',
      recipients: ['manager@company.com'],
      nextRun: '2024-01-15 09:00',
      enabled: true
    },
    {
      id: '2',
      name: 'Monthly Analytics Dashboard',
      reportType: 'analytics-dashboard',
      frequency: 'monthly',
      format: 'excel',
      recipients: ['team@company.com', 'ceo@company.com'],
      nextRun: '2024-02-01 08:00',
      enabled: true
    }
  ]);

  const [newExport, setNewExport] = useState({
    name: '',
    reportType: '',
    frequency: '',
    format: '',
    recipients: '',
    time: '09:00'
  });

  const handleAddExport = () => {
    if (!newExport.name || !newExport.reportType || !newExport.frequency || !newExport.format) {
      toast.error('Please fill in all required fields');
      return;
    }

    const recipients = newExport.recipients.split(',').map(email => email.trim()).filter(Boolean);
    if (recipients.length === 0) {
      toast.error('Please add at least one recipient email');
      return;
    }

    const nextRun = new Date();
    nextRun.setDate(nextRun.getDate() + (newExport.frequency === 'daily' ? 1 : newExport.frequency === 'weekly' ? 7 : 30));
    
    const exportSchedule: ScheduledExport = {
      id: Date.now().toString(),
      name: newExport.name,
      reportType: newExport.reportType,
      frequency: newExport.frequency,
      format: newExport.format,
      recipients,
      nextRun: nextRun.toLocaleDateString() + ' ' + newExport.time,
      enabled: true
    };

    setScheduledExports([...scheduledExports, exportSchedule]);
    setNewExport({ name: '', reportType: '', frequency: '', format: '', recipients: '', time: '09:00' });
    toast.success('Export schedule created successfully');
  };

  const toggleExport = (id: string) => {
    setScheduledExports(prev => 
      prev.map(exp => 
        exp.id === id ? { ...exp, enabled: !exp.enabled } : exp
      )
    );
  };

  const deleteExport = (id: string) => {
    setScheduledExports(prev => prev.filter(exp => exp.id !== id));
    toast.success('Export schedule deleted');
  };

  const runNow = (exportItem: ScheduledExport) => {
    toast.success(`Generating ${exportItem.name} report...`);
    // In a real app, this would trigger the actual export
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            Schedule New Export
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="export-name">Report Name</Label>
              <Input
                id="export-name"
                placeholder="e.g., Weekly Customer Report"
                value={newExport.name}
                onChange={(e) => setNewExport({...newExport, name: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="report-type">Report Type</Label>
              <Select value={newExport.reportType} onValueChange={(value) => setNewExport({...newExport, reportType: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="customer-summary">Customer Summary</SelectItem>
                  <SelectItem value="analytics-dashboard">Analytics Dashboard</SelectItem>
                  <SelectItem value="ticket-performance">Ticket Performance</SelectItem>
                  <SelectItem value="revenue-forecast">Revenue Forecast</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="frequency">Frequency</Label>
              <Select value={newExport.frequency} onValueChange={(value) => setNewExport({...newExport, frequency: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="format">Format</Label>
              <Select value={newExport.format} onValueChange={(value) => setNewExport({...newExport, format: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="excel">Excel</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="time">Time</Label>
              <Input
                id="time"
                type="time"
                value={newExport.time}
                onChange={(e) => setNewExport({...newExport, time: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="recipients">Recipients (comma-separated emails)</Label>
            <Input
              id="recipients"
              placeholder="manager@company.com, team@company.com"
              value={newExport.recipients}
              onChange={(e) => setNewExport({...newExport, recipients: e.target.value})}
            />
          </div>

          <Button onClick={handleAddExport} className="w-full">
            <Calendar className="h-4 w-4 mr-2" />
            Schedule Export
          </Button>
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-green-600" />
            Scheduled Exports ({scheduledExports.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {scheduledExports.map((exportItem) => (
              <div key={exportItem.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-medium">{exportItem.name}</h4>
                    <Badge variant={exportItem.enabled ? "default" : "secondary"}>
                      {exportItem.enabled ? 'Active' : 'Disabled'}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-4 text-sm text-muted-foreground">
                    <div>
                      <span className="font-medium">Type:</span> {exportItem.reportType}
                    </div>
                    <div>
                      <span className="font-medium">Frequency:</span> {exportItem.frequency}
                    </div>
                    <div>
                      <span className="font-medium">Format:</span> {exportItem.format.toUpperCase()}
                    </div>
                    <div>
                      <span className="font-medium">Next Run:</span> {exportItem.nextRun}
                    </div>
                  </div>
                  
                  <div className="mt-2 text-sm text-muted-foreground">
                    <span className="font-medium">Recipients:</span> {exportItem.recipients.join(', ')}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Switch
                    checked={exportItem.enabled}
                    onCheckedChange={() => toggleExport(exportItem.id)}
                  />
                  <Button variant="outline" size="sm" onClick={() => runNow(exportItem)}>
                    <FileDown className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => deleteExport(exportItem.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            
            {scheduledExports.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No scheduled exports yet. Create your first automated report above.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExportScheduler;
