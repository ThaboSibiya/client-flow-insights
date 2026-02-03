
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Download, 
  FileSpreadsheet, 
  FileJson, 
  FileText, 
  Calendar,
  Clock,
  Mail,
  Plus,
  Trash2,
  Play,
  Pause
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { exportCustomers } from '@/utils/exportUtils';

interface ExportFormat {
  id: string;
  name: string;
  icon: React.ReactNode;
  extension: string;
}

const exportFormats: ExportFormat[] = [
  { id: 'csv', name: 'CSV', icon: <FileSpreadsheet className="h-5 w-5" />, extension: '.csv' },
  { id: 'excel', name: 'Excel', icon: <FileSpreadsheet className="h-5 w-5" />, extension: '.xlsx' },
  { id: 'json', name: 'JSON', icon: <FileJson className="h-5 w-5" />, extension: '.json' },
  { id: 'pdf', name: 'PDF', icon: <FileText className="h-5 w-5" />, extension: '.pdf' }
];

interface DataSource {
  id: string;
  name: string;
  recordCount: number;
}

const dataSources: DataSource[] = [
  { id: 'customers', name: 'Customers', recordCount: 1250 },
  { id: 'tickets', name: 'Support Tickets', recordCount: 856 },
  { id: 'invoices', name: 'Invoices', recordCount: 423 },
  { id: 'revenue', name: 'Revenue Data', recordCount: 2100 },
  { id: 'team', name: 'Team Performance', recordCount: 45 }
];

interface ScheduledExport {
  id: string;
  name: string;
  dataSource: string;
  format: string;
  frequency: string;
  nextRun: Date;
  isActive: boolean;
}

interface ExportHubProps {
  onExport?: (format: string, dataSource: string) => void;
}

const ExportHub: React.FC<ExportHubProps> = ({ onExport }) => {
  const [selectedFormat, setSelectedFormat] = useState<string>('csv');
  const [selectedSources, setSelectedSources] = useState<string[]>(['customers']);
  const [isExporting, setIsExporting] = useState(false);
  const [showScheduler, setShowScheduler] = useState(false);
  
  const [scheduledExports, setScheduledExports] = useState<ScheduledExport[]>([
    {
      id: '1',
      name: 'Weekly Customer Report',
      dataSource: 'customers',
      format: 'excel',
      frequency: 'Weekly',
      nextRun: new Date(2025, 1, 10),
      isActive: true
    },
    {
      id: '2',
      name: 'Monthly Revenue Summary',
      dataSource: 'revenue',
      format: 'pdf',
      frequency: 'Monthly',
      nextRun: new Date(2025, 2, 1),
      isActive: true
    }
  ]);

  const toggleSource = (sourceId: string) => {
    setSelectedSources(prev => 
      prev.includes(sourceId)
        ? prev.filter(id => id !== sourceId)
        : [...prev, sourceId]
    );
  };

  const handleExport = async () => {
    if (selectedSources.length === 0) {
      toast({
        title: "No data selected",
        description: "Please select at least one data source to export",
        variant: "destructive"
      });
      return;
    }

    setIsExporting(true);
    
    // Simulate export
    setTimeout(() => {
      setIsExporting(false);
      toast({
        title: "Export Complete",
        description: `Exported ${selectedSources.length} dataset(s) as ${selectedFormat.toUpperCase()}`,
      });
      onExport?.(selectedFormat, selectedSources.join(','));
    }, 1500);
  };

  const toggleScheduledExport = (id: string) => {
    setScheduledExports(prev => prev.map(exp => 
      exp.id === id ? { ...exp, isActive: !exp.isActive } : exp
    ));
  };

  const totalRecords = selectedSources.reduce((sum, id) => {
    const source = dataSources.find(s => s.id === id);
    return sum + (source?.recordCount || 0);
  }, 0);

  return (
    <div className="space-y-6">
      {/* Quick Export */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium">Quick Export</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Format Selection */}
          <div className="space-y-3">
            <Label className="text-sm text-muted-foreground">Export Format</Label>
            <div className="grid grid-cols-4 gap-2">
              {exportFormats.map((format) => (
                <button
                  key={format.id}
                  onClick={() => setSelectedFormat(format.id)}
                  className={`
                    p-3 rounded-lg border text-center transition-all
                    ${selectedFormat === format.id 
                      ? 'border-primary bg-primary/5 ring-1 ring-primary' 
                      : 'border-border hover:border-primary/50 hover:bg-muted/50'
                    }
                  `}
                >
                  <div className={`mx-auto mb-1 ${selectedFormat === format.id ? 'text-primary' : 'text-muted-foreground'}`}>
                    {format.icon}
                  </div>
                  <p className="text-sm font-medium">{format.name}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Data Sources */}
          <div className="space-y-3">
            <Label className="text-sm text-muted-foreground">Select Data</Label>
            <div className="space-y-2">
              {dataSources.map((source) => (
                <label
                  key={source.id}
                  className={`
                    flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all
                    ${selectedSources.includes(source.id)
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                    }
                  `}
                >
                  <Checkbox
                    checked={selectedSources.includes(source.id)}
                    onCheckedChange={() => toggleSource(source.id)}
                  />
                  <div className="flex-1">
                    <p className="font-medium text-sm">{source.name}</p>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {source.recordCount.toLocaleString()} records
                  </Badge>
                </label>
              ))}
            </div>
          </div>

          {/* Export Summary */}
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div>
              <p className="text-sm text-muted-foreground">Ready to export</p>
              <p className="font-semibold">{totalRecords.toLocaleString()} records</p>
            </div>
            <Button onClick={handleExport} disabled={isExporting || selectedSources.length === 0}>
              {isExporting ? (
                <>Exporting...</>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Export {selectedFormat.toUpperCase()}
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Scheduled Exports */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-medium">Scheduled Exports</CardTitle>
            <Button variant="outline" size="sm" onClick={() => setShowScheduler(!showScheduler)}>
              <Plus className="h-4 w-4 mr-1" />
              New Schedule
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {showScheduler && (
            <div className="mb-4 p-4 border border-dashed border-border rounded-lg space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Report Name</Label>
                  <Input placeholder="Weekly Summary" />
                </div>
                <div className="space-y-2">
                  <Label>Data Source</Label>
                  <select className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm">
                    {dataSources.map(source => (
                      <option key={source.id} value={source.id}>{source.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Format</Label>
                  <select className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm">
                    {exportFormats.map(format => (
                      <option key={format.id} value={format.id}>{format.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Frequency</Label>
                  <select className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm">
                    <option>Daily</option>
                    <option>Weekly</option>
                    <option>Monthly</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Email Recipients</Label>
                <Input placeholder="email@example.com, another@example.com" />
              </div>
              <div className="flex gap-2">
                <Button size="sm">Create Schedule</Button>
                <Button size="sm" variant="ghost" onClick={() => setShowScheduler(false)}>Cancel</Button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            {scheduledExports.map((schedule) => (
              <div
                key={schedule.id}
                className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className={`p-2 rounded-md ${schedule.isActive ? 'bg-primary/10' : 'bg-muted'}`}>
                  <Calendar className={`h-4 w-4 ${schedule.isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{schedule.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {schedule.frequency} • {schedule.format.toUpperCase()} • Next: {schedule.nextRun.toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={schedule.isActive ? "default" : "secondary"}>
                    {schedule.isActive ? 'Active' : 'Paused'}
                  </Badge>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8"
                    onClick={() => toggleScheduledExport(schedule.id)}
                  >
                    {schedule.isActive ? (
                      <Pause className="h-4 w-4" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExportHub;
